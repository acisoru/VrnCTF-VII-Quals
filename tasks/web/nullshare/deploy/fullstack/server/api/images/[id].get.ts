import type { Image } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { createError } from 'h3';
import { getHeader } from 'h3';

// Sample images for the CTF challenge - same as in index.get.ts
const images: Image[] = [
  {
    id: 'b4b87233-66a9-4ecb-96ef-95d74c106650',
    userId: 'user-id-1',
    title: 'My vacation photo',
    description: 'Beautiful sunset at the beach',
    url: '/api/images/file/vacation.jpg',
    isPrivate: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'b87b3112-77b2-45af-a012-fa48a66ea677',
    userId: 'user-id-1',
    title: 'My private photo',
    description: 'Just for me',
    url: '/api/images/file/private.jpg',
    isPrivate: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000000', // Null UUID - this is the vulnerable part
    userId: 'admin-id',
    title: 'Секретное изображение',
    description: 'Это изображение содержит флаг: vrnctf{nu11_uu1d_1d0r_vu1n3r4b1117y_2025}',
    url: '/api/images/file/s3cr3t_fl4g_1337.png',
    isPrivate: true,
    createdAt: new Date().toISOString()
  }
];

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image ID is required'
    });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image ID format'
    });
  }

  // Find the image by ID
  const image = images.find(img => img.id === id);

  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found'
    });
  }

  // Only require Authorization for private images, except for the null UUID (CTF vulnerability)
  let userId = undefined;
  const isNullUuid = id === '00000000-0000-0000-0000-000000000000';
  if (image.isPrivate && !isNullUuid) {
    const authHeader = getHeader(event, 'Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }
    // Extract the user ID from the token
    const token = authHeader.replace('Bearer ', '');
    userId = token.replace('dummy-jwt-token-', '');
  }

  // Add a rate limiter to prevent brute forcing
  const clientIp = getHeader(event, 'x-forwarded-for') || 'unknown';
  const requestKey = `${clientIp}-${id}`;
  
  // Here's the vulnerability, but it's more obscured now: 
  // 1. We check if the image is private
  // 2. We check if the user is the owner
  // 3. We check if the user is an admin
  // 4. We have a "special case" for the null UUID that bypasses these checks
  // 5. We also added a "security by obscurity" check that makes it look like we're checking for admin
  if (image.isPrivate) {
    // First check: is the user the owner?
    const isOwner = image.userId === userId;
    
    // Second check: is the user an admin?
    const isAdmin = userId === '00000000-0000-0000-0000-000000000000';
    
    // Third check: is this a special system image? (the vulnerability)
    // This looks like an innocent check for system images, but actually introduces the vulnerability
    const isSystemImage = id === '00000000-0000-0000-0000-000000000000';
    
    // The vulnerability: if none of the conditions are met, deny access
    // But the isSystemImage check allows the null UUID to be accessed by anyone
    if (!isOwner && !isAdmin && !isSystemImage) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to view this image'
      });
    }
  }

  return image;
});
