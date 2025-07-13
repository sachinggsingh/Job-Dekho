import jwt, { JwtPayload } from 'jsonwebtoken';
import {findUserById} from '../models/User';
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

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if (!decoded || typeof decoded !== 'object' || !decoded.id) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        const user = await findUserById(decoded.id);
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