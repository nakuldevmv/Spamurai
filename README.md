# 🥷 Spamurai

_A clean inbox is a sharp mind. Spamurai is here to forge the blade._

🚀 **Project Status:** Actively under development.

⚠️ **Note:** This project is in active development. Not ready for production use (unless you're brave, dumb... or a glorious combo of both).

---

## 1. Introduction

Spamurai is your digital bushido—a script that slices through spam like a katana through chaos.

It:

- Fetches emails via IMAP (Gmail support baked in)
- Auto-detects and clicks unsubscribe links
- Moves unwanted mail to Trash (or completely obliterates it)
- Logs all actions to MongoDB Atlas for a paper trail

This tool doesn’t just slap—it backhands inbox chaos into oblivion.

---

## 2. Prerequisites

Before you wield the blade, make sure you’ve got:

- **Node.js** (v16 or later)
- **npm** or **yarn**
- A **MongoDB Atlas** account and cluster
- **Google App Password** (IMAP access for Gmail)
- An **IPQualityScore** API key (URL scanner for dodgy links)

---

## 3. Environment Variables

Create a `.env` file in your project root with the following sacred scrolls:

```dotenv
# Google App Password
# https://myaccount.google.com/apppasswords
EMAIL='abc****@gmail.com'
PASSWORD='zsdx abdc dgdf jsks'
PORT=993
HOST='imap.gmail.com'

# URL Verifier API
# https://www.ipqualityscore.com/documentation/malicious-url-scanner-api/overview
IPQ_API='kuM8NM*********************'

# MongoDB Atlas Database
# https://cloud.mongodb.com/v2/67fbfb88c7f43f66026022dd#/clusters
DB_USERNAME='abc******'
DB_PASSWORD='0Ld**********'
CLUSTER='spamurai.gjpxkae.mongodb.net/?retryWrites=true&w=majority&appName=Spamurai'
DB_NAME='spamurai'
DB_COLLECTION='scanned_links'
DB_COLLECTION2='unsubedLink'
```

---

## 4. Setup & Run

```bash
# Clone the repo
git clone https://github.com/yourusername/spamurai.git
cd spamurai

# Install dependencies
npm install

# Populate your .env (see above)
# 💡 Get your creds:
# - [Google App Password](https://myaccount.google.com/apppasswords)
# - [IPQS key](https://www.ipqualityscore.com/)
# - [MongoDB cluster info](https://cloud.mongodb.com/)

# Launch the samurai
npm start
```

---

## 5. How It Works (High‑Level)

Let’s slice it up:

1. **IMAP Email Fetch** — Connects to your Gmail inbox, wipes out Spam/Trash.
2. **Filter** — Skips flagged or important mail (don’t worry, your boss is safe).
3. **Link Extraction** — Hunts down unsubscribe links like a bounty.
4. **URL Safety Check** — Uses IPQualityScore or cached verdicts to check if links are sketchy.
5. **Action** — Clicks the safe ones and logs every move to MongoDB.
6. **Cleanup** — Moves processed emails to Trash (or incinerates them if you say so).

---

## 6. Warnings & Disclaimer

⚠️ Spamurai is sharp and experimental. Mishandling may result in email carnage.

- No SLAs, no warranties. It might break or misfire.
- We **only** click unsubscribe links deemed safe.
- Don’t commit your `.env`. For real. Keep those secrets secret.

---

## 7. TODOs & Roadmap

- [ ] Improve Unsub Link detection (handle HTML weirdness)
- [ ] Enhance link safety checks (add heuristics + fallback methods)
- [ ] Switch to OAuth2 for Gmail (ditch the App Passwords)
- [ ] Build a React + Vite dashboard for real-time tracking

---

## 8. Extras (Optional Goodies)

- **Pro Tip:** Add your VIPs to a whitelist so Spamurai doesn’t go rogue.
- **Helpful Links:**
  - [node-imap](https://github.com/mscdex/node-imap)
  - [mailparser](https://github.com/nodemailer/mailparser)
  - [puppeteer](https://pptr.dev/)
  - [IPQualityScore API Docs](https://www.ipqualityscore.com/documentation)

> _Spamurai bows, sheaths the blade, and fades into the shadows..._

