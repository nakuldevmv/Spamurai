import Imap from './node_modules/node-imap/lib/Connection.js';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
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

        console.log(`📫 You’ve got ${box.messages.total} messages`);

        imap.search([['SINCE', 'April 1, 2025']], (err, results) => {
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

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, mail) => {
                if (err) {
                  console.log('⚠️ Parse Error:', err);
                  return;
                }

                console.log('---------------------------');
                console.log('👤 Sender:', mail.from.text);
                console.log('📝 Subject:', mail.subject);
                console.log('💬 Body preview:', mail.text?.substring(0, 100), '...');
              });
            });
          });

          fetch.once('end', () => {
            console.log('✅ Finished fetching emails.');
            imap.end();
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.log('💥 IMAP Error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('🚪 IMAP connection closed.');
      resolve();
    });

    imap.connect();
  });
}
