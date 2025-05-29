
# 🥷 Spamurai

_A clean inbox is a sharp mind. Spamurai is here to forge the blade._

🚀 **Project Status:** Actively under development  
⚠️ **Note:** Experimental—use at your own risk. Always back up important mail.

---

## 📦 Repo & Entry Point

Clone & run the main script:

```bash
git clone https://github.com/nakuldevmv/Spamurai.git
cd Spamurai/backend
```

The entry point is `backend/index.js`.

---

## 1. 🔥 Introduction

Spamurai is your digital bushido—a script that slices through spam like a katana through chaos. It:

- Fetches mail via IMAP (Gmail ready)  
- Auto‑detects & clicks unsubscribe links 🪄  
- Moves unwanted mail to Trash (or nukes it ☠️)  
- Logs every strike to MongoDB Atlas  

---

## 2. 🧰 Prerequisites

- **Node.js** (v16+)  
- **npm** or **yarn**  
- **MongoDB Atlas** cluster  
- **Google App Password** (for IMAP access)  
- **IPQualityScore** API key (for link safety checks)  

---

## 3. 🔐 Environment Setup

Copy the example environment file and fill in your own values:

```bash
cp example.env .env
```

**Fill out `.env` like this:**

```dotenv
# Gmail IMAP (App Password)
EMAIL='you@gmail.com'
PASSWORD='your_16_digit_app_password'
PORT=993
HOST='imap.gmail.com'

# URL safety scanner (IPQualityScore)
IPQ_API='your_ipqs_api_key'

# MongoDB Atlas
DB_USERNAME='your_db_user'
DB_PASSWORD='your_db_password'
CLUSTER='your_cluster_url'   # e.g. spamurai.gjpxkae.mongodb.net
DB_NAME='spamurai'
DB_COLLECTION='scanned_links'
DB_COLLECTION2='unsubedLink'
```

> 🔒 **Never commit** your real `.env`—keep it in `.gitignore`.

---

## 4. 🛠️ Install & Run

```bash
# from Spamurai/backend
npm install      # or yarn install
npm start        # or node index.js
```

---

## 5. 🧠 How It Works

1. **IMAP Connect** — Logs into your Gmail inbox  
2. **Filter** — Skips flagged or important mail  
3. **Extract** — Finds unsubscribe links in each email  
4. **Verify** — Checks links via IPQualityScore (or cache)  
5. **Execute** — Clicks safe links, logs to MongoDB  
6. **Cleanup** — Moves processed messages to Trash (optional delete)

---

## 6. ⚠️ Warnings & Disclaimer

- Spamurai is still in training—no warranties.  
- It **only** clicks links marked safe.  
- Double‑check your `.env` before you run.  
- Backup your inbox if you’re feeling paranoid.

---
## 7. 📊 Working Flowchart
```mermaid
flowchart TD
    subgraph "Spamurai Service"
        ORC["Orchestrator (backend/index.js)"]:::internal
        CFG["Configuration (.env)"]:::internal
        IMAP["IMAP Connector"]:::internal
        PARS["Mail Filter & Parser (getters.js)"]:::internal
        subgraph "Unsubscribe Module"
            FIND["Unsubscribe Link Extractor (findUnsubLinks.js)"]:::internal
            PUPP["Puppeteer Setup (pupSetup.js)"]:::internal
        end
        SCAN["Link Safety Scanner (ipqs.js)"]:::internal
        subgraph "Unsubscriber Service"
            UNS["Unsubscriber Logic (unsubscriber.js)"]:::internal
            CAPTCHA["Captcha Handler (captcha.js)"]:::internal
        end
        CLEAN["Mail Cleanup (imap-copy.js)"]:::internal
        MONGO_CLIENT["Logger / Persistence (mongoConnect.js)"]:::internal
    end

    IMAP_SRV[("IMAP Server")]:::external
    IPQS[("IPQualityScore API")]:::external
    MONGO[("MongoDB Atlas")]:::db

    ORC --> CFG
    ORC --> IMAP
    IMAP --> IMAP_SRV
    ORC --> PARS
    PARS --> FIND
    FIND --> SCAN
    SCAN -->|"safe"| PUPP
    PUPP --> UNS
    SCAN -->|"POST /check"| IPQS
    SCAN --> MONGO_CLIENT
    UNS -->|"click safe links"| MONGO_CLIENT
    UNS --> CLEAN
    CLEAN --> IMAP_SRV
    MONGO_CLIENT --> MONGO

    CFG -.-> ORC
    CFG -.-> IMAP
    CFG -.-> PARS
    CFG -.-> FIND
    CFG -.-> SCAN
    CFG -.-> UNS
    CFG -.-> CLEAN
    CFG -.-> MONGO_CLIENT

    click ORC "https://github.com/nakuldevmv/spamurai/blob/main/backend/index.js"
    click IMAP "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/connectMail/imapConnect.js"
    click PARS "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/getters.js"
    click FIND "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/findUnsubLinks.js"
    click PUPP "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/pupSetup.js"
    click SCAN "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/scanners/ipqs.js"
    click UNS "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/unsubscriber.js"
    click CAPTCHA "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/captcha.js"
    click CLEAN "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/connectMail/imap-copy.js"
    click MONGO_CLIENT "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/server/mongoConnect.js"
    click CFG "https://github.com/nakuldevmv/spamurai/blob/main/backend/example.env"

    classDef internal fill:#0E4C75,stroke:#5DADE2
    classDef external fill:#2C3E50,stroke:#95A5A6
    classDef db fill:#145A32,stroke:#58D68D

```
## 7. 🗺️ Roadmap

- [x] Smarter unsubscribe link detection   
- [x] Advanced link‑safety heuristics & fallbacks  
- [x] A Simple UI for I/O  
- [ ] OAuth2 support for Gmail (drop app passwords)  

---

## 8. 🎁 Extras & Pro Tips

- Whitelist VIP senders to avoid friendly fire  
- Helpful docs:  
  - [node‑imap](https://github.com/mscdex/node-imap)  
  - [mailparser](https://github.com/nodemailer/mailparser)  
  - [puppeteer](https://pptr.dev/)  
  - [IPQualityScore API](https://www.ipqualityscore.com/documentation)  

> _Spamurai bows, sheaths the blade, and fades into the shadows..._  
