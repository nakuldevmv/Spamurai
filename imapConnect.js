import Imap from './node_modules/node-imap/lib/Connection.js';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { findUnsubLinks } from './utils/unsub/findUnsubLinks.js';
import checkUrl from './utils/urlChecker.js';
import { MongoClient } from 'mongodb';
import { getDomain, getMail, getName, getdate } from './utils/getters.js';

dotenv.config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.CLUSTER}`;

const client = new MongoClient(uri);
let db;
let collection = process.env.DB_COLLECTION;
async function connectDB() {
  try {
    await client.connect();
    db = await client.db(process.env.DB_NAME);
    console.log("🗃️  Connected to Spamurai's Database");

  } catch (err) {
    console.log(err);
  }
}
connectDB();

const imap = new Imap({
  user: process.env.EMAIL,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: Number(process.env.PORT),
  tls: true,
});

export default function connectToInbox() {
  return new Promise((resolve, reject) => {
    const emails = [];
    let totalToParse = 0;
    let parsedCount = 0;
    

    imap.once('ready', () => {
      cleanFolder('[Gmail]/Spam', 'Spam')
        .then(() => cleanFolder('[Gmail]/Trash', 'Trash'))
        .then(() => openInbox()) 
        .catch((err) => {
          console.log('🔴  Error in cleaning folders :: ', err);
          reject(err); 
        });

      function cleanFolder(folderName, folderLabel) {
        return new Promise((resolve, reject) => {
          imap.openBox(folderName, false, (err, box) => {
            if (err) return reject(err);

            console.log(`📫  Total ${folderLabel} Messages: ${box.messages.total}`);

            imap.search(['ALL'], (err, results) => {
              if (err) {
                console.log(`🔴  Search Error in ${folderLabel} :: `, err);
                return reject(err);
              }

              if (!results.length) {
                console.log(`📭  No ${folderLabel} emails to delete.`);
                return resolve(); 
              }

              const fetch = imap.fetch(results, { bodies: '' });

              fetch.on('message', (msg) => {
                msg.once('attributes', (attrs) => {
                  const { uid } = attrs;
                  console.log(`🗑️  Deleting ${folderLabel} UID : ${uid}`);
                  imap.addFlags(uid, '\\Deleted', (err) => {
                    if (err) console.log(`🔴  Error marking ${folderLabel} email for deletion ::`, err);
                  });
                });
              });

              fetch.once('end', () => {
                imap.expunge((err) => {
                  if (err) console.log('🔴  Expunge Error :: ', err);
                  else console.log(`✅  ${folderLabel} emails deleted.`);
                  resolve(); 
                });
              });
            });
          });
        });
      }



      function openInbox() {
        // STEP 2: Scan INBOX
        imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          console.log(`📨  Total Inbox Messages : ${box.messages.total}`);

          // imap.search(['ALL'], (err, results) => {
          imap.search([['SINCE', 'APRIL 15, 2025']], (err, results) => {
            if (err) {
              console.log('🔴  Inbox Search Error:', err);
              return reject(err);
            }

            if (!results.length) {
              console.log('📭  No recent emails found.');
              imap.end();
              return resolve();
            }

            totalToParse = results.length;
            const fetch = imap.fetch(results, { bodies: '' });

            fetch.on('message', (msg) => {
              let isImportant = false;
              let isFlagged = false;
              let attrs = null;

              msg.on('attributes', (attributes) => {
                attrs = attributes;
                const labels = attrs['x-gm-labels'] || [];
                const flags = attrs.flags || [];

                isImportant = labels.includes('\\Important');
                isFlagged = flags.includes('\\Flagged');
              });
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, mail) => {
                  if (err) {
                    console.log('🔴  Parse Error :: ', err);
                  } else {
                    if (!isImportant && !isFlagged) {

                      emails.push(mail);
                    } else {
                      console.log(`🔶  Skipped important or flagged: ${mail.subject}`);
                    }

                  }

                  parsedCount++;
                  if (parsedCount === totalToParse) {
                    imap.end();
                  }
                });
              });
            });
          });
        });
      }
    });

    imap.once('error', (err) => {
      console.log('🔴  IMAP Error ::', err);
      reject(err);
    });

    imap.once('end', async () => {
      let totalLinks = 0;

      for (const mail of emails) {
        const unsubLinks = await findUnsubLinks(mail);

        if (unsubLinks.length > 0) {
          console.log('..................................................');
          console.log('👤  Sender Name : ', getName(mail.from.text));
          console.log('📧  Sender E-mail : ', getMail(mail.from.text));
          console.log('📝  Subject : ', `${mail.subject}...`);
          
          //disabled api calls for now
          for (const link of unsubLinks) {
            let scannedLink = await db.collection(collection).findOne({ domain: getDomain(link) });
            if (scannedLink) {
              if (scannedLink.isSafe) {
                console.log("✅  Link is Safe and its already scanned skiping...");
              } else if (!scannedLink.isSafe) {
                console.log("⚠️  Link is Unsafe and its already scanned skiping...");
              } else {
                console.log("🔴  Link is not properly scanned yet");
              }
            } else {
              const isSafe = await checkUrl(link);
              const linkData = {
                date: getdate(),
                sender_mail: getMail(mail.from.text),
                sender_name: getName(mail.from.text),
                domain: getDomain(link),
                link: link,
                isSafe: isSafe,
              };

              try {

                await db.collection(process.env.DB_COLLECTION).insertOne(linkData);

              }
              catch (err) {
                if (err.errorResponse.code === 11000) {
                  console.log("⚠️  Duplicate entry found! ignoring...");
                } else {
                  console.log("🔴  MongoDB Error :: ", err);
                }
              }
            }
            totalLinks++;
          }
        }
      }

      resolve();
      client.close();
      console.log(`📊  Total Links Found : ${totalLinks}`);
      console.log("📦  DB connection closed.");
      console.log('✅  Done & Dusted.');
    });

    imap.connect();
  });
}
