"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../configs/database");
const BaseModel_1 = __importDefault(require("./BaseModel"));
class History extends sequelize_1.Model {
}
exports.History = History;
History.init({
    input1: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    input2: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    percentage: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    matchedChars: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    totalChars: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    caseSensitive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'History',
    tableName: 'histories',
    timestamps: true,
    paranoid: false,
    indexes: [
        { fields: ['id'] },
        { fields: ['createdAt'] }
    ]
});
class HistoryModel extends BaseModel_1.default {
    constructor() {
        super(History);
    }
}
exports.default = new HistoryModel();
//# sourceMappingURL=HistoryModel.js.map