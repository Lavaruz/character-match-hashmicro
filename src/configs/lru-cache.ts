import { LRUCache } from 'lru-cache'
import logger from './logger';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 60,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
  allowStale: false
});

export default cache;

export function getCache<T = any>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  logger.info(`HIT CACHE ${key}`)

  try {
    return JSON.parse(cached.toString()) as T;
  } catch {
    return null;
  }
}

export function setCache(key: string, value: any, ttlMs?: number) {
  const data = JSON.stringify(value);
  if (ttlMs) {
    cache.set(key, data, { ttl: ttlMs });
  } else {
    cache.set(key, data);
  }
}

export function deleteCache(keys?: string | string[]) {
  if (!keys) {
    cache.clear();
    return;
  }

  if (Array.isArray(keys)) {
    for (const key of keys) {
      cache.delete(key);
    }
  } else {
    cache.delete(keys);
  }
}
