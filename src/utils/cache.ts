import { Redis } from "@upstash/redis";
import { logger } from "../helpers/logger";
import { redis } from "../helpers/redis";

export const getCache = async (key: string) => {
    return await redis.get(key);
}

export const setCache = async (key:string,value:any, ttlSeconds=3600)=>{
    await redis.set(key,JSON.stringify(value),{ex:ttlSeconds})
}

export const deleteCache = async (key:string)=>{
    await redis.del(key)
}