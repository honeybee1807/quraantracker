<div align="center">

<img src="MQT_logo.png" alt="My Quraan Tracker" width="220"/>

<br/>

# My Quraan Tracker

**Organise group Quraan Khatams · Count Zikr & Durood · Track Yaaseen recitations**

*For the pleasure of Allah — By Olideen Technologies*

<br/>

[![Live App](https://img.shields.io/badge/🌐%20Live%20App-myquraantracker.netlify.app-0D4A3E?style=for-the-badge)](https://myquraantracker.netlify.app)
[![Netlify Status](https://img.shields.io/netlify/your-netlify-id?style=for-the-badge&logo=netlify&label=Netlify)](https://myquraantracker.netlify.app)
[![License](https://img.shields.io/badge/License-MIT-C9A84C?style=for-the-badge)](LICENSE)

<br/>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

</div>

---

## 📖 About

**My Quraan Tracker** is a free, mobile-first web app built for Muslim families and communities to organise acts of worship together — without the chaos of messy WhatsApp lists, no app downloads, no sign-in, and no banking details required.

> *No more "who has which para?" — everything is tracked in one beautiful place.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 📖 **Group Quraan Khatam** | Create a Khatam, allocate all 30 paras, and track who's completed what — live across all devices |
| 🤲 **Zikr & Durood Counter** | Quick personal tasbeeh counter, or set a group target and track everyone's contributions |
| ⭐ **Surah Yaaseen Counter** | Count and track Yaaseen recitations individually or as a group |
| 📲 **WhatsApp Sharing** | Share a clean short link — no base64, no codes, no ugly long URLs |
| ☁️ **Supabase Backend** | All data saved to the cloud — updates sync across different phones instantly |
| 🕐 **SA Timestamps** | Every WhatsApp share includes the exact SA time the update was made |
| 📱 **Mobile-First** | Designed exclusively for phone use, single page, no navigation |
| ♿ **Ultra Simple UI** | Usable by any age — from 5 to 90 years old |

---

## 🗂️ File Structure

```
📁 myquraantracker/
├── 🏠  index.html          → Single-page app — all three tools inline
├── 🎨  style.css           → All styling (mobile-first, card-based)
├── ⚙️  config.js           → Supabase credentials (window.SUPABASE_CONFIG)
├── 🖼️  MQT_logo.png        → App logo (also used as favicon)
├── 🗺️  sitemap.xml         → SEO sitemap
├── 🤖  robots.txt          → Search engine instructions
└── 📄  CNAME               → Custom domain config
```

---

## 🚀 How It Works

```
1️⃣  Someone creates a Khatam, Zikr, or Yaaseen counter
        ↓
2️⃣  Data is saved to Supabase — a short ID is generated (e.g. XK3TQ)
        ↓
3️⃣  WhatsApp message is sent with a clean link:
     *Esale Sawaab* — Quraan Khatam
     12 of 30 paras completed as of 11 May 26 @ 14:32 (South Africa Standard Time)

     Please click the link to claim your para.
     https://myquraantracker.netlify.app/?k=XK3TQ
        ↓
4️⃣  Family opens the link — data loads live from Supabase
        ↓
5️⃣  They enter their name and tap a para to claim it
        ↓
6️⃣  Para is saved to Supabase — everyone sees the same state 🤲
```

---

## 🎨 Design

| | |
|---|---|
| **Palette** | Deep Teal `#0D4A3E` + Gold `#C9A84C` + Warm Cream `#FAF7F2` |
| **Typography** | DM Sans (UI) + Amiri (Arabic text) |
| **Icons** | FontAwesome 6.5 via CDN |
| **Layout** | Single page, accordion tools, max-width 480px |
| **Target** | Mobile phones — inspired by khatm.site's simplicity |
| **Vibe** | Soft · Elegant · Unisex · Islamic identity |

---

## 📦 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| 🏗️ Structure | HTML5 — single `index.html`, no routing |
| 🎨 Styling | CSS3 — custom properties, mobile-first, all in `style.css` |
| ⚙️ Logic | Vanilla JavaScript — no frameworks, no npm |
| ☁️ Database | Supabase (PostgreSQL) — REST API via raw `fetch` |
| 💾 Local Cache | `localStorage` — previous Khatams list, standalone tasbeeh |
| 🚀 Hosting | Netlify — free tier, auto-deploy from GitHub |
| 📦 Version Control | GitHub |
| 🔍 SEO | Sitemap · robots.txt · Open Graph · Twitter Card · Google Search Console |

</div>

---

## 🗄️ Database Schema

```sql
-- Khatam tracking
khatms (
  id          text PRIMARY KEY,   -- short random code e.g. "XK3TQ"
  description text,               -- e.g. "Esale Sawaab for Dadi"
  paras       jsonb,              -- array of 30 para objects
  created_at  timestamp
)

-- Zikr / Durood group counter
zikr_counters (
  id            text PRIMARY KEY,
  description   text,
  target        int8,
  total         int8,
  contributions jsonb             -- array of { name, count }
)

-- Yaaseen group counter
yaaseen_counters (
  id            text PRIMARY KEY,
  description   text,
  target        int8,
  total         int8,
  contributions jsonb
)
```

All tables have RLS enabled with public `SELECT`, `INSERT`, and `UPDATE` policies for the `anon` role.

---

## 🛠️ Local Development

```bash
# 1. Clone the repo
git clone https://github.com/honeybee1807/quraantracker.git

# 2. Open in VS Code
cd quraantracker
code .

# 3. Make sure config.js has your Supabase credentials:
# var SUPABASE_URL = 'https://your-project.supabase.co';
# var SUPABASE_KEY = 'your-anon-key';
# var APP_DOMAIN   = 'https://myquraantracker.netlify.app';
# window.SUPABASE_CONFIG = { url: SUPABASE_URL, key: SUPABASE_KEY, appDomain: APP_DOMAIN };

# 4. Open with Live Server (VS Code extension)
# No build step, no npm install — just open and go ✅
```

---

## 🌍 Deployment

This app is deployed on **Netlify** via GitHub integration.

Every `git push` to `main` triggers an automatic redeploy within ~60 seconds.

```bash
git add .
git commit -m "feat: your update"
git push
# ✅ Live in ~60 seconds
```

> **Note:** `config.js` contains your Supabase anon key. This key is safe to commit — it is designed to be public. Your RLS policies protect the data, not the key.

---

## 🤲 Purpose

This app was built **for the pleasure of Allah** to make it easier for Muslim families to:

- Complete group Quraan Khatams for loved ones (Esale Sawaab)
- Organise Khatams during Ramadan, weddings, and special occasions
- Count collective Durood, Tasbeeh, and Zikr as a community
- Remove the admin burden from whoever organises the Khatam

> *"Whoever facilitates ease for another, Allah will facilitate ease for them in this world and the Hereafter."* — Sahih Muslim

---

## 👩‍💻 Built By

<div align="center">

**Olideen Technologies**

[![Website](https://img.shields.io/badge/🌐%20Website-olideen.co.za-0D4A3E?style=for-the-badge)](https://olideen.co.za)
[![GitHub](https://img.shields.io/badge/GitHub-honeybee1807-181717?style=for-the-badge&logo=github)](https://github.com/honeybee1807)

*Building technology with purpose.*

</div>

---

<div align="center">

Made with 🤍 in South Africa

**بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**

</div>
