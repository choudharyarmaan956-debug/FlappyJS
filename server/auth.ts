import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface JWTPayload {
  userId: number;
  displayName: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateJWT(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    displayName: user.displayName
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from cookies first, then fall back to Authorization header
    let token = req.cookies?.authToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    const payload = verifyJWT(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get fresh user data from storage
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function optionalAuthJWT(req: Request, res: Response, next: NextFunction) {
  // Try to authenticate, but don't fail if no token provided
  let token = req.cookies?.authToken;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (token) {
    const payload = verifyJWT(token);
    if (payload) {
      // Don't await here to keep it non-blocking
      storage.getUser(payload.userId).then(user => {
        if (user) {
          req.user = user;
        }
      }).catch(err => {
        console.error('Optional auth error:', err);
      });
    }
  }
  
  next();
}