import jwt from 'jsonwebtoken';
import {  Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest, Role, UserPayload } from '../utils/types';


export const verifyToken:RequestHandler = (req: AuthRequest, res: Response, next: NextFunction):void => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
 

};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !user.roles || !roles.some(role => user.roles.includes(role))) {
      res.status(403).json({ message: 'Forbidden: Insufficient role' });
      return;
    }

    next();
  };
};