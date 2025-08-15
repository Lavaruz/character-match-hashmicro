import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import cors from "cors"
import cookieParser from 'cookie-parser';
import { sequelize } from "./configs/database";

import userRouter from "./routers/user.router";
import historyRouter from "./routers/history.router";
import webRouter from "./routers/webRouter";
import logger from "./configs/logger";
import morgan from "morgan"
import helmet from "helmet";

const app = express();

/**
 * Karena akan deploy di Railway untuk saat ini origin akan "*"
 * Soalnya railways domainnya random :), jadi ribet setupnya
 */
app.use(cors({
    origin: "*",
    credentials: true,
}));

/* FIX ME: next update */
// app.use(helmet());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.enable("trust proxy");
app.use(morgan("tiny", {
  stream: {
    write: (message) => {
        logger.info(message.trim())
    }
  }
}));

app.use("/", express.static(path.join(__dirname, '../public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

let PORT = process.env.PORT || 8095;

sequelize.sync({alter: true}).then(() => {
    const VERSION_API = "v1";
    app.use(`/`, webRouter);
    app.use(`/api/${VERSION_API}/users`, userRouter);
    app.use(`/api/${VERSION_API}/histories`, historyRouter);

    logger.info(`db hosted on "${process.env.DB}"`)
    app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
})
.catch((error) => {
    logger.error(`Koneksi database gagal: ${error}`);
});
