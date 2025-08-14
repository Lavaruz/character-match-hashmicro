// middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';

interface RateLimiterOptions {
  windowMs: number; // milidetik
  limit: number;
  message: string | object;
}

export function createRateLimiter(options: RateLimiterOptions) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.socket.remoteAddress || '',
    message: options.message,
  });
}

// Reusable limiter instance
export const authLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  message: { error: 'Terlalu banyak permintaan dari alamat IP ini, silakan coba lagi nanti.' },
});

export const historiesLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 30,
  message: { error: 'Terlalu banyak request ke histories, coba lagi nanti.' },
});
