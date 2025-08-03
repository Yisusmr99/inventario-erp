const Joi = require('joi');

class CreateProductCategoryDto {
    constructor({ nombre, descripcion, estado }) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.estado = estado !== undefined ? estado : 1;
    }

    static get schema() {
        return Joi.object({
            nombre: Joi.string().min(2).max(100).required(),
            descripcion: Joi.string().max(500).optional().allow('', null),
            estado: Joi.number().valid(0, 1).default(1),
        });
    }

    static validate(data) {
        const { error, value } = this.schema.validate(data);
        if (error) throw new Error(error.details[0].message);
        return value;
    }
}

class UpdateProductCategoryDto extends CreateProductCategoryDto {
    constructor({ id, nombre, descripcion, estado }) {
        super({ nombre, descripcion, estado });
        this.id = id;
    }

    static get schema() {
        return Joi.object({
            id: Joi.number().integer().positive().required(),
            nombre: Joi.string().min(2).max(100).required(),
            descripcion: Joi.string().max(500).optional().allow('', null),
            estado: Joi.number().valid(0, 1).default(1),
        });
    }

    static validate(data) {
        const { error, value } = this.schema.validate(data);
        if (error) throw new Error(error.details[0].message);
        return value;
    }
}

module.exports = {
    CreateProductCategoryDto,
    UpdateProductCategoryDto,
};
