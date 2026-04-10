<div align="center">

<img src="MQT_logo.png" alt="My Quraan Tracker" width="220"/>

<br/>

# My Quraan Tracker

**Organise group Quraan Khatms · Count Zikr & Durood · Track Yaaseen recitations**

*For the pleasure of Allah — By Olideen Technologies*

<br/>

[![Live App](https://img.shields.io/badge/🌐%20Live%20App-myquraantracker.netlify.app-0D4A3E?style=for-the-badge)](https://myquraantracker.netlify.app)
[![Netlify Status](https://img.shields.io/netlify/your-netlify-id?style=for-the-badge&logo=netlify&label=Netlify)](https://myquraantracker.netlify.app)
[![License](https://img.shields.io/badge/License-MIT-C9A84C?style=for-the-badge)](LICENSE)

<br/>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
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
| 📖 **Group Quraan Khatm** | Create a Khatm, allocate all 30 paras, and track who's completed what |
| 🤲 **Zikr & Durood Counter** | Set a group target and track everyone's contributions |
| ⭐ **Surah Yaaseen Counter** | Count and track Yaaseen recitations individually or as a group |
| 📲 **WhatsApp Sharing** | Share via WhatsApp with a clean short code — no ugly long links |
| 🔑 **Code-Based Joining** | Family joins using a simple 5-letter code — no login needed |
| 📵 **Works Offline** | System fonts only — no Google Fonts dependency |
| 📱 **Mobile-First** | Designed exclusively for phone use, with large tap targets |
| ♿ **Ultra Simple UI** | Usable by any age — from 5 to 90 years old |

---

## 🖥️ Pages

```
📁 myquraantracker/
├── 🏠  index.html          → Home — create or join a Khatm / Zikr
├── 📖  quraan.html         → Quraan Khatm tracker with all 30 paras
├── 🤲  zikr.html           → Zikr, Durood & Tasbeeh counter
├── ⭐  yaaseencounts.html  → Surah Yaaseen group counter
├── 🎨  style.css           → All styling (mobile-first, offline-safe)
├── ⚙️  script.js           → All functionality
├── 🖼️  MQT_logo.png        → App logo
├── 🗺️  sitemap.xml         → SEO sitemap
└── 🤖  robots.txt          → Search engine instructions
```

---

## 🚀 How It Works

```
1️⃣  Someone creates a Khatm on their phone
        ↓
2️⃣  App generates a unique 5-letter code (e.g. AB3KX)
        ↓
3️⃣  WhatsApp message is sent to the family group
     📖 Esale Sawaab — Quraan Khatm
     🔑 Khatm Code: AB3KX
     🌐 Open: myquraantracker.netlify.app
        ↓
4️⃣  Family opens the app, enters the code, claims their para
        ↓
5️⃣  Once read, they mark it done ✓
        ↓
6️⃣  Progress updates for everyone 🤲
```

---

## 🎨 Design

| | |
|---|---|
| **Palette** | Deep Teal `#0D4A3E` + Gold `#C9A84C` + Warm Cream `#FAF7F2` |
| **Typography** | Georgia (serif headings) + Segoe UI (body) — 100% offline |
| **Layout** | Card-based, swipeable feel, max-width 480px |
| **Target** | Mobile phones only |
| **Vibe** | Soft · Elegant · Unisex · Islamic identity |

---

## 📦 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| 🏗️ Structure | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) |
| 🎨 Styling | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) Custom Properties · Mobile-first · No frameworks |
| ⚙️ Logic | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) Vanilla ES6+ · No libraries |
| 💾 Storage | Browser `localStorage` — no database, no backend |
| 🚀 Hosting | ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white) Free tier · Auto-deploy from GitHub |
| 📦 Version Control | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white) |
| 🔍 SEO | Sitemap · robots.txt · Open Graph · Google Search Console |

</div>

---

## 🛠️ Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/quraantracker.git

# 2. Open in VS Code
cd quraantracker
code .

# 3. Open index.html in your browser
# No build step, no npm install — just open and go ✅
```

---

## 🌍 Deployment

This app is deployed on **Netlify** via GitHub integration.

Every `git push` to `main` triggers an automatic redeploy.

```bash
git add .
git commit -m "Your update"
git push
# ✅ Live in ~30 seconds
```

---

## 📱 Screenshots

> *Mobile-first design — built for the phone, always.*

| Home | Quraan Khatm | Zikr Counter |
|---|---|---|
| Create or join a Khatm | Claim your para | Tap to count |

---

## 🤲 Purpose

This app was built **for the pleasure of Allah** to make it easier for Muslim families to:

- Complete group Quraan Khatms for loved ones (Esale Sawaab)
- Organise Khatms during Ramadan, weddings, and special occasions
- Count collective Durood, Tasbeeh, and Zikr as a community
- Remove the admin burden from whoever organises the Khatm

> *"Whoever facilitates ease for another, Allah will facilitate ease for them in this world and the Hereafter."* — Sahih Muslim

---

## 👩‍💻 Built By

<div align="center">

**Olideen Technologies**

[![Website](https://img.shields.io/badge/🌐%20Website-olideentech.com-0D4A3E?style=for-the-badge)](https://olideentech.com)
[![GitHub](https://img.shields.io/badge/GitHub-OlideenTech-181717?style=for-the-badge&logo=github)](https://github.com/OlideenTech)

*Building technology with purpose.*

</div>

---

<div align="center">

Made with 🤍 in South Africa

**بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**

</div>