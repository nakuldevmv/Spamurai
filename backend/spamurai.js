
import {startIMAP,connectToInbox} from './utils/connectMail/imapConnect.js';
export default function startSpamurai(email, password, month ,day, year, isAgree, isDelete,clientId) {



  console.clear();
  console.log(`

    ░▒▓███████▓▒░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓██████████████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░ 
    ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░ 
    ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░ 
     ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓█▓▒░ 
           ░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░ 
           ░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░ 
    ░▒▓███████▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░ 
                                                                                                              
                                                                                                              

Oi, inbox samurai. Ready to slice through spam like it's sashimi?

You're about to unleash a script that:
🔹 Cracks open your inbox like a fortune cookie
🔹 Hunts down unsubscribe links like a bloodhound
🔹 Auto-clicks ONLY the SAFE ones (no shady back-alley links, promise)
🔹 Moves emails to the Trash like they never existed
🔹 And if you say the magic word — deletes 'em. For good. No ctrl+Z. No resurrection.

‼️ THIS IS IRREVERSIBLE.
‼️ We ain't cowboys clickin' willy-nilly — every link gets checked, scanned, background-checked, kissed goodnight.

📌 Reminder:
Double-check your creds, say a lil' prayer to the email gods,
and make sure you ain’t got grandma’s secret cookie recipe buried in Promotions.

This ain’t Gmail filters.
This is digital bushido, baby.
`);

  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });

  // rl.question("👉 Type 'yes' to continue: ", (answer) => {
  //   if (answer.trim().toLowerCase() !== 'yes') {
  //     console.log("❌ Execution aborted. No unsubscribe scrolls were touched. Stay safe, ronin.");
  //     rl.close();
  //     process.exit(0);
  //   }

  //   rl.close();
  if(isAgree){
    const imap= startIMAP(email,password);
    connectToInbox(imap, month ,day, year, isDelete,clientId,email);

  }else{
    console.log("❌ Execution aborted. No unsubscribe scrolls were touched. Stay safe, ronin.");
    // imap.end();
    client.close();
    resolve();
    return;
    
  }
  // });
}
