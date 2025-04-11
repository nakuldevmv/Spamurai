import Imap from './node_modules/node-imap/lib/Connection.js';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { findUnsubLinks } from './utils/findUnsubLinks.js';

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
    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) return reject(err);

        console.log(`📫 Total Messages: ${box.messages.total}`);

        imap.search(['SCINCE',['1 April 2025']], (err, results) => {
          if (err) {
            console.log('❌ Search Error:', err);
            return reject(err);
          }

          if (!results.length) {
            console.log('📭 No recent emails found.');
            imap.end();
            return resolve();
          }

          const fetch = imap.fetch(results, { bodies: '' });
          const totalEmails = results.length;
          let parsedCount = 0;
          let totalLinks = 0;

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, mail) => {
                parsedCount++;

                if (err) {
                  console.log('⚠️ Parse Error:', err);
                } else {
                  const unsubLinks = findUnsubLinks(mail);
                  if (unsubLinks.length > 0) {

                    console.log('---------------------------');
                    console.log('👤 Sender:', mail.from.text);
                    console.log('📝 Subject:', mail.subject);

                    console.log('🔗 Links are:');
                    unsubLinks.forEach(link => {
                      console.log(`↗️  ${link}`);
                      totalLinks++;
                    });
                  }
                }

                if (parsedCount === totalEmails) {
                  console.log(`Total Links fetched: ${totalLinks}`);
                  console.log('✅ Finished fetching emails');
                  imap.end();
                }
              });
            });
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.log('💥 IMAP Error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('>> IMAP connection closed <<');
      resolve();
    });

    imap.connect();
  });
}
