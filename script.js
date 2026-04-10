/* =============================================
   MY QURAAN TRACKER — script.js
   Sharing: URL-encoded data (no database needed)
   Works across all phones via WhatsApp links
   ============================================= */

const PARA_NAMES = [
  "Alif Lam Meem","Sayaqool","Tilkar Rusul","Lan Tana Loo",
  "Wal Mohsanat","La Yuhibbullah","Wa Iza Samiu","Wa Lau Annana",
  "Qalal Malao","Wa A'lamu","Ya'tazeroon","Wa Ma Min Dabbah",
  "Wa Ma Ubarri-u","Rubama","Subhanalazi","Qal Alam","Iqtaraba",
  "Qad Aflaha","Wa Qalallazina","A'man Khalaq","Utlu Ma Oohi-a",
  "Wa Man Yaqnut","Wa Mali-ya","Faman Azlamu","Elahe Yuraddu",
  "Ha Meem","Qala Fama Khatbukum","Qad Sami Allah","Tabarakallazi","Amma"
];

// ── HELPERS ──────────────────────────────────

function getParam(n) {
  return new URLSearchParams(window.location.search).get(n);
}

// Encode khatm object into a URL-safe string
function encodeKhatm(khatm) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(khatm))));
}

// Decode khatm from URL string
function decodeKhatm(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch(e) { return null; }
}

// Encode zikr object
function encodeZikr(zikr) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(zikr))));
}

function decodeZikr(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch(e) { return null; }
}

// Build the shareable WhatsApp link for a khatm
const APP_DOMAIN = 'https://myquraantracker.netlify.app';

function buildKhatmShareLink(khatm) {
  const encoded = encodeKhatm(khatm);
  return `${APP_DOMAIN}/quraan.html?k=${encoded}`;
}

function buildZikrShareLink(zikr) {
  const encoded = encodeZikr(zikr);
  return `${APP_DOMAIN}/zikr.html?z=${encoded}`;
}

// Shorten a URL using TinyURL (free, no signup, no API key)
async function shortenUrl(longUrl) {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    if (res.ok) {
      const short = await res.text();
      if (short.startsWith('https://tinyurl.com/')) return short;
    }
  } catch(e) { /* fall through to long URL */ }
  return longUrl; // fallback to full URL if shortener fails
}

// Share on WhatsApp — shortens link first so it's clean and clickable
async function whatsappShare(text, url) {
  // Show a brief "preparing..." state on the button
  const btns = document.querySelectorAll('[onclick*="WhatsApp"]');
  btns.forEach(b => { b._orig = b.innerHTML; b.innerHTML = '⏳ Preparing…'; b.disabled = true; });

  const shortUrl = await shortenUrl(url);

  btns.forEach(b => { b.innerHTML = b._orig; b.disabled = false; });

  const msg = encodeURIComponent(`${text}\n${shortUrl}`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// Save khatm to localStorage (for "My Khatms" list on home)
function saveKhatmLocal(khatm) {
  const all = JSON.parse(localStorage.getItem('mqt_khatms') || '[]');
  const idx = all.findIndex(k => k.code === khatm.code);
  if (idx >= 0) all[idx] = khatm; else all.push(khatm);
  localStorage.setItem('mqt_khatms', JSON.stringify(all));
}

function generateCode() {
  return Math.random().toString(36).substring(2,7).toUpperCase();
}

// ─────────────────────────────────────────────
//  KHATM PAGE
// ─────────────────────────────────────────────
let activeKhatm = null;

function initKhatmPage() {
  // Check URL for encoded khatm data
  const kParam = getParam('k');
  if (kParam) {
    const khatm = decodeKhatm(kParam);
    if (!khatm) { showKhatmForm(); return; }
    activeKhatm = khatm;
    saveKhatmLocal(khatm); // save locally so it appears in "My Khatms"
    showKhatmView(khatm);
    return;
  }
  showKhatmForm();
}

function showKhatmForm() {
  document.getElementById('khatmFormSection').style.display = 'block';
  document.getElementById('khatmView').style.display = 'none';
}

function showKhatmView(khatm) {
  document.getElementById('khatmFormSection').style.display = 'none';
  document.getElementById('khatmView').style.display = 'block';
  renderKhatm(khatm);
}

function createKhatmFromPage() {
  const desc = document.getElementById('khatmDescPage').value.trim();
  if (!desc) { alert('Please enter a name for your Khatm first.'); return; }
  const khatm = {
    code: generateCode(),
    description: desc,
    createdAt: new Date().toISOString(),
    paras: Array.from({length: 30}, (_, i) => ({
      number: i + 1, assignedTo: '', completed: false
    }))
  };
  activeKhatm = khatm;
  saveKhatmLocal(khatm);
  // Push to URL so page can be refreshed / shared
  const encoded = encodeKhatm(khatm);
  window.history.replaceState({}, '', `quraan.html?k=${encoded}`);
  showKhatmView(khatm);
}

function renderKhatm(khatm) {
  // Title & code
  document.getElementById('khatmTitle').textContent = khatm.description;

  // Progress
  const done = khatm.paras.filter(p => p.completed).length;
  const pct  = Math.round((done / 30) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${done} of 30 paras done`;
  document.getElementById('progressPct').textContent  = pct + '%';

  if (done === 30) document.getElementById('khatmComplete').style.display = 'block';

  // Update share URL in the URL bar
  const encoded = encodeKhatm(khatm);
  window.history.replaceState({}, '', `quraan.html?k=${encoded}`);

  // Paras grid
  const grid = document.getElementById('parasGrid');
  grid.innerHTML = khatm.paras.map(para => {
    if (para.completed) {
      return `<div class="para-tile completed unavailable">
        <span class="para-num">${para.number}</span>
        <span class="para-name">${PARA_NAMES[para.number-1]}</span>
        <span class="para-tick">✓</span>
        <span class="para-who">${para.assignedTo}</span>
      </div>`;
    }
    if (para.assignedTo) {
      return `<div class="para-tile assigned" onclick="markDone(${para.number})">
        <span class="para-num">${para.number}</span>
        <span class="para-name">${PARA_NAMES[para.number-1]}</span>
        <span class="para-who">${para.assignedTo}</span>
        <span style="font-size:0.58rem;color:var(--gold-dark);margin-top:0.2rem;display:block;font-weight:700;">Tap → done</span>
      </div>`;
    }
    return `<div class="para-tile available" onclick="claimPara(${para.number})">
      <span class="para-num">${para.number}</span>
      <span class="para-name">${PARA_NAMES[para.number-1]}</span>
      <span style="font-size:0.58rem;color:var(--teal-mid);margin-top:0.25rem;display:block;font-weight:700;">Tap to claim</span>
    </div>`;
  }).join('');
}

function claimPara(num) {
  if (!activeKhatm) return;
  const name = document.getElementById('yourName').value.trim();
  if (!name) { alert('Please enter your name first!'); document.getElementById('yourName').focus(); return; }
  const para = activeKhatm.paras.find(p => p.number === num);
  if (!para || para.assignedTo) return;
  para.assignedTo = name;
  saveKhatmLocal(activeKhatm);
  renderKhatm(activeKhatm);
}

function markDone(num) {
  if (!activeKhatm) return;
  const para = activeKhatm.paras.find(p => p.number === num);
  if (!para) return;
  if (!confirm(`Mark Para ${num} as complete?`)) return;
  para.completed = true;
  saveKhatmLocal(activeKhatm);
  renderKhatm(activeKhatm);
}

// Share updated Khatm via WhatsApp
function shareKhatmWhatsApp() {
  if (!activeKhatm) return;
  const link = buildKhatmShareLink(activeKhatm);
  const done = activeKhatm.paras.filter(p => p.completed).length;
  const msg  = `📖 *${activeKhatm.description}* — Quraan Khatm\n${done}/30 paras done. Tap to join and claim yours:`;
  whatsappShare(msg, link);
}

// Copy the share link to clipboard
function copyKhatmLink() {
  if (!activeKhatm) return;
  const link = buildKhatmShareLink(activeKhatm);
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('copyLinkBtn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = 'Copy Link', 1800); }
  });
}

// ─────────────────────────────────────────────
//  HOME PAGE — load from URL if khatm in param
// ─────────────────────────────────────────────
function initHomePage() {
  // Load my khatms from localStorage for the "My Khatms" section
  const all = JSON.parse(localStorage.getItem('mqt_khatms') || '[]');
  const section = document.getElementById('myKhatmsSection');
  const list    = document.getElementById('myKhatmsList');
  if (!all.length || !section) return;
  section.style.display = 'block';
  list.innerHTML = all.map(k => {
    const done = k.paras.filter(p => p.completed).length;
    const pct  = Math.round((done / 30) * 100);
    const encoded = encodeKhatm(k);
    return `<a href="quraan.html?k=${encoded}" class="khatm-row">
      <div class="khatm-row-icon"><i class="fas fa-book-quran"></i></div>
      <div class="khatm-row-info">
        <div class="khatm-row-name">${k.description}</div>
        <div class="khatm-row-meta">${done}/30 paras done</div>
        <div class="progress-wrap" style="margin-top:0.35rem;height:6px;"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="khatm-row-pct">${pct}%</div>
    </a>`;
  }).join('');
}

// ─────────────────────────────────────────────
//  ZIKR PAGE
// ─────────────────────────────────────────────
let zikrSession  = 0;
let currentZikr  = null;
let standaloneSession = 0;

function initZikrPage() {
  const zParam = getParam('z');
  if (zParam) {
    const zikr = decodeZikr(zParam);
    if (!zikr) { showZikrForm(); return; }
    currentZikr = zikr;
    document.getElementById('zikrFormSection').style.display = 'none';
    document.getElementById('zikrView').style.display = 'block';
    renderZikr(zikr);
    return;
  }
  showZikrForm();
}

function showZikrForm() {
  document.getElementById('zikrFormSection').style.display = 'block';
  document.getElementById('zikrView').style.display = 'none';
  const saved = parseInt(localStorage.getItem('mqt_standalone_total') || '0');
  const el = document.getElementById('standaloneSaved');
  if (el) el.textContent = saved.toLocaleString();
}

function createZikrFromPage() {
  const desc   = document.getElementById('zikrDescPage').value.trim();
  const target = parseInt(document.getElementById('zikrTargetPage').value) || 100;
  if (!desc) { alert('Please enter what you are counting.'); return; }
  const zikr = {
    code: generateCode(), description: desc, target,
    total: 0, contributions: [], createdAt: new Date().toISOString()
  };
  currentZikr = zikr;
  const encoded = encodeZikr(zikr);
  window.history.replaceState({}, '', `zikr.html?z=${encoded}`);
  document.getElementById('zikrFormSection').style.display = 'none';
  document.getElementById('zikrView').style.display = 'block';
  renderZikr(zikr);
}

function renderZikr(zikr) {
  document.getElementById('zikrTitle').textContent         = zikr.description;
  document.getElementById('zikrTotalCount').textContent    = zikr.total.toLocaleString();
  document.getElementById('zikrTargetDisplay').textContent = zikr.target.toLocaleString();
  const pct = Math.min(100, Math.round((zikr.total / zikr.target) * 100));
  document.getElementById('zikrProgressFill').style.width  = pct + '%';
  document.getElementById('zikrProgressPct').textContent   = pct + '%';
  const el = document.getElementById('zikrContributions');
  el.innerHTML = zikr.contributions.length === 0
    ? '<div class="empty-state"><i class="fas fa-hand-holding-heart"></i><p>No contributions yet — be the first!</p></div>'
    : zikr.contributions.map(c =>
        `<div class="contrib-item"><span class="contrib-name">${c.name}</span><span class="contrib-count">${c.count.toLocaleString()}</span></div>`
      ).join('');
  // update URL with latest data
  const encoded = encodeZikr(zikr);
  window.history.replaceState({}, '', `zikr.html?z=${encoded}`);
}

function tapZikr() {
  zikrSession++;
  const el = document.getElementById('zikrSessionCount');
  el.textContent = zikrSession.toLocaleString();
  el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 250);
}

function saveZikrSession() {
  if (zikrSession === 0) { alert('Tap the button first to count!'); return; }
  const name = document.getElementById('zikrYourName').value.trim() || 'Anonymous';
  if (!currentZikr) return;
  currentZikr.total += zikrSession;
  const ex = currentZikr.contributions.find(c => c.name === name);
  if (ex) ex.count += zikrSession; else currentZikr.contributions.push({ name, count: zikrSession });
  zikrSession = 0;
  document.getElementById('zikrSessionCount').textContent = '0';
  renderZikr(currentZikr);
}

function shareZikrWhatsApp() {
  if (!currentZikr) return;
  const link = buildZikrShareLink(currentZikr);
  const msg  = `🤲 *${currentZikr.description}* — Group Zikr\nTotal: ${currentZikr.total}/${currentZikr.target}. Tap to join:`;
  whatsappShare(msg, link);
}

// ── STANDALONE TASBEEH ──
function tapStandalone() {
  standaloneSession++;
  const el = document.getElementById('standaloneCount');
  if (el) { el.textContent = standaloneSession.toLocaleString(); el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 250); }
  const s = document.getElementById('standaloneSession');
  if (s) s.textContent = standaloneSession.toLocaleString();
}
function saveStandalone() {
  const prev = parseInt(localStorage.getItem('mqt_standalone_total') || '0');
  const newTotal = prev + standaloneSession;
  localStorage.setItem('mqt_standalone_total', newTotal);
  standaloneSession = 0;
  const els = ['standaloneCount','standaloneSession'];
  els.forEach(id => { const e = document.getElementById(id); if (e) e.textContent = '0'; });
  const saved = document.getElementById('standaloneSaved');
  if (saved) saved.textContent = newTotal.toLocaleString();
}
function resetStandalone() {
  if (!confirm('Reset all counts?')) return;
  standaloneSession = 0;
  localStorage.removeItem('mqt_standalone_total');
  ['standaloneCount','standaloneSession','standaloneSaved'].forEach(id => {
    const e = document.getElementById(id); if (e) e.textContent = '0';
  });
}

// ─────────────────────────────────────────────
//  YAASEEN PAGE
// ─────────────────────────────────────────────
let yaaseenSession  = 0;
let currentYaaseen  = null;

function initYaaseenPage() {
  const yParam = getParam('y');
  if (yParam) {
    try {
      const y = JSON.parse(decodeURIComponent(escape(atob(yParam))));
      currentYaaseen = y;
      document.getElementById('yaaseenFormSection').style.display = 'none';
      document.getElementById('yaaseenView').style.display = 'block';
      renderYaaseen(y);
    } catch(e) { showYaaseenForm(); }
    return;
  }
  showYaaseenForm();
}

function showYaaseenForm() {
  document.getElementById('yaaseenFormSection').style.display = 'block';
  document.getElementById('yaaseenView').style.display = 'none';
}

function createYaaseenFromPage() {
  const desc   = document.getElementById('yaaseenDescPage').value.trim();
  const target = parseInt(document.getElementById('yaaseenTargetPage').value) || 41;
  if (!desc) { alert('Please enter a description.'); return; }
  const y = { code: generateCode(), description: desc, target, total: 0, contributions: [], createdAt: new Date().toISOString() };
  currentYaaseen = y;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(y))));
  window.history.replaceState({}, '', `yaaseencounts.html?y=${encoded}`);
  document.getElementById('yaaseenFormSection').style.display = 'none';
  document.getElementById('yaaseenView').style.display = 'block';
  renderYaaseen(y);
}

function renderYaaseen(y) {
  document.getElementById('yaaseenTitle').textContent         = y.description;
  document.getElementById('yaaseenTotal').textContent         = y.total;
  document.getElementById('yaaseenTargetDisplay').textContent = y.target;
  const pct = Math.min(100, Math.round((y.total / y.target) * 100));
  document.getElementById('yaaseenProgressFill').style.width  = pct + '%';
  const list = document.getElementById('yaaseenContributions');
  list.innerHTML = y.contributions.length === 0
    ? '<div class="empty-state"><i class="fas fa-star-and-crescent"></i><p>No contributions yet — be the first!</p></div>'
    : y.contributions.map(c =>
        `<div class="contrib-item"><span class="contrib-name">${c.name}</span><span class="contrib-count">${c.count}</span></div>`
      ).join('');
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(y))));
  window.history.replaceState({}, '', `yaaseencounts.html?y=${encoded}`);
}

function tapYaaseen() {
  yaaseenSession++;
  const el = document.getElementById('yaaseenSession');
  if (el) { el.textContent = yaaseenSession; el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 250); }
}

function saveYaaseenSession() {
  if (yaaseenSession === 0) { alert('Tap the button first!'); return; }
  const name = document.getElementById('yaaseenYourName').value.trim() || 'Anonymous';
  if (!currentYaaseen) return;
  currentYaaseen.total += yaaseenSession;
  const ex = currentYaaseen.contributions.find(c => c.name === name);
  if (ex) ex.count += yaaseenSession; else currentYaaseen.contributions.push({ name, count: yaaseenSession });
  yaaseenSession = 0;
  const el = document.getElementById('yaaseenSession'); if (el) el.textContent = '0';
  renderYaaseen(currentYaaseen);
}

function shareYaaseenWhatsApp() {
  if (!currentYaaseen) return;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(currentYaaseen))));
  const url = `${APP_DOMAIN}/yaaseencounts.html?y=${encoded}`;
  const msg = `⭐ *${currentYaaseen.description}* — Yaaseen Counter\nTotal: ${currentYaaseen.total}/${currentYaaseen.target}. Tap to join:`;
  whatsappShare(msg, url);
}

// ─────────────────────────────────────────────
//  DRAWER
// ─────────────────────────────────────────────
function openDrawer()  {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}