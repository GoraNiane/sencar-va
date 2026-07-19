const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;

function readJson(file) {
  const full = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(full, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(file, data) {
  const full = path.join(DATA_DIR, file);
  fs.writeFileSync(full, JSON.stringify(data, null, 2), 'utf-8');
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
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
  nextId
};
