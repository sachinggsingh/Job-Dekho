import { Request, Response, NextFunction } from 'express';
import { getCache } from '../utils/cache';

// cacheKeyFn: (req) => string
export const cacheMiddleware = (cacheKeyFn: (req: Request) => string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = cacheKeyFn(req);
    const cached = await getCache(key);
    if (typeof cached === 'string' && cached) {
      // If it's a job by id
      if (key.startsWith('job:')) {
        res.status(200).json({ job: JSON.parse(cached), success: true, cached: true });
        return;
      }
      // If it's all jobs
      if (key === 'jobs:all') {
        res.status(200).json({ jobs: JSON.parse(cached), success: true, cached: true });
        return;
      }
      // Default: send raw cached data
      res.status(200).json(JSON.parse(cached));
      return;
    }
    next();
  } catch (error) {
    next();
  }
};
