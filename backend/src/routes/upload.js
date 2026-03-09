import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `vid-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/i;
  const ext = path.extname(file.originalname).slice(1);
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only images allowed (jpeg, jpg, png, gif, webp)'));
};

const videoFilter = (req, file, cb) => {
  const allowed = /mp4|webm|mov|ogg/i;
  const ext = path.extname(file.originalname).slice(1);
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only videos allowed (mp4, webm, mov, ogg)'));
};

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: videoFilter,
});

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `banner-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadAny = multer({
  storage: bannerStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const imgExts = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    const vidExts = ['mp4', 'webm', 'mov', 'ogg'];
    if (imgExts.includes(ext) || vidExts.includes(ext)) cb(null, true);
    else cb(new Error('Only images (jpeg, jpg, png, gif, webp) or videos (mp4, webm, mov, ogg) allowed'));
  },
});

const router = express.Router();
const baseUrl = () => process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;

router.post('/image', uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `${baseUrl()}/uploads/${req.file.filename}` });
});

router.post('/video', uploadVideo.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `${baseUrl()}/uploads/${req.file.filename}` });
});

router.post('/banner', uploadAny.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
  const videoExts = ['mp4', 'webm', 'mov', 'ogg'];
  const mediaType = videoExts.includes(ext) ? 'video' : 'image';
  res.json({
    url: `${baseUrl()}/uploads/${req.file.filename}`,
    mediaType,
  });
});

router.post('/images', uploadImage.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
  const urls = req.files.map((f) => `${baseUrl()}/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
