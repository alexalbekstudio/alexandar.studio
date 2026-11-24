// admin/admin.js

// ============================================================
// AUTH CHECK
// ============================================================
fetch('/api/session', { credentials: 'include' })
  .then(r => r.json())
  .then(d => {
    if (!d.loggedIn) {
      window.location.href = '/admin/login.html';
      return;
    }
    const el = document.getElementById('userName');
    if (el) el.textContent = '👤 ' + d.user;
  })
  .catch(() => window.location.href = '/admin/login.html');

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/admin/login.html';
});

// ============================================================
// STATE
// ============================================================
let currentTab = 'index';
let currentData = null;
let savedSnapshot = '';

function markSaved() {
  savedSnapshot = JSON.stringify(currentData);
}

function hasUnsavedChanges() {
  return currentData && JSON.stringify(currentData) !== savedSnapshot;
}

window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ============================================================
// CUSTOM ALERT & CONFIRM
// ============================================================
function showAlert(message, type = 'info') {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 transition-opacity duration-200';
    
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    const colors = {
      info: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      success: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      error: 'text-red-400 border-red-500/30 bg-red-500/10',
      warn: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    };
    const c = colors[type] || colors.info;

    overlay.innerHTML = `
      <div class="bg-slate-900 border ${c.split(' ')[1]} rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-95 transition-transform duration-200">
        <div class="text-4xl mb-4 text-center">${icons[type] || icons.info}</div>
        <p class="text-slate-200 text-center text-sm leading-relaxed mb-6">${message}</p>
        <button class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm hover:brightness-110 transition-all" id="alertOkBtn">U redu</button>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { 
      overlay.style.opacity = '1'; 
      overlay.firstElementChild.classList.remove('scale-95'); 
    });
    
    overlay.querySelector('#alertOkBtn').onclick = () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); resolve(); }, 200);
    };
  });
}

function showConfirm(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 transition-opacity duration-200';
    
    overlay.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-95 transition-transform duration-200">
        <div class="text-4xl mb-4 text-center">🤔</div>
        <p class="text-slate-200 text-center text-sm leading-relaxed mb-6">${message}</p>
        <div class="flex gap-3">
          <button class="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-all" id="confirmNoBtn">Otkaži</button>
          <button class="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-400 transition-all" id="confirmYesBtn">Potvrdi</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { 
      overlay.style.opacity = '1'; 
      overlay.firstElementChild.classList.remove('scale-95'); 
    });
    
    const close = (val) => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); resolve(val); }, 200);
    };
    
    overlay.querySelector('#confirmYesBtn').onclick = () => close(true);
    overlay.querySelector('#confirmNoBtn').onclick = () => close(false);
  });
}

// ============================================================
// HELPERS
// ============================================================
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function field(label, value, path, type = 'text', rows = 3) {
  const id = 'f_' + path.replace(/\./g, '_');
  let input;
  if (type === 'textarea') {
    input = `<textarea id="${id}" data-path="${path}" rows="${rows}"
      class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition resize-y">${esc(value)}</textarea>`;
  } else {
    input = `<input type="${type}" id="${id}" data-path="${path}" value="${esc(value)}"
      class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition">`;
  }
  return `<div>
    <label class="block text-[10px] mono text-slate-500 mb-1.5 tracking-wider uppercase">${label}</label>
    ${input}
  </div>`;
}

function fieldGroup(title, children, color = 'cyan') {
  const colors = {
    cyan: 'border-cyan-500/20',
    emerald: 'border-emerald-500/20',
    amber: 'border-amber-500/20',
    purple: 'border-purple-500/20'
  };
  return `
    <div class="bg-slate-900/60 border ${colors[color]} rounded-2xl p-5 space-y-4">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <span class="w-1 h-4 rounded-full bg-${color}-400"></span>
        ${title}
      </h3>
      ${children}
    </div>
  `;
}

function showToast(msg, color = 'emerald') {
  const el = document.createElement('div');
  const colors = {
    emerald: 'bg-emerald-500 text-slate-950',
    red: 'bg-red-500 text-white',
    cyan: 'bg-cyan-500 text-slate-950'
  };
  el.className = `fixed top-20 right-4 z-[100] px-5 py-3 rounded-xl font-bold text-sm shadow-2xl ${colors[color] || colors.emerald}`;
  el.textContent = msg;
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.2s';
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 2500);
}

// ============================================================
// TAB SWITCHING
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (currentData && hasUnsavedChanges()) {
      const confirmLeave = await showConfirm('Imaš nesačuvane izmene. Napustiti stranicu?');
      if (!confirmLeave) return;
    }
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.className = 'tab-btn w-full text-left px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 font-semibold text-sm transition';
    });
    btn.className = 'tab-btn w-full text-left px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold text-sm transition';
    currentTab = btn.dataset.tab;
    loadPage(currentTab);
  });
});

// ============================================================
// LOAD PAGE
// ============================================================
async function loadPage(page) {
  const area = document.getElementById('editorArea');
  area.innerHTML = `<div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
    <p class="text-slate-400 text-sm">⏳ Učitavanje...</p></div>`;

  try {
    const res = await fetch(`/api/data/${page}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Greška pri učitavanju');
    currentData = await res.json();
    markSaved();

    if (page === 'index') {
      renderIndexEditor();
    } else if (page === 'dizajn') {
      renderGalleryEditor('dizajn');
    } else if (page === 'umetnost') {
      renderGalleryEditor('umetnost');
    } else if (['microstock', 'housebuilding', 'servicemaster'].includes(page)) {
      renderLandingEditor(page);
    }
    
  } catch (e) {
    area.innerHTML = `<div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-400 text-sm">
      ❌ ${e.message}</div>`;
  }
}

// ============================================================
// EDITOR: INDEX
// ============================================================
function renderIndexEditor() {
  const area = document.getElementById('editorArea');
  const d = currentData;

  if (!d.hero) d.hero = {};
  if (!d.projects) d.projects = [];

  area.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-extrabold text-white">📄 Index stranica</h2>
      <button onclick="savePage('index')" id="saveTop"
        class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 transition disabled:opacity-50">
        💾 Sačuvaj
      </button>
    </div>

    ${fieldGroup('Hero — Badge', `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Badge (SR)', d.hero.badge_sr, 'hero.badge_sr')}
        ${field('Badge (EN)', d.hero.badge_en, 'hero.badge_en')}
      </div>
    `, 'cyan')}

    ${fieldGroup('Hero — Naslov', `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Naslov prefix (SR)', d.hero.title_prefix_sr, 'hero.title_prefix_sr')}
        ${field('Naslov prefix (EN)', d.hero.title_prefix_en, 'hero.title_prefix_en')}
      </div>
      ${field('Gradient naslov (SR + EN, isti tekst)', d.hero.title_gradient, 'hero.title_gradient')}
    `, 'cyan')}

    ${fieldGroup('Hero — Opis', `
      ${field('Opis (SR)', d.hero.desc_sr, 'hero.desc_sr', 'textarea', 3)}
      ${field('Opis (EN)', d.hero.desc_en, 'hero.desc_en', 'textarea', 3)}
    `, 'cyan')}

    <!-- PROJEKTI -->
    <div class="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="w-1 h-4 rounded-full bg-emerald-400"></span>
          Projekti <span class="text-xs mono text-slate-500">(${d.projects.length})</span>
        </h3>
        <button onclick="addProject()"
          class="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition">
          + Dodaj projekat
        </button>
      </div>
      <div id="projectsList" class="space-y-4"></div>
    </div>

    <div class="sticky bottom-4 z-10 mt-6">
      <button onclick="savePage('index')"
        class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-xl shadow-cyan-500/30 hover:brightness-110 transition">
        💾 Sačuvaj sve promene
      </button>
    </div>
  `;

  renderProjectsList();
}

function renderProjectsList() {
  const list = document.getElementById('projectsList');
  if (!list) return;

  if (currentData.projects.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-sm text-center py-6">
      Nema projekata. Klikni "+ Dodaj projekat" iznad.
    </p>`;
    return;
  }

  list.innerHTML = currentData.projects.map((p, i) => `
    <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3" data-idx="${i}">
      <div class="flex justify-between items-center">
        <span class="text-xs mono text-emerald-400">#${i + 1} — ${esc(p.title) || 'Novi projekat'}</span>
        <div class="flex gap-1">
          <button onclick="moveProject(${i}, -1)" ${i === 0 ? 'disabled' : ''}
            class="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30">↑</button>
          <button onclick="moveProject(${i}, 1)" ${i === currentData.projects.length - 1 ? 'disabled' : ''}
            class="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30">↓</button>
          <button onclick="removeProject(${i})"
            class="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">🗑</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Naslov', p.title, `projects.${i}.title`)}
        ${field('Badge', p.badge, `projects.${i}.badge`)}
        ${field('Status', p.status, `projects.${i}.status`)}
        ${field('URL', p.url, `projects.${i}.url`, 'url')}
        ${field('Boja badge-a (cyan/emerald/amber/purple)', p.badge_color || 'cyan', `projects.${i}.badge_color`)}
        ${field('Tagovi (odvoji zarezom)', (p.tags || []).join(', '), `projects.${i}.tags_csv`)}
      </div>

      ${field('Opis (SR)', p.desc_sr, `projects.${i}.desc_sr`, 'textarea', 2)}
      ${field('Opis (EN)', p.desc_en, `projects.${i}.desc_en`, 'textarea', 2)}
    </div>
  `).join('');
}

function addProject() {
  currentData.projects.push({
    id: 'proj-' + Date.now(),
    title: 'Novi projekat',
    badge: 'SaaS Platform',
    badge_color: 'emerald',
    status: 'Production',
    url: 'https://',
    tags: [],
    desc_sr: '',
    desc_en: ''
  });
  renderProjectsList();
}

async function removeProject(i) {
  const confirmDel = await showConfirm(`Ukloniti projekat "${currentData.projects[i].title}"?`);
  if (!confirmDel) return;
  currentData.projects.splice(i, 1);
  renderProjectsList();
}

function moveProject(i, dir) {
  const arr = currentData.projects;
  const ni = i + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[i], arr[ni]] = [arr[ni], arr[i]];
  renderProjectsList();
}

// ============================================================
// EDITOR: LANDING PAGES (MicroStock, HouseBuilding, ServiceMaster)
// ============================================================
function renderLandingEditor(page) {
  const area = document.getElementById('editorArea');
  const d = currentData;

  // Inicijalizacija ako je prazno
  if (!d.hero) d.hero = {};
  if (!d.features) d.features = [];
  if (!d.pricing) d.pricing = [];
  if (!d.faq) d.faq = [];

  const labels = {
    microstock: '🚀 MicroStock',
    housebuilding: '🏠 House Building',
    servicemaster: '🔧 ServiceMaster'
  };

  area.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-extrabold text-white">${labels[page]}</h2>
      <button onclick="savePage('${page}')" id="saveTop"
        class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 transition">
        💾 Sačuvaj
      </button>
    </div>

    ${fieldGroup('Hero sekcija', `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Badge (SR)', d.hero.badge_sr, 'hero.badge_sr')}
        ${field('Badge (EN)', d.hero.badge_en, 'hero.badge_en')}
        ${field('Naslov (SR)', d.hero.title_sr, 'hero.title_sr')}
        ${field('Naslov (EN)', d.hero.title_en, 'hero.title_en')}
        ${field('Akcent (SR)', d.hero.accent_sr, 'hero.accent_sr')}
        ${field('Akcent (EN)', d.hero.accent_en, 'hero.accent_en')}
        ${fieldGroup('Slike za Landing stranicu (unesi putanju, npr. ../landing/img/ms-hero-1.jpg)', `
        ${field('Glavna slika (Problem/Hero)', d.images?.hero || '', 'images.hero')}
        ${field('Slika za Funkcionalnost 1', d.images?.feat1 || '', 'images.feat1')}
        ${field('Slika za Funkcionalnost 2', d.images?.feat2 || '', 'images.feat2')}
        ${field('Slika za Funkcionalnost 3', d.images?.feat3 || '', 'images.feat3')}
        ${field('Slika za Funkcionalnost 4', d.images?.feat4 || '', 'images.feat4')}
        ${field('Slika za Funkcionalnost 5', d.images?.feat5 || '', 'images.feat5')}
    `, 'amber')}
      </div>
      ${field('Opis (SR)', d.hero.desc_sr, 'hero.desc_sr', 'textarea', 3)}
      ${field('Opis (EN)', d.hero.desc_en, 'hero.desc_en', 'textarea', 3)}
      ${field('Napomena ispod dugmića (SR)', d.hero.note_sr, 'hero.note_sr')}
      ${field('Napomena ispod dugmića (EN)', d.hero.note_en, 'hero.note_en')}
    `, 'cyan')}

    <!-- FEATURES -->
    <div class="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="w-1 h-4 rounded-full bg-emerald-400"></span>
          Funkcionalnosti <span class="text-xs mono text-slate-500">(${d.features.length})</span>
        </h3>
        <button onclick="addLandingFeature()"
          class="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition">
          + Dodaj funkcionalnost
        </button>
      </div>
      <div id="featuresList" class="space-y-4"></div>
    </div>

    <!-- PRICING -->
    <div class="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="w-1 h-4 rounded-full bg-amber-400"></span>
          Cenovni paketi <span class="text-xs mono text-slate-500">(${d.pricing.length})</span>
        </h3>
        <button onclick="addLandingPricing()"
          class="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition">
          + Dodaj paket
        </button>
      </div>
      <div id="pricingList" class="space-y-4"></div>
    </div>

    <!-- FAQ -->
    <div class="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="w-1 h-4 rounded-full bg-purple-400"></span>
          FAQ <span class="text-xs mono text-slate-500">(${d.faq.length})</span>
        </h3>
        <button onclick="addLandingFaq()"
          class="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/30 transition">
          + Dodaj pitanje
        </button>
      </div>
      <div id="faqList" class="space-y-4"></div>
    </div>

    <div class="sticky bottom-4 z-10 mt-6">
      <button onclick="savePage('${page}')"
        class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-xl shadow-cyan-500/30 hover:brightness-110 transition">
        💾 Sačuvaj sve promene
      </button>
    </div>
  `;

  renderLandingFeatures(page);
  renderLandingPricing(page);
  renderLandingFaq(page);
}

function renderLandingFeatures(page) {
  const list = document.getElementById('featuresList');
  if (!list) return;
  const d = currentData;

  if (d.features.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-sm text-center py-4">Nema funkcionalnosti.</p>`;
    return;
  }

  list.innerHTML = d.features.map((f, i) => `
    <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-xs mono text-emerald-400">#${i + 1}</span>
        <button onclick="removeLandingFeature(${i}, '${page}')"
          class="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">🗑</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Ikona (emoji)', f.icon, `features.${i}.icon`)}
        ${field('Naslov (SR)', f.title_sr, `features.${i}.title_sr`)}
        ${field('Naslov (EN)', f.title_en, `features.${i}.title_en`)}
      </div>
      ${field('Opis (SR)', f.desc_sr, `features.${i}.desc_sr`, 'textarea', 2)}
      ${field('Opis (EN)', f.desc_en, `features.${i}.desc_en`, 'textarea', 2)}
    </div>
  `).join('');
}

function renderLandingPricing(page) {
  const list = document.getElementById('pricingList');
  if (!list) return;
  const d = currentData;

  if (d.pricing.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-sm text-center py-4">Nema paketa.</p>`;
    return;
  }

  list.innerHTML = d.pricing.map((p, i) => `
    <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-xs mono text-amber-400">#${i + 1}</span>
        <button onclick="removeLandingPricing(${i}, '${page}')"
          class="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">🗑</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Naziv paketa', p.name, `pricing.${i}.name`)}
        ${field('Cena (prikaz, npr. 5€)', p.price, `pricing.${i}.price`)}
        ${field('Vrednost za plaćanje (npr. 600)', p.priceValue, `pricing.${i}.priceValue`)}
        ${field('CTA (SR)', p.cta_sr, `pricing.${i}.cta_sr`)}
        ${field('CTA (EN)', p.cta_en, `pricing.${i}.cta_en`)}
      </div>
      ${field('Funkcionalnosti (odvoji zarezom)', (p.features || []).join(', '), `pricing.${i}.features_csv`, 'textarea', 2)}
    </div>
  `).join('');
}

function renderLandingFaq(page) {
  const list = document.getElementById('faqList');
  if (!list) return;
  const d = currentData;

  if (d.faq.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-sm text-center py-4">Nema pitanja.</p>`;
    return;
  }

  list.innerHTML = d.faq.map((item, i) => `
    <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-xs mono text-purple-400">#${i + 1}</span>
        <button onclick="removeLandingFaq(${i}, '${page}')"
          class="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">🗑</button>
      </div>
      ${field('Pitanje (SR)', item.q_sr, `faq.${i}.q_sr`)}
      ${field('Pitanje (EN)', item.q_en, `faq.${i}.q_en`)}
      ${field('Odgovor (SR)', item.a_sr, `faq.${i}.a_sr`, 'textarea', 2)}
      ${field('Odgovor (EN)', item.a_en, `faq.${i}.a_en`, 'textarea', 2)}
    </div>
  `).join('');
}

// --- Dodavanje/brisanje Features ---
function addLandingFeature() {
  currentData.features.push({ icon: '✨', title_sr: '', title_en: '', desc_sr: '', desc_en: '' });
  renderLandingFeatures(currentTab);
}
async function removeLandingFeature(i, page) {
  if (!(await showConfirm('Ukloniti ovu funkcionalnost?'))) return;
  currentData.features.splice(i, 1);
  renderLandingFeatures(page);
}

// --- Dodavanje/brisanje Pricing ---
function addLandingPricing() {
  currentData.pricing.push({ name: 'Novi paket', price: '0€', priceValue: '0', cta_sr: 'Izaberi', cta_en: 'Choose', features: [] });
  renderLandingPricing(currentTab);
}
async function removeLandingPricing(i, page) {
  if (!(await showConfirm('Ukloniti ovaj paket?'))) return;
  currentData.pricing.splice(i, 1);
  renderLandingPricing(page);
}

// --- Dodavanje/brisanje FAQ ---
function addLandingFaq() {
  currentData.faq.push({ q_sr: '', q_en: '', a_sr: '', a_en: '' });
  renderLandingFaq(currentTab);
}
async function removeLandingFaq(i, page) {
  if (!(await showConfirm('Ukloniti ovo pitanje?'))) return;
  currentData.faq.splice(i, 1);
  renderLandingFaq(page);
}

// ============================================================
// EDITOR: DIZAJN / UMETNOST
// ============================================================
function renderGalleryEditor(page) {
  const area = document.getElementById('editorArea');
  const d = currentData;

  if (!d.header) d.header = {};
  if (!d.gallery) d.gallery = [];

  const accent = page === 'dizajn' ? 'amber' : 'purple';
  const label = page === 'dizajn' ? '🎨 Dizajn' : '🖼️ Umetnost';

  area.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-extrabold text-white">${label}</h2>
      <button onclick="savePage('${page}')" id="saveTop"
        class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 transition">
        💾 Sačuvaj
      </button>
    </div>

    <!-- INFO BOX ZA TAGOVE -->
    <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-start gap-3 mb-2">
      <div class="text-cyan-400 text-lg mt-0.5">💡</div>
      <div>
        <p class="text-xs font-bold text-white mb-1">Podsetnik za Tagove (Filter)</p>
        <p class="text-[11px] text-slate-400 font-mono leading-relaxed">
          <span class="text-amber-400 font-bold">DIZAJN:</span> branding, print, uiux, marketing<br>
          <span class="text-purple-400 font-bold">UMETNOST:</span> ilustracija, konceptualno, eksperimenti, serija
        </p>
      </div>
    </div>

    ${fieldGroup('Zaglavlje stranice', `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Badge (SR)', d.header.badge_sr, 'header.badge_sr')}
        ${field('Badge (EN)', d.header.badge_en, 'header.badge_en')}
        ${field('Naslov (SR)', d.header.title_sr, 'header.title_sr')}
        ${field('Naslov (EN)', d.header.title_en, 'header.title_en')}
      </div>
      ${field('Opis (SR)', d.header.desc_sr, 'header.desc_sr', 'textarea', 3)}
      ${field('Opis (EN)', d.header.desc_en, 'header.desc_en', 'textarea', 3)}
    `, accent)}

    <div class="bg-slate-900/60 border border-${accent}-500/20 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="w-1 h-4 rounded-full bg-${accent}-400"></span>
          Galerija <span class="text-xs mono text-slate-500">(${d.gallery.length})</span>
        </h3>
        <button onclick="addGalleryItem('${page}')"
          class="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition">
          + Dodaj sliku
        </button>
      </div>
      <div id="galleryList" class="space-y-4"></div>
    </div>

    <div class="sticky bottom-4 z-10 mt-6">
      <button onclick="savePage('${page}')"
        class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-xl shadow-cyan-500/30 hover:brightness-110 transition">
        💾 Sačuvaj sve promene
      </button>
    </div>
  `;

  renderGalleryList(page);
}

function renderGalleryList(page) {
  const list = document.getElementById('galleryList');
  if (!list) return;

  if (currentData.gallery.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-sm text-center py-6">
      Nema slika. Klikni "+ Dodaj sliku" iznad.
    </p>`;
    return;
  }

  list.innerHTML = currentData.gallery.map((g, i) => `
    <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-xs mono text-cyan-400">#${i + 1} — ${esc(g.title) || 'Nova slika'}</span>
        <div class="flex gap-1">
          <button onclick="moveGalleryItem(${i}, -1)" ${i === 0 ? 'disabled' : ''}
            class="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30">↑</button>
          <button onclick="moveGalleryItem(${i}, 1)" ${i === currentData.gallery.length - 1 ? 'disabled' : ''}
            class="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30">↓</button>
          <button onclick="removeGalleryItem(${i}, '${page}')"
            class="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">🗑</button>
        </div>
      </div>

      <div class="flex gap-3 items-start">
        <div class="w-32 h-24 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800">
          ${g.image
            ? `<img src="${esc(g.image)}" class="w-full h-full object-cover">`
            : '<div class="flex items-center justify-center h-full text-slate-600 text-[10px]">Nema slike</div>'}
        </div>
        <div class="flex-1">
          <label class="block text-[10px] mono text-slate-500 mb-1.5 uppercase">Slika</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onchange="uploadGalleryImage(event, ${i}, '${page}')"
            class="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-400 file:font-semibold file:cursor-pointer hover:file:bg-cyan-500/30 file:transition">
          <p class="text-[10px] text-slate-600 mt-1">Max 10 MB • JPG, PNG, WEBP, GIF, SVG</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${field('Naslov', g.title, `gallery.${i}.title`)}
        ${field('Kategorija / Godina (prikaz)', g.category, `gallery.${i}.category`)}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] mono text-slate-500 mb-1.5 tracking-wider uppercase">Filter Tag (npr. branding, print, uiux, art)</label>
          <input type="text" data-path="gallery.${i}.filter_tag" value="${esc(g.filter_tag || '')}"
            class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none">
        </div>
      </div>
      ${field('Opis (SR)', g.desc_sr, `gallery.${i}.desc_sr`, 'textarea', 2)}
      ${field('Opis (EN)', g.desc_en, `gallery.${i}.desc_en`, 'textarea', 2)}
    </div>
  `).join('');
}

function addGalleryItem(page) {
  currentData.gallery.push({
    id: 'img-' + Date.now(),
    image: '',
    title: 'Novi rad',
    category: 'Kategorija / 2026',
    filter_tag: '',
    desc_sr: '',
    desc_en: ''
  });
  renderGalleryList(page);
}

async function removeGalleryItem(i, page) {
  const confirmDel = await showConfirm(`Ukloniti "${currentData.gallery[i].title || 'ovu sliku'}"?`);
  if (!confirmDel) return;
  currentData.gallery.splice(i, 1);
  renderGalleryList(page);
}

function moveGalleryItem(i, dir) {
  const arr = currentData.gallery;
  const ni = i + dir;
  if (ni < 0 || ni >= arr.length) return;
  [arr[i], arr[ni]] = [arr[ni], arr[i]];
  renderGalleryList(currentTab);
}

async function uploadGalleryImage(event, index, page) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showAlert('Slika je veća od 10 MB', 'error');
    return;
  }

  const fd = new FormData();
  fd.append('image', file);

  const wrapper = event.target.closest('div').parentElement;
  const imgContainer = wrapper.querySelector('.w-32');
  const originalHTML = imgContainer.innerHTML;
  imgContainer.innerHTML = '<div class="flex items-center justify-center h-full text-cyan-400 text-xs">⏳</div>';

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd,
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload neuspešan');
    }

    const data = await res.json();
    currentData.gallery[index].image = data.url;
    renderGalleryList(page);
    showToast('✅ Slika uploadovana!', 'emerald');
  } catch (e) {
    imgContainer.innerHTML = originalHTML;
    showAlert(e.message, 'error');
  }
}

// ============================================================
// COLLECT FORM VALUES → currentData
// ============================================================
function collectFormValues() {
  document.querySelectorAll('[data-path]').forEach(el => {
    const path = el.dataset.path;
    let value = el.value;

    // Tagovi za projekte
    if (path.endsWith('.tags_csv')) {
      const m = path.match(/^projects\.(\d+)\.tags_csv$/);
      if (m) {
        const idx = parseInt(m[1]);
        currentData.projects[idx].tags = value.split(',').map(t => t.trim()).filter(Boolean);
      }
      return;
    }

    // Funkcionalnosti za pricing (novo)
    if (path.endsWith('.features_csv')) {
      const m = path.match(/^pricing\.(\d+)\.features_csv$/);
      if (m) {
        const idx = parseInt(m[1]);
        currentData.pricing[idx].features = value.split(',').map(t => t.trim()).filter(Boolean);
      }
      return;
    }

    // Ostalo (nested objekti)
    const keys = path.split('.');
    let obj = currentData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  });
}

// ============================================================
// SAVE PAGE
// ============================================================
async function savePage(page) {
  collectFormValues();

  const btns = document.querySelectorAll('#saveTop, .sticky button');
  btns.forEach(b => { b.disabled = true; });

  try {
    const res = await fetch(`/api/data/${page}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(currentData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Greška pri čuvanju');
    }

    markSaved();
    showToast('✅ Sačuvano!', 'emerald');
  } catch (e) {
    showAlert(e.message, 'error');
  } finally {
    btns.forEach(b => { b.disabled = false; });
  }
}

// ============================================================
// INIT
// ============================================================
loadPage('index');