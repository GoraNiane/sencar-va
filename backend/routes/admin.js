const express = require('express');

const { loginAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/auth/login', (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ message: 'Mot de passe obligatoire.' });

  const result = loginAdmin({ password });
  if (!result) return res.status(401).json({ message: 'Mot de passe invalide.' });

  res.json({ token: result.token, role: result.admin.role, admin: result.admin });
});

module.exports = router;
