const Imap = require('./node_modules/node-imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const imap = new Imap({
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT,
    tls: true,
});

imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        console.log(`📫 You’ve got ${box.messages.total} messages`);
        //implement 
        // imap.search(['ALL', ['SINCE', 'March 1, 2025']], (err, results) => {
        //     if (err) throw err;
          
        //     const latest = results.slice(-5); // get last 5
        //     const f = imap.fetch(latest, { bodies: '' });
          
        //     f.on('message', (msg) => {
        //       msg.on('body', async (stream) => {
        //         const parsed = await simpleParser(stream);
        //         console.log('📨 Subject:', parsed.subject);
        //         console.log('🧑‍💻 From:', parsed.from.text);
        //         console.log('📜 Snippet:', parsed.text?.slice(0, 100));
        //       });
        //     });
          
        //     f.once('end', () => {
        //       console.log('✅ Done fetching emails');
        //       imap.end();
        //     });
        //   });
          
        //
    });
});

imap.once('error', (err) => {
    console.log('💥 Error: ', err);
});

imap.once('end', () => {
    console.log('🚪 Connection closed');
});

imap.connect();
