const express = require('express');
const router = express.Router();
const { readAlerts, writeAlerts, readArticles, writeArticles, readPartners, writePartners, nextId } = require('../data/store');
const { requireAuth, requireRole, auditLog } = require('../middleware/auth');

// Auth admin (JWT)
const requireAdmin = [requireAuth, requireRole(['gerant', 'vendeur'])];


// ===== ALERTS =====
router.get('/alerts', requireAdmin, (req, res) => {
  const alerts = readAlerts();
  res.json(alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/alerts', (req, res) => {
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

module.exports = router;
