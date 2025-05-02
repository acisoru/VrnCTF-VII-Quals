import { v4 as uuidv4 } from 'uuid';
import type { User } from '../../../types';

// Hardcoded users for the CTF challenge
const users: User[] = [
  {
    id: uuidv4(),
    username: 'user',
    password: 'user',
    isAdmin: false
  },
  {
    id: uuidv4(),
    username: 'admin',
    password: 'admin',
    isAdmin: true
  }
];

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    });
  }

  // Don't send the password back to the client
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: 'dummy-jwt-token-' + userWithoutPassword.id // In a real app, this would be a JWT
  };
});
