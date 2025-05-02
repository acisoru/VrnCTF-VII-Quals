import type { User } from '../../../types';

export default defineEventHandler((event) => {
  // In a real app, we would validate the JWT token here
  // For the CTF challenge, we'll just check if the Authorization header exists
  const authHeader = getHeader(event, 'Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  // Extract the user ID from the token (in a real app, we would decode the JWT)
  const token = authHeader.replace('Bearer ', '');
  const userId = token.replace('dummy-jwt-token-', '');

  // For the CTF challenge, we'll return a dummy user
  const user: Omit<User, 'password'> = {
    id: userId,
    username: userId === '00000000-0000-0000-0000-000000000000' ? 'admin' : 'user',
    isAdmin: userId === '00000000-0000-0000-0000-000000000000'
  };

  return user;
});
