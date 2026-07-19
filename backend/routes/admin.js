const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

const { readAdmins, writeAdmins } = require('../data/adminStore');
const { loginAdmin, requireAuth, requireRole, auditLog } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe obligatoires.' });

  const result = await loginAdmin({ email, password });
  if (!result) return res.status(401).json({ message: 'Identifiants invalides.' });

  // Audit
  try {
    auditLog({
      adminId: result.admin.id,
      action: 'LOGIN',
      entity: 'ADMIN',
      entityId: result.admin.id,
      req
    });
  } catch {}

  res.json({ token: result.token, role: result.admin.role, admin: { id: result.admin.id, email: result.admin.email } });
});

// Endpoint utilitaire: créer le premier admin/mettre à jour un hash si vide (optionnel)
// Utiliser seulement en dev. En prod, verrouiller.
router.post('/auth/bootstrap', requireRole(['gerant']), async (req, res) => {
  const { email, password, role = 'gerant' } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe obligatoires.' });

  const admins = readAdmins();
  let admin = admins.find(a => a.email.toLowerCase() === String(email).toLowerCase());
  if (!admin) {
    admin = { id: admins.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1, email, role, passwordHash: '', active: true, createdAt: new Date().toISOString() };
    admins.push(admin);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  admin.passwordHash = passwordHash;
  admin.role = role;
  admin.active = true;

  writeAdmins(admins);
  res.json({ success: true });
});

// (Optionnel) audit list
router.get('/audit', requireAuth, requireRole(['gerant']), (req, res) => {
  const { readAdminAudit } = require('../data/adminStore');
  res.json(readAdminAudit().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

module.exports = router;

