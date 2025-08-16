import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configs/database';
import BaseModel from './BaseModel';

export class History extends Model {
  public id!: number;
  public input1!: string;
  public input2!: string;
  public percentage!: number;
  public matchedChars!: number;
  public totalChars!: number;
  public caseSensitive!: boolean;
  public allowDuplicates!: boolean;
}

History.init(
{
    input1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    input2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    percentage: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    matchedChars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    totalChars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    caseSensitive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    allowDuplicates: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},
{ 
    sequelize, 
    modelName: 'History',
    tableName: 'histories',
    timestamps: true,
    paranoid: false,
    indexes: [
        {fields: ['id']},
        {fields: ['createdAt']}
    ]
});

class HistoryModel extends BaseModel<History> {
  constructor() {
    super(History);
  }
}

export default new HistoryModel();
