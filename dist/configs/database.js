"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
let sequelize;
if (process.env.DB === "mysql") {
    exports.sequelize = sequelize = new sequelize_1.Sequelize({
        dialect: "mysql",
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        logging: false,
    });
}
else {
    exports.sequelize = sequelize = new sequelize_1.Sequelize({
        dialect: "sqlite",
        storage: "./charmatcher.sqlite",
        logging: false,
    });
}
//# sourceMappingURL=database.js.map