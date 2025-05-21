import { connectDB, startIMAP, connectToInbox } from './utils/connectMail/imapConnect.js';
export default async function startSpamurai(email, password, month, day, year, isAgree, isDelete, clientId) {
  console.clear();
  if (isAgree) {
    try {
      console.log("🧙‍♂️ Connecting to the database...");
      await connectDB();
      console.log("🧙‍♂️ Database connected.");
      console.log("🧙‍♂️ Connecting to the inbox...");
      const imap = startIMAP(email, password);
      console.log("🧙‍♂️ Inbox connected.");
      connectToInbox(imap, month, day, year, isDelete, clientId, email);
    } catch (e) {
      console.log(e.message);
    }
  } else {
    console.log("❌ Execution aborted. No unsubscribe scrolls were touched. Stay safe, ronin.");
    return;
  }
}
