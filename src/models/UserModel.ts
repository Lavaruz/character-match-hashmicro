import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../configs/database';
import BaseModel from './BaseModel';
import bcrypt from 'bcrypt';

export class User extends Model{
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public async updateLastLogin(): Promise<void> {
    this.lastLoginAt = new Date();
    await this.save();
  }

  // Virtual field to get user info without password
  public toSafeJSON() {
    const { password, ...safeUser } = this.toJSON();
    return safeUser;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
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
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true, /* soft delete buat user (analytical purpose) */
    hooks: {
      // Hash password before saving
      beforeCreate: async (user: User) => {
        if (user.password) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      }
    },
    indexes: [
      {unique: true, fields: ['username']},
      {unique: true, fields: ['email']},
      {fields: ['isActive']},
      {fields: ['createdAt']}
    ]
  }
);

class UserModel extends BaseModel<User> {
  constructor() {
    super(User);
  }
}

export default new UserModel();