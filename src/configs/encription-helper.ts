import { Request, Response, NextFunction } from 'express';
import { decrypt, encrypt } from './crypto'; // fungsi decrypt yang kamu udah punya

export function decryptBody(req: Request, res: Response, next: NextFunction) {
  try {
    // Kalau body punya key `r`, berarti data terenkripsi
    if (req.body && typeof req.body.r === 'string') {
      const decrypted = decrypt(req.body.r);
      
      // decrypt harus return JSON string, kita parse ke object
      req.body = JSON.parse(decrypted);
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid encrypted request body',
    });
  }
  
  next();
}

export function sendEncrypted(
  res: Response,
  statusCode: number,
  payload: Record<string, any>,
) {
  const encryptedData = encrypt(payload);
  return res.status(statusCode).json(encryptedData);
}
