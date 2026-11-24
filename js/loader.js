// js/loader.js

// ============================================================
// STANJE (globalno, dostupno kroz window)
// ============================================================
window.__galleryItems = [];
window.__galleryPage = '';

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

function setI18n(key, sr, en) {
  if (!sr && !en) return;
  document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
    if (sr) el.dataset.sr = sr;
    if (en) el.dataset.en = en;
    const lang = localStorage.getItem('alexandar_lang') || 'sr';
    el.textContent = lang === 'en' ? (en || sr) : (sr || en);
  });
}

function applyDynamicI18n() {
  const lang = localStorage.getItem('alexandar_lang') || 'sr';
  document.querySelectorAll('[data-dyn-sr], [data-dyn-en]').forEach(el => {
    const sr = el.dataset.dynSr;
    const en = el.dataset.dynEn;
    if (lang === 'en' && en) el.textContent = en;
    else if (sr) el.textContent = sr;
  });
}

// ============================================================
// INDEX
// ============================================================
function applyIndex(data) {
  const h = data.hero || {};
  setI18n('hero_badge', h.badge_sr, h.badge_en);
  setI18n('hero_title_prefix', h.title_prefix_sr, h.title_prefix_en);
  setI18n('hero_desc', h.desc_sr, h.desc_en);

  if (h.title_gradient && h.title_gradient.trim()) {
    const grad = document.querySelector('h1 .bg-clip-text');
    if (grad) grad.textContent = h.title_gradient;
  }

  if (Array.isArray(data.projects) && data.projects.length > 0) {
    renderProjects(data.projects);
  }
}

// ============================================================
// GALLERY PAGE
// ============================================================
function applyGalleryPage(page, data) {
  window.__galleryPage = page;
  const h = data.header || {};

  if (page === 'dizajn') {
    setI18n('design_badge', h.badge_sr, h.badge_en);
    setI18n('design_title', h.title_sr, h.title_en);
    setI18n('design_desc', h.desc_sr, h.desc_en);
  } else if (page === 'umetnost') {
    setI18n('art_badge', h.badge_sr, h.badge_en);
    setI18n('art_title', h.title_sr, h.title_en);
    setI18n('art_desc', h.desc_sr, h.desc_en);
  }

  if (Array.isArray(data.gallery) && data.gallery.length > 0) {
    window.__galleryItems = data.gallery;

    const galerija = document.querySelector('#galerija');
    if (!galerija) return;

    const grid = galerija.nextElementSibling;
    if (!grid || !grid.classList.contains('grid')) return;

    // Dugme "Prikaži sve"
    if (!document.getElementById('showAllBtn')) {
      const showAll = document.createElement('button');
      showAll.id = 'showAllBtn';
      showAll.className = 'text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-2 ml-3 transition-colors hidden';
      showAll.textContent = '✕ Prikaži sve';
      galerija.appendChild(showAll);

      showAll.onclick = () => {
        renderGallery(grid, window.__galleryItems, page);
        showAll.classList.add('hidden');
      };
    }

    renderGallery(grid, window.__galleryItems, page);
  }
}

function renderGallery(container, gallery, page) {
  const accentBorder = page === 'dizajn' ? 'hover:border-amber-500/40' : 'hover:border-purple-500/40';
  const accentText = page === 'dizajn' ? 'text-amber-400' : 'text-purple-400';

  if (gallery.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-mono text-sm">
      Nema radova u ovoj kategoriji.
    </div>`;
    return;
  }

  container.innerHTML = gallery.map((g, index) => {
    // Koristimo globalni __galleryItems i prosleđujemo indeks kroz data-atribut
    return `
    <div class="gallery-item rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden backdrop-blur-md ${accentBorder} transition-all shadow-xl flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
         data-gallery-idx="${index}">
      <div class="w-full h-52 overflow-hidden bg-slate-950 relative">
        ${g.image
          ? `<img src="${esc(g.image)}" alt="${esc(g.title)}" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500">`
          : `<div class="flex items-center justify-center h-full text-slate-600 text-xs font-mono">[ Nema slike ]</div>`}
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg class="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
        </div>
      </div>
      <div class="p-5">
        <span class="text-[10px] font-mono ${accentText} uppercase tracking-wider">${esc(g.category)}</span>
        <h3 class="text-base font-bold text-white mt-1">${esc(g.title)}</h3>
        <p class="text-slate-400 text-xs mt-2 line-clamp-2">
          <span data-dyn-sr="${esc(g.desc_sr)}" data-dyn-en="${esc(g.desc_en)}">${esc(g.desc_sr)}</span>
        </p>
      </div>
    </div>
  `}).join('');

  applyDynamicI18n();

  // DIREKTNO DODAVANJE LISTENERA NA SVAKU KARTICU
  container.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const idx = parseInt(item.dataset.galleryIdx);
      const data = window.__galleryItems[idx];
      if (data) {
        window.openGalleryLightbox(data);
      }
    });
  });
}

// ============================================================
// LIGHTBOX
// ============================================================
function openLightbox(item) {
  if (!item || !item.image) return;

  const overlay = document.createElement('div');
  overlay.id = 'lightboxOverlay';
  overlay.className = 'fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
  
  overlay.innerHTML = `
    <button class="absolute top-4 right-4 text-white hover:text-cyan-400 text-3xl z-10 transition-colors" id="closeLightboxBtn">✕</button>
    <div class="max-w-5xl w-full flex flex-col items-center" id="lightboxContent">
      <img src="${esc(item.image)}" alt="${esc(item.title)}" class="max-h-[75vh] w-auto rounded-lg shadow-2xl object-contain">
      <div class="mt-4 text-center bg-slate-900/80 p-4 rounded-xl backdrop-blur border border-slate-700/50 w-full max-w-2xl">
        <span class="text-xs font-mono text-cyan-400 uppercase tracking-wider">${esc(item.category)}</span>
        <h3 class="text-xl font-bold text-white mt-1">${esc(item.title)}</h3>
        <p class="text-slate-400 text-sm mt-2">
          <span data-dyn-sr="${esc(item.desc_sr)}" data-dyn-en="${esc(item.desc_en)}">${esc(item.desc_sr)}</span>
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.style.opacity = '1');
  
  const close = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
    document.removeEventListener('keydown', escHandler);
  };
  
  overlay.querySelector('#closeLightboxBtn').onclick = close;
  overlay.onclick = close;
  overlay.querySelector('#lightboxContent').onclick = (e) => e.stopPropagation();

  const escHandler = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', escHandler);

  applyDynamicI18n();
}

// ============================================================
// GLOBAL EVENT DELEGATION
// ============================================================
document.addEventListener('click', (e) => {

  // 2. Filter
  const filterBtn = e.target.closest('.filter-btn');
  if (filterBtn) {
    e.preventDefault();
    const filter = filterBtn.dataset.filter;
    if (!filter) return;

    const galerija = document.querySelector('#galerija');
    if (!galerija) return;
    const grid = galerija.nextElementSibling;
    if (!grid || !grid.classList.contains('grid')) return;

    const filtered = window.__galleryItems.filter(item => item.filter_tag === filter);
    renderGallery(grid, filtered, window.__galleryPage);

    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) showAllBtn.classList.remove('hidden');

    const y = galerija.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({top: y, behavior: 'smooth'});
  }
});

// ============================================================
// INIT — čekaj DOM, pa učitaj
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.includes('dizajn') ? 'dizajn'
            : path.includes('umetnost') ? 'umetnost'
            : 'index';

  fetch(`/api/data/${page}`)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      if (page === 'index') applyIndex(data);
      else applyGalleryPage(page, data);
    })
    .catch(err => console.warn('Loader greška:', err));
});

// ============================================================
// GLOBALNA FUNKCIJA ZA LIGHTBOX (poziva se direktno iz HTML-a)
// ============================================================
window.openGalleryLightbox = function(item) {
  if (!item || !item.image) return;

  // Ukloni postojeći ako postoji
  const existing = document.getElementById('lightboxOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'lightboxOverlay';
  overlay.className = 'fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
  overlay.style.zIndex = '99999';
  
  overlay.innerHTML = `
    <button class="absolute top-4 right-4 text-white hover:text-cyan-400 text-3xl transition-colors" id="closeLightboxBtn">✕</button>
    <div class="max-w-5xl w-full flex flex-col items-center" id="lightboxContent">
      <img src="${esc(item.image)}" alt="${esc(item.title)}" class="max-h-[75vh] w-auto rounded-lg shadow-2xl object-contain">
      <div class="mt-4 text-center bg-slate-900/80 p-4 rounded-xl backdrop-blur border border-slate-700/50 w-full max-w-2xl">
        <span class="text-xs font-mono text-cyan-400 uppercase tracking-wider">${esc(item.category)}</span>
        <h3 class="text-xl font-bold text-white mt-1">${esc(item.title)}</h3>
        <p class="text-slate-400 text-sm mt-2">
          <span data-dyn-sr="${esc(item.desc_sr)}" data-dyn-en="${esc(item.desc_en)}">${esc(item.desc_sr)}</span>
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.style.opacity = '1');
  
  const close = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
    document.removeEventListener('keydown', escHandler);
  };
  
  overlay.querySelector('#closeLightboxBtn').onclick = close;
  overlay.onclick = close;
  overlay.querySelector('#lightboxContent').onclick = (e) => e.stopPropagation();

  const escHandler = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', escHandler);

  applyDynamicI18n();
};