import jwt from 'jsonwebtoken';
import { UserPayload } from './types';

// Create Access Token (short-lived)
export function createAccessToken(user: UserPayload): string {
  return jwt.sign(
    { id: user.id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

// Create Refresh Token (long-lived)
export function createRefreshToken(user: UserPayload): string {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );
}
