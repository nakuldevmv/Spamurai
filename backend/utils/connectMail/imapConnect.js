import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { findUnsubLinks } from '../unsub/findUnsubLinks.js';
import checkUrl from '../urlChecker.js';
import { MongoClient } from 'mongodb';
import { getDomain, getMail, getName, getdate } from '../getters.js';
import { getUserInput } from '../getUserInput.js';

import unsuber from '../unsub/unsubscriber.js';

dotenv.config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.CLUSTER}`;

const client = new MongoClient(uri);
let db;
let collection = process.env.DB_COLLECTION;
let collection2 = process.env.DB_COLLECTION2;
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
  connTimeout: 5000,   
  authTimeout: 5000,    
  tlsOptions: { rejectUnauthorized: false }
});

export default async function connectToInbox(m, d, y, isDelete) {
  console.log(" ")

  // const month = await getUserInput("📅  Enter month (e.g. October): ");
  // const date = await getUserInput("📆  Enter day   (e.g. 1): ");
  // const year = await getUserInput("🗓️  Enter year  (e.g. 2025): ");
  const month = m;
  const date = d;
  const year = y;
  console.log(`\n🧠  Pro tip: Want to scan your whole inbox? Just enter your birthday as the date 😎`);

  console.log(`⚠️  Full scans can take a long time—like, seriously long, depending on your inbox 🕰️`);
  console.log(`🙏  So yeah... be patient. A lot of patience. Like, monk-level patience 🧘‍♂️\n`);


  console.log(`\n📅 Scanning emails starting from: ${month} ${date}, ${year}...\n`);

  return new Promise((resolve, reject) => {
    const start = Date.now();

    let emailsScanned = 0;
    let safeLinkCount = 0;
    let unsafeLinkCount = 0;
    let unsubCount = 0;
    let isSuccessful;

    const emails = [];
    let totalToParse = 0;
    let parsedCount = 0;



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
          console.log(" ")
        });
      }


      function openInbox() {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          console.log(`📨  Total Inbox Messages : ${box.messages.total}`);
          console.log(" ")


          try {
            imap.search([[`SINCE`, `${month.toUpperCase()} ${date}, ${year}`]], (err, results) => {
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
          } catch (err) {
            console.log("🔴  Inbox Search Error :: ", err.message);
            process.exit(0);

          }
        });
      }
    });

    imap.once('error', (err) => {
      console.log('🔴  IMAP Error ::', err);

      if (err.code === 'ECONNRESET') {
        console.log('⚠️  Connection reset — salvaging scanned emails...');
        processParsedEmails();
      } else {
        reject(err);
      }
    });

    async function processParsedEmails() {
      let totalLinks = 0;
      let uidToDelete = [];

      for (const mail of emails) {

        const unsubLinks = await findUnsubLinks(mail.mail);

        if (unsubLinks.length > 0) {
          uidToDelete.push(mail.uid);

          console.log('▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄');
          console.log(" ")
          console.log('🆔  Message UID : ', mail.uid);
          console.log('👤  Sender Name : ', getName(mail.from));
          console.log('📧  Sender E-mail : ', getMail(mail.from));
          console.log('📝  Subject : ', `${mail.subject}...`);
          console.log(" ")

          for (const link of unsubLinks) {
            const domain = getDomain(link);

            let scannedLink = await db.collection(collection).findOne({ domain });
            let unsubedLink = await db.collection(collection2).findOne({ userMail: process.env.EMAIL, domain });

            if (scannedLink) {
              if (scannedLink.isSafe) {
                safeLinkCount++;
                console.log("✅  Link is Safe and already scanned — Unsubscribing...");
                if (unsubedLink) {
                  console.log("✅  Already Unsubscribed the link!");
                } else {
                  isSuccessful = await unsuber(link);
                  if (isSuccessful) {
                    unsubCount++;
                  }
                  const unsubedData = {
                    date: getdate(),
                    userMail: process.env.EMAIL,
                    domain,
                    link,
                  };
                  try {
                    await db.collection(collection2).insertOne(unsubedData);
                  } catch (err) {
                    if (err?.errorResponse?.code === 11000) {
                      console.log("⚠️  Duplicate entry found! Ignoring...");
                    } else {
                      console.log("🔴  MongoDB Error :: ", err);
                    }
                  }
                }
              } else {
                unsafeLinkCount++;
                console.log("⚠️  Link is Unsafe and already scanned — skipping...");
              }
            } else {
              const isSafe = await checkUrl(link);
              if (isSafe) {
                safeLinkCount++;
              } else {
                unsafeLinkCount++;
              }

              const linkData = {
                date: getdate(),
                sender_mail: getMail(mail.from),
                sender_name: getName(mail.from),
                domain,
                link,
                isSafe,
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

              if (isSafe) {
                isSuccessful = await unsuber(link);
                if (isSuccessful) {
                  unsubCount++;
                }
                const unsubedData = {
                  date: getdate(),
                  userMail: process.env.EMAIL,
                  domain,
                  link,
                };
                try {
                  await db.collection(collection2).insertOne(unsubedData);
                } catch (err) {
                  if (err?.errorResponse?.code === 11000) {
                    console.log("⚠️  Duplicate entry found! Ignoring...");
                  } else {
                    console.log("🔴  MongoDB Error :: ", err);
                  }
                }
              }
            }

            totalLinks++;
          }
          console.log(" ")
        }
        emailsScanned++;
      }
      uidToDelete = uidToDelete.filter(item => item !== null);
      if (uidToDelete.length > 0) {
        console.log('▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄');
        console.log(" ")
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

              // const input = await getUserInput("🚨  Do you want to delete the message in trash? (y/n) : ")
              const input = isDelete;
              // if (input.toLowerCase() == 'y') {
              if(input){
                imap.addFlags(uidToDelete, '\\Deleted', err => {
                  if (err) {
                    console.error('🔴 Error adding \\Deleted flags:', err);
                    return finish();
                  }
                  imap.expunge(err => {
                    if (err) {
                      console.error('🔴 Expunge error:', err);
                    } else {
                      console.log(" ")
                      console.log('🗑️  Mails successfully deleted!');
                    }
                    finish();
                  });
                });
              } else {
                console.log(" ")
                console.log("🗑️  The messages have been moved to Trash! Feel free to dig in if you wanna manually inspect each one 🕵️‍♂️📬");
                finish();
              }
            }
          });
        });




      } else {
        console.log(" ")
        console.log('ℹ️  No mails flagged for deletion.');
        finish();
      }


      function finish() {
        const duration = ((Date.now() - start) / 1000).toFixed(2);

        console.log("\n");
        console.log("📬  Spamurai Scan Finished - Report Time ⚔️");
        console.log("=============================================");
        console.log(`📨  Emails Scanned:            ${emailsScanned}`);
        console.log(`🔗  Total Unsub Links Found:   ${totalLinks}`);
        console.log(`🛡️  Safe Links:                ${safeLinkCount}`);
        console.log(`☠️  Unsafe Links:              ${unsafeLinkCount}`);
        console.log(`✅  Successful Unsubscribes:   ${unsubCount}`);
        console.log(`⏱️  Total Scan Duration:       ${duration} seconds`);
        console.log("=============================================\n");

        console.log("❗  Note:");
        console.log(`🗑️  Messages moved to Trash if unsafe or errored out.  Manual check optional 👀`);
        console.log(`⚠️  If any UID shows up as "null", try rescanning.  Could be a ghost email 👻`);
        console.log("\n");

        console.log("✅  Scan complete.  Spamurai bows and logs off... for now 🥷\n");

        imap.end();
        client.close();
        resolve();
        process.exit(0);
      }

    }

    imap.connect();
  });
}
