"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
exports.verifyWebRoute = verifyWebRoute;
const jsonwebtoken_1 = require("jsonwebtoken");
const requireAuth = (req, res, next) => {
    const token = req.cookies?.["WEB_TOKEN"];
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
function verifyWebRoute(req, res, next) {
    const token = req.cookies?.["WEB_TOKEN"];
    if (!token)
        return res.redirect("/login");
    try {
        next();
    }
    catch (error) {
        return res.redirect("/login");
    }
}
//# sourceMappingURL=jwt.js.map