"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptBody = decryptBody;
exports.sendEncrypted = sendEncrypted;
const crypto_1 = require("./crypto"); // fungsi decrypt yang kamu udah punya
function decryptBody(req, res, next) {
    try {
        // Kalau body punya key `r`, berarti data terenkripsi
        if (req.body && typeof req.body.r === 'string') {
            const decrypted = (0, crypto_1.decrypt)(req.body.r);
            // decrypt harus return JSON string, kita parse ke object
            req.body = JSON.parse(decrypted);
        }
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid encrypted request body',
        });
    }
    next();
}
function sendEncrypted(res, statusCode, payload) {
    const encryptedData = (0, crypto_1.encrypt)(payload);
    return res.status(statusCode).json(encryptedData);
}
//# sourceMappingURL=encription-helper.js.map