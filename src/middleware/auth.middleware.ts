import jwt, { JwtPayload } from 'jsonwebtoken';
import { findUserById } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../helpers/logger';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-secret';


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        // Verify JWT
        let decoded: JwtPayload | string;
        try {
            decoded = jwt.verify(token,ACCESS_TOKEN_SECRET);
        } catch (err) {
            logger.error('JWT verification failed:', err);
            res.status(401).json({ message: 'Invalid or expired token' });
            return
        }

        // Ensure decoded is an object and has an id
        if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
            res.status(401).json({ message: 'Invalid token payload' });
            return;
        }

        // Find user by id (ensure id is a number)
        const userId = typeof decoded.id === 'string' ? parseInt(decoded.id, 10) : decoded.id;
        const user = await findUserById(userId);
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};