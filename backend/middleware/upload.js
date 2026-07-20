const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads', 'vehicles');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const vehicleDir = path.join(UPLOADS_ROOT, String(req.params.id));
    fs.mkdirSync(vehicleDir, { recursive: true });
    cb(null, vehicleDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, '-');
    const baseName = path.basename(safeName, path.extname(safeName));
    cb(null, `${Date.now()}-${baseName}.webp`);
  }
});

const fileFilter = (req, file, cb) => {
  const isPhoto = file.fieldname === 'photos' && file.mimetype.startsWith('image/');
  const isVideo = file.fieldname === 'videos' && file.mimetype.startsWith('video/');
  if (isPhoto || isVideo) return cb(null, true);
  cb(new Error('Type de fichier non autorisé.'));
};

async function applyWatermarkAndWebp(filePath) {
  try {
    const watermarkSvg = Buffer.from(
      `<svg width="200" height="40" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="28" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.35)" font-weight="bold">AUTO ELITE</text>
       </svg>`
    );
    await sharp(filePath)
      .composite([{ input: watermarkSvg, gravity: 'southeast', blend: 'over' }])
      .webp({ quality: 85 })
      .toFile(filePath + '.tmp');
    fs.renameSync(filePath + '.tmp', filePath);
  } catch (err) {
    console.error('Image processing error:', err.message);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 80 * 1024 * 1024 }
});

async function uploadWithProcess(req, res, next) {
  await upload.any()(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Erreur lors du téléchargement.' });
    const photoFiles = (req.files || []).filter(f => f.fieldname === 'photos').map(f => f.filename);
    for (const filename of photoFiles) {
      const filePath = path.join(UPLOADS_ROOT, String(req.params.id), filename);
      await applyWatermarkAndWebp(filePath);
    }
    next();
  });
}

module.exports = { upload, uploadWithProcess, UPLOADS_ROOT };
