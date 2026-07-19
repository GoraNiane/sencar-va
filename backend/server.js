const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

app.listen(PORT, () => {
  console.log(`API Auto Elite démarrée sur http://localhost:${PORT}`);
});
