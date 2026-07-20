const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const vehiclesRouter = require('./routes/vehicles');
const extrasRouter = require('./routes/extras');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads', 'vehicles');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());

app.use('/uploads/vehicles', express.static(uploadsDir));

// Rate limiting for public API
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes. Veuillez réessayer dans un instant.' }
});
app.use('/api/vehicles', publicLimiter);
app.use('/api', publicLimiter);

app.use('/api/vehicles', vehiclesRouter);
app.use('/api', extrasRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'auto-elite-api' });
});

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || 'Erreur lors du traitement de la requête.' });
  }
  next();
});

// Important pour Vercel : n'active app.listen que si on n'est pas sur Vercel (en local)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API Auto Elite démarrée sur http://localhost:${PORT}`);
  });
}

// Exporte l'application pour que Vercel puisse l'utiliser en serverless
module.exports = app;