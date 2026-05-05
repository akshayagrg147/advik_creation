import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Region = process.env.AWS_REGION;
const s3Bucket = process.env.AWS_S3_BUCKET;

const s3Client = new S3Client({
  region: s3Region,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const getS3Url = (key) =>
  `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;

const compressImageBuffer = async (file) => {
  const image = sharp(file.buffer);
  const metadata = await image.metadata();
  const pipeline = image.rotate();

  if (metadata.width && metadata.width > 1600) {
    pipeline.resize(1600);
  }

  const outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer();

  return {
    buffer: outputBuffer,
    extension: '.webp',
    contentType: 'image/webp',
  };
};

export const uploadToS3 = async (file, prefix, { compressImage = false } = {}) => {
  if (!file) throw new Error('No file provided');

  let body = file.buffer;
  let ext = path.extname(file.originalname) || '';
  let contentType = file.mimetype;

  const isImage =
    /^image\//.test(file.mimetype) ||
    /\.(jpe?g|png|gif|webp)$/i.test(file.originalname);

  if (compressImage && isImage) {
    const compressed = await compressImageBuffer(file);
    body = compressed.buffer;
    ext = compressed.extension;
    contentType = compressed.contentType;
  }

  const key = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: getS3Url(key),
  };
};

export const uploadBufferToS3 = async (
  buffer,
  prefix,
  { contentType = 'application/octet-stream', extension = '' } = {}
) => {
  const key = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: getS3Url(key),
  };
};
