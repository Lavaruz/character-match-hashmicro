"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../configs/database");
const BaseModel_1 = __importDefault(require("./BaseModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class User extends sequelize_1.Model {
    // Instance methods
    async validatePassword(password) {
        return bcrypt_1.default.compare(password, this.password);
    }
    async updateLastLogin() {
        this.lastLoginAt = new Date();
        await this.save();
    }
    // Virtual field to get user info without password
    toSafeJSON() {
        const { password, ...safeUser } = this.toJSON();
        return safeUser;
    }
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: {
            name: 'unique_username',
            msg: 'Username already exists'
        },
        validate: {
            len: {
                args: [3, 50],
                msg: 'Username must be between 3 and 50 characters'
            },
            isAlphanumeric: {
                msg: 'Username can only contain letters and numbers'
            }
        }
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: {
            name: 'unique_email',
            msg: 'Email already exists'
        },
        validate: {
            isEmail: {
                msg: 'Please provide a valid email address'
            },
            len: {
                args: [5, 255],
                msg: 'Email must be between 5 and 255 characters'
            }
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: {
                args: [6, 255],
                msg: 'Password must be at least 6 characters long'
            }
        }
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true, /* soft delete buat user (analytical purpose) */
    hooks: {
        // Hash password before saving
        beforeCreate: async (user) => {
            if (user.password) {
                const saltRounds = 12;
                user.password = await bcrypt_1.default.hash(user.password, saltRounds);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const saltRounds = 12;
                user.password = await bcrypt_1.default.hash(user.password, saltRounds);
            }
        }
    },
    indexes: [
        { unique: true, fields: ['username'] },
        { unique: true, fields: ['email'] },
        { fields: ['isActive'] },
        { fields: ['createdAt'] }
    ]
});
class UserModel extends BaseModel_1.default {
    constructor() {
        super(User);
    }
}
exports.default = new UserModel();
//# sourceMappingURL=UserModel.js.map