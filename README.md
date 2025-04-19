<!-- 
---

# Spamurai

**Spamurai** is your digital samurai for inbox cleanup. It hunts down unsubscribe links, verifies them, and lets you decide if you want to remove them from your inbox permanently. Unsubscribe with precision, move trash emails to the bin, and make your inbox a zen space once again.

## ⚙️ Features:
- Automatically scans your inbox for unsubscribe links.
- Verifies each link to ensure it's safe (no shady business).
- Deletes unwanted emails after your confirmation.
- Moves flagged emails to Trash for a second look.
- Reusable and adaptable for any email account (Gmail works like a charm).

## 🔥 DISCLAIMER (Pay Attention!)
Before you fire up the script, here’s the deal:
- **⚠️ This script accesses your inbox and can permanently delete emails.**
- **We only click safe unsubscribe links** after scanning their URLs.
- **Once deleted, it’s gone for good. No undo.**

This isn't your average Gmail filter—this is **digital bushido**.

## 🚀 Quick Start

1. **Clone the Repo**  
   Clone this repo to your local machine or server.

   ```bash
   git clone https://github.com/yourusername/spamurai.git
   cd spamurai
   ```

2. **Install Dependencies**  
   Make sure you have `node.js` and `npm` installed. Then, install the necessary packages.

   ```bash
   npm install
   ```

3. **Setup Environment Variables**  
   Create a `.env` file in the root directory and add your email credentials and MongoDB info.

   ```env
   DB_USERNAME=your_mongo_user
   DB_PASSWORD=your_mongo_password
   CLUSTER=your_mongo_cluster
   DB_NAME=your_db_name
   DB_COLLECTION=your_collection_name
   EMAIL=your_email
   PASSWORD=your_email_password
   HOST=your_imap_host
   PORT=your_imap_port
   ```

4. **Run the Script**  
   After setup, execute the script to start the process.

   ```bash
   node index.js
   ```

   You'll be prompted with a disclaimer and asked to confirm before proceeding.

## 📜 How It Works

- **Step 1**: Connects to your email inbox using IMAP.
- **Step 2**: Scans your inbox for emails with unsubscribe links.
- **Step 3**: Verifies whether each unsubscribe link is safe by checking it against the database.
- **Step 4**: Automatically clicks the unsubscribe link if it's verified as safe.
- **Step 5**: Moves emails to the Trash folder and asks for confirmation to delete them permanently.
- **Step 6**: Logs the outcome and closes the database connection.

## ⚡ Contributions

Feel free to contribute to this project! If you have ideas to improve Spamurai, just fork the repo and submit a pull request. We’re all about making spam cleanup easier.

## 👀 License

Spamurai is an open-source project. Feel free to use it, modify it, and share it.

---

### Tips:

- **🔒 Double-check your email credentials** before running the script. You don’t want to make any accidental changes to your email.
- **💾 Backup important emails** before running this script. It’s a powerful tool, but once emails are deleted, they’re gone for good.
- **🛡️ Safe Links Only**: We’ve got your back. Only verified links are clicked, but it’s always a good idea to keep an eye on things.

--- -->
