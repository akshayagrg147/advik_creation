import path from 'path';
import { uploadBufferToS3 } from './s3Upload.js';

const OPENAI_API_BASE = 'https://api.openai.com/v1';
const DEFAULT_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';

const getExtensionForType = (contentType = '') => {
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
  return '.png';
};

const buildPrompt = (product, promptNotes = '') => {
  const title = product.name?.trim() || 'Indian ethnicwear outfit';
  const category = product.category?.trim() || 'women ethnicwear';
  const subcategory = product.subcategory?.trim() || 'premium festivewear';
  const description = product.description?.trim() || '';
  const notes = promptNotes.trim();

  return [
    'Create a photorealistic premium ecommerce fashion image.',
    'Feature an adult Indian woman model wearing the exact garment shown in the reference image.',
    'Faithfully preserve the outfit design, fabric, color palette, embroidery, print placement, silhouette, neckline, sleeve details, and styling cues from the reference.',
    `Product title: ${title}.`,
    `Category context: ${category}.`,
    `Subcategory context: ${subcategory}.`,
    description ? `Product description context: ${description}.` : '',
    notes ? `Additional styling guidance: ${notes}.` : '',
    'Use a polished Indian ethnicwear brand aesthetic with elegant posture, believable drape, soft luxury lighting, and a premium neutral background.',
    'Keep the composition suitable for ecommerce and campaign use, with the outfit as the hero.',
    'No text, no watermark, no extra people, no distorted hands, no cropped head, and no accessories that hide the outfit.',
  ]
    .filter(Boolean)
    .join(' ');
};

const fetchReferenceAsset = async (url, index) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download reference image ${index + 1}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Reference asset ${index + 1} is not an image`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = path.basename(new URL(url).pathname) || `reference-${index + 1}.jpg`;

  return {
    buffer,
    contentType,
    filename,
  };
};

const generateImageWithOpenAI = async ({ prompt, referenceAssets }) => {
  const formData = new FormData();
  formData.append('model', DEFAULT_IMAGE_MODEL);
  formData.append('prompt', prompt);
  formData.append('size', '1024x1536');
  formData.append('response_format', 'b64_json');

  referenceAssets.forEach((asset) => {
    formData.append(
      'image',
      new Blob([asset.buffer], { type: asset.contentType }),
      asset.filename
    );
  });

  const response = await fetch(`${OPENAI_API_BASE}/images/edits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || 'OpenAI image generation failed';
    throw new Error(message);
  }

  const image = data?.data?.[0];
  if (!image?.b64_json) {
    throw new Error('OpenAI did not return an image');
  }

  const buffer = Buffer.from(image.b64_json, 'base64');
  return {
    buffer,
    contentType: 'image/png',
  };
};

const collectReferenceImages = (product) => {
  const uniqueUrls = new Set([product.image, ...(product.images || [])].filter(Boolean).slice(0, 3));
  return Array.from(uniqueUrls);
};

export const generateProductModelImage = async (product, { promptNotes = '' } = {}) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Add OPENAI_API_KEY in backend .env to enable AI model image generation.');
  }
  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
    throw new Error('AWS S3 upload is not configured for generated model images.');
  }

  const referenceImageUrls = collectReferenceImages(product);
  if (referenceImageUrls.length === 0) {
    throw new Error('Add at least one product image before generating a model shot.');
  }

  const referenceAssets = await Promise.all(
    referenceImageUrls.map((url, index) => fetchReferenceAsset(url, index))
  );

  const prompt = buildPrompt(product, promptNotes);
  const generated = await generateImageWithOpenAI({ prompt, referenceAssets });
  const extension = getExtensionForType(generated.contentType);
  const upload = await uploadBufferToS3(generated.buffer, 'images/generated-model/model', {
    contentType: generated.contentType,
    extension,
  });

  return {
    prompt,
    imageUrl: upload.url,
  };
};
