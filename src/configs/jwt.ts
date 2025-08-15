import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare module 'express' {
    interface Request {
      user?: any; // Ganti 'any' dengan jenis data yang sesuai untuk 'user'.
      authenticate?: boolean
    }
}

export interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; email: string };
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.["WEB_TOKEN"];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: number;
      username: string;
      email: string
    };

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

function verifyWebRoute(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.["WEB_TOKEN"];
    if (!token) return res.redirect("/login");

    try {
        next();
    } catch (error) {
        return res.redirect("/login");
    }
}

export {
  requireAuth,
  verifyWebRoute
}
