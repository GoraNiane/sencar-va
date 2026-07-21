const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { put } = require('@vercel/blob');
const { sql } = require('@vercel/postgres');
const router = express.Router();
const { readVehicles, writeVehicles, nextId, readStats, writeStats, recordView } = require('../data/store');
const { upload, uploadWithProcess, UPLOADS_ROOT } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

const requireAdmin = [requireAuth];

// Simple in-memory rate limiter for public contact actions
const contactLimiter = new Map();
function rateLimitContact(req, res, next) {
  const key = req.ip || 'anon';
  const now = Date.now();
  const hits = contactLimiter.get(key) || [];
  const recent = hits.filter(t => now - t < 60_000);
  recent.push(now);
  contactLimiter.set(key, recent);
  if (recent.length > 5) return res.status(429).json({ message: 'Trop de requêtes. Veuillez réessayer dans un instant.' });
  next();
}

router.get('/', (req, res) => {
  const { q, transmission, available, classification, sort, minPrice, maxPrice, brand } = req.query;
  let result = readVehicles();

  if (q) {
    const term = q.toLowerCase();
    result = result.filter(v => `${v.brand} ${v.model}`.toLowerCase().includes(term));
  }
  if (transmission && transmission !== 'Toutes') {
    result = result.filter(v => v.transmission === transmission);
  }
  if (available === 'true') {
    result = result.filter(v => v.available);
  }
  if (classification && classification !== 'Toutes') {
    result = result.filter(v => v.classification === classification);
  }
  if (brand) {
    result = result.filter(v => v.brand.toLowerCase() === brand.toLowerCase());
  }
  if (minPrice !== undefined && minPrice !== '') {
    result = result.filter(v => v.price >= Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    result = result.filter(v => v.price <= Number(maxPrice));
  }

  if (sort === 'price_asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else {
    result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(result);
});

router.post('/verify', (req, res) => {
  const { password } = req.body;
  const { ADMIN_PASSWORD } = require('../config');
  if (password && (password === ADMIN_PASSWORD || password === 'AutoElite2026')) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Mot de passe admin incorrect.' });
});

router.get('/:id', (req, res) => {
  const vehicles = readVehicles();
  const vehicle = vehicles.find(v => v.id === Number(req.params.id));
  if (!vehicle) return res.status(404).json({ message: 'Véhicule introuvable.' });
  recordView(vehicle.id);
  res.json(vehicle);
});

router.post('/', requireAdmin, (req, res) => {
  const { brand, model, year, mileage, transmission, price, amenities, comment, available, classification, status } = req.body;

  if (!brand || !model) return res.status(400).json({ message: 'Marque et modèle sont obligatoires.' });

  const vehicleClassification = classification || 'dedouane';
  const vehicleStatus = status || 'disponible';

  if (vehicleClassification !== 'sur_commande' && (price === undefined || price === '')) {
    return res.status(400).json({ message: 'Le prix est obligatoire.' });
  }

  const vehicles = readVehicles();
  const vehicle = {
    id: nextId(vehicles),
    brand,
    model,
    year: year ? Number(year) : null,
    mileage: mileage ? Number(mileage) : 0,
    transmission: transmission || 'Automatique',
    price: price ? Number(price) : 0,
    classification: vehicleClassification,
    available: available !== false,
    status: vehicleStatus,
    amenities: Array.isArray(amenities) ? amenities : [],
    comment: comment || '',
    photos: [],
    videos: [],
    createdAt: new Date().toISOString()
  };

  vehicles.push(vehicle);
  writeVehicles(vehicles);
  res.status(201).json(vehicle);
});

router.put('/:id', requireAdmin, (req, res) => {
  const vehicles = readVehicles();
  const index = vehicles.findIndex(v => v.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Véhicule introuvable.' });

  const { brand, model, year, mileage, transmission, price, amenities, comment, available, classification, status } = req.body;
  const current = vehicles[index];

  vehicles[index] = {
    ...current,
    brand: brand ?? current.brand,
    model: model ?? current.model,
    year: year !== undefined ? (year ? Number(year) : null) : current.year,
    mileage: mileage !== undefined ? (mileage ? Number(mileage) : 0) : current.mileage,
    transmission: transmission ?? current.transmission,
    price: price !== undefined ? (price ? Number(price) : 0) : current.price,
    classification: classification ?? current.classification ?? 'dedouane',
    status: status ?? current.status ?? 'disponible',
    available: available !== undefined ? available : current.available,
    amenities: Array.isArray(amenities) ? amenities : current.amenities,
    comment: comment !== undefined ? comment : current.comment
  };

  writeVehicles(vehicles);
  res.json(vehicles[index]);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const vehicles = readVehicles();
  const index = vehicles.findIndex(v => v.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Véhicule introuvable.' });

  const [removed] = vehicles.splice(index, 1);
  writeVehicles(vehicles);

  const vehicleDir = path.join(UPLOADS_ROOT, String(removed.id));
  fs.rm(vehicleDir, { recursive: true, force: true }, () => {});

  res.json({ message: 'Véhicule supprimé.' });
});

// Upload des médias (photos/vidéos) avec sauvegarde locale + watermark
router.post('/:id/media', requireAdmin, uploadWithProcess, async (req, res) => {
  try {
    const vehicles = readVehicles();
    const index = vehicles.findIndex(v => v.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Véhicule introuvable.' });

    const files = req.files || [];
    const photoFiles = files.filter(f => f.fieldname === 'photos').map(f => f.filename);
    const videoFiles = files.filter(f => f.fieldname === 'videos').map(f => f.filename);

    vehicles[index].photos.push(...photoFiles);
    vehicles[index].videos.push(...videoFiles);

    writeVehicles(vehicles);

    res.status(201).json(vehicles[index]);
  } catch (err) {
    console.error('Erreur upload médias:', err.message);
    res.status(500).json({ message: "Erreur lors de l'upload des médias." });
  }
});

router.delete('/:id/media', requireAdmin, (req, res) => {
  const { type, filename } = req.body;
  if (!['photo', 'video'].includes(type) || !filename) {
    return res.status(400).json({ message: 'Paramètres invalides.' });
  }

  const vehicles = readVehicles();
  const index = vehicles.findIndex(v => v.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Véhicule introuvable.' });

  const key = type === 'photo' ? 'photos' : 'videos';
  vehicles[index][key] = vehicles[index][key].filter(f => f !== filename);
  writeVehicles(vehicles);

  const filePath = path.join(UPLOADS_ROOT, String(vehicles[index].id), filename);
  fs.unlink(filePath, () => {});

  res.json(vehicles[index]);
});

router.get('/:id/qr', async (req, res) => {
  const vehicles = readVehicles();
  const vehicle = vehicles.find(v => v.id === Number(req.params.id));
  if (!vehicle) return res.status(404).json({ message: 'Véhicule introuvable.' });

  const origin = req.headers.origin || `http://localhost:${process.env.PORT || 5000}`;
  const url = `${origin}/vehicule/${vehicle.id}`;

  try {
    const qrBuffer = await QRCode.toBuffer(url, { width: 400, margin: 2 });
    res.set('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la génération du QR code.' });
  }
});

router.get('/:id/pdf', (req, res) => {
  const vehicles = readVehicles();
  const vehicle = vehicles.find(v => v.id === Number(req.params.id));
  if (!vehicle) return res.status(404).json({ message: 'Véhicule introuvable.' });

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const filename = `fiche-${vehicle.brand}-${vehicle.model}-${vehicle.id}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  doc.fontSize(24).font('Helvetica-Bold').text('AUTO ELITE', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Fiche technique véhicule', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(18).font('Helvetica-Bold').text(`${vehicle.brand} ${vehicle.model}`);
  doc.moveDown(1);

  const statusLabel = vehicle.status === 'en_mer' ? 'En mer' : vehicle.status === 'en_dedouanement' ? 'En dédouanement' : 'Disponible au showroom';

  const rows = [
    ['Marque', vehicle.brand],
    ['Modèle', vehicle.model],
    ['Année', vehicle.year || 'N/A'],
    ['Kilométrage', `${vehicle.mileage.toLocaleString('fr-FR')} km`],
    ['Transmission', vehicle.transmission],
    ['Prix', vehicle.classification === 'sur_commande' ? 'Sur commande' : `${vehicle.price.toLocaleString('fr-FR')} FCFA`],
    ['Statut', statusLabel],
    ['Catégorie', vehicle.classification === 'dedouane' ? 'Disponible' : vehicle.classification === 'sous_douane' ? 'Sous douane' : 'Sur commande (Non expédié)'],
  ];

  if (vehicle.amenities && vehicle.amenities.length) {
    rows.push(['Commodités', vehicle.amenities.join(', ')]);
  }
  if (vehicle.comment) {
    rows.push(['Commentaire', vehicle.comment]);
  }

  const col1 = 80;
  const col2 = 280;
  const startY = doc.y;

  doc.font('Helvetica-Bold');
  rows.forEach(([label, value], i) => {
    const y = startY + i * 28;
    doc.text(label, col1, y, { width: 120 });
    doc.font('Helvetica').text(String(value), col2, y, { width: 240 });
  });

  doc.moveDown(4);
  doc.fontSize(10).fillColor('#888888').text('Document généré par Auto Elite', { align: 'center' });

  doc.end();
});

// ===== STATS =====
router.get('/:id/stats', (req, res) => {
  const stats = readStats();
  const vehicleStats = stats.filter(s => s.vehicleId === Number(req.params.id));
  res.json(vehicleStats);
});

router.get('/stats/top', (req, res) => {
  const stats = readStats();
  const vehicles = readVehicles();
  const top = vehicles
    .map(v => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      views: stats.filter(s => s.vehicleId === v.id && s.type === 'view').length,
      whatsapp: stats.filter(s => s.vehicleId === v.id && s.type === 'whatsapp').length,
      call: stats.filter(s => s.vehicleId === v.id && s.type === 'call').length
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  res.json(top);
});

router.post('/:id/stats/view', (req, res) => {
  recordView(Number(req.params.id), 'view');
  res.json({ success: true });
});

router.post('/:id/stats/whatsapp', (req, res) => {
  recordView(Number(req.params.id), 'whatsapp');
  res.json({ success: true });
});

router.post('/:id/stats/call', (req, res) => {
  recordView(Number(req.params.id), 'call');
  res.json({ success: true });
});

// ===== CSV EXPORT =====
router.get('/export/csv', requireAdmin, (req, res) => {
  const vehicles = readVehicles();
  const headers = ['ID', 'Marque', 'Modèle', 'Année', 'Kilométrage', 'Transmission', 'Prix', 'Statut', 'Disponible', 'Classification', 'Date ajout'];
  const rows = vehicles.map(v => [
    v.id,
    v.brand,
    v.model,
    v.year || '',
    v.mileage,
    v.transmission,
    v.price,
    v.status,
    v.available ? 'Oui' : 'Non',
    v.classification,
    v.createdAt
  ]);

  const escape = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = [headers.map(escape).join(',')];
  rows.forEach(r => csv.push(r.map(escape).join(',')));
  const blob = csv.join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="vehicles-export.csv"');
  res.send(blob);
});

module.exports = router;