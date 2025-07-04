import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export type Role = 'admin' | 'teacher' | 'user';
