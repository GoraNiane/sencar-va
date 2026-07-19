const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readAdmins, writeAdmins, readAdminAudit, writeAdminAudit, nextId } = require('../data/adminStore');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';

function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Non authentifié.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalide.' });
  }
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ message: 'Non authentifié.' });
    if (!roles.length) return next();
    if (!roles.includes(req.admin.role)) return res.status(403).json({ message: 'Rôle insuffisant.' });
    return next();
  };
}

function auditLog({ adminId, action, entity, entityId, req }) {
  const ip = req.ip || '';
  const userAgent = req.headers['user-agent'] || '';

  const entry = {
    id: nextId(readAdminAudit()),
    adminId,
    action,
    entity,
    entityId: entityId ?? null,
    ip,
    userAgent,
    createdAt: new Date().toISOString()
  };

  const audit = readAdminAudit();
  audit.push(entry);
  writeAdminAudit(audit);
}

async function loginAdmin({ email, password }) {
  const admins = readAdmins();
  const admin = admins.find(a => a.email.toLowerCase() === String(email || '').toLowerCase() && a.active);
  if (!admin) return null;
  if (!admin.passwordHash) return null;

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return null;

  const token = jwt.sign({ adminId: admin.id, role: admin.role, email: admin.email }, JWT_SECRET, { expiresIn: '8h' });
  return { token, admin };
}

module.exports = {
  requireAuth,
  requireRole,
  auditLog,
  loginAdmin,
  JWT_SECRET
};

