"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseModel {
    constructor(model) {
        this.model = model;
    }
    async findAll(options) {
        return this.model.findAll(options);
    }
    async findById(id, options) {
        return this.model.findByPk(id, options);
    }
    async findOne(where, options) {
        return this.model.findOne({ where, ...options });
    }
    async create(data, options) {
        return this.model.create(data, options);
    }
    async update(id, data, options) {
        return this.model.update(data, {
            where: { id },
            ...options
        });
    }
    async delete(id, options) {
        return this.model.destroy({
            where: { id },
            ...options
        });
    }
    async bulkCreate(data, options) {
        return this.model.bulkCreate(data, options);
    }
    async count(where) {
        return this.model.count({ where });
    }
    async exists(where) {
        const count = await this.count(where);
        return count > 0;
    }
}
exports.default = BaseModel;
//# sourceMappingURL=BaseModel.js.map