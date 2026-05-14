import { registerAs } from '@nestjs/config';

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

export const cloudinaryConfig = registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  maxFileBytes: process.env.CLOUDINARY_MAX_FILE_BYTES
    ? parseInt(process.env.CLOUDINARY_MAX_FILE_BYTES, 10)
    : DEFAULT_MAX_BYTES,
  allowedMimeTypes: process.env.CLOUDINARY_ALLOWED_MIME_TYPES
    ? process.env.CLOUDINARY_ALLOWED_MIME_TYPES.split(',').map((s) => s.trim())
    : DEFAULT_ALLOWED_MIME_TYPES,
}));
