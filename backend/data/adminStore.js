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

module.exports = {
  readAdmins: () => readJson('admins.json'),
  writeAdmins: (data) => writeJson('admins.json', data),
  readAdminAudit: () => readJson('admin_audit.json'),
  writeAdminAudit: (data) => writeJson('admin_audit.json', data),
  nextId
};

