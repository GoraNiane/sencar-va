const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;

function readJson(file) {
  const full = path.join(DATA_DIR, file);
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, 'utf-8');
  return raw ? JSON.parse(raw) : [];
}

function writeJson(file, data) {
  const full = path.join(DATA_DIR, file);
  fs.writeFileSync(full, JSON.stringify(data, null, 2), 'utf-8');
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

function recordView(vehicleId, type = 'view') {
  const stats = readJson('stats.json');
  stats.push({
    id: nextId(stats),
    vehicleId: Number(vehicleId),
    type,
    createdAt: new Date().toISOString()
  });
  writeJson('stats.json', stats);
}

module.exports = {
  readVehicles: () => readJson('vehicles.json'),
  writeVehicles: (data) => writeJson('vehicles.json', data),
  readAlerts: () => readJson('alerts.json'),
  writeAlerts: (data) => writeJson('alerts.json', data),
  readArticles: () => readJson('articles.json'),
  writeArticles: (data) => writeJson('articles.json', data),
  readPartners: () => readJson('partners.json'),
  writePartners: (data) => writeJson('partners.json', data),
  readAppointments: () => readJson('appointments.json'),
  writeAppointments: (data) => writeJson('appointments.json', data),
  readTradeins: () => readJson('tradeins.json'),
  writeTradeins: (data) => writeJson('tradeins.json', data),
  readFavorites: () => readJson('favorites.json'),
  writeFavorites: (data) => writeJson('favorites.json', data),
  readReviews: () => readJson('reviews.json'),
  writeReviews: (data) => writeJson('reviews.json', data),
  readLegal: () => readJson('legal.json'),
  writeLegal: (data) => writeJson('legal.json', data),
  readStats: () => readJson('stats.json'),
  writeStats: (data) => writeJson('stats.json', data),
  nextId,
  recordView
};
