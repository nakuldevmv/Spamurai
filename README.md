
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
    %% Infrastructure Layer
    subgraph "Infrastructure (Runtime/Infra)"
        Docker["Docker Container"]:::infra
        Env[".env Configuration"]:::infra
    end

    %% Application Layer
    subgraph "Node.js Application"
        Entry1["EntryPoint: index.js"]:::core
        Entry2["EntryPoint: spamurai.js"]:::core
        subgraph "Core Modules"
            IMAP1["IMAP Connect: imapConnect.js"]:::core
            IMAP2["IMAP Copy: imap-copy.js"]:::core
            IMAP3["IMAP Backup: imapConnectBackup.js"]:::core
            Parser1["Getters: getters.js"]:::core
            Parser2["URL Checker: urlChecker.js"]:::core
            Scanner["URL Scanner: ipqs.js"]:::core
            Unsub1["Puppeteer Setup: pupSetup.js"]:::core
            Unsub2["Find Links: findUnsubLinks.js"]:::core
            Unsub3["Captcha Handler: captcha.js"]:::core
            Unsub4["Unsubscriber: unsubscriber.js"]:::core
            DB["Mongo Connect: mongoConnect.js"]:::core
            CLI["CLI Handler: getUserInput.js"]:::core
        end
    end

    %% External Services
    subgraph "External Services"
        Gmail["Gmail IMAP (port 993)"]:::external
        IPQS["IPQualityScore API"]:::external
        PuppeteerService["Puppeteer Headless"]:::external
    end

    %% Data Store
    subgraph "Data Stores"
        MongoDB["MongoDB Atlas"]:::datastore
    end

    %% Connections
    Env -->|provides config| Docker
    Docker -->|runs| Entry1
    Docker -->|runs| Entry2

    Entry1 -->|orchestrates| Entry2
    Entry2 -->|uses| IMAP1
    Entry2 -->|uses| IMAP2
    Entry2 -->|uses| IMAP3
    Entry2 -->|calls| CLI

    IMAP1 -->|IMAP fetch| Gmail
    IMAP2 -->|IMAP fetch| Gmail
    IMAP3 -->|IMAP fetch| Gmail

    IMAP1 -->|outputs messages| Parser1
    IMAP1 -->|outputs messages| Parser2

    Parser1 -->|extracts links| Unsub2
    Parser2 -->|validates URLs| Unsub2

    Unsub2 -->|passes links| Scanner
    Scanner -->|API request/response| IPQS
    IPQS -->|returns verdict| Scanner

    Scanner -->|safe links| Unsub1
    Scanner -->|unsafe links| Unsub4

    Unsub1 -->|browser navigation| PuppeteerService
    Unsub1 -->|handles captcha| Unsub3
    Unsub3 -->|solves| Unsub1

    Unsub1 -->|completes flow| Unsub4
    Unsub4 -->|logs result| DB
    DB -->|connects| MongoDB

    %% Click Events
    click Entry1 "https://github.com/nakuldevmv/spamurai/blob/main/backend/index.js"
    click Entry2 "https://github.com/nakuldevmv/spamurai/blob/main/backend/spamurai.js"
    click IMAP1 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/connectMail/imapConnect.js"
    click IMAP2 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/connectMail/imap-copy.js"
    click IMAP3 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/connectMail/imapConnectBaclup.js"
    click Parser1 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/getters.js"
    click Parser2 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/urlChecker.js"
    click Scanner "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/scanners/ipqs.js"
    click Unsub1 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/pupSetup.js"
    click Unsub2 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/findUnsubLinks.js"
    click Unsub3 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/captcha.js"
    click Unsub4 "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/unsub/unsubscriber.js"
    click DB "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/server/mongoConnect.js"
    click CLI "https://github.com/nakuldevmv/spamurai/blob/main/backend/utils/getUserInput.js"
    click Docker "https://github.com/nakuldevmv/spamurai/tree/main/backend/Dockerfile"
    click Env "https://github.com/nakuldevmv/spamurai/blob/main/backend/example.env"

    %% Styles
    classDef core fill:#D0E8FF,stroke:#009,stroke-width:1px
    classDef external fill:#DFF2D8,stroke:#090,stroke-width:1px
    classDef datastore fill:#FFF4C1,stroke:#CC0,stroke-width:1px
    classDef infra fill:#FFE0B2,stroke:#F60,stroke-width:1px
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
