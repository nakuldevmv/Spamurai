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
