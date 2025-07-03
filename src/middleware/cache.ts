import { Request, Response, NextFunction } from 'express';
import { redis, setRedis } from '../helpers/redis';

export const getCache = async(key: string) => {
    return await redis.get(key);
}

export const deleteCache = async(key: string) => {
    await redis.del(key);
}

export const setCache = async (key: string, value: any, ttlSeconds: number = 3600) => {
    return await setRedis(key, JSON.stringify(value), ttlSeconds);
}

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
