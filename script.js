/* =============================================
   MY QURAAN TRACKER — script.js
   WhatsApp sharing: plain <a href> — no JS
   navigation, no window.open, no iOS dialogs.
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

function encodeKhatm(khatm) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(khatm))));
}
function decodeKhatm(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch(e) { return null; }
}
function encodeZikr(zikr) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(zikr))));
}
function decodeZikr(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch(e) { return null; }
}

const APP_DOMAIN = 'https://myquraantracker.netlify.app';

function buildKhatmShareLink(khatm) {
  return `${APP_DOMAIN}/quraan.html?k=${encodeKhatm(khatm)}`;
}
function buildZikrShareLink(zikr) {
  return `${APP_DOMAIN}/zikr.html?z=${encodeZikr(zikr)}`;
}
function buildYaaseenShareLink(y) {
  return `${APP_DOMAIN}/yaaseencounts.html?y=${btoa(unescape(encodeURIComponent(JSON.stringify(y))))}`;
}

// ── WA LINK BUILDER ───────────────────────────
// WHY THIS WORKS ON iOS:
//   A plain <a href="https://wa.me/…"> that the *user taps* is treated
//   by iOS as a normal link follow — Safari hands it off to WhatsApp
//   with no dialog. Only JS-initiated navigation (window.open,
//   location.href) triggers the "This site is trying to open another
//   application" security prompt.
//   So we never call any JS to navigate. We just keep the href on the
//   anchor tag up to date, and let the user tap it naturally.

function buildWaHref(text, url) {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

// Set the href on one or more anchor elements by id
function setWaLink(ids, href) {
  (Array.isArray(ids) ? ids : [ids]).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });
}

// Save khatm to localStorage
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
  const kParam = getParam('k');
  if (kParam) {
    const khatm = decodeKhatm(kParam);
    if (!khatm) { showKhatmForm(); return; }
    activeKhatm = khatm;
    saveKhatmLocal(khatm);
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
  window.history.replaceState({}, '', `quraan.html?k=${encodeKhatm(khatm)}`);
  showKhatmView(khatm);
}

function renderKhatm(khatm) {
  document.getElementById('khatmTitle').textContent = khatm.description;

  const done = khatm.paras.filter(p => p.completed).length;
  const pct  = Math.round((done / 30) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${done} of 30 paras done`;
  document.getElementById('progressPct').textContent  = pct + '%';

  if (done === 30) document.getElementById('khatmComplete').style.display = 'block';

  // Keep URL bar in sync
  window.history.replaceState({}, '', `quraan.html?k=${encodeKhatm(khatm)}`);

  // Update both WhatsApp anchor tags
  const link = buildKhatmShareLink(khatm);
  const msg  = `📖 *${khatm.description}* — Quraan Khatm\n${done}/30 paras done. Tap to join and claim yours:`;
  const href = buildWaHref(msg, link);
  setWaLink(['khatmWaBtn', 'khatmWaBtnBottom'], href);

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

function copyKhatmLink() {
  if (!activeKhatm) return;
  const link = buildKhatmShareLink(activeKhatm);
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('copyLinkBtn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = 'Copy Link', 1800); }
  });
}

// ─────────────────────────────────────────────
//  HOME PAGE
// ─────────────────────────────────────────────
function initHomePage() {
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
        <div class="progress-wrap" style="margin-top:0.35rem;height:6px;">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="khatm-row-pct">${pct}%</div>
    </a>`;
  }).join('');
}

// ─────────────────────────────────────────────
//  ZIKR PAGE
// ─────────────────────────────────────────────
let zikrSession       = 0;
let currentZikr       = null;
let standaloneSession = 0;

function initZikrPage() {
  const zParam = getParam('z');

  if (zParam) {
    document.getElementById('zikrFormSection').style.display = 'none';
    document.getElementById('zikrView').style.display        = 'none';

    const zikr = decodeZikr(zParam);

    if (!zikr) {
      document.getElementById('zikrView').style.display = 'block';
      document.getElementById('zikrView').innerHTML = `
        <div class="card fade-up" style="margin:1rem;">
          <div class="card-body" style="text-align:center;padding:2rem 1rem;">
            <div style="font-size:2rem;margin-bottom:0.75rem;">⚠️</div>
            <div style="font-family:Georgia,serif;font-weight:700;color:var(--teal);font-size:1.1rem;margin-bottom:0.5rem;">
              Link could not be loaded
            </div>
            <p style="font-size:0.85rem;color:var(--text-soft);margin-bottom:1.25rem;">
              WhatsApp may have broken this link. Ask the organiser
              to tap <strong>Copy Link</strong> and paste it directly.
            </p>
            <a href="zikr.html" class="btn btn-primary">Start a new counter</a>
          </div>
        </div>`;
      return;
    }

    currentZikr = zikr;
    document.getElementById('zikrView').style.display = 'block';
    renderZikr(zikr);
    return;
  }

  showZikrForm();
}

function showZikrForm() {
  document.getElementById('zikrFormSection').style.display = 'block';
  document.getElementById('zikrView').style.display        = 'none';
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
  window.history.replaceState({}, '', `zikr.html?z=${encodeZikr(zikr)}`);
  document.getElementById('zikrFormSection').style.display = 'none';
  document.getElementById('zikrView').style.display        = 'block';
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

  window.history.replaceState({}, '', `zikr.html?z=${encodeZikr(zikr)}`);

  // Update WhatsApp anchor href
  const link = buildZikrShareLink(zikr);
  const msg  = `🤲 *${zikr.description}* — Group Zikr\nTotal: ${zikr.total}/${zikr.target}. Tap to join:`;
  setWaLink('zikrWaBtn', buildWaHref(msg, link));
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

// ── STANDALONE TASBEEH ──────────────────────
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
  ['standaloneCount','standaloneSession'].forEach(id => {
    const e = document.getElementById(id); if (e) e.textContent = '0';
  });
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
let yaaseenSession = 0;
let currentYaaseen = null;

function initYaaseenPage() {
  const yParam = getParam('y');

  if (yParam) {
    document.getElementById('yaaseenFormSection').style.display = 'none';
    document.getElementById('yaaseenView').style.display        = 'none';

    try {
      const y = JSON.parse(decodeURIComponent(escape(atob(yParam))));
      currentYaaseen = y;
      document.getElementById('yaaseenView').style.display = 'block';
      renderYaaseen(y);
    } catch(e) {
      document.getElementById('yaaseenView').style.display = 'block';
      document.getElementById('yaaseenView').innerHTML = `
        <div class="card fade-up" style="margin:1rem;">
          <div class="card-body" style="text-align:center;padding:2rem 1rem;">
            <div style="font-size:2rem;margin-bottom:0.75rem;">⚠️</div>
            <div style="font-family:Georgia,serif;font-weight:700;color:var(--gold-dark);font-size:1.1rem;margin-bottom:0.5rem;">
              Link could not be loaded
            </div>
            <p style="font-size:0.85rem;color:var(--text-soft);margin-bottom:1.25rem;">
              WhatsApp may have broken this link. Ask the organiser
              to tap <strong>Copy Link</strong> and paste it directly.
            </p>
            <a href="yaaseencounts.html" class="btn btn-gold">Start a new counter</a>
          </div>
        </div>`;
    }
    return;
  }

  showYaaseenForm();
}

function showYaaseenForm() {
  document.getElementById('yaaseenFormSection').style.display = 'block';
  document.getElementById('yaaseenView').style.display        = 'none';
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
  document.getElementById('yaaseenView').style.display        = 'block';
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

  // Update WhatsApp anchor href
  const link = buildYaaseenShareLink(y);
  const msg  = `⭐ *${y.description}* — Yaaseen Counter\nTotal: ${y.total}/${y.target}. Tap to join:`;
  setWaLink('yaaseenWaBtn', buildWaHref(msg, link));
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

// ─────────────────────────────────────────────
//  DRAWER
// ─────────────────────────────────────────────
function openDrawer() {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}