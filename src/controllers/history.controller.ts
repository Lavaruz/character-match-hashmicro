import {
  Request,
  Response
} from 'express';
import HistoryModel from '../models/HistoryModel';
import logger from '../configs/logger';
import {
  deleteCache,
  getCache,
  setCache
} from '../configs/lru-cache';
import DOMPurify from 'dompurify'; // bisa pakai npm package 'dompurify'
import {
  JSDOM
} from 'jsdom';
import { encrypt } from '../configs/crypto';
import { sendEncrypted } from '../configs/encription-helper';

const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window);
const isDev = process.env.NODE_ENV == "production"

/* C */
export const historyCheckMatch = async (req: Request, res: Response) => {
  try {
    const {
      input1,
      input2,
      caseSensitive = false,
      allowDuplicates = false
    } = req.body;

    if (!input1 || !input2) {
      return sendEncrypted(res, 400, {
        success: false,
        message: "Both input1 and input2 are required",
      });
    }

    if (typeof input1 !== "string" || typeof input2 !== "string") {
      return sendEncrypted(res, 400, {
        success: false,
        message: "Both input1 and input2 must be strings",
      });
    }

    const matchStats = calculateMatchStats(input1, input2, caseSensitive, allowDuplicates);

    const history = await HistoryModel.create({
      input1,
      input2,
      percentage: matchStats.percentage,
      matchedChars: matchStats.matchedChars,
      totalChars: matchStats.totalChars,
      caseSensitive,
      allowDuplicates
    });

    // Clear / invalidate all cache
    deleteCache();

    return sendEncrypted(res, 200, {
      success: true,
      message: "Match percentage calculated successfully",
      data: {
        input1,
        input2,
        caseSensitive,
        allowDuplicates,
        percentage: matchStats.percentage.toFixed(2),
        matchedChars: matchStats.matchedChars,
        totalChars: matchStats.totalChars,
        matchedCharsList: matchStats.matchedCharsList,
        history
      },
    });
  } catch (error: any) {
    logger.error("Error in checkMatch:", error);
    return sendEncrypted(res, 500, {
      success: false,
      message: "Internal Server Error",
      error: isDev ? error.message : undefined,
    });
  }
};

/* R */
export const historyGetAll = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const input1 = req.query.input1 as string;
  const input2 = req.query.input2 as string;

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
    const cacheResponse = getCache(cacheKey);
    if (cacheResponse) {
      return res.status(200).json(cacheResponse); // cache sudah terenkripsi
    }

    const whereClause: any = {};
    if (input1) {
      whereClause.input1 = { $like: `%${input1}%` };
    }
    if (input2) {
      whereClause.input2 = { $like: `%${input2}%` };
    }

    const { rows: history, count } = await HistoryModel["model"].findAndCountAll({
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
    const encryptedData = encrypt(responseData);
    setCache(cacheKey, encryptedData, 60 * 1000);

    return sendEncrypted(res, 200, responseData);
  } catch (error: any) {
    logger.error("Error in getHistory:", error);
    return sendEncrypted(res, 500, {
      success: false,
      message: "Internal Server Error",
      error: isDev ? error.message : undefined,
    });
  }
};

/* U */
export const historyUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { input1, input2, caseSensitive, allowDuplicates } = req.body;

    // Validasi input
    if (!input1 || !input2) {
      return sendEncrypted(res, 400, {
        success: false,
        message: "Both input1 and input2 are required",
      });
    }

    if (typeof input1 !== "string" || typeof input2 !== "string") {
      return sendEncrypted(res, 400, {
        success: false,
        message: "Both input1 and input2 must be strings",
      });
    }

    const isCaseSensitive = caseSensitive === true || caseSensitive === "true";
    const isAllowDuplicates = allowDuplicates === true || allowDuplicates === "true";

    // Hitung ulang stats
    const { percentage, matchedChars, totalChars, matchedCharsList } =
      calculateMatchStats(input1, input2, isCaseSensitive, allowDuplicates);

    const history = await HistoryModel["model"].findByPk(id);
    if (!history) {
      return sendEncrypted(res, 404, {
        success: false,
        message: "History record not found",
      });
    }

    await history.update({
      input1,
      input2,
      caseSensitive: isCaseSensitive,
      allowDuplicates: isAllowDuplicates,
      percentage,
      matchedChars,
      totalChars,
    });

    deleteCache();

    return sendEncrypted(res, 200, {
      success: true,
      message: "History updated successfully",
      data: {
        id: history.id,
        input1,
        input2,
        caseSensitive: isCaseSensitive,
        allowDuplicates: isAllowDuplicates,
        percentage: percentage.toFixed(2),
        matchedChars,
        totalChars,
        matchedCharsList,
      },
    });
  } catch (error: any) {
    logger.error("Error in historyUpdate:", error);
    return sendEncrypted(res, 500, {
      message: "Internal Server Error",
      error: isDev ? error.message : undefined,
    });
  }
};

/* D */
export const historyDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const history = await HistoryModel["model"].findByPk(id);
    if (!history) {
      return sendEncrypted(res, 404, {
        success: false,
        message: "History record not found",
      });
    }

    await history.destroy();
    deleteCache();

    return sendEncrypted(res, 200, {
      success: true,
      message: "History deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error in historyDelete:", error);
    return sendEncrypted(res, 500, {
      message: "Internal Server Error",
      error: isDev ? error.message : undefined,
    });
  }
};



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
 * Untuk mengatasi ambiguitas, function ini menyediakan opsi `caseSensitive` & `allowDuplicates`
 * agar user bisa memilih mode yang diinginkan.
 */

function calculateMatchStats(input1: string, input2: string, caseSensitive: boolean = false, allowDuplicates: boolean = false) {
  const processedInput1 = caseSensitive ? input1 : input1.toUpperCase();
  const processedInput2 = caseSensitive ? input2 : input2.toUpperCase();

  const chars1 = processedInput1.split('');
  const chars2 = processedInput2.split('');
  const totalChars = chars1.length;

  let matchedChars = 0;
  const matchedList: string[] = [];

  // Implementasi NESTED LOOP + NESTED IF
  for (let i = 0; i < chars1.length; i++) {
    const currentChar = chars1[i];

    // Skip duplikasi
    if (!allowDuplicates && matchedList.includes(currentChar)) {
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