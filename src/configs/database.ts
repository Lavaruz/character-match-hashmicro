import { Sequelize } from "sequelize";

let sequelize: Sequelize;

if (process.env.DB === "mysql") {
  sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./charmatcher.sqlite",
    logging: false,
  });
}

export { sequelize };
