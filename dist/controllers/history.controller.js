"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyDelete = exports.historyUpdate = exports.historyGetAll = exports.historyCheckMatch = void 0;
const HistoryModel_1 = __importDefault(require("../models/HistoryModel"));
const logger_1 = __importDefault(require("../configs/logger"));
const lru_cache_1 = require("../configs/lru-cache");
const dompurify_1 = __importDefault(require("dompurify")); // bisa pakai npm package 'dompurify'
const jsdom_1 = require("jsdom");
const crypto_1 = require("../configs/crypto");
const encription_helper_1 = require("../configs/encription-helper");
const window = new jsdom_1.JSDOM('').window;
const DOMPurifyInstance = (0, dompurify_1.default)(window);
const isDev = process.env.NODE_ENV == "production";
/* C */
const historyCheckMatch = async (req, res) => {
    try {
        const { input1, input2, caseSensitive = false } = req.body;
        if (!input1 || !input2) {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Both input1 and input2 are required",
            });
        }
        if (typeof input1 !== "string" || typeof input2 !== "string") {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Both input1 and input2 must be strings",
            });
        }
        const matchStats = calculateMatchStats(input1, input2, caseSensitive);
        const history = await HistoryModel_1.default.create({
            input1,
            input2,
            percentage: matchStats.percentage,
            matchedChars: matchStats.matchedChars,
            totalChars: matchStats.totalChars,
            caseSensitive
        });
        // Clear / invalidate all cache
        (0, lru_cache_1.deleteCache)();
        return (0, encription_helper_1.sendEncrypted)(res, 200, {
            success: true,
            message: "Match percentage calculated successfully",
            data: {
                input1,
                input2,
                caseSensitive,
                percentage: matchStats.percentage.toFixed(2),
                matchedChars: matchStats.matchedChars,
                totalChars: matchStats.totalChars,
                matchedCharsList: matchStats.matchedCharsList,
                history
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error in checkMatch:", error);
        return (0, encription_helper_1.sendEncrypted)(res, 500, {
            success: false,
            message: "Internal Server Error",
            error: isDev ? error.message : undefined,
        });
    }
};
exports.historyCheckMatch = historyCheckMatch;
/* R */
const historyGetAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const input1 = req.query.input1;
    const input2 = req.query.input2;
    // Cache key unik berdasarkan semua query params
    const cacheKey = [
        "history",
        `page=${page}`,
        `limit=${limit}`,
        input1 ? `input1=${input1}` : "",
        input2 ? `input2=${input2}` : ""
    ]
        .filter(Boolean)
        .join("&");
    try {
        // Ambil dari cache kalau ada
        const cacheResponse = (0, lru_cache_1.getCache)(cacheKey);
        if (cacheResponse) {
            return res.status(200).json(cacheResponse); // cache sudah terenkripsi
        }
        const whereClause = {};
        if (input1) {
            whereClause.input1 = { $like: `%${input1}%` };
        }
        if (input2) {
            whereClause.input2 = { $like: `%${input2}%` };
        }
        const { rows: history, count } = await HistoryModel_1.default["model"].findAndCountAll({
            where: whereClause,
            order: [["createdAt", "DESC"]],
            offset,
            limit,
        });
        // XSS safe
        const safeHistory = history.map(item => ({
            ...item.toJSON(),
            input1: DOMPurifyInstance.sanitize(item.input1),
            input2: DOMPurifyInstance.sanitize(item.input2)
        }));
        const responseData = {
            success: true,
            message: "History fetched successfully",
            data: safeHistory,
            pagination: {
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
            },
        };
        // Simpan ke cache dalam bentuk terenkripsi
        const encryptedData = (0, crypto_1.encrypt)(responseData);
        (0, lru_cache_1.setCache)(cacheKey, encryptedData, 60 * 1000);
        return (0, encription_helper_1.sendEncrypted)(res, 200, responseData);
    }
    catch (error) {
        logger_1.default.error("Error in getHistory:", error);
        return (0, encription_helper_1.sendEncrypted)(res, 500, {
            success: false,
            message: "Internal Server Error",
            error: isDev ? error.message : undefined,
        });
    }
};
exports.historyGetAll = historyGetAll;
/* U */
const historyUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { input1, input2, caseSensitive } = req.body;
        // Validasi input
        if (!input1 || !input2) {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Both input1 and input2 are required",
            });
        }
        if (typeof input1 !== "string" || typeof input2 !== "string") {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Both input1 and input2 must be strings",
            });
        }
        const isCaseSensitive = caseSensitive === true || caseSensitive === "true";
        // Hitung ulang stats
        const { percentage, matchedChars, totalChars, matchedCharsList } = calculateMatchStats(input1, input2, isCaseSensitive);
        const history = await HistoryModel_1.default["model"].findByPk(id);
        if (!history) {
            return (0, encription_helper_1.sendEncrypted)(res, 404, {
                success: false,
                message: "History record not found",
            });
        }
        await history.update({
            input1,
            input2,
            caseSensitive: isCaseSensitive,
            percentage,
            matchedChars,
            totalChars,
        });
        (0, lru_cache_1.deleteCache)();
        return (0, encription_helper_1.sendEncrypted)(res, 200, {
            success: true,
            message: "History updated successfully",
            data: {
                id: history.id,
                input1,
                input2,
                caseSensitive: isCaseSensitive,
                percentage: percentage.toFixed(2),
                matchedChars,
                totalChars,
                matchedCharsList,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error in historyUpdate:", error);
        return (0, encription_helper_1.sendEncrypted)(res, 500, {
            message: "Internal Server Error",
            error: isDev ? error.message : undefined,
        });
    }
};
exports.historyUpdate = historyUpdate;
/* D */
const historyDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await HistoryModel_1.default["model"].findByPk(id);
        if (!history) {
            return (0, encription_helper_1.sendEncrypted)(res, 404, {
                success: false,
                message: "History record not found",
            });
        }
        await history.destroy();
        (0, lru_cache_1.deleteCache)();
        return (0, encription_helper_1.sendEncrypted)(res, 200, {
            success: true,
            message: "History deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in historyDelete:", error);
        return (0, encription_helper_1.sendEncrypted)(res, 500, {
            message: "Internal Server Error",
            error: isDev ? error.message : undefined,
        });
    }
};
exports.historyDelete = historyDelete;
/* Utils Function */
/**
 * NOTE:
 * Pada dokumen soal terdapat contoh:
 *   Input1: ABBCD
 *   Input2: Gallant Duck
 *   Hasil yang disebutkan: A dan D match → 2/5 = 40%
 * Setelah dianalisa, contoh tersebut ambigu/tidak konsisten karena:
 *   - Jika case-insensitive, huruf yang match seharusnya A, C, dan D (3/5 = 60%)
 *   - Jika case-sensitive, huruf yang match seharusnya hanya D (1/5 = 20%)
 *
 * Untuk mengatasi ambiguitas, function ini menyediakan opsi `caseSensitive`
 * agar user bisa memilih mode yang diinginkan.
 */
function calculateMatchStats(input1, input2, caseSensitive = false) {
    const processedInput1 = caseSensitive ? input1 : input1.toUpperCase();
    const processedInput2 = caseSensitive ? input2 : input2.toUpperCase();
    const chars1 = processedInput1.split('');
    const chars2 = processedInput2.split('');
    const totalChars = chars1.length;
    let matchedChars = 0;
    const matchedList = [];
    // Implementasi NESTED LOOP + NESTED IF
    for (let i = 0; i < chars1.length; i++) {
        const currentChar = chars1[i];
        // Skip duplikasi
        if (matchedList.includes(currentChar)) {
            continue;
        }
        for (let j = 0; j < chars2.length; j++) {
            // NESTED IF
            if (currentChar === chars2[j]) {
                // Mathematical calculation: increment match counter
                matchedChars++;
                matchedList.push(currentChar);
                break;
            }
        }
    }
    // Mathematics: Calculate percentage
    const percentage = totalChars > 0 ? (matchedChars / totalChars) * 100 : 0;
    return {
        percentage,
        matchedChars,
        totalChars,
        matchedCharsList: matchedList,
        caseSensitive
    };
}
/* Demo Function */
/* untuk testting logic "Calculate Match" */
function demoCalculation() {
    console.log("=== DEMO: Testing with given example ===");
    console.log("Input1: ABBCD");
    console.log("Input2: Gallant Duck");
    console.log("");
    const caseInsensitive = calculateMatchStats("ABBCD", "Gallant Duck", false);
    console.log("Case-Insensitive Result:", caseInsensitive);
    console.log("");
    const caseSensitive = calculateMatchStats("ABBCD", "Gallant Duck", true);
    console.log("Case-Sensitive Result:", caseSensitive);
    console.log("");
}
// Uncomment to run demo
// demoCalculation();
//# sourceMappingURL=history.controller.js.map