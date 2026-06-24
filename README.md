<div align="center">

# 📰 Telegram Tech News Bot

**A serverless Telegram bot that delivers the latest technology news from The Guardian and Hacker News — deployed on Cloudflare Workers with fully automated CI/CD via GitHub Actions.**

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[فارسی](README.FA.md) · [Setup Guide](#setup-guide) · [Commands](#bot-commands) · [Troubleshooting](#troubleshooting)

</div>

---

## What is this?

This bot fetches fresh technology headlines and sends them directly to any Telegram chat on demand. Each news item is formatted with a **bold title** and a linked source name at the end, so the article is one tap away.

```
*Apple unveils new M4 chip lineup at WWDC 2025*
[The Guardian](https://theguardian.com/...)

*Show HN: I built a local-first SQLite sync engine*
[Hacker News](https://news.ycombinator.com/...)
```

The entire infrastructure runs **100 % free**:

| Layer | Service | Cost |
|-------|---------|------|
| Runtime | Cloudflare Workers (free tier) | Free |
| CI/CD | GitHub Actions | Free |
| News: tech | The Guardian Open API | Free |
| News: community | Hacker News Firebase API | Free, no key |

---

## Features

- **Serverless** — no server to manage, scales to zero when idle
- **Zero local tooling** — no Node.js, npm, or Wrangler needed on your machine
- **Parallel fetching** — Guardian and Hacker News are fetched with `Promise.all`
- **MarkdownV2 safe** — all special characters are escaped correctly for Telegram
- **Auto-deploy** — every `git push` to `main` triggers a new deployment
- **Encrypted secrets** — API keys are stored as Cloudflare Worker secrets, never in code

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript |
| Runtime | Cloudflare Workers (V8 isolates) |
| Build & deploy tool | Wrangler (runs in CI only) |
| CI/CD | GitHub Actions + `cloudflare/wrangler-action` |
| News source 1 | [The Guardian Open Platform](https://open-platform.theguardian.com) |
| News source 2 | [Hacker News Firebase API](https://github.com/HackerNews/API) |
| Telegram integration | Webhook (HTTP POST from Telegram → Worker) |

---

## Project Structure

```
telegram-news-bot/
├── src/
│   └── index.ts                    # Bot logic (fetch, format, send)
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline
├── wrangler.toml                   # Cloudflare Worker config
├── package.json                    # Dependencies (wrangler, ts types)
├── tsconfig.json                   # TypeScript config
├── .gitignore
├── README.md                       # This file
└── README.FA.md                    # Persian documentation
```

---

## Setup Guide

### What you need

| Tool | Purpose |
|------|---------|
| **A browser** | Creating accounts, collecting keys |
| **Git** | Only for `git push` — or upload files directly on GitHub.com |

> All build steps, dependency installation, and deployment run inside **GitHub Actions** on GitHub's servers. Nothing runs on your machine.

---

### Phase 1 — Collect 4 keys (all in your browser)

#### 1.1 Telegram Bot Token

1. Open **@BotFather** in Telegram
2. Send `/newbot`
3. Choose a display name (e.g. `Tech News Bot`)
4. Choose a username ending in `bot` (e.g. `my_technews_bot`)
5. BotFather replies with a token like:
   ```
   7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. Save it as → **`TELEGRAM_BOT_TOKEN`**

#### 1.2 Guardian API Key

1. Go to <https://open-platform.theguardian.com/access/>
2. Click **"Register for a developer key"**
3. Fill in the free registration form
4. An API key arrives in your email:
   ```
   a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```
5. Save it as → **`GUARDIAN_API_KEY`**

#### 1.3 Cloudflare Account ID

1. Sign up at <https://dash.cloudflare.com/sign-up> (free plan is enough)
2. Verify your email
3. Navigate to **Workers & Pages → Overview**
4. Find **Account ID** in the right-hand sidebar — copy it
5. Save it as → **`CLOUDFLARE_ACCOUNT_ID`**

#### 1.4 Cloudflare API Token

1. Go to <https://dash.cloudflare.com/profile/api-tokens>
2. Click **"Create Token"**
3. Select the **"Edit Cloudflare Workers"** template
4. Set:
   - Account Resources → **Include → All accounts**
   - Zone Resources → **Include → All zones**
5. Click **"Continue to summary"** → **"Create Token"**
6. Copy the token immediately — it is shown **only once**
7. Save it as → **`CLOUDFLARE_API_TOKEN`**

---

### Phase 2 — Create the GitHub Repository

#### 2.1 New repository

1. Go to <https://github.com/new>
2. Name it `telegram-news-bot`
3. Set it to **Private**
4. Click **"Create repository"**

#### 2.2 Add 4 repository secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

Add all four secrets:

| Secret name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | From step 1.4 |
| `CLOUDFLARE_ACCOUNT_ID` | From step 1.3 |
| `TELEGRAM_BOT_TOKEN` | From step 1.1 |
| `GUARDIAN_API_KEY` | From step 1.2 |

---

### Phase 3 — Upload the project files

#### Option A — Directly on GitHub.com *(no git required)*

For each file click **Add file → Create new file** inside the repository.

> **Tip:** To create nested files, type the full path in the filename field.  
> Example: type `src/index.ts` — GitHub creates the `src/` folder automatically.

Create these files in any order:

```
src/index.ts
wrangler.toml
package.json
tsconfig.json
.gitignore
.github/workflows/deploy.yml   ← triggers deployment
```

After committing the last file GitHub Actions starts automatically.

#### Option B — With git push

```bash
git clone https://github.com/YOUR_USERNAME/telegram-news-bot.git
cd telegram-news-bot

# Copy all project files into this directory

git add .
git commit -m "feat: Telegram tech news bot"
git push origin main
```

---

### Phase 4 — Watch the automatic deployment

1. Open your repository → **Actions** tab
2. Find the **"Deploy to Cloudflare Workers"** run
3. Wait ~30–60 seconds
4. ✅ Green checkmark = deployed successfully

**What happens inside GitHub Actions:**

```
git push
    │
    ▼
actions/checkout@v4      pulls your code onto the GitHub runner
    │
    ▼
npm install              installs wrangler & TypeScript (on GitHub's server)
    │
    ▼
wrangler deploy          compiles TypeScript → uploads Worker to Cloudflare
    │
    ▼
secrets inject           encrypts TELEGRAM_BOT_TOKEN & GUARDIAN_API_KEY
                         into the Worker environment on Cloudflare
    │
    ▼
✅  Bot is live at  https://telegram-news-bot.YOUR_SUBDOMAIN.workers.dev
```

---

### Phase 5 — Activate the bot *(one-time, in your browser)*

#### 5.1 Find your Worker URL

Go to **Cloudflare Dashboard → Workers & Pages → telegram-news-bot**

The URL shown there looks like:
```
https://telegram-news-bot.johndoe.workers.dev
```

#### 5.2 Register the Telegram webhook

Open this URL in your browser (replace both values):

```
https://api.telegram.org/botTELEGRAM_BOT_TOKEN/setWebhook?url=WORKER_URL
```

**Real example:**
```
https://api.telegram.org/bot7123456789:AAFxxx/setWebhook?url=https://telegram-news-bot.johndoe.workers.dev
```

A successful response looks like:
```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

---

### Phase 6 — Test the bot

Open Telegram, find your bot by its `@username`, and send:

| Command | Result |
|---------|--------|
| `/start` | Welcome message and help |
| `/guardian` | 5 latest articles from The Guardian |
| `/hackernews` | 5 top stories from Hacker News |
| `/all` | Both sources together |

---

## Updating the Bot

Every future change deploys automatically:

```bash
git add .
git commit -m "update: your change description"
git push origin main
# ✅ GitHub Actions re-deploys in ~30 seconds — no manual steps needed
```

---

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Show help message |
| `/help` | Show help message |
| `/guardian` | Latest 5 tech articles from The Guardian |
| `/hackernews` | Top 5 stories from Hacker News |
| `/all` | All news from both sources |

---

## Secrets Reference

| Secret | Where to get it |
|--------|----------------|
| `CLOUDFLARE_API_TOKEN` | <https://dash.cloudflare.com/profile/api-tokens> |
| `CLOUDFLARE_ACCOUNT_ID` | Workers & Pages → Overview → right sidebar |
| `TELEGRAM_BOT_TOKEN` | @BotFather in Telegram |
| `GUARDIAN_API_KEY` | <https://open-platform.theguardian.com/access/> |

---

## Troubleshooting

### Bot does not respond

Check that the webhook is correctly registered by opening this URL:
```
https://api.telegram.org/botTOKEN/getWebhookInfo
```
The `url` field must match your Worker URL exactly.

### GitHub Actions fails (red ✗)

1. Click the failed run → read the log
2. Most common cause: a secret was pasted with an extra space or newline
3. Go to Settings → Secrets → delete and re-add the affected secret

### Cloudflare 401 error

Your `CLOUDFLARE_API_TOKEN` has expired or was entered incorrectly.  
Create a new token in the Cloudflare dashboard and update the GitHub secret.

### Telegram 400: "can't parse entities"

A news title contains unescaped MarkdownV2 characters.  
The `esc()` function in `src/index.ts` handles this — ensure it wraps every dynamic string.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
