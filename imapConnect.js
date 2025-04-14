import Imap from './node_modules/node-imap/lib/Connection.js';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { findUnsubLinks } from './utils/findUnsubLinks.js';
import checkUrl from './utils/urlChecker.js';

dotenv.config();

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
      // STEP 1: Clean Spam first
      imap.openBox('[Gmail]/Spam', false, (err, box) => {
        if (err) return reject(err);

        console.log(`📫 Total Spam Messages: ${box.messages.total}`);

        imap.search(['ALL'], (err, results) => {
          if (err) {
            console.log('❌ Search Error in Spam:', err);
            return reject(err);
          }

          if (!results.length) {
            console.log('📭 No spam emails to delete.');
            return openInbox(); //Step 2 calls inbox after cleaning spam
          }

          const fetch = imap.fetch(results, { bodies: '' });

          fetch.on('message', (msg) => {
            msg.once('attributes', (attrs) => {
              const { uid } = attrs;
              console.log(`🗑️ Deleting Spam UID: ${uid}`);
              imap.addFlags(uid, '\\Deleted', (err) => {
                if (err) console.log('⚠️ Error marking spam for deletion:', err);
              });
            });
          });

          fetch.once('end', () => {
            imap.expunge((err) => {
              if (err) console.log('❌ Expunge Error:', err);
              else console.log('✅ Spam emails deleted.');

              openInbox(); //Step 2 calls inbox after cleaning spam
            });
          });
        });
      });

      function openInbox() {
        // STEP 2: Scan INBOX
        imap.openBox('INBOX', false, (err, box) => {
          if (err) return reject(err);

          console.log(`📨 Total Inbox Messages: ${box.messages.total}`);

          imap.search([['SINCE', 'APRIL 13, 2025']], (err, results) => {
            if (err) {
              console.log('❌ Inbox Search Error:', err);
              return reject(err);
            }

            if (!results.length) {
              console.log('📭 No recent emails found.');
              imap.end();
              return resolve();
            }

            totalToParse = results.length;
            const fetch = imap.fetch(results, { bodies: '' });

            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, mail) => {
                  if (err) {
                    console.log('⚠️ Parse Error:', err);
                  } else {
                    emails.push(mail);
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
      console.log('💥 IMAP Error:', err);
      reject(err);
    });

    imap.once('end', async () => {
      let totalLinks = 0;

      for (const mail of emails) {
        const unsubLinks = await findUnsubLinks(mail);

        if (unsubLinks.length > 0) {
          console.log('---------------------------');
          console.log('👤 Sender:', mail.from.text);
          console.log('📝 Subject:', mail.subject);

          for (const link of unsubLinks) {
            const verdict = await checkUrl(link);
            console.log(`🔗 Link Status: ${verdict}`);
            totalLinks++;
          }
        }
      }

      console.log(`📊 Total Links Found: ${totalLinks}`);
      console.log('✅ Done & Dusted.');
      resolve();
    });

    imap.connect();
  });
}
