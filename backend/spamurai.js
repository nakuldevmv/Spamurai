import { connectDB, startIMAP, connectToInbox } from './utils/connectMail/imapConnect.js';
export default async function startSpamurai(email, password, month, day, year, isAgree, isDelete, clientId) {
  console.clear();
  if (isAgree) {
    try {
      await connectDB();
      const imap = startIMAP(email, password);
      connectToInbox(imap, month, day, year, isDelete, clientId, email);
    } catch (e) {
      console.log(e.message);
    }
  } else {
    console.log("❌ Execution aborted. No unsubscribe scrolls were touched. Stay safe, ronin.");
    return;
  }
}
