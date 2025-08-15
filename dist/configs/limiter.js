"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historiesLimiter = exports.authLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
// middlewares/rateLimiter.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function createRateLimiter(options) {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs,
        limit: options.limit,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.socket.remoteAddress || '',
        message: options.message,
    });
}
// Reusable limiter instance
exports.authLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    limit: 5,
    message: { error: 'Terlalu banyak permintaan dari alamat IP ini, silakan coba lagi nanti.' },
});
exports.historiesLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    message: { error: 'Terlalu banyak request ke histories, coba lagi nanti.' },
});
//# sourceMappingURL=limiter.js.map