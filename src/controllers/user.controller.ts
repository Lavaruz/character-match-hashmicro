import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import { Op } from "sequelize";
import jwt from "jsonwebtoken"
import logger from "../configs/logger";

const isDev = process.env.NODE_ENV == "production"

export const userCreate = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    if (typeof username !== "string" || username.length < 3 || username.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Username must be a string between 3 and 50 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    /* Cek duplikasi username & email */
    const existingUsername = await UserModel.findOne({username});
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const existingEmail = await UserModel.findOne({email});
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    /* Simpan user baru */
    /* Hashing password sudah di hooks db */
    const newUser = await UserModel.create({ username, email, password });

    /* Return data aman (tanpa password) */
    const safeUser = (newUser as any).toSafeJSON?.() || newUser;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: safeUser,
    });
  } catch (error: any) {
    logger.error("Error in createUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: isDev ? error.message : undefined,
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    // identifier = username/email, remember = boolean
    const { identifier, password, remember } = req.body; 

    /* Validasi input */
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/Email and password are required",
      });
    }

    /* Cari user berdasarkan username atau email */
    const user = await UserModel["model"].findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    /* Cek status aktif */
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Please contact support.",
      });
    }

    /* Validasi password */
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    /* Update last login */
    await user.updateLastLogin();

    /* Hapus password dari response */
    const safeUser = user.toSafeJSON();

    /* Generate JWT token */
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.ACCESS_TOKEN_SECRET || "secret",
      { expiresIn: "1d" } // Token tetap 1 hari, cookie atur durasi di sini
    );

    // Atur maxAge cookie berdasarkan remember
    const maxAge = remember
      ? 7 * 24 * 60 * 60 * 1000 // 30 hari
      : 1 * 24 * 60 * 60 * 1000; // 1 hari

    res.cookie('WEB_TOKEN', token, {
      httpOnly: true,
      secure: !isDev,
      sameSite: isDev ? "lax" : 'strict',
      maxAge,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        ...safeUser,
      },
    });
  } catch (error: any) {
    logger.error("Error in userLogin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: isDev ? error.message : undefined,
    });
  }
};

export const userLogout = async (req: Request, res: Response) => {
  try {
    // Hapus cookie token dengan cara set maxAge = 0 / expired
    res.cookie("WEB_TOKEN", "", {
      httpOnly: true,
      secure: !isDev,
      sameSite: isDev ? "lax" : "strict",
      maxAge: 0,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error: any) {
    logger.error("Error in userLogout:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: isDev ? error.message : undefined,
    });
  }
};
