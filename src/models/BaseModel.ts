import { 
  Model, 
  ModelStatic, 
  WhereOptions, 
  CreateOptions, 
  UpdateOptions,
  DestroyOptions,
  FindOptions,
  Attributes,
  CreationAttributes
} from 'sequelize';

// Option 1: Menggunakan constraint untuk memastikan model memiliki id
interface BaseModelAttributes {
  id: number;
}

export default class BaseModel<T extends Model<BaseModelAttributes>> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findAll(options?: FindOptions<Attributes<T>>) {
    return this.model.findAll(options);
  }

  async findById(id: number, options?: Omit<FindOptions<Attributes<T>>, 'where'>) {
    return this.model.findByPk(id, options);
  }

  async findOne(where: WhereOptions<Attributes<T>>, options?: Omit<FindOptions<Attributes<T>>, 'where'>) {
    return this.model.findOne({ where, ...options });
  }

  async create(data: CreationAttributes<T>, options?: CreateOptions<Attributes<T>>) {
    return this.model.create(data, options);
  }

  async update(
    id: number, 
    data: Partial<Attributes<T>>, 
    options?: Omit<UpdateOptions<Attributes<T>>, 'where'>
  ) {
    return this.model.update(data, { 
      where: { id } as WhereOptions<Attributes<T>>, 
      ...options 
    });
  }

  async delete(id: number, options?: Omit<DestroyOptions<Attributes<T>>, 'where'>) {
    return this.model.destroy({ 
      where: { id } as WhereOptions<Attributes<T>>, 
      ...options 
    });
  }

  async bulkCreate(data: CreationAttributes<T>[], options?: CreateOptions<Attributes<T>>) {
    return this.model.bulkCreate(data, options);
  }

  async count(where?: WhereOptions<Attributes<T>>) {
    return this.model.count({ where });
  }

  async exists(where: WhereOptions<Attributes<T>>) {
    const count = await this.count(where);
    return count > 0;
  }
}