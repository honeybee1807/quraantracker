/* =============================================
   MY QURAAN TRACKER — script.js
   Full functionality: Khatm + Zikr + Yaaseen
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

function generateCode() { return Math.random().toString(36).substring(2,8).toUpperCase(); }
function getParam(n)    { return new URLSearchParams(window.location.search).get(n); }

// ─────────────────────────────────────────────
//  KHATM
// ─────────────────────────────────────────────
function initKhatmPage() {
  const code = getParam('code');
  if (!code) { document.getElementById('khatmFormSection').style.display = 'block'; return; }
  const all  = JSON.parse(localStorage.getItem('mqt_khatms') || '[]');
  const khatm = all.find(k => k.code === code);
  if (!khatm) { alert('Khatm not found!'); window.location.href = 'index.html'; return; }
  document.getElementById('khatmView').style.display = 'block';
  renderKhatm(khatm);
}

function saveKhatm(khatm) {
  const all = JSON.parse(localStorage.getItem('mqt_khatms') || '[]');
  const idx = all.findIndex(k => k.code === khatm.code);
  if (idx >= 0) all[idx] = khatm; else all.push(khatm);
  localStorage.setItem('mqt_khatms', JSON.stringify(all));
}

function renderKhatm(khatm) {
  document.getElementById('khatmTitle').textContent       = khatm.description;
  document.getElementById('khatmCodeDisplay').textContent = khatm.code;

  const done = khatm.paras.filter(p => p.completed).length;
  const pct  = Math.round((done / 30) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = done + ' of 30 paras done';
  document.getElementById('progressPct').textContent  = pct + '%';

  if (done === 30) document.getElementById('khatmComplete').style.display = 'block';

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
      return `<div class="para-tile assigned" onclick="markDone('${khatm.code}',${para.number})">
        <span class="para-num">${para.number}</span>
        <span class="para-name">${PARA_NAMES[para.number-1]}</span>
        <span class="para-who">${para.assignedTo}</span>
        <span style="font-size:0.6rem;color:var(--gold-dark);margin-top:0.2rem;display:block;">Tap to mark done</span>
      </div>`;
    }
    return `<div class="para-tile available" onclick="claimPara('${khatm.code}',${para.number})">
      <span class="para-num">${para.number}</span>
      <span class="para-name">${PARA_NAMES[para.number-1]}</span>
      <span style="font-size:0.6rem;color:var(--teal-mid);margin-top:0.3rem;display:block;font-weight:700;">Tap to claim</span>
    </div>`;
  }).join('');
}

function claimPara(code, num) {
  const name = document.getElementById('yourName').value.trim();
  if (!name) { alert('Please enter your name first!'); document.getElementById('yourName').focus(); return; }
  const all  = JSON.parse(localStorage.getItem('mqt_khatms') || '[]');
  const khatm = all.find(k => k.code === code);
  if (!khatm) return;
  const para = khatm.paras.find(p => p.number === num);
  if (!para || para.assignedTo) return;
  para.assignedTo = name;
  saveKhatm(khatm);
  renderKhatm(khatm);
  // pop animation
  const tiles = document.querySelectorAll('.para-tile');
  tiles[num-1]?.classList.add('pop');
  setTimeout(() => tiles[num-1]?.classList.remove('pop'), 300);
}

function markDone(code, num) {
  const all  = JSON.parse(localStorage.getItem('mqt_khatms') || '[]');
  const khatm = all.find(k => k.code === code);
  if (!khatm) return;
  const para = khatm.paras.find(p => p.number === num);
  if (!para) return;
  if (!confirm(`Mark Para ${num} as complete?`)) return;
  para.completed = true;
  saveKhatm(khatm);
  renderKhatm(khatm);
}

function createKhatmFromPage() {
  const desc = document.getElementById('khatmDescPage').value.trim();
  if (!desc) { alert('Please enter a name for your Khatm.'); return; }
  const code = generateCode();
  const khatm = {
    code, description: desc, createdAt: new Date().toISOString(),
    paras: Array.from({length:30}, (_,i) => ({ number: i+1, assignedTo:'', completed: false }))
  };
  saveKhatm(khatm);
  window.history.replaceState({}, '', 'quraan.html?code=' + code);
  document.getElementById('khatmFormSection').style.display = 'none';
  document.getElementById('khatmView').style.display = 'block';
  renderKhatm(khatm);
}

function joinKhatmFromPage() {
  const code = document.getElementById('joinCodePage').value.trim().toUpperCase();
  if (!code) { alert('Please enter a code.'); return; }
  const all = JSON.parse(localStorage.getItem('mqt_khatms') || '[]');
  const found = all.find(k => k.code === code);
  if (!found) { alert('Khatm not found. Double check the code.'); return; }
  window.history.replaceState({}, '', 'quraan.html?code=' + code);
  document.getElementById('khatmFormSection').style.display = 'none';
  document.getElementById('khatmView').style.display = 'block';
  renderKhatm(found);
}

// ─────────────────────────────────────────────
//  ZIKR
// ─────────────────────────────────────────────
let zikrSession = 0;
let currentZikr = null;
let standaloneSession = 0;

function initZikrPage() {
  const code = getParam('code');
  if (!code) {
    document.getElementById('zikrFormSection').style.display = 'block';
    const saved = parseInt(localStorage.getItem('mqt_standalone_total') || '0');
    document.getElementById('standaloneSaved').textContent = saved.toLocaleString();
    return;
  }
  const all  = JSON.parse(localStorage.getItem('mqt_zikrs') || '[]');
  const zikr = all.find(z => z.code === code);
  if (!zikr) { alert('Counter not found!'); window.location.href = 'index.html'; return; }
  currentZikr = zikr;
  document.getElementById('zikrView').style.display = 'block';
  renderZikr(zikr);
}

function saveZikrData(zikr) {
  const all = JSON.parse(localStorage.getItem('mqt_zikrs') || '[]');
  const idx = all.findIndex(z => z.code === zikr.code);
  if (idx >= 0) all[idx] = zikr; else all.push(zikr);
  localStorage.setItem('mqt_zikrs', JSON.stringify(all));
}

function renderZikr(zikr) {
  document.getElementById('zikrTitle').textContent       = zikr.description;
  document.getElementById('zikrCodeDisplay').textContent = zikr.code;
  document.getElementById('zikrTotalCount').textContent  = zikr.total.toLocaleString();
  document.getElementById('zikrTargetDisplay').textContent = zikr.target.toLocaleString();
  const pct = Math.min(100, Math.round((zikr.total / zikr.target) * 100));
  document.getElementById('zikrProgressFill').style.width = pct + '%';
  document.getElementById('zikrProgressPct').textContent  = pct + '%';
  const el = document.getElementById('zikrContributions');
  el.innerHTML = zikr.contributions.length === 0
    ? '<div class="empty-state"><i class="fas fa-hand-holding-heart"></i><p>No contributions yet — be the first!</p></div>'
    : zikr.contributions.map(c => `
        <div class="contrib-item">
          <span class="contrib-name">${c.name}</span>
          <span class="contrib-count">${c.count.toLocaleString()}</span>
        </div>`).join('');
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
  saveZikrData(currentZikr);
  zikrSession = 0;
  document.getElementById('zikrSessionCount').textContent = '0';
  renderZikr(currentZikr);
}

function createZikrFromPage() {
  const desc   = document.getElementById('zikrDescPage').value.trim();
  const target = parseInt(document.getElementById('zikrTargetPage').value) || 100;
  if (!desc) { alert('Please enter what you are counting.'); return; }
  const code = generateCode();
  const zikr = { code, description: desc, target, total: 0, contributions: [], createdAt: new Date().toISOString() };
  saveZikrData(zikr); currentZikr = zikr;
  window.history.replaceState({}, '', 'zikr.html?code=' + code);
  document.getElementById('zikrFormSection').style.display = 'none';
  document.getElementById('zikrView').style.display = 'block';
  renderZikr(zikr);
}

function joinZikrFromPage() {
  const code = document.getElementById('joinZikrPage').value.trim().toUpperCase();
  if (!code) { alert('Please enter a code.'); return; }
  const all  = JSON.parse(localStorage.getItem('mqt_zikrs') || '[]');
  const found = all.find(z => z.code === code);
  if (!found) { alert('Counter not found. Double check the code.'); return; }
  currentZikr = found;
  window.history.replaceState({}, '', 'zikr.html?code=' + code);
  document.getElementById('zikrFormSection').style.display = 'none';
  document.getElementById('zikrView').style.display = 'block';
  renderZikr(found);
}

// Standalone
function tapStandalone() {
  standaloneSession++;
  document.getElementById('standaloneCount').textContent   = standaloneSession.toLocaleString();
  document.getElementById('standaloneSession').textContent = standaloneSession.toLocaleString();
  const el = document.getElementById('standaloneCount');
  el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 250);
}
function saveStandalone() {
  const saved = parseInt(localStorage.getItem('mqt_standalone_total') || '0');
  localStorage.setItem('mqt_standalone_total', saved + standaloneSession);
  standaloneSession = 0;
  document.getElementById('standaloneCount').textContent   = '0';
  document.getElementById('standaloneSession').textContent = '0';
  document.getElementById('standaloneSaved').textContent   = (saved + standaloneSession).toLocaleString();
  // reload to show updated total
  const t = parseInt(localStorage.getItem('mqt_standalone_total') || '0');
  document.getElementById('standaloneSaved').textContent = t.toLocaleString();
}
function resetStandalone() {
  if (!confirm('Reset all counts?')) return;
  standaloneSession = 0;
  localStorage.removeItem('mqt_standalone_total');
  ['standaloneCount','standaloneSession','standaloneSaved'].forEach(id => document.getElementById(id).textContent = '0');
}

// ─────────────────────────────────────────────
//  YAASEEN
// ─────────────────────────────────────────────
let yaaseenSession = 0;

function initYaaseenPage() {
  const code = getParam('code');
  if (!code) { document.getElementById('yaaseenFormSection').style.display = 'block'; return; }
  const all = JSON.parse(localStorage.getItem('mqt_yaaseens') || '[]');
  const y   = all.find(a => a.code === code);
  if (!y) { alert('Counter not found!'); window.location.href = 'index.html'; return; }
  document.getElementById('yaaseenView').style.display = 'block';
  renderYaaseen(y);
}

function saveYaaseen(y) {
  const all = JSON.parse(localStorage.getItem('mqt_yaaseens') || '[]');
  const idx = all.findIndex(a => a.code === y.code);
  if (idx >= 0) all[idx] = y; else all.push(y);
  localStorage.setItem('mqt_yaaseens', JSON.stringify(all));
}

function renderYaaseen(y) {
  document.getElementById('yaaseenTitle').textContent         = y.description;
  document.getElementById('yaaseenCodeDisplay').textContent   = y.code;
  document.getElementById('yaaseenTotal').textContent         = y.total;
  document.getElementById('yaaseenTargetDisplay').textContent = y.target;
  const pct = Math.min(100, Math.round((y.total / y.target) * 100));
  document.getElementById('yaaseenProgressFill').style.width  = pct + '%';
  const list = document.getElementById('yaaseenContributions');
  list.innerHTML = y.contributions.length === 0
    ? '<div class="empty-state"><i class="fas fa-star-and-crescent"></i><p>No contributions yet — be the first!</p></div>'
    : y.contributions.map(c => `
        <div class="contrib-item">
          <span class="contrib-name">${c.name}</span>
          <span class="contrib-count">${c.count}</span>
        </div>`).join('');
}

function tapYaaseen() {
  yaaseenSession++;
  const el = document.getElementById('yaaseenSession');
  el.textContent = yaaseenSession;
  el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 250);
}

function saveYaaseenSession() {
  if (yaaseenSession === 0) { alert('Tap the button first!'); return; }
  const code = getParam('code');
  const name = document.getElementById('yaaseenYourName').value.trim() || 'Anonymous';
  const all  = JSON.parse(localStorage.getItem('mqt_yaaseens') || '[]');
  const y    = all.find(a => a.code === code);
  if (!y) return;
  y.total += yaaseenSession;
  const ex = y.contributions.find(c => c.name === name);
  if (ex) ex.count += yaaseenSession; else y.contributions.push({ name, count: yaaseenSession });
  saveYaaseen(y);
  yaaseenSession = 0;
  document.getElementById('yaaseenSession').textContent = '0';
  renderYaaseen(y);
}

function createYaaseenFromPage() {
  const desc   = document.getElementById('yaaseenDescPage').value.trim();
  const target = parseInt(document.getElementById('yaaseenTargetPage').value) || 41;
  if (!desc) { alert('Please enter a description.'); return; }
  const code = generateCode();
  const y = { code, description: desc, target, total: 0, contributions: [], createdAt: new Date().toISOString() };
  saveYaaseen(y);
  window.history.replaceState({}, '', 'yaaseencounts.html?code=' + code);
  document.getElementById('yaaseenFormSection').style.display = 'none';
  document.getElementById('yaaseenView').style.display = 'block';
  renderYaaseen(y);
}

function joinYaaseenFromPage() {
  const code  = document.getElementById('joinYaaseenPage').value.trim().toUpperCase();
  if (!code) { alert('Please enter a code.'); return; }
  const all   = JSON.parse(localStorage.getItem('mqt_yaaseens') || '[]');
  const found = all.find(y => y.code === code);
  if (!found) { alert('Counter not found. Double check the code.'); return; }
  window.history.replaceState({}, '', 'yaaseencounts.html?code=' + code);
  document.getElementById('yaaseenFormSection').style.display = 'none';
  document.getElementById('yaaseenView').style.display = 'block';
  renderYaaseen(found);
}