// Rečnik za dvojezičnost
const translations = {
  sr: {
    nav_role: "Software & SaaS",
    nav_projects: "Projekti",
    nav_stack: "Tehnologije",
    nav_networks: "Mreže",
    nav_contact: "Kontakt",
    nav_cta: "Započni projekat",
    hero_badge: "Dostupan za nove projekte & saradnju",
    hero_title_prefix: "Inženjering modernih",
    hero_desc: "Razvijam brze web aplikacije, optimizovane API servise, PWA rešenja i pouzdanu Cloud infrastrukturu.",
    hero_btn_projects: "Istraži projekte",
    hero_btn_contact: "Stupi u kontakt",
    projects_tag: "Izvedeni Radovi",
    projects_title: "Projekti u Produkciji",
    project_ms_desc: "SaaS analitička platforma za autore na microstock agencijama. Automatizovano praćenje zarada, prodaje i portfolio metrika sa naprednim izveštavanjem.",
    project_kuca_desc: "Specijalizovana Progressive Web App aplikacija za budžetiranje, evidenciju troškova po fazama gradnje, skladištenje računa i praćenje građevinskih radova.",
    project_kuca_deploy: "Pokrenuto na samostalnoj VPS infrastrukturi (Hetzner + Coolify)",
    project_link: "Poseti landing stranicu",
    stack_tag: "Inženjerski Fokus",
    stack_title: "Tehnološki Ekosistem",
    stack_be_desc: "Brza, asinhrona i skalabilna serverska arhitektura sa fokusom na pouzdanost i performanse.",
    stack_fe_desc: "Moderni, lagani i optimizovani korisnički interfejsi sa mogućnostima offline rada i brzim učitavanjem.",
    stack_ops_desc: "Samostalno hostovana infrastruktura, kontejnerizacija, automatski SSL i Traefik reverse proxy.",
    networks_title: "Povežimo se na Mrežama",
    contact_title: "Započnimo saradnju",
    contact_desc: "Imate ideju za SaaS proizvod, potrebu za razvojem namenskog softvera ili želite automatizaciju procesa? Javite se direktno.",
    btn_visit_landing: "Poseti landing stranicu",
    btn_open_app: "Pokreni aplikaciju",
    proj_microstock_desc: "Zvanična prezentaciona stranica za SaaS platformu sa cenovnim planovima i pregledom mogućnosti.",
    proj_microapp_desc: "Kompletna analitička SaaS platforma za autore na microstock agencijama sa automatskim praćenjem metrika i zarada.",
    proj_kuca_desc: "Specijalizovana PWA aplikacija za budžetiranje, evidenciju računa i praćenje troškova izgradnje kuće.",
    proj_upcoming_title: "Uskoro Dolazi",
    proj_upcoming_desc: "Novi softverski projekat i SaaS rešenje fokusirano na automatizaciju i desktop performanse trenutno je u fazi razvoja.",
    proj_upcoming_status: "Najava uskoro • Stay tuned",
    proj_housebuilding_desc: "Sveobuhvatna SaaS platforma za upravljanje gradnjom kuće, praćenje faza radova, kontrolu budžeta, evidenciju računa i foto-dokumentaciju gradilišta.",
    btn_send_email: "Pošalji Email",
  },
  en: {
    nav_role: "Software & SaaS",
    nav_projects: "Projects",
    nav_stack: "Tech Stack",
    nav_networks: "Networks",
    nav_contact: "Contact",
    nav_cta: "Start Project",
    hero_badge: "Available for new projects & contracts",
    hero_title_prefix: "Engineering Modern",
    hero_desc: "Building high-performance web applications, resilient APIs, progressive web apps, and self-hosted cloud infrastructure.",
    hero_btn_projects: "Explore Projects",
    hero_btn_contact: "Get in Touch",
    projects_tag: "Featured Work",
    projects_title: "Live Production Systems",
    project_ms_desc: "SaaS analytics platform for microstock contributors. Automated earnings sync, portfolio intelligence, and advanced financial reporting.",
    project_kuca_desc: "Dedicated Progressive Web App for home construction budgeting, phased expense tracking, receipts vault, and real-time planning.",
    project_kuca_deploy: "Running on dedicated VPS infrastructure (Hetzner + Coolify)",
    project_link: "Visit landing page",
    stack_tag: "Core Competencies",
    stack_title: "Technology Stack",
    stack_be_desc: "High-throughput asynchronous backends engineered for speed, clean architecture, and reliability.",
    stack_fe_desc: "Responsive, lightweight user interfaces built for instant load speeds, PWA offline capabilities, and polish.",
    stack_ops_desc: "Self-hosted VPS infrastructure, multi-container deployments, automated SSL, and Traefik reverse proxying.",
    networks_title: "Connect Across Networks",
    contact_title: "Let's Build Together",
    contact_desc: "Have a SaaS idea, require custom software architecture, or want to automate business workflows? Let's connect.",
    btn_visit_landing: "Visit Landing Page",
    btn_open_app: "Launch Application",
    proj_microstock_desc: "Official landing page for the microstock analytics SaaS platform featuring pricing tiers and feature showcases.",
    proj_microapp_desc: "Comprehensive analytics SaaS platform for microstock contributors with automated revenue tracking and metrics.",
    proj_kuca_desc: "Specialized Progressive Web App for home construction budgeting, expense logging, and receipt management.",
    proj_upcoming_title: "Coming Soon",
    proj_upcoming_desc: "A brand new software and SaaS solution focused on workflow automation and modern desktop architecture is currently in active development.",
    proj_upcoming_status: "Announcement Soon • Stay tuned",
    proj_microstock_desc: "Official landing page for the microstock analytics SaaS platform featuring pricing tiers and feature showcases.",
    proj_housebuilding_desc: "Comprehensive SaaS platform for home construction management, progress tracking, budget oversight, receipt archiving, and on-site photo documentation.",
    contact_title: "Let's Build Together",
    contact_desc: "Have a SaaS concept in mind, need custom software architecture, or want to automate business workflows? Let's connect.",
    btn_send_email: "Send Email",
  }
};

let currentLang = localStorage.getItem('alexandar_lang') || 'sr';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('alexandar_lang', lang);
  const langDisplay = document.getElementById('langCurrent');
  if (langDisplay) {
    langDisplay.textContent = lang.toUpperCase();
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

document.getElementById('langToggle')?.addEventListener('click', () => {
  setLanguage(currentLang === 'sr' ? 'en' : 'sr');
});

// Postavljanje početnog jezika
setLanguage(currentLang);

// Kopiranje email adrese u clipboard
const copyBtn = document.getElementById('copyEmailBtn');
const toast = document.getElementById('copyToast');

copyBtn?.addEventListener('click', () => {
  navigator.clipboard.writeText('alexalbekstudio.design@gmail.com');
  if (toast) {
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2500);
  }
});