import { createError, sendStream, defineEventHandler } from 'h3';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// This is a private image server that requires routing through the API
// Instead of serving files directly from public directory
export default defineEventHandler(async (event) => {
  const filename = event.context.params?.filename;
  
  if (!filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Filename is required'
    });
  }

  // For security, validate filename to prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid filename'
    });
  }

  // In production, you would check authorization here
  // For this CTF, we'll keep it simple

  // Path to images directory (using import.meta.url would work in ESM)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // We'll store images in the public directory for this challenge
  // In a real application, sensitive images would be outside the web root
  const imagePath = join('public', 'images', filename);

  console.log(imagePath)
  // Check if file exists
  if (!existsSync(imagePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found'
    });
  }

  // Set content type based on file extension
  let contentType = 'image/jpeg'; // Default
  if (filename.endsWith('.png')) {
    contentType = 'image/png';
  } else if (filename.endsWith('.gif')) {
    contentType = 'image/gif';
  } else if (filename.endsWith('.webp')) {
    contentType = 'image/webp';
  }

  // Set headers
  event.node.res.setHeader('Content-Type', contentType);
  event.node.res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for a year

  // Stream the file to the client
  return sendStream(event, createReadStream(imagePath));
});
