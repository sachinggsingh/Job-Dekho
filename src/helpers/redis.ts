import { Redis } from '@upstash/redis'
import { logger } from './logger';

// Initialize Upstash Redis instance using environment variables
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Helper to set a value in Redis
export const setRedis = async (key: string, value: string) => {
    try {
        await redis.set(key, value);
        logger.info(`Redis set: ${key} ${value}`);
        return true;
    } catch (error) {
        logger.error(`Error setting redis: ${error}`);
        return false;
    }
}

// Helper to get a value from Redis
export const getRedis = async (key: string) => {
  try {
    const value = await redis.get(key);
    logger.info(`Redis get: ${key} -> ${value}`);
    return value;
  } catch (error) {
    logger.error(`Error getting redis: ${error}`);
    return null;
  }
}
