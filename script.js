/* =============================================
   MY QURAAN TRACKER — script.js
   Data: Supabase (PostgreSQL)
   Sharing: Short code via URL param only
   ============================================= */

// ── SUPABASE CONFIG ───────────────────────────
// 🔑 Replace these with your new credentials
const SUPABASE_URL = 'https://urvddwtcdycqurrczrnl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bG3fICPySEzuufIHOKkZ-A_Zx2a_IKX';

const APP_DOMAIN = 'https://myquraantracker.netlify.app';

const PARA_NAMES = [
  "Alif Lam Meem","Sayaqool","Tilkar Rusul","Lan Tana Loo",
  "Wal Mohsanat","La Yuhibbullah","Wa Iza Samiu","Wa Lau Annana",
  "Qalal Malao","Wa A'lamu","Ya'tazeroon","Wa Ma Min Dabbah",
  "Wa Ma Ubarri-u","Rubama","Subhanalazi","Qal Alam","Iqtaraba",
  "Qad Aflaha","Wa Qalallazina","A'man Khalaq","Utlu Ma Oohi-a",
  "Wa Man Yaqnut","Wa Mali-ya","Faman Azlamu","Elahe Yuraddu",
  "Ha Meem","Qala Fama Khatbukum","Qad Sami Allah","Tabarakallazi","Amma"
];

// ── SUPABASE HELPER ───────────────────────────

async function sbFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── GENERAL HELPERS ───────────────────────────

function getParam(n) {
  return new URLSearchParams(window.location.search).get(n);
}

function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function buildWaHref(text, url) {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

function setWaLink(ids, href) {
  (Array.isArray(ids) ? ids : [ids]).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });
}

function showError(message) {
  alert(`❌ ${message}`);
}

// ── DRAWER ────────────────────────────────────

function openDrawer() {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

// ==============================================
//  KHATM PAGE
// ==============================================

let activeKhatm = null;

async function initKhatmPage() {
  const code = getParam('k');
  if (code) {
    showKhatmLoading();
    try {
      const rows = await sbFetch(`khatms?id=eq.${code}&select=*`);
      if (!rows || rows.length === 0) {
        showKhatmError('Khatm not found. The code may be incorrect.');
        return;
      }
      activeKhatm = rows[0];
      showKhatmView(activeKhatm);
    } catch (e) {
      showKhatmError('Could not load Khatm. Please check your connection.');
    }
    return;
  }
  showKhatmForm();
}

function showKhatmLoading() {
  document.getElementById('khatmFormSection').style.display = 'none';
  document.getElementById('khatmView').style.display = 'none';
  let loader = document.getElementById('khatmLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'khatmLoader';
    loader.className = 'page-body';
    loader.innerHTML = `<div class="card fade-up"><div class="card-body" style="text-align:center;padding:2rem;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--teal);"></i>
      <p style="margin-top:1rem;color:var(--text-soft);">Loading Khatm…</p>
    </div></div>`;
    document.querySelector('.page-hero').after(loader);
  }
  loader.style.display = 'block';
}

function hideKhatmLoading() {
  const loader = document.getElementById('khatmLoader');
  if (loader) loader.style.display = 'none';
}

function showKhatmError(msg) {
  hideKhatmLoading();
  document.getElementById('khatmView').style.display = 'block';
  document.getElementById('khatmView').innerHTML = `
    <div class="card fade-up" style="margin:1rem;">
      <div class="card-body" style="text-align:center;padding:2rem 1rem;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">⚠️</div>
        <div style="font-family:Georgia,serif;font-weight:700;color:var(--teal);font-size:1.1rem;margin-bottom:0.5rem;">${msg}</div>
        <a href="quraan.html" class="btn btn-primary" style="margin-top:1rem;">Start a New Khatm</a>
      </div>
    </div>`;
}

function showKhatmForm() {
  hideKhatmLoading();
  document.getElementById('khatmFormSection').style.display = 'block';
  document.getElementById('khatmView').style.display = 'none';
}

function showKhatmView(khatm) {
  hideKhatmLoading();
  document.getElementById('khatmFormSection').style.display = 'none';
  document.getElementById('khatmView').style.display = 'block';
  renderKhatm(khatm);
}

async function createKhatmFromPage() {
  const desc = document.getElementById('khatmDescPage').value.trim();
  if (!desc) { alert('Please enter a name for your Khatm first.'); return; }

  const btn = document.querySelector('#khatmFormSection .btn-primary');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating…';

  const code = generateCode();
  const paras = Array.from({ length: 30 }, (_, i) => ({
    number: i + 1, assignedTo: '', completed: false
  }));

  try {
    await sbFetch('khatms', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify({ id: code, description: desc, paras })
    });
    activeKhatm = { id: code, description: desc, paras };
    window.history.replaceState({}, '', `quraan.html?k=${code}`);
    showKhatmView(activeKhatm);
  } catch (e) {
    showError('Could not create Khatm. Please try again.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> Create & Share';
  }
}

function renderKhatm(khatm) {
  document.getElementById('khatmTitle').textContent = khatm.description;

  const done = khatm.paras.filter(p => p.completed).length;
  const pct  = Math.round((done / 30) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${done} of 30 paras done`;
  document.getElementById('progressPct').textContent  = pct + '%';

  if (done === 30) document.getElementById('khatmComplete').style.display = 'block';

  // Update URL to short code only
  window.history.replaceState({}, '', `quraan.html?k=${khatm.id}`);

  // Single WhatsApp share link
  const shareUrl = `${APP_DOMAIN}/quraan.html?k=${khatm.id}`;
  const msg = `📖 *${khatm.description}* — Quraan Khatm\n${done}/30 paras done. Tap to join and claim yours:`;
  setWaLink('khatmWaBtn', buildWaHref(msg, shareUrl));

  // Paras grid
  const grid = document.getElementById('parasGrid');
  grid.innerHTML = khatm.paras.map(para => {
    if (para.completed) {
      return `<div class="para-tile completed unavailable">
        <span class="para-num">${para.number}</span>
        <span class="para-name">${PARA_NAMES[para.number - 1]}</span>
        <span class="para-tick">✓</span>
        <span class="para-who">${para.assignedTo}</span>
      </div>`;
    }
    if (para.assignedTo) {
      return `<div class="para-tile assigned" onclick="markDone(${para.number})">
        <span class="para-num">${para.number}</span>
        <span class="para-name">${PARA_NAMES[para.number - 1]}</span>
        <span class="para-who">${para.assignedTo}</span>
        <span style="font-size:0.58rem;color:var(--gold-dark);margin-top:0.2rem;display:block;font-weight:700;">Tap → done</span>
      </div>`;
    }
    return `<div class="para-tile available" onclick="claimPara(${para.number})">
      <span class="para-num">${para.number}</span>
      <span class="para-name">${PARA_NAMES[para.number - 1]}</span>
      <span style="font-size:0.58rem;color:var(--teal-mid);margin-top:0.25rem;display:block;font-weight:700;">Tap to claim</span>
    </div>`;
  }).join('');
}

async function claimPara(num) {
  if (!activeKhatm) return;
  const name = document.getElementById('yourName').value.trim();
  if (!name) { alert('Please enter your name first!'); document.getElementById('yourName').focus(); return; }

  const para = activeKhatm.paras.find(p => p.number === num);
  if (!para || para.assignedTo) return;

  para.assignedTo = name;

  try {
    await sbFetch(`khatms?id=eq.${activeKhatm.id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({ paras: activeKhatm.paras })
    });
    renderKhatm(activeKhatm);
  } catch (e) {
    para.assignedTo = ''; // rollback
    showError('Could not claim para. Please try again.');
  }
}

async function markDone(num) {
  if (!activeKhatm) return;
  const para = activeKhatm.paras.find(p => p.number === num);
  if (!para) return;
  if (!confirm(`Mark Para ${num} as complete?`)) return;

  para.completed = true;

  try {
    await sbFetch(`khatms?id=eq.${activeKhatm.id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({ paras: activeKhatm.paras })
    });
    renderKhatm(activeKhatm);
  } catch (e) {
    para.completed = false; // rollback
    showError('Could not mark para as done. Please try again.');
  }
}

function copyKhatmLink() {
  if (!activeKhatm) return;
  const link = `${APP_DOMAIN}/quraan.html?k=${activeKhatm.id}`;
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('copyLinkBtn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = 'Copy Link', 1800); }
  });
}

// ==============================================
//  HOME PAGE
// ==============================================

function initHomePage() {
  // Home page shows static cards only — no localStorage needed
  // Khatms are accessed via shared short code links
}

// ==============================================
//  ZIKR PAGE
// ==============================================

let zikrSession     = 0;
let currentZikr     = null;
let standaloneSession = 0;

async function initZikrPage() {
  const code = getParam('z');

  if (code) {
    showZikrLoading();
    try {
      const rows = await sbFetch(`zikr_counters?id=eq.${code}&select=*`);
      if (!rows || rows.length === 0) {
        showZikrError('Zikr counter not found.');
        return;
      }
      currentZikr = rows[0];
      document.getElementById('zikrFormSection').style.display = 'none';
      document.getElementById('zikrView').style.display = 'block';
      hideZikrLoading();
      renderZikr(currentZikr);
    } catch (e) {
      showZikrError('Could not load Zikr counter. Please check your connection.');
    }
    return;
  }

  showZikrForm();
}

function showZikrLoading() {
  document.getElementById('zikrFormSection').style.display = 'none';
  document.getElementById('zikrView').style.display = 'none';
  let loader = document.getElementById('zikrLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'zikrLoader';
    loader.className = 'page-body';
    loader.innerHTML = `<div class="card fade-up"><div class="card-body" style="text-align:center;padding:2rem;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--teal);"></i>
      <p style="margin-top:1rem;color:var(--text-soft);">Loading Zikr…</p>
    </div></div>`;
    document.querySelector('.page-hero').after(loader);
  }
  loader.style.display = 'block';
}

function hideZikrLoading() {
  const loader = document.getElementById('zikrLoader');
  if (loader) loader.style.display = 'none';
}

function showZikrError(msg) {
  hideZikrLoading();
  document.getElementById('zikrView').style.display = 'block';
  document.getElementById('zikrView').innerHTML = `
    <div class="card fade-up" style="margin:1rem;">
      <div class="card-body" style="text-align:center;padding:2rem 1rem;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">⚠️</div>
        <div style="font-family:Georgia,serif;font-weight:700;color:var(--teal);font-size:1.1rem;margin-bottom:0.5rem;">${msg}</div>
        <a href="zikr.html" class="btn btn-primary" style="margin-top:1rem;">Start a New Counter</a>
      </div>
    </div>`;
}

function showZikrForm() {
  hideZikrLoading();
  document.getElementById('zikrFormSection').style.display = 'block';
  document.getElementById('zikrView').style.display = 'none';
  const saved = parseInt(localStorage.getItem('mqt_standalone_total') || '0');
  const el = document.getElementById('standaloneSaved');
  if (el) el.textContent = saved.toLocaleString();
}

async function createZikrFromPage() {
  const desc   = document.getElementById('zikrDescPage').value.trim();
  const target = parseInt(document.getElementById('zikrTargetPage').value) || 100;
  if (!desc) { alert('Please enter what you are counting.'); return; }

  const btn = document.querySelector('#zikrFormSection .btn-primary');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating…';

  const code = generateCode();

  try {
    await sbFetch('zikr_counters', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify({ id: code, description: desc, target, total: 0, contributions: [] })
    });
    currentZikr = { id: code, description: desc, target, total: 0, contributions: [] };
    window.history.replaceState({}, '', `zikr.html?z=${code}`);
    document.getElementById('zikrFormSection').style.display = 'none';
    document.getElementById('zikrView').style.display = 'block';
    renderZikr(currentZikr);
  } catch (e) {
    showError('Could not create Zikr counter. Please try again.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> Create Group Counter';
  }
}

function renderZikr(zikr) {
  document.getElementById('zikrTitle').textContent         = zikr.description;
  document.getElementById('zikrTotalCount').textContent    = zikr.total.toLocaleString();
  document.getElementById('zikrTargetDisplay').textContent = zikr.target.toLocaleString();
  const pct = Math.min(100, Math.round((zikr.total / zikr.target) * 100));
  document.getElementById('zikrProgressFill').style.width = pct + '%';
  document.getElementById('zikrProgressPct').textContent  = pct + '%';

  const el = document.getElementById('zikrContributions');
  el.innerHTML = zikr.contributions.length === 0
    ? '<div class="empty-state"><i class="fas fa-hand-holding-heart"></i><p>No contributions yet — be the first!</p></div>'
    : zikr.contributions.map(c =>
        `<div class="contrib-item"><span class="contrib-name">${c.name}</span><span class="contrib-count">${c.count.toLocaleString()}</span></div>`
      ).join('');

  window.history.replaceState({}, '', `zikr.html?z=${zikr.id}`);

  const shareUrl = `${APP_DOMAIN}/zikr.html?z=${zikr.id}`;
  const msg = `🤲 *${zikr.description}* — Group Zikr\nTotal: ${zikr.total}/${zikr.target}. Tap to join:`;
  setWaLink('zikrWaBtn', buildWaHref(msg, shareUrl));
}

function tapZikr() {
  zikrSession++;
  const el = document.getElementById('zikrSessionCount');
  el.textContent = zikrSession.toLocaleString();
  el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 250);
}

async function saveZikrSession() {
  if (zikrSession === 0) { alert('Tap the button first to count!'); return; }
  const name = document.getElementById('zikrYourName').value.trim() || 'Anonymous';
  if (!currentZikr) return;

  const btn = document.querySelector('#zikrView .btn-primary');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  currentZikr.total += zikrSession;
  const ex = currentZikr.contributions.find(c => c.name === name);
  if (ex) ex.count += zikrSession;
  else currentZikr.contributions.push({ name, count: zikrSession });

  try {
    await sbFetch(`zikr_counters?id=eq.${currentZikr.id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({ total: currentZikr.total, contributions: currentZikr.contributions })
    });
    zikrSession = 0;
    document.getElementById('zikrSessionCount').textContent = '0';
    renderZikr(currentZikr);
  } catch (e) {
    // rollback
    currentZikr.total -= zikrSession;
    if (ex) ex.count -= zikrSession;
    else currentZikr.contributions.pop();
    showError('Could not save. Please try again.');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Save My Count';
}

// ── STANDALONE TASBEEH (localStorage — personal only) ──
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
  ['standaloneCount', 'standaloneSession'].forEach(id => {
    const e = document.getElementById(id); if (e) e.textContent = '0';
  });
  const saved = document.getElementById('standaloneSaved');
  if (saved) saved.textContent = newTotal.toLocaleString();
}
function resetStandalone() {
  if (!confirm('Reset all counts?')) return;
  standaloneSession = 0;
  localStorage.removeItem('mqt_standalone_total');
  ['standaloneCount', 'standaloneSession', 'standaloneSaved'].forEach(id => {
    const e = document.getElementById(id); if (e) e.textContent = '0';
  });
}

// ==============================================
//  YAASEEN PAGE
// ==============================================

let yaaseenSession = 0;
let currentYaaseen = null;

async function initYaaseenPage() {
  const code = getParam('y');

  if (code) {
    showYaaseenLoading();
    try {
      const rows = await sbFetch(`yaaseen_counters?id=eq.${code}&select=*`);
      if (!rows || rows.length === 0) {
        showYaaseenError('Yaaseen counter not found.');
        return;
      }
      currentYaaseen = rows[0];
      document.getElementById('yaaseenFormSection').style.display = 'none';
      document.getElementById('yaaseenView').style.display = 'block';
      hideYaaseenLoading();
      renderYaaseen(currentYaaseen);
    } catch (e) {
      showYaaseenError('Could not load Yaaseen counter. Please check your connection.');
    }
    return;
  }

  showYaaseenForm();
}

function showYaaseenLoading() {
  document.getElementById('yaaseenFormSection').style.display = 'none';
  document.getElementById('yaaseenView').style.display = 'none';
  let loader = document.getElementById('yaaseenLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'yaaseenLoader';
    loader.className = 'page-body';
    loader.innerHTML = `<div class="card fade-up"><div class="card-body" style="text-align:center;padding:2rem;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--gold-dark);"></i>
      <p style="margin-top:1rem;color:var(--text-soft);">Loading Yaaseen Counter…</p>
    </div></div>`;
    document.querySelector('.page-hero').after(loader);
  }
  loader.style.display = 'block';
}

function hideYaaseenLoading() {
  const loader = document.getElementById('yaaseenLoader');
  if (loader) loader.style.display = 'none';
}

function showYaaseenError(msg) {
  hideYaaseenLoading();
  document.getElementById('yaaseenView').style.display = 'block';
  document.getElementById('yaaseenView').innerHTML = `
    <div class="card fade-up" style="margin:1rem;">
      <div class="card-body" style="text-align:center;padding:2rem 1rem;">
        <div style="font-size:2rem;margin-bottom:0.75rem;">⚠️</div>
        <div style="font-family:Georgia,serif;font-weight:700;color:var(--gold-dark);font-size:1.1rem;margin-bottom:0.5rem;">${msg}</div>
        <a href="yaaseencounts.html" class="btn btn-gold" style="margin-top:1rem;">Start a New Counter</a>
      </div>
    </div>`;
}

function showYaaseenForm() {
  hideYaaseenLoading();
  document.getElementById('yaaseenFormSection').style.display = 'block';
  document.getElementById('yaaseenView').style.display = 'none';
}

async function createYaaseenFromPage() {
  const desc   = document.getElementById('yaaseenDescPage').value.trim();
  const target = parseInt(document.getElementById('yaaseenTargetPage').value) || 41;
  if (!desc) { alert('Please enter a description.'); return; }

  const btn = document.querySelector('#yaaseenFormSection .btn-gold');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating…';

  const code = generateCode();

  try {
    await sbFetch('yaaseen_counters', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify({ id: code, description: desc, target, total: 0, contributions: [] })
    });
    currentYaaseen = { id: code, description: desc, target, total: 0, contributions: [] };
    window.history.replaceState({}, '', `yaaseencounts.html?y=${code}`);
    document.getElementById('yaaseenFormSection').style.display = 'none';
    document.getElementById('yaaseenView').style.display = 'block';
    renderYaaseen(currentYaaseen);
  } catch (e) {
    showError('Could not create Yaaseen counter. Please try again.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> Create Counter';
  }
}

function renderYaaseen(y) {
  document.getElementById('yaaseenTitle').textContent         = y.description;
  document.getElementById('yaaseenTotal').textContent         = y.total;
  document.getElementById('yaaseenTargetDisplay').textContent = y.target;
  const pct = Math.min(100, Math.round((y.total / y.target) * 100));
  document.getElementById('yaaseenProgressFill').style.width = pct + '%';

  const list = document.getElementById('yaaseenContributions');
  list.innerHTML = y.contributions.length === 0
    ? '<div class="empty-state"><i class="fas fa-star-and-crescent"></i><p>No contributions yet — be the first!</p></div>'
    : y.contributions.map(c =>
        `<div class="contrib-item"><span class="contrib-name">${c.name}</span><span class="contrib-count">${c.count}</span></div>`
      ).join('');

  window.history.replaceState({}, '', `yaaseencounts.html?y=${y.id}`);

  const shareUrl = `${APP_DOMAIN}/yaaseencounts.html?y=${y.id}`;
  const msg = `⭐ *${y.description}* — Yaaseen Counter\nTotal: ${y.total}/${y.target}. Tap to join:`;
  setWaLink('yaaseenWaBtn', buildWaHref(msg, shareUrl));
}

function tapYaaseen() {
  yaaseenSession++;
  const el = document.getElementById('yaaseenSession');
  if (el) { el.textContent = yaaseenSession; el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 250); }
}

async function saveYaaseenSession() {
  if (yaaseenSession === 0) { alert('Tap the button first!'); return; }
  const name = document.getElementById('yaaseenYourName').value.trim() || 'Anonymous';
  if (!currentYaaseen) return;

  const btn = document.querySelector('#yaaseenView .btn-gold');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  currentYaaseen.total += yaaseenSession;
  const ex = currentYaaseen.contributions.find(c => c.name === name);
  if (ex) ex.count += yaaseenSession;
  else currentYaaseen.contributions.push({ name, count: yaaseenSession });

  try {
    await sbFetch(`yaaseen_counters?id=eq.${currentYaaseen.id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: JSON.stringify({ total: currentYaaseen.total, contributions: currentYaaseen.contributions })
    });
    yaaseenSession = 0;
    const el = document.getElementById('yaaseenSession');
    if (el) el.textContent = '0';
    renderYaaseen(currentYaaseen);
  } catch (e) {
    currentYaaseen.total -= yaaseenSession;
    if (ex) ex.count -= yaaseenSession;
    else currentYaaseen.contributions.pop();
    showError('Could not save. Please try again.');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Save My Count';
}