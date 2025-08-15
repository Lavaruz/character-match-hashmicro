"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.setCache = setCache;
exports.deleteCache = deleteCache;
const lru_cache_1 = require("lru-cache");
const logger_1 = __importDefault(require("./logger"));
const cache = new lru_cache_1.LRUCache({
    max: 500,
    ttl: 1000 * 60 * 60,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
    allowStale: false
});
exports.default = cache;
function getCache(key) {
    const cached = cache.get(key);
    if (!cached)
        return null;
    logger_1.default.info(`HIT CACHE ${key}`);
    try {
        return JSON.parse(cached.toString());
    }
    catch {
        return null;
    }
}
function setCache(key, value, ttlMs) {
    const data = JSON.stringify(value);
    if (ttlMs) {
        cache.set(key, data, { ttl: ttlMs });
    }
    else {
        cache.set(key, data);
    }
}
function deleteCache(keys) {
    if (!keys) {
        cache.clear();
        return;
    }
    if (Array.isArray(keys)) {
        for (const key of keys) {
            cache.delete(key);
        }
    }
    else {
        cache.delete(keys);
    }
}
//# sourceMappingURL=lru-cache.js.map