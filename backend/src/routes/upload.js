import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadToS3 } from '../lib/s3Upload.js';

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

// Use in-memory storage; files are sent directly to S3
const storage = multer.memoryStorage();

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: videoFilter,
});

const uploadAny = multer({
  storage,
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

router.post('/image', uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { url } = await uploadToS3(req.file, 'images/img', {
      compressImage: true,
    });
    res.json({ url });
  } catch (err) {
    console.error('S3 image upload error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

router.post('/video', uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { url } = await uploadToS3(req.file, 'videos/vid');
    res.json({ url });
  } catch (err) {
    console.error('S3 video upload error:', err);
    res.status(500).json({ error: 'Video upload failed' });
  }
});

router.post('/banner', uploadAny.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
    const videoExts = ['mp4', 'webm', 'mov', 'ogg'];
    const mediaType = videoExts.includes(ext) ? 'video' : 'image';

    const { url } = await uploadToS3(req.file, 'banners/banner', {
      compressImage: mediaType === 'image',
    });
    res.json({
      url,
      mediaType,
    });
  } catch (err) {
    console.error('S3 banner upload error:', err);
    res.status(500).json({ error: 'Banner upload failed' });
  }
});

router.post('/images', uploadImage.array('images', 10), async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ error: 'No files uploaded' });

    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadToS3(file, 'images/img', { compressImage: true })
      )
    );

    const urls = uploads.map((u) => u.url);
    res.json({ urls });
  } catch (err) {
    console.error('S3 multiple image upload error:', err);
    res.status(500).json({ error: 'Images upload failed' });
  }
});

export default router;
