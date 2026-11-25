// js/landing-loader.js
document.addEventListener('DOMContentLoaded', () => {
  loadLandingData();
});

// Osluškuj promenu jezika
document.getElementById('langToggle')?.addEventListener('click', () => {
  setTimeout(loadLandingData, 50); 
});

function loadLandingData() {
  const path = window.location.pathname;
  const page = path.includes('microstock') ? 'microstock'
            : path.includes('housebuilding') ? 'housebuilding'
            : path.includes('servicemaster') ? 'servicemaster'
            : null;

  if (!page) return;

  fetch(`/api/data/${page}`)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      renderLandingPage(data);
    })
    .catch(err => console.warn('Landing loader greška:', err));
}

function renderLandingPage(data) {
  const lang = localStorage.getItem('alexandar_lang') || 'sr';
  const h = data.hero || {};
  
  // 1. Učitavanje slika
  if (data.images) {
    if (data.images.hero && document.getElementById('img-hero-1')) document.getElementById('img-hero-1').src = data.images.hero;
    if (data.images.feat1 && document.getElementById('img-feat-1')) document.getElementById('img-feat-1').src = data.images.feat1;
    if (data.images.feat2 && document.getElementById('img-feat-2')) document.getElementById('img-feat-2').src = data.images.feat2;
    if (data.images.feat3 && document.getElementById('img-feat-3')) document.getElementById('img-feat-3').src = data.images.feat3;
    if (data.images.feat4 && document.getElementById('img-feat-4')) document.getElementById('img-feat-4').src = data.images.feat4;
    if (data.images.feat5 && document.getElementById('img-feat-5')) document.getElementById('img-feat-5').src = data.images.feat5;
  }

  // 2. Prevodi
  const dict = {
    sr: {
      nav_home: "Početna", nav_design: "Dizajn", nav_art: "Umetnost",
      footer_rights: "Sva prava zadržana.", footer_location: "Pančevo, Srbija / Remote Worldwide",
      ms_btn_try: "Probaj besplatno 14 dana →", ms_btn_features: "Pogledaj kako radi",
      ms_problem_title: "Da li ti se ovo dešava?", 
      ms_problem_desc: "Zalihe u jednoj tabeli, narudžbine u drugoj, troškovi u trećoj. Na kraju meseca nemaš pojma da li si u plusu ili minusu, a QR kodove za proizvode pišeš ručno.",
      ms_prob_1: "Gubiš vreme na ručno prepisivanje", ms_prob_2: "Ne znaš tačno stanje na magacinu", ms_prob_3: "Nedostaje ti vreme za pravi posao",
      ms_features_badge: "FUNKCIONALNOSTI", ms_features_title: "MicroStock rešava sve to.",
      ms_pricing_badge: "CENE", ms_pricing_title: "Izaberi paket.",
      ms_docs_title: "Preuzmi uputstva", ms_docs_desc: "Detaljna uputstva za instalaciju na serveru, kao i korisnička uputstva za rad u aplikaciji.",
      ms_faq_title: "Česta pitanja",
      modal_pay_title: "Uplata paketa:", modal_pay_desc: "Skenirajte NBS IPS QR kod bankarskom aplikacijom.", modal_pay_scan: "Otvorite m-banking → IPS Skeniraj",
      modal_pay_beneficiary: "Primalac:", modal_pay_amount: "Iznos:", modal_pay_code: "Šifra plaćanja:", modal_pay_ref: "Poziv na broj:", modal_pay_purpose: "Svrha:", modal_pay_ok: "U redu, razumem",
      ms_tab_cloud: "☁️ Cloud (Mesečno)", ms_tab_standalone: "💻 Standalone (Trajno)",
      hb_problem_title: "Da li ti se ovo dešava?", hb_problem_desc: "Vođenje gradnje u rokovniku, računi u kutiji, a rokovi za zakonske faze vam promiču. Na kraju krajeva, ne znate tačno koliko ste potrošili.",
      hb_prob_1: "Gubite vreme na ručno prepisivanje računa", hb_prob_2: "Ne znate tačno stanje budžeta", hb_prob_3: "Zakonski rokovi vam promiču",
      hb_features_badge: "FUNKCIONALNOSTI", hb_features_title: "HouseBuilding rešava sve to.",
      hb_pricing_badge: "CENE", hb_pricing_title: "Izaberi paket.",
      hb_docs_title: "Preuzmi uputstva", hb_docs_desc: "Detaljna uputstva za instalaciju na serveru, kao i korisnička uputstva za rad u aplikaciji.",
      hb_faq_title: "Česta pitanja", hb_tab_cloud: "☁️ Cloud (Mesečno)", hb_tab_standalone: "💻 Standalone (Trajno)",
      sm_problem_title: "Da li ti se ovo dešava?", sm_problem_desc: "Radni nalozi na papiru, delovi se gube u magacinu, a fiskalni računi se pišu ručno. Na kraju dana ne znate koliko ste tačno zaradili.",
      sm_prob_1: "Gubite vreme na papirne naloge", sm_prob_2: "Ne znate tačno stanje delova", sm_prob_3: "Ručno pisanje fiskalnih računa",
      sm_features_badge: "FUNKCIONALNOSTI", sm_features_title: "ServiceMasterOS rešava sve to.",
      sm_pricing_badge: "CENE", sm_pricing_title: "Izaberi paket.",
      sm_docs_title: "Preuzmi uputstva", sm_docs_desc: "Detaljna uputstva za instalaciju na serveru, kao i korisnička uputstva za rad u aplikaciji.",
      sm_faq_title: "Česta pitanja",
    },
    en: {
      nav_home: "Home", nav_design: "Design", nav_art: "Art",
      footer_rights: "All rights reserved.", footer_location: "Pancevo, Serbia / Remote Worldwide",
      ms_btn_try: "Try free for 14 days →", ms_btn_features: "See how it works",
      ms_problem_title: "Does this happen to you?", ms_problem_desc: "Stock in one spreadsheet, orders in another, costs in a third. At the end of the month, you have no idea if you're in the black or red.",
      ms_prob_1: "Wasting time on manual data entry", ms_prob_2: "You don't know the exact stock level", ms_prob_3: "Missing time for the real work",
      ms_features_badge: "FEATURES", ms_features_title: "MicroStock solves all that.",
      ms_pricing_badge: "PRICING", ms_pricing_title: "Choose a plan.",
      ms_docs_title: "Download Guides", ms_docs_desc: "Detailed installation guides for server setup, as well as user manuals.",
      ms_faq_title: "Frequently asked questions",
      modal_pay_title: "Package payment:", modal_pay_desc: "Scan the NBS IPS QR code with your banking app.", modal_pay_scan: "Open m-banking → IPS Scan",
      modal_pay_beneficiary: "Beneficiary:", modal_pay_amount: "Amount:", modal_pay_code: "Payment code:", modal_pay_ref: "Reference:", modal_pay_purpose: "Purpose:", modal_pay_ok: "Got it, thanks",
      ms_tab_cloud: "☁️ Cloud (Monthly)", ms_tab_standalone: "💻 Standalone (Lifetime)",
      hb_problem_title: "Does this happen to you?", hb_problem_desc: "Managing construction in a notebook, receipts in a box, and statutory deadlines slipping by. In the end, you don't know exactly how much you've spent.",
      hb_prob_1: "Wasting time manually copying receipts", hb_prob_2: "You don't know the exact budget status", hb_prob_3: "Statutory deadlines are slipping by",
      hb_features_badge: "FEATURES", hb_features_title: "HouseBuilding solves all that.",
      hb_pricing_badge: "PRICING", hb_pricing_title: "Choose a plan.",
      hb_docs_title: "Download Guides", hb_docs_desc: "Detailed installation guides for server setup, as well as user manuals.",
      hb_faq_title: "Frequently asked questions", hb_tab_cloud: "☁️ Cloud (Monthly)", hb_tab_standalone: "💻 Standalone (Lifetime)",
      sm_problem_title: "Does this happen to you?", sm_problem_desc: "Work orders on paper, parts getting lost in inventory, and invoices written by hand. At the end of the day, you don't know exactly how much you've earned.",
      sm_prob_1: "Wasting time on paper work orders", sm_prob_2: "You don't know the exact parts inventory", sm_prob_3: "Writing invoices by hand",
      sm_features_badge: "FEATURES", sm_features_title: "ServiceMasterOS solves all that.",
      sm_pricing_badge: "PRICING", sm_pricing_title: "Choose a plan.",
      sm_docs_title: "Download Guides", sm_docs_desc: "Detailed installation guides for server setup, as well as user manuals.",
      sm_faq_title: "Frequently asked questions",
    }
  };
  const tr = dict[lang] || dict.sr;

  Object.keys(tr).forEach(key => {
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
      el.textContent = tr[key];
    });
  });

  // 3. Hero
  const setTxt = (selector, sr, en) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = (lang === 'en' ? en : sr) || sr || en || '';
  };
  setTxt('[data-i18n="ms_hero_title"]', h.title_sr, h.title_en);
  setTxt('[data-i18n="ms_hero_accent"]', h.accent_sr, h.accent_en);
  setTxt('[data-i18n="ms_hero_desc"]', h.desc_sr, h.desc_en);
  setTxt('[data-i18n="ms_badge"]', h.badge_sr, h.badge_en);
  setTxt('[data-i18n="ms_note"]', h.note_sr, h.note_en);

  // 4. Features
  const featGrid = document.getElementById('landing-features-grid');
  if (featGrid && data.features && data.features.length) {
    featGrid.innerHTML = data.features.map(f => `
      <div class="glass-card rounded-2xl p-6 border border-slate-800">
        <div class="text-3xl mb-3">${f.icon || '✨'}</div>
        <h3 class="text-lg font-bold text-white mb-2">${(lang === 'en' ? f.title_en : f.title_sr) || f.title_sr}</h3>
        <p class="text-slate-400 text-sm">${(lang === 'en' ? f.desc_en : f.desc_sr) || f.desc_sr}</p>
      </div>
    `).join('');
  }

  // 5. Pricing
  const priceGrid = document.getElementById('landing-pricing-grid');
  const path = window.location.pathname;
  
  if (priceGrid && data.pricing && data.pricing.length) {
    window.__allPricing = data.pricing;
    
    window.renderPricingCards = function(filterVal) {
      // Ako je ServiceMaster, filtriramo po 'variant'. Ako je MicroStock/HB, filtriramo po 'type'.
      let filtered = [];
      if (path.includes('servicemaster')) {
        filtered = window.__allPricing.filter(p => (p.variant || 'desktop') === filterVal);
      } else {
        filtered = window.__allPricing.filter(p => (p.type || 'cloud') === filterVal);
      }
      
      priceGrid.innerHTML = filtered.map(p => {
        let btnHtml = '';
        const displayPrice = (lang === 'en' && p.price_en) ? p.price_en : p.price;
        const displayName = (lang === 'en' && p.name_en) ? p.name_en : p.name;
        const displayFeatures = (lang === 'en' && p.features_en && p.features_en.length) ? p.features_en : p.features;

        if (displayPrice.toLowerCase().includes('kontakt') || displayPrice.toLowerCase().includes('contact')) {
            btnHtml = `<a href="mailto:alexalbekstudio.design@gmail.com" class="block text-center w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm mt-3 hover:bg-slate-700 hover:-translate-y-1 transition-all duration-300">${lang === 'en' ? 'Contact Us' : 'Kontaktiraj nas'}</a>`;
        } else {
            if (lang === 'en') {
                let cleanPrice = displayPrice.split(' ')[0]; 
                btnHtml = `<button onclick="openPaymentEn('${displayName}', '${cleanPrice}', '${p.priceValue || '0'}')" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm mt-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">💳 Pay Now</button>`;
            } else {
                btnHtml = `<button onclick="openPayment('${displayName}', '${p.priceValue || '0'}')" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm mt-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">💳 Plati odmah</button>`;
            }
        }

        return `
        <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300">
          <div class="text-sm font-bold text-cyan-400 mb-2">${displayName}</div>
          <div class="text-3xl font-extrabold text-white mb-4">${displayPrice}</div>
          <ul class="space-y-2 mb-6 flex-1 text-sm text-slate-300">
            ${(displayFeatures || []).map(f => `<li>✓ ${f}</li>`).join('')}
          </ul>
          ${btnHtml}
        </div>
        `;
      }).join('');
    };

    // Postavljanje podrazumevanog taba
    if (path.includes('servicemaster')) {
        window.renderPricingCards('desktop');
    } else {
        const savedTab = localStorage.getItem('pricing_tab') || 'cloud';
        if (window.switchPricing) window.switchPricing(savedTab); 
        else window.renderPricingCards(savedTab);
    }
  }

  // 6. FAQ
  const faqGrid = document.getElementById('landing-faq-grid');
  if (faqGrid && data.faq && data.faq.length) {
    faqGrid.innerHTML = data.faq.map(item => `
      <details class="glass-card rounded-xl p-5 cursor-pointer border border-slate-800 group hover:border-cyan-500/30 transition-colors">
        <summary class="font-semibold text-white flex justify-between items-center outline-none">
          <span>${(lang === 'en' ? item.q_en : item.q_sr) || item.q_sr}</span>
          <span class="text-cyan-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <p class="mt-4 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4">
          ${(lang === 'en' ? item.a_en : item.a_sr) || item.a_sr}
        </p>
      </details>
    `).join('');
  }
}

window.switchPricing = function(type) {
  localStorage.setItem('pricing_tab', type);
  const btnCloud = document.getElementById('tab-cloud');
  const btnStandalone = document.getElementById('tab-standalone');

  if (btnCloud && btnStandalone) {
    if (type === 'cloud') {
      btnCloud.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-cyan-500 text-slate-950 shadow-lg';
      btnStandalone.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white';
    } else {
      btnCloud.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white';
      btnStandalone.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-cyan-500 text-slate-950 shadow-lg';
    }
  }
  
  if (window.renderPricingCards) window.renderPricingCards(type);
};

window.switchPlatform = function(variant) {
  const btnDesktop = document.getElementById('btn-desktop');
  const btnServer = document.getElementById('btn-server');

  if (btnDesktop && btnServer) {
    if (variant === 'desktop') {
      btnDesktop.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-cyan-500 text-slate-950 shadow-lg';
      btnServer.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white';
    } else {
      btnDesktop.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white';
      btnServer.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-cyan-500 text-slate-950 shadow-lg';
    }
  }
  
  if (window.renderPricingCards) window.renderPricingCards(variant);
};