<div align="center">

# 📰 ربات اخبار تکنولوژی تلگرام

**یک ربات تلگرام سرورلس که آخرین اخبار تکنولوژی را از The Guardian و Hacker News دریافت و ارسال می‌کند — روی Cloudflare Workers مستقر شده با CI/CD کاملاً خودکار از طریق GitHub Actions.**

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) · [راهنمای راه‌اندازی](#راهنمای-راه‌اندازی) · [دستورات ربات](#دستورات-ربات) · [رفع اشکال](#رفع-اشکال)

</div>

---

## این پروژه چیست؟

این ربات آخرین اخبار تکنولوژی را جمع‌آوری کرده و مستقیماً در تلگرام ارسال می‌کند. هر خبر با **تیتر بولد** نمایش داده می‌شود و در انتها نام منبع به‌عنوان لینک کلیک‌پذیر قرار می‌گیرد:

```
*Apple unveils new M4 chip lineup at WWDC 2025*
[The Guardian](https://theguardian.com/...)

*Show HN: I built a local-first SQLite sync engine*
[Hacker News](https://news.ycombinator.com/...)
```

تمام زیرساخت **کاملاً رایگان** است:

| لایه | سرویس | هزینه |
|------|--------|--------|
| اجرا | Cloudflare Workers (پلن رایگان) | رایگان |
| CI/CD | GitHub Actions | رایگان |
| اخبار تکنولوژی | The Guardian Open API | رایگان |
| اخبار جامعه توسعه‌دهندگان | Hacker News Firebase API | رایگان، بدون کلید |

---

## ویژگی‌ها

- **سرورلس** — بدون سرور، در زمان بیکاری هیچ منبعی مصرف نمی‌شود
- **بدون نیاز به ابزار محلی** — نه Node.js، نه npm، نه Wrangler روی سیستم شما
- **دریافت موازی** — Guardian و Hacker News با `Promise.all` همزمان دریافت می‌شوند
- **ایمن در برابر MarkdownV2** — تمام کاراکترهای خاص برای تلگرام escape می‌شوند
- **استقرار خودکار** — هر `git push` به شاخه `main` یک استقرار جدید ایجاد می‌کند
- **رمزنگاری secrets** — کلیدهای API به‌عنوان Worker secret در Cloudflare ذخیره می‌شوند، هرگز در کد

---

## پشته فناوری

| بخش | فناوری |
|-----|--------|
| زبان برنامه‌نویسی | TypeScript |
| محیط اجرا | Cloudflare Workers (V8 isolates) |
| ابزار build و deploy | Wrangler (فقط در CI اجرا می‌شود) |
| CI/CD | GitHub Actions + `cloudflare/wrangler-action` |
| منبع اخبار ۱ | [The Guardian Open Platform](https://open-platform.theguardian.com) |
| منبع اخبار ۲ | [Hacker News Firebase API](https://github.com/HackerNews/API) |
| ارتباط با تلگرام | Webhook (HTTP POST از تلگرام به Worker) |

---

## ساختار پروژه

```
telegram-news-bot/
├── src/
│   └── index.ts                    # منطق اصلی ربات (دریافت، فرمت، ارسال)
├── .github/
│   └── workflows/
│       └── deploy.yml              # خط لوله CI/CD
├── wrangler.toml                   # تنظیمات Cloudflare Worker
├── package.json                    # وابستگی‌ها (wrangler، تایپ‌های TS)
├── tsconfig.json                   # تنظیمات TypeScript
├── .gitignore
├── README.md                       # مستندات انگلیسی
└── README.FA.md                    # همین فایل
```

---

## راهنمای راه‌اندازی

### ابزار مورد نیاز

| ابزار | کاربرد |
|-------|--------|
| **مرورگر** | ساخت حساب‌ها، جمع‌آوری کلیدها |
| **Git** | فقط برای `git push` — یا آپلود مستقیم روی GitHub.com |

> تمام مراحل build، نصب وابستگی‌ها و استقرار درون **GitHub Actions** روی سرورهای گیت‌هاب اجرا می‌شوند. هیچ چیزی روی سیستم شما اجرا نمی‌شود.

---

### فاز ۱ — جمع‌آوری ۴ کلید (همه در مرورگر)

#### ۱.۱ توکن ربات تلگرام

1. در تلگرام **@BotFather** را باز کنید
2. دستور `/newbot` را ارسال کنید
3. یک نام نمایشی انتخاب کنید (مثال: `Tech News Bot`)
4. یک username انتخاب کنید که به `bot` ختم شود (مثال: `my_technews_bot`)
5. BotFather یک token مثل این می‌دهد:
   ```
   7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. ذخیره کنید با نام → **`TELEGRAM_BOT_TOKEN`**

#### ۱.۲ کلید API گاردین

1. به آدرس <https://open-platform.theguardian.com/access/> بروید
2. روی **"Register for a developer key"** کلیک کنید
3. فرم ثبت‌نام رایگان را پر کنید
4. یک API key به ایمیل شما می‌آید:
   ```
   a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```
5. ذخیره کنید با نام → **`GUARDIAN_API_KEY`**

#### ۱.۳ حساب Cloudflare + Account ID

1. در <https://dash.cloudflare.com/sign-up> ثبت‌نام کنید (پلن رایگان کافی است)
2. ایمیل خود را تأیید کنید
3. به بخش **Workers & Pages → Overview** بروید
4. **Account ID** را در ستون سمت راست صفحه پیدا و کپی کنید
5. ذخیره کنید با نام → **`CLOUDFLARE_ACCOUNT_ID`**

#### ۱.۴ API Token کلودفلر

1. به <https://dash.cloudflare.com/profile/api-tokens> بروید
2. روی **"Create Token"** کلیک کنید
3. قالب آماده **"Edit Cloudflare Workers"** را انتخاب کنید
4. تنظیمات:
   - Account Resources → **Include → All accounts**
   - Zone Resources → **Include → All zones**
5. روی **"Continue to summary"** → **"Create Token"** کلیک کنید
6. **توجه:** توکن فقط یک‌بار نمایش داده می‌شود — همین لحظه کپی کنید
7. ذخیره کنید با نام → **`CLOUDFLARE_API_TOKEN`**

---

### فاز ۲ — ساخت Repository گیت‌هاب

#### ۲.۱ ساخت Repository جدید

1. به <https://github.com/new> بروید
2. نام را `telegram-news-bot` بگذارید
3. گزینه **Private** را انتخاب کنید
4. روی **"Create repository"** کلیک کنید

#### ۲.۲ اضافه کردن ۴ Secret

مسیر: **Settings → Secrets and variables → Actions → New repository secret**

چهار secret را یکی‌یکی اضافه کنید:

| نام Secret | مقدار |
|-----------|-------|
| `CLOUDFLARE_API_TOKEN` | از مرحله ۱.۴ |
| `CLOUDFLARE_ACCOUNT_ID` | از مرحله ۱.۳ |
| `TELEGRAM_BOT_TOKEN` | از مرحله ۱.۱ |
| `GUARDIAN_API_KEY` | از مرحله ۱.۲ |

---

### فاز ۳ — آپلود فایل‌های پروژه

#### روش الف — مستقیم روی GitHub.com *(بدون git)*

برای هر فایل روی **Add file → Create new file** کلیک کنید.

> **نکته:** برای فایل‌های داخل پوشه، مسیر کامل را در قسمت نام تایپ کنید.  
> مثال: تایپ کنید `src/index.ts` — گیت‌هاب پوشه `src/` را خودکار می‌سازد.

این فایل‌ها را بسازید:

```
src/index.ts
wrangler.toml
package.json
tsconfig.json
.gitignore
.github/workflows/deploy.yml   ← استقرار را فعال می‌کند
```

پس از commit کردن آخرین فایل، GitHub Actions خودکار شروع می‌شود.

#### روش ب — با git push

```bash
git clone https://github.com/YOUR_USERNAME/telegram-news-bot.git
cd telegram-news-bot

# همه فایل‌های پروژه را اینجا کپی کنید

git add .
git commit -m "feat: Telegram tech news bot"
git push origin main
```

---

### فاز ۴ — پیگیری استقرار خودکار

1. وارد repository در گیت‌هاب شوید → تب **Actions**
2. اجرای **"Deploy to Cloudflare Workers"** را می‌بینید
3. حدود ۳۰ تا ۶۰ ثانیه صبر کنید
4. ✅ علامت سبز = استقرار موفق

**جریان کار داخل GitHub Actions:**

```
git push
    │
    ▼
actions/checkout@v4      کد را روی سرور GitHub دریافت می‌کند
    │
    ▼
npm install              wrangler و TypeScript را روی سرور GitHub نصب می‌کند
    │
    ▼
wrangler deploy          TypeScript را کامپایل و Worker را روی Cloudflare آپلود می‌کند
    │
    ▼
secrets inject           TELEGRAM_BOT_TOKEN و GUARDIAN_API_KEY را
                         به‌صورت رمزنگاری‌شده درون Worker ذخیره می‌کند
    │
    ▼
✅  ربات زنده است روی  https://telegram-news-bot.YOUR_SUBDOMAIN.workers.dev
```

---

### فاز ۵ — فعال‌سازی ربات *(یک‌بار، در مرورگر)*

#### ۵.۱ پیدا کردن Worker URL

وارد **Cloudflare Dashboard → Workers & Pages → telegram-news-bot** شوید.

URL نمایش داده‌شده به شکل زیر است:
```
https://telegram-news-bot.johndoe.workers.dev
```

این آدرس را به‌عنوان **WORKER_URL** یادداشت کنید.

#### ۵.۲ ثبت Webhook تلگرام (فقط با باز کردن یک URL در مرورگر)

آدرس زیر را در مرورگر باز کنید (مقادیر را جایگزین کنید):

```
https://api.telegram.org/botTELEGRAM_BOT_TOKEN/setWebhook?url=WORKER_URL
```

**مثال واقعی:**
```
https://api.telegram.org/bot7123456789:AAFxxx/setWebhook?url=https://telegram-news-bot.johndoe.workers.dev
```

پاسخ موفق در مرورگر:
```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

---

### فاز ۶ — تست ربات

ربات را در تلگرام با username آن پیدا کنید و دستورات زیر را امتحان کنید:

| دستور | نتیجه |
|-------|--------|
| `/start` | پیام خوش‌آمد و راهنما |
| `/guardian` | ۵ خبر آخر از The Guardian |
| `/hackernews` | ۵ خبر برتر از Hacker News |
| `/all` | اخبار هر دو منبع |

---

## به‌روزرسانی ربات

هر تغییر در کد به‌صورت خودکار مستقر می‌شود:

```bash
git add .
git commit -m "update: توضیح تغییر"
git push origin main
# ✅ GitHub Actions در ~۳۰ ثانیه دوباره deploy می‌کند — هیچ کار دستی لازم نیست
```

---

## دستورات ربات

| دستور | توضیح |
|-------|--------|
| `/start` | نمایش راهنما |
| `/help` | نمایش راهنما |
| `/guardian` | ۵ خبر آخر از The Guardian |
| `/hackernews` | ۵ خبر برتر از Hacker News |
| `/all` | اخبار هر دو منبع با هم |

---

## مرجع Secretها

| نام Secret | محل دریافت |
|-----------|------------|
| `CLOUDFLARE_API_TOKEN` | <https://dash.cloudflare.com/profile/api-tokens> |
| `CLOUDFLARE_ACCOUNT_ID` | Workers & Pages → Overview → ستون راست |
| `TELEGRAM_BOT_TOKEN` | @BotFather در تلگرام |
| `GUARDIAN_API_KEY` | <https://open-platform.theguardian.com/access/> |

---

## رفع اشکال

### ربات جواب نمی‌دهد

Webhook را بررسی کنید — این آدرس را در مرورگر باز کنید:
```
https://api.telegram.org/botTOKEN/getWebhookInfo
```
مقدار فیلد `url` باید دقیقاً با Worker URL شما یکسان باشد.

### GitHub Actions قرمز (شکست خورده) است

1. روی اجرای شکست‌خورده کلیک کنید → لاگ را بخوانید
2. شایع‌ترین علت: secret اشتباه وارد شده (فاصله اضافه یا کاراکتر زائد)
3. مسیر Settings → Secrets → آن secret را حذف و دوباره اضافه کنید

### خطای ۴۰۱ در Cloudflare

`CLOUDFLARE_API_TOKEN` منقضی شده یا اشتباه وارد شده است.  
یک توکن جدید در داشبورد Cloudflare بسازید و GitHub Secret را آپدیت کنید.

### خطای تلگرام: "can't parse entities"

یک تیتر خبری حاوی کاراکتر خاص escape‌نشده است.  
تابع `esc()` در `src/index.ts` باید تمام رشته‌های پویا را wrap کند.

---

## مجوز

[MIT](LICENSE) — آزادانه استفاده، ویرایش و توزیع کنید.
