import { Image } from '~/types';
import { v4 as uuidv4 } from 'uuid';

// Sample images for the CTF challenge
const images: Image[] = [
  {
    id: 'b4b87233-66a9-4ecb-96ef-95d74c106650',
    userId: 'user-id-1', // This will be replaced with actual user ID in a real app
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
  }
];

export default defineEventHandler((event) => {
  // In a real app, we would validate the JWT token here
  const authHeader = getHeader(event, 'Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  // Extract the user ID from the token
  const token = authHeader.replace('Bearer ', '');
  const userId = token.replace('dummy-jwt-token-', '');

  // Return all public images and the user's private images
  // The vulnerability is that we're not properly checking ownership for the null UUID
  const accessibleImages = images.filter(image => 
    !image.isPrivate || 
    image.userId === userId || 
    image.id === '00000000-0000-0000-0000-000000000000' // Vulnerability: null UUID images are accessible to everyone
  );

  return accessibleImages;
});
