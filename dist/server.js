"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./configs/database");
const user_router_1 = __importDefault(require("./routers/user.router"));
const history_router_1 = __importDefault(require("./routers/history.router"));
const webRouter_1 = __importDefault(require("./routers/webRouter"));
const logger_1 = __importDefault(require("./configs/logger"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
/**
 * Karena akan deploy di Railway untuk saat ini origin akan "*"
 * Soalnya railways domainnya random :), jadi ribet setupnya
 */
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
/* FIX ME: next update */
// app.use(helmet());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.enable("trust proxy");
app.use((0, morgan_1.default)("tiny", {
    stream: {
        write: (message) => {
            logger_1.default.info(message.trim());
        }
    }
}));
app.use("/", express_1.default.static(path_1.default.join(__dirname, '../public')));
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "../views"));
let PORT = process.env.PORT || 8095;
database_1.sequelize.sync({ alter: true }).then(() => {
    const VERSION_API = "v1";
    app.use(`/`, webRouter_1.default);
    app.use(`/api/${VERSION_API}/users`, user_router_1.default);
    app.use(`/api/${VERSION_API}/histories`, history_router_1.default);
    logger_1.default.info(`db hosted on "${process.env.DB}"`);
    app.listen(PORT, () => logger_1.default.info(`Server running on http://localhost:${PORT}`));
})
    .catch((error) => {
    logger_1.default.error(`Koneksi database gagal: ${error}`);
});
//# sourceMappingURL=server.js.map