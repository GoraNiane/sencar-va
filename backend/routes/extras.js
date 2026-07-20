const express = require('express');
const router = express.Router();
const { readAlerts, writeAlerts, readArticles, writeArticles, readPartners, writePartners, nextId } = require('../data/store');
const { readAppointments, writeAppointments } = require('../data/store');
const { readTradeins, writeTradeins } = require('../data/store');
const { readFavorites, writeFavorites } = require('../data/store');
const { readReviews, writeReviews } = require('../data/store');
const { readLegal, writeLegal } = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const requireAdmin = [requireAuth];

// Simple in-memory rate limiter for public submissions
const publicLimiter = new Map();
function rateLimitPublic(req, res, next) {
  const key = req.ip || 'anon';
  const now = Date.now();
  const hits = publicLimiter.get(key) || [];
  const recent = hits.filter(t => now - t < 60_000);
  recent.push(now);
  publicLimiter.set(key, recent);
  if (recent.length > 3) return res.status(429).json({ message: 'Trop de requêtes. Veuillez réessayer dans un instant.' });
  next();
}

// ===== ALERTS =====
router.get('/alerts', requireAdmin, (req, res) => {
  const alerts = readAlerts();
  res.json(alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/alerts', rateLimitPublic, (req, res) => {
  const { contact, brand, model, phone, email } = req.body;
  if (!contact || (!phone && !email)) {
    return res.status(400).json({ message: 'Contact et téléphone ou email sont obligatoires.' });
  }
  const alerts = readAlerts();
  const alert = {
    id: nextId(alerts),
    contact: contact || '',
    brand: brand || '',
    model: model || '',
    phone: phone || '',
    email: email || '',
    createdAt: new Date().toISOString()
  };
  alerts.push(alert);
  writeAlerts(alerts);
  res.status(201).json({ success: true, message: 'Votre alerte a été enregistrée. Nous vous contacterons dès que le véhicule est disponible.' });
});

router.delete('/alerts/:id', requireAdmin, (req, res) => {
  let alerts = readAlerts();
  alerts = alerts.filter(a => a.id !== Number(req.params.id));
  writeAlerts(alerts);
  res.json({ message: 'Alerte supprimée.' });
});

// ===== ARTICLES =====
router.get('/articles', (req, res) => {
  const articles = readArticles();
  res.json(articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/articles', requireAdmin, (req, res) => {
  const { title, excerpt, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Titre et contenu sont obligatoires.' });
  const articles = readArticles();
  const article = {
    id: nextId(articles),
    title,
    excerpt: excerpt || '',
    content,
    createdAt: new Date().toISOString()
  };
  articles.push(article);
  writeArticles(articles);
  res.status(201).json(article);
});

router.put('/articles/:id', requireAdmin, (req, res) => {
  const articles = readArticles();
  const index = articles.findIndex(a => a.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Article introuvable.' });
  const { title, excerpt, content } = req.body;
  articles[index] = {
    ...articles[index],
    title: title ?? articles[index].title,
    excerpt: excerpt ?? articles[index].excerpt,
    content: content ?? articles[index].content
  };
  writeArticles(articles);
  res.json(articles[index]);
});

router.delete('/articles/:id', requireAdmin, (req, res) => {
  let articles = readArticles();
  articles = articles.filter(a => a.id !== Number(req.params.id));
  writeArticles(articles);
  res.json({ message: 'Article supprimé.' });
});

// ===== PARTNERS =====
router.get('/partners', (req, res) => {
  const partners = readPartners();
  res.json(partners);
});

router.post('/partners', requireAdmin, (req, res) => {
  const { name, logo } = req.body;
  if (!name) return res.status(400).json({ message: 'Le nom du partenaire est obligatoire.' });
  const partners = readPartners();
  const partner = { id: nextId(partners), name, logo: logo || '' };
  partners.push(partner);
  writePartners(partners);
  res.status(201).json(partner);
});

router.delete('/partners/:id', requireAdmin, (req, res) => {
  let partners = readPartners();
  partners = partners.filter(p => p.id !== Number(req.params.id));
  writePartners(partners);
  res.json({ message: 'Partenaire supprimé.' });
});

// ===== APPOINTMENTS =====
router.get('/appointments', requireAdmin, (req, res) => {
  const appointments = readAppointments();
  res.json(appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/appointments', rateLimitPublic, (req, res) => {
  const { name, phone, email, vehicleId, date, time, message } = req.body;
  if (!name || !phone || !date || !time) {
    return res.status(400).json({ message: 'Nom, téléphone, date et heure sont obligatoires.' });
  }
  const appointments = readAppointments();
  const appointment = {
    id: nextId(appointments),
    name,
    phone,
    email: email || '',
    vehicleId: vehicleId ? Number(vehicleId) : null,
    date,
    time,
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  appointments.push(appointment);
  writeAppointments(appointments);
  res.status(201).json({ success: true, message: 'Votre demande de rendez-vous a été enregistrée.' });
});

router.put('/appointments/:id/status', requireAdmin, (req, res) => {
  const appointments = readAppointments();
  const index = appointments.findIndex(a => a.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Rendez-vous introuvable.' });
  const { status } = req.body;
  appointments[index].status = status || appointments[index].status;
  writeAppointments(appointments);
  res.json(appointments[index]);
});

router.delete('/appointments/:id', requireAdmin, (req, res) => {
  let appointments = readAppointments();
  appointments = appointments.filter(a => a.id !== Number(req.params.id));
  writeAppointments(appointments);
  res.json({ message: 'Rendez-vous supprimé.' });
});

// ===== TRADE-INS =====
router.get('/tradeins', requireAdmin, (req, res) => {
  const tradeins = readTradeins();
  res.json(tradeins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/tradeins', rateLimitPublic, (req, res) => {
  const { name, phone, email, brand, model, year, mileage, description } = req.body;
  if (!name || !phone || !brand || !model) {
    return res.status(400).json({ message: 'Nom, téléphone, marque et modèle sont obligatoires.' });
  }
  const tradeins = readTradeins();
  const tradein = {
    id: nextId(tradeins),
    name,
    phone,
    email: email || '',
    brand,
    model,
    year: year ? Number(year) : null,
    mileage: mileage ? Number(mileage) : 0,
    description: description || '',
    photos: [],
    status: 'new',
    createdAt: new Date().toISOString()
  };
  tradeins.push(tradein);
  writeTradeins(tradeins);
  res.status(201).json({ success: true, message: 'Votre proposition de reprise a été enregistrée.' });
});

router.post('/tradeins/:id/media', requireAdmin, (req, res) => {
  const tradeins = readTradeins();
  const index = tradeins.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Reprise introuvable.' });
  // Media upload handled by multipart form - simplified here
  res.json(tradeins[index]);
});

router.put('/tradeins/:id/status', requireAdmin, (req, res) => {
  const tradeins = readTradeins();
  const index = tradeins.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Reprise introuvable.' });
  const { status } = req.body;
  tradeins[index].status = status || tradeins[index].status;
  writeTradeins(tradeins);
  res.json(tradeins[index]);
});

router.delete('/tradeins/:id', requireAdmin, (req, res) => {
  let tradeins = readTradeins();
  tradeins = tradeins.filter(t => t.id !== Number(req.params.id));
  writeTradeins(tradeins);
  res.json({ message: 'Reprise supprimée.' });
});

// ===== FAVORITES =====
router.get('/favorites', requireAuth, (req, res) => {
  const favs = readFavorites();
  const userFavs = favs.filter(f => f.adminId === req.admin.adminId);
  res.json(userFavs);
});

router.post('/favorites', requireAuth, (req, res) => {
  const { vehicleId } = req.body;
  if (!vehicleId) return res.status(400).json({ message: 'vehicleId requis.' });
  const favs = readFavorites();
  const exists = favs.find(f => f.adminId === req.admin.adminId && f.vehicleId === Number(vehicleId));
  if (exists) return res.status(409).json({ message: 'Déjà en favori.' });
  favs.push({ id: nextId(favs), adminId: req.admin.adminId, vehicleId: Number(vehicleId), createdAt: new Date().toISOString() });
  writeFavorites(favs);
  res.status(201).json({ success: true });
});

router.delete('/favorites/:vehicleId', requireAuth, (req, res) => {
  let favs = readFavorites();
  favs = favs.filter(f => !(f.adminId === req.admin.adminId && f.vehicleId === Number(req.params.vehicleId)));
  writeFavorites(favs);
  res.json({ message: 'Favori supprimé.' });
});

// ===== REVIEWS =====
router.get('/reviews', (req, res) => {
  const reviews = readReviews();
  res.json(reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/reviews', rateLimitPublic, (req, res) => {
  const { name, rating, comment, vehicleId } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ message: 'Nom, note et commentaire sont obligatoires.' });
  }
  const reviews = readReviews();
  const review = {
    id: nextId(reviews),
    name,
    rating: Number(rating),
    comment,
    vehicleId: vehicleId ? Number(vehicleId) : null,
    approved: false,
    createdAt: new Date().toISOString()
  };
  reviews.push(review);
  writeReviews(reviews);
  res.status(201).json({ success: true, message: 'Merci ! Votre avis sera publié après modération.' });
});

router.put('/reviews/:id/approve', requireAdmin, (req, res) => {
  const reviews = readReviews();
  const index = reviews.findIndex(r => r.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Avis introuvable.' });
  reviews[index].approved = true;
  writeReviews(reviews);
  res.json(reviews[index]);
});

router.delete('/reviews/:id', requireAdmin, (req, res) => {
  let reviews = readReviews();
  reviews = reviews.filter(r => r.id !== Number(req.params.id));
  writeReviews(reviews);
  res.json({ message: 'Avis supprimé.' });
});

// ===== LEGAL PAGES =====
router.get('/legal/:page', (req, res) => {
  const page = req.params.page;
  const legal = readLegal();
  if (page === 'mentions' && legal.mentions) return res.json({ title: 'Mentions légales', content: legal.mentions });
  if (page === 'privacy' && legal.privacy) return res.json({ title: 'Politique de confidentialité', content: legal.privacy });
  if (page === 'cgv' && legal.cgv) return res.json({ title: 'Conditions générales de vente', content: legal.cgv });
  res.status(404).json({ message: 'Page introuvable.' });
});

router.put('/legal/:page', requireAdmin, (req, res) => {
  const page = req.params.page;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Contenu requis.' });
  const legal = readLegal();
  if (page === 'mentions') legal.mentions = content;
  else if (page === 'privacy') legal.privacy = content;
  else if (page === 'cgv') legal.cgv = content;
  else return res.status(404).json({ message: 'Page introuvable.' });
  writeLegal(legal);
  res.json({ success: true });
});

module.exports = router;
