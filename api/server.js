// api/server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// VALIDACIJA ENV
// ============================================================
if (!process.env.ADMIN_HASH || !process.env.SESSION_SECRET) {
  console.error('❌ GREŠKA: Nedostaju ADMIN_HASH ili SESSION_SECRET u .env fajlu!');
  console.error('   Pogledaj api/.env.example za šablon.');
  process.exit(1);
}

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8 // 8 sati
  }
}));

// Serviraj statički frontend (sve iz root-a projekta)
app.use(express.static(path.join(__dirname, '..')));

// Serviraj uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// MULTER — upload slika
// ============================================================
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .slice(0, 40);
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Samo slike su dozvoljene (JPG, PNG, WEBP, GIF, SVG)'));
    }
  }
});

// ============================================================
// AUTH
// ============================================================
function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  res.status(401).json({ error: 'Neautorizovano. Prijavi se ponovo.' });
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  // Provjerava da li su podaci pravilni
  if (!username || !password) {
    return res.status(400).json({ error: 'Nedostaju podaci.' });
  }

  // Hardkodirano — samo za testiranje
  if (username === 'aleksandar' && password === 'Alex@+65!') {
    req.session.loggedIn = true;
    req.session.user = username;
    res.json({ ok: true });
    return;
  }

  // Ako ne uspije — vrati grešku
  return res.status(401).json({ error: 'Pogrešni podaci.' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({
    loggedIn: !!(req.session && req.session.loggedIn),
    user: req.session?.user || null
  });
});

// ============================================================
// DATA (JSON fajlovi)
// ============================================================
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const VALID_PAGES = ['index', 'dizajn', 'umetnost', 'microstock', 'housebuilding', 'servicemaster'];

function dataPath(page) {
  return path.join(DATA_DIR, `${page}.json`);
}

function readData(page) {
  const p = dataPath(page);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('Greška pri čitanju', p, e);
    return null;
  }
}

function writeData(page, data) {
  const p = dataPath(page);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

// GET — javno (bilo ko može da čita, jer frontend učitava ovo)
app.get('/api/data/:page', (req, res) => {
  const page = req.params.page;
  if (!VALID_PAGES.includes(page)) {
    return res.status(400).json({ error: 'Nepoznata stranica.' });
  }
  const data = readData(page);
  if (!data) return res.status(404).json({ error: 'Podaci nisu pronađeni.' });
  res.json(data);
});

// PUT — samo admin
app.put('/api/data/:page', requireAuth, (req, res) => {
  const page = req.params.page;
  if (!VALID_PAGES.includes(page)) {
    return res.status(400).json({ error: 'Nepoznata stranica.' });
  }
  try {
    writeData(page, req.body);
    res.json({ ok: true, saved: new Date().toISOString() });
  } catch (e) {
    console.error('Greška pri pisanju:', e);
    res.status(500).json({ error: 'Greška pri čuvanju.' });
  }
});

// ============================================================
// UPLOAD
// ============================================================
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nema fajla.' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Error handler za multer greške
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload greška: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ============================================================
// START
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔════════════════════════════════════════════╗');
  console.log('  ║   ✅  Alexandar Studio Admin Server        ║');
  console.log('  ╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`  🌐  Sajt:     http://localhost:${PORT}/`);
  console.log(`  🔐  Login:    http://localhost:${PORT}/admin/login.html`);
  console.log(`  📊  Admin:    http://localhost:${PORT}/admin/dashboard.html`);
  console.log('');
  console.log(`  👤  User:     ${process.env.ADMIN_USER}`);
  console.log('');
});