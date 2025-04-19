import Imap from './node_modules/node-imap/lib/Connection.js';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { findUnsubLinks } from './utils/unsub/findUnsubLinks.js';
import checkUrl from './utils/urlChecker.js';
import { MongoClient } from 'mongodb';
import { getDomain, getMail, getName, getdate } from './utils/getters.js';
import { getUserInput } from './utils/getUserInput.js';

// import unsub from './unsub/unsubscriber.js';
import unsuber from './utils/unsub/unsubscriber.js';

dotenv.config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.CLUSTER}`;

const client = new MongoClient(uri);
let db;
let collection = process.env.DB_COLLECTION;
async function connectDB() {
  try {
    await client.connect();
    db = await client.db(process.env.DB_NAME);
    // console.log("🗃️  Connected to Spamurai's Database");

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
    // const month = `January`;
    // const date = `30`;
    // const year = `2025`;

    // console.log(`📅 Scanning emails starting from: ${month} ${date}, ${year}...`);
    console.log(`📅 Scanning ALL emails...`);




    // .then(() => cleanFolder('[Gmail]/Trash', 'Trash'))

    imap.once('ready', () => {
      cleanFolder('[Gmail]/Spam', 'Spam')
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
        imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          console.log(`📨  Total Inbox Messages : ${box.messages.total}`);

          imap.search(['ALL'], (err, results) => {
            // imap.search([[`SINCE`, `${month.toUpperCase()} ${date}, ${year}`]], (err, results) => {
            if (err) {
              console.log('🔴  Inbox Search Error:', err);
              return reject(err);
            }

            if (!results.length) {
              console.log('📭  No recent emails found.');
              finish();
              return resolve();
            }

            totalToParse = results.length;
            const fetch = imap.fetch(results, { bodies: '' });

            fetch.on('message', (msg) => {
              let isImportant = false;
              let isFlagged = false;
              let attrs = null;
              let uid = null;

              msg.on('attributes', (attributes) => {
                attrs = attributes;
                uid = attrs.uid;
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

                      emails.push({
                        uid,
                        from: mail.from,
                        subject: mail.subject,
                        mail
                      });

                    } else {
                      console.log(`🔶  Skipped important or flagged: ${mail.subject}`);
                    }

                  }

                  parsedCount++;
                  if (parsedCount === totalToParse) {
                    processParsedEmails()
                  }
                });
              });
            });
          });
        });
      }
    });

    // imap.once('error', (err) => {
    //   console.log('🔴  IMAP Error ::', err);
    //   reject(err);
    // });
    imap.once('error', (err) => {
      console.log('🔴  IMAP Error ::', err);
    
      if (err.code === 'ECONNRESET') {
        console.log('⚠️  Connection reset — salvaging scanned emails...');
        processParsedEmails(); // gracefully wrap it up with what we've got
      } else {
        reject(err); // only kill if it's something else
      }
    });
    
    async function processParsedEmails() {
      let totalLinks = 0;
      let uidToDelete = [];

      for (const mail of emails) {
        const unsubLinks = await findUnsubLinks(mail.mail);

        if (unsubLinks.length > 0) {
          uidToDelete.push(mail.uid);

          console.log('..................................................');
          console.log('🆔  Message UID : ', mail.uid);
          console.log('👤  Sender Name : ', getName(mail.from));
          console.log('📧  Sender E-mail : ', getMail(mail.from));
          console.log('📝  Subject : ', `${mail.subject}...`);

          for (const link of unsubLinks) {
            let scannedLink = await db.collection(collection).findOne({ domain: getDomain(link) });

            if (scannedLink) {
              if (scannedLink.isSafe) {
                console.log("✅  Link is Safe and already scanned — Unsubscribing...");
                await unsuber(link);
              } else if (!scannedLink.isSafe) {
                console.log("⚠️  Link is Unsafe and already scanned — skipping...");
              } else {
                console.log("🔴  Link is not properly scanned yet");
              }
            } else {
              const isSafe = await checkUrl(link);
              if (isSafe) {
                await unsuber(link);
              }
              const linkData = {
                date: getdate(),
                sender_mail: getMail(mail.from),
                sender_name: getName(mail.from),
                domain: getDomain(link),
                link: link,
                isSafe: isSafe,
              };

              try {
                await db.collection(process.env.DB_COLLECTION).insertOne(linkData);
              } catch (err) {
                if (err?.errorResponse?.code === 11000) {
                  console.log("⚠️  Duplicate entry found! Ignoring...");
                } else {
                  console.log("🔴  MongoDB Error :: ", err);
                }
              }
            }

            totalLinks++;
          }
        }
      }
      uidToDelete = uidToDelete.filter(item => item !== null);
      if (uidToDelete.length > 0) {
        console.log('🚩  Message UIDs for moving to trash folder:', uidToDelete);
        console.log('📩  Moving mails to trash folder...');
        imap.delFlags(uidToDelete, ['\\Seen', '\\Flagged', '\\Answered', '\\Draft', '\\Recent'], (err) => {
          if (err) {
            console.log("⚠️  Failed to clean up flags before moving:", err);
          }

          imap.move(uidToDelete, '[Gmail]/Trash', async (err) => {
            if (err) {
              console.log("🔴  Error while moving mails :: ", err);
              finish();
            } else {
              console.log("✅  Mails moved to trash folder!");

              const input = await getUserInput("Do you want to delete the message in trash? (y/n)")
              if (input.toLowerCase() == 'y') {
                imap.addFlags(uidToDelete, '\\Deleted', err => {
                  if (err) {
                    console.error('🔴 Error adding \\Deleted flags:', err);
                    return finish();
                  }
                  imap.expunge(err => {
                    if (err) {
                      console.error('🔴 Expunge error:', err);
                    } else {
                      console.log('🗑️ Mails successfully deleted!');
                    }
                    finish();
                  });
                });
              } else {
                console.log("The messages are in the trash if you want to manually check each of them")
                finish();
              }
            }
          });
        });




      } else {

        console.log('ℹ️ No mails flagged for deletion.');
        finish();
      }

      function finish() {
        console.log(`📊 Total Unsub Links Found: ${totalLinks}`);
        // console.log('📦 Database disconnected.');
        console.log('⚠️  If any UID shows up as "null", try rescanning. Could be a ghost email 👻');
        console.log('✅ Scan complete.');
        imap.end();
        client.close();
        resolve();
        process.exit(0) //kill the program
      }
    }

    imap.connect();
  });
}
