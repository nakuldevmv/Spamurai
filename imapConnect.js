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
      //spam folder cleaning
      imap.openBox('[Gmail]/Spam',false,(err,box)=>{
        if(err)return reject(err);

        console.log(`📫 Total Number of Spam Messages: ${box.messages.total}`);
         imap.search(['ALL'], (err, results) => {
          if (err) {
            console.log('❌ Search Error:', err);
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
      })


      // imap.openBox('INBOX', false, (err, box) => {
      //   if (err) return reject(err);

      //   console.log(`📫 Total Messages: ${box.messages.total}`);

      //   imap.search([['SINCE', 'APRIL 13, 2025']], (err, results) => {
      //     if (err) {
      //       console.log('❌ Search Error:', err);
      //       return reject(err);
      //     }

      //     if (!results.length) {
      //       console.log('📭 No recent emails found.');
      //       imap.end();
      //       return resolve();
      //     }

      //     totalToParse = results.length;
      //     const fetch = imap.fetch(results, { bodies: '' });

      //     fetch.on('message', (msg) => {
      //       msg.on('body', (stream) => {
      //         simpleParser(stream, async (err, mail) => {
      //           if (err) {
      //             console.log('⚠️ Parse Error:', err);
      //           } else {
      //             emails.push(mail);
      //           }

      //           parsedCount++;
      //           if (parsedCount === totalToParse) {
      //             imap.end(); 
      //           }
      //         });
      //       });
      //     });
      //   });
      // });

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
            console.log(`🔗Link Status : ${verdict}`);
            totalLinks++;
          }
        }
      }

      console.log(`Total Links fetched: ${totalLinks}`);
      console.log('✅ Finished fetching emails');
      console.log('>> IMAP connection closed <<');
      resolve();
    });

    imap.connect();
  });
}
