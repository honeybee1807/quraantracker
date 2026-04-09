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

// Encode Khatam object into a URL-safe string
function encodeKhatam(Khatam) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(Khatam))));
}

// Decode Khatam from URL string
function decodeKhatam(str) {
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

// Build the shareable WhatsApp link for a Khatam
function buildKhatamShareLink(Khatam) {
  const encoded = encodeKhatam(Khatam);
  const url = `${location.origin}${location.pathname.replace('index.html','').replace(/\/[^/]*$/, '/')  }quraan.html?k=${encoded}`;
  return url;
}

function buildZikrShareLink(zikr) {
  const encoded = encodeZikr(zikr);
  const url = `${location.origin}${location.pathname.replace('index.html','').replace(/\/[^/]*$/, '/')}zikr.html?z=${encoded}`;
  return url;
}

function whatsappShare(text, url) {
  const msg = encodeURIComponent(`${text}\n\n${url}`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// Save Khatam to localStorage (for "My Khatams" list on home)
function saveKhatamLocal(Khatam) {
  const all = JSON.parse(localStorage.getItem('mqt_Khatams') || '[]');
  const idx = all.findIndex(k => k.code === Khatam.code);
  if (idx >= 0) all[idx] = Khatam; else all.push(Khatam);
  localStorage.setItem('mqt_Khatams', JSON.stringify(all));
}

function generateCode() {
  return Math.random().toString(36).substring(2,7).toUpperCase();
}

// ─────────────────────────────────────────────
//  Khatam PAGE
// ─────────────────────────────────────────────
let activeKhatam = null;

function initKhatamPage() {
  // Check URL for encoded Khatam data
  const kParam = getParam('k');
  if (kParam) {
    const Khatam = decodeKhatam(kParam);
    if (!Khatam) { showKhatamForm(); return; }
    activeKhatam = Khatam;
    saveKhatamLocal(Khatam); // save locally so it appears in "My Khatams"
    showKhatamView(Khatam);
    return;
  }
  showKhatamForm();
}

function showKhatamForm() {
  document.getElementById('KhatamFormSection').style.display = 'block';
  document.getElementById('KhatamView').style.display = 'none';
}

function showKhatamView(Khatam) {
  document.getElementById('KhatamFormSection').style.display = 'none';
  document.getElementById('KhatamView').style.display = 'block';
  renderKhatam(Khatam);
}

function createKhatamFromPage() {
  const desc = document.getElementById('KhatamDescPage').value.trim();
  if (!desc) { alert('Please enter a name for your Khatam first.'); return; }
  const Khatam = {
    code: generateCode(),
    description: desc,
    createdAt: new Date().toISOString(),
    paras: Array.from({length: 30}, (_, i) => ({
      number: i + 1, assignedTo: '', completed: false
    }))
  };
  activeKhatam = Khatam;
  saveKhatamLocal(Khatam);
  // Push to URL so page can be refreshed / shared
  const encoded = encodeKhatam(Khatam);
  window.history.replaceState({}, '', `quraan.html?k=${encoded}`);
  showKhatamView(Khatam);
}

function renderKhatam(Khatam) {
  // Title & code
  document.getElementById('KhatamTitle').textContent = Khatam.description;

  // Progress
  const done = Khatam.paras.filter(p => p.completed).length;
  const pct  = Math.round((done / 30) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${done} of 30 paras done`;
  document.getElementById('progressPct').textContent  = pct + '%';

  if (done === 30) document.getElementById('KhatamComplete').style.display = 'block';

  // Update share URL in the URL bar
  const encoded = encodeKhatam(Khatam);
  window.history.replaceState({}, '', `quraan.html?k=${encoded}`);

  // Paras grid
  const grid = document.getElementById('parasGrid');
  grid.innerHTML = Khatam.paras.map(para => {
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
  if (!activeKhatam) return;
  const name = document.getElementById('yourName').value.trim();
  if (!name) { alert('Please enter your name first!'); document.getElementById('yourName').focus(); return; }
  const para = activeKhatam.paras.find(p => p.number === num);
  if (!para || para.assignedTo) return;
  para.assignedTo = name;
  saveKhatamLocal(activeKhatam);
  renderKhatam(activeKhatam);
}

function markDone(num) {
  if (!activeKhatam) return;
  const para = activeKhatam.paras.find(p => p.number === num);
  if (!para) return;
  if (!confirm(`Mark Para ${num} as complete?`)) return;
  para.completed = true;
  saveKhatamLocal(activeKhatam);
  renderKhatam(activeKhatam);
}

// Share updated Khatam via WhatsApp
function shareKhatamWhatsApp() {
  if (!activeKhatam) return;
  const link = buildKhatamShareLink(activeKhatam);
  const msg  = `📖 *${activeKhatam.description}* — Quraan Khatam\nJoin us and claim your para:\n`;
  whatsappShare(msg, link);
}

// Copy the share link to clipboard
function copyKhatamLink() {
  if (!activeKhatam) return;
  const link = buildKhatamShareLink(activeKhatam);
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('copyLinkBtn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = 'Copy Link', 1800); }
  });
}

// ─────────────────────────────────────────────
//  HOME PAGE — load from URL if Khatam in param
// ─────────────────────────────────────────────
function initHomePage() {
  // Load my Khatams from localStorage for the "My Khatams" section
  const all = JSON.parse(localStorage.getItem('mqt_Khatams') || '[]');
  const section = document.getElementById('myKhatamsSection');
  const list    = document.getElementById('myKhatamsList');
  if (!all.length || !section) return;
  section.style.display = 'block';
  list.innerHTML = all.map(k => {
    const done = k.paras.filter(p => p.completed).length;
    const pct  = Math.round((done / 30) * 100);
    const encoded = encodeKhatam(k);
    return `<a href="quraan.html?k=${encoded}" class="Khatam-row">
      <div class="Khatam-row-icon"><i class="fas fa-book-quran"></i></div>
      <div class="Khatam-row-info">
        <div class="Khatam-row-name">${k.description}</div>
        <div class="Khatam-row-meta">${done}/30 paras done</div>
        <div class="progress-wrap" style="margin-top:0.35rem;height:6px;"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="Khatam-row-pct">${pct}%</div>
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
  const msg  = `🤲 *${currentZikr.description}* — Zikr Counter\nJoin and add your count:\n`;
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
  const url = `${location.origin}${location.pathname.replace(/\/[^/]*$/, '/')}yaaseencounts.html?y=${encoded}`;
  const msg = `⭐ *${currentYaaseen.description}* — Yaaseen Counter\nJoin and add your count:\n`;
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