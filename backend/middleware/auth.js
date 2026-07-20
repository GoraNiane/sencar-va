const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_SECRET = config.JWT_SECRET;

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

function loginAdmin({ password }) {
  if (password !== config.ADMIN_PASSWORD) return null;

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });
  return { token, admin: { role: 'admin' } };
}

module.exports = {
  requireAuth,
  loginAdmin
};
