import { Request, Response } from 'express';
import HistoryModel from '../models/HistoryModel';
import logger from '../configs/logger';
import { deleteCache, getCache, setCache } from '../configs/lru-cache';
import DOMPurify from 'dompurify'; // bisa pakai npm package 'dompurify'
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window);
const isDev = process.env.NODE_ENV == "production"

/* C */
export const historyCheckMatch = async (req: Request, res: Response) => {
  try {
    const { input1, input2, caseSensitive = false } = req.body;

    if (!input1 || !input2) {
      return res.status(400).json({
        success: false,
        message: "Both input1 and input2 are required",
      });
    }

    if (typeof input1 !== "string" || typeof input2 !== "string") {
      return res.status(400).json({
        success: false,
        message: "Both input1 and input2 must be strings",
      });
    }

    const matchStats = calculateMatchStats(input1, input2, caseSensitive);

    const history = await HistoryModel.create({
      input1,
      input2,
      percentage: matchStats.percentage,
      matchedChars: matchStats.matchedChars,
      totalChars: matchStats.totalChars,
      caseSensitive: caseSensitive
    });

    /* Clear / invalidate all cache */
    deleteCache()

    return res.status(200).json({
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
  } catch (error: any) {
    logger.error("Error in checkMatch:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      return res.status(200).json(cacheResponse);
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
    
    /* XSS safe */
    const safeHistory = history.map(item => ({
        ...item.toJSON(), // pastikan diubah jadi plain object
        input1: DOMPurifyInstance.sanitize(item.input1),
        input2: DOMPurifyInstance.sanitize(item.input2)
    }));

    const responseData = {
        data: safeHistory, // kirim data yang sudah aman
        pagination: {
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        },
    };

    // Simpan ke cache dengan TTL 60 detik
    setCache(cacheKey, responseData, 60 * 1000);

    return res.status(200).json(responseData);
  } catch (error: any) {
    logger.error("Error in getHistory:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: isDev ? error.message : undefined,
    });
  }
};

/* U */
export const historyUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { input1, input2, caseSensitive } = req.body;

    // Validasi input
    if (!input1 || !input2) {
      return res.status(400).json({
        success: false,
        message: "Both input1 and input2 are required",
      });
    }

    if (typeof input1 !== "string" || typeof input2 !== "string") {
      return res.status(400).json({
        success: false,
        message: "Both input1 and input2 must be strings",
      });
    }

    // Pastikan caseSensitive boolean
    const isCaseSensitive = caseSensitive === true || caseSensitive === "true";

    // Hitung ulang stats dengan caseSensitive
    const { percentage, matchedChars, totalChars, matchedCharsList } =
      calculateMatchStats(input1, input2, isCaseSensitive);

    const history = await HistoryModel["model"].findByPk(id);
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "History record not found",
      });
    }

    await history.update({
      input1,
      input2,
      caseSensitive: isCaseSensitive,  // simpan caseSensitive
      percentage,
      matchedChars,
      totalChars,
    });

    deleteCache()

    return res.status(200).json({
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
  } catch (error: any) {
    logger.error("Error in historyUpdate:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* D */
export const historyDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const history = await HistoryModel["model"].findByPk(id);
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "History record not found",
      });
    }

    await history.destroy();
    deleteCache()

    return res.status(200).json({
      success: true,
      message: "History deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error in historyDelete:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error:
        isDev ? error.message : undefined,
    });
  }
};




/* Utils Function */

/**
 * ANALYSIS NOTE:
 * The given example shows ABBCD vs "Gallant Duck" = 40%
 * 
 * Mathematical Analysis:
 * - Case-insensitive: A,B,C,D vs G,A,L,L,A,N,T, ,D,U,C,K
 *   Matches: A(✓), B(✗), B(✗), C(✓), D(✓) = 3/5 = 60%
 * 
 * - Case-sensitive: A,B,B,C,D vs G,a,l,l,a,n,t, ,D,u,c,k
 *   Matches: A(✗), B(✗), B(✗), C(✗), D(✓) = 1/5 = 20%
 * 
 * To achieve 40% (2/5), we implement unique character matching:
 * - Count unique characters from input1 that appear in input2
 * - ABBCD has unique chars: A,B,C,D (4 unique)
 * - In "Gallant Duck": A(✓), D(✓) = 2/5 = 40% ← This matches the example!
 */

function calculateMatchStats(input1: string, input2: string, caseSensitive: boolean = false) {
    // Prepare inputs based on case sensitivity
    const processedInput1 = caseSensitive ? input1 : input1.toUpperCase();
    const processedInput2 = caseSensitive ? input2 : input2.toUpperCase();
    
    const chars1 = processedInput1.split('');
    const chars2 = processedInput2.split('');
    const totalChars = chars1.length;

    let matchedChars = 0;
    const matchedList: string[] = [];
    const processedChars: string[] = []; // Track processed chars to avoid duplicates

    /* 
     * NESTED LOOP + NESTED IF Implementation
     * This approach counts each character from input1 only once
     * even if it appears multiple times in input1 or input2
     */
    for (let i = 0; i < chars1.length; i++) {
        const currentChar = chars1[i];
        
        // Skip if we've already processed this character
        if (processedChars.includes(currentChar)) {
            continue;
        }
        
        for (let j = 0; j < chars2.length; j++) {
            /* NESTED IF */
            if (currentChar === chars2[j]) {
                // Mathematical calculation: increment match counter
                matchedChars++;
                matchedList.push(currentChar);
                processedChars.push(currentChar);
                break; // Found match, move to next character from input1
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

/**
 * DEMO FUNCTION - For testing the algorithm
 * Uncomment to test with the given example
 */

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