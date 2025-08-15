"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogout = exports.userLogin = exports.userCreate = void 0;
const UserModel_1 = __importDefault(require("../models/UserModel"));
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../configs/logger"));
const encription_helper_1 = require("../configs/encription-helper");
const isDev = process.env.NODE_ENV == "production";
const userCreate = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Validasi input
        if (!username || !email || !password) {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Username, email, and password are required",
            });
        }
        if (typeof username !== "string" || username.length < 3 || username.length > 50) {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Username must be a string between 3 and 50 characters",
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Invalid email format",
            });
        }
        if (typeof password !== "string" || password.length < 6) {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }
        const existingUsername = await UserModel_1.default.findOne({ username });
        if (existingUsername) {
            return (0, encription_helper_1.sendEncrypted)(res, 409, {
                success: false,
                message: "Username already exists",
            });
        }
        const existingEmail = await UserModel_1.default.findOne({ email });
        if (existingEmail) {
            return (0, encription_helper_1.sendEncrypted)(res, 409, {
                success: false,
                message: "Email already exists",
            });
        }
        const newUser = await UserModel_1.default.create({ username, email, password });
        const safeUser = newUser.toSafeJSON?.() || newUser;
        return (0, encription_helper_1.sendEncrypted)(res, 201, {
            success: true,
            message: "User created successfully",
            data: safeUser,
        });
    }
    catch (error) {
        logger_1.default.error("Error in createUser:", error);
        return (0, encription_helper_1.sendEncrypted)(res, 500, {
            success: false,
            message: "Internal server error",
            error: isDev ? error.message : undefined,
        });
    }
};
exports.userCreate = userCreate;
const userLogin = async (req, res) => {
    try {
        const { identifier, password, remember } = req.body;
        // Validasi input
        if (!identifier || !password) {
            return (0, encription_helper_1.sendEncrypted)(res, 400, {
                success: false,
                message: "Username/Email and password are required",
            });
        }
        // Cari user berdasarkan username atau email
        const user = await UserModel_1.default["model"].findOne({
            where: {
                [sequelize_1.Op.or]: [{ username: identifier }, { email: identifier }],
            },
        });
        if (!user) {
            return (0, encription_helper_1.sendEncrypted)(res, 401, {
                success: false,
                message: "Invalid username/email or password",
            });
        }
        // Cek status aktif
        if (!user.isActive) {
            return (0, encription_helper_1.sendEncrypted)(res, 403, {
                success: false,
                message: "Account is inactive. Please contact support.",
            });
        }
        // Validasi password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return (0, encription_helper_1.sendEncrypted)(res, 401, {
                success: false,
                message: "Invalid username/email or password",
            });
        }
        // Update last login
        await user.updateLastLogin();
        // Hapus password dari response
        const safeUser = user.toSafeJSON();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, process.env.ACCESS_TOKEN_SECRET || "secret", { expiresIn: "1d" });
        // maxAge cookie berdasarkan remember
        const maxAge = remember
            ? 7 * 24 * 60 * 60 * 1000 // 7 hari
            : 1 * 24 * 60 * 60 * 1000; // 1 hari
        res.cookie("WEB_TOKEN", token, {
            httpOnly: true,
            secure: !isDev,
            sameSite: isDev ? "lax" : "strict",
            maxAge,
            path: "/",
        });
        return (0, encription_helper_1.sendEncrypted)(res, 200, {
            success: true,
            message: "Login successful",
            data: { ...safeUser },
        });
    }
    catch (error) {
        logger_1.default.error("Error in userLogin:", error);
        return (0, encription_helper_1.sendEncrypted)(res, 500, {
            success: false,
            message: "Internal server error",
            error: isDev ? error.message : undefined,
        });
    }
};
exports.userLogin = userLogin;
const userLogout = async (req, res) => {
    try {
        res.cookie("WEB_TOKEN", "", {
            httpOnly: true,
            secure: !isDev,
            sameSite: isDev ? "lax" : "strict",
            maxAge: 0,
            path: "/",
        });
        return (0, encription_helper_1.sendEncrypted)(res, 200, {
            success: true,
            message: "Logout berhasil",
        });
    }
    catch (error) {
        logger_1.default.error("Error in userLogout:", error);
        return (0, encription_helper_1.sendEncrypted)(res, 500, {
            success: false,
            message: "Internal server error",
            error: isDev ? error.message : undefined,
        });
    }
};
exports.userLogout = userLogout;
//# sourceMappingURL=user.controller.js.map