const ProductCategoryModel = require('../models/productCategoryModel');
const { CreateProductCategoryDto, UpdateProductCategoryDto } = require('../dtos/products.categories.dto');

class ProductCategoryService {
    static async createCategory(data) {
        const validatedData = CreateProductCategoryDto.validate(data);

        const exists = await ProductCategoryModel.existsByName(validatedData.nombre);
        if (exists) throw new Error('Ya existe una categoría con este nombre');

        const categoryId = await ProductCategoryModel.create(validatedData);
        return await ProductCategoryModel.findById(categoryId);
    }

    static async getAllCategories({ page = 1, limit = 10, search = null } = {}) {
        const total = await ProductCategoryModel.count(search);
        const totalPages = Math.ceil(total / limit);
        let currentPage = page > totalPages ? totalPages : page;
        if (currentPage < 1) currentPage = 1;

        const offset = (currentPage - 1) * limit;
        const categories = total === 0
            ? []
            : await ProductCategoryModel.findAll({ offset, limit, search });

        return {
            categories,
            totalCategories: total,
            totalPages,
            currentPage,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
        };
    }

    static async getCategoryById(id) {
        const category = await ProductCategoryModel.findById(id);
        if (!category) throw new Error('Categoría no encontrada');
        return category;
    }

    static async updateCategory(data) {
        const validatedData = UpdateProductCategoryDto.validate(data);

        const existing = await ProductCategoryModel.findById(validatedData.id);
        if (!existing) throw new Error('Categoría no encontrada');

        const duplicate = await ProductCategoryModel.existsByName(validatedData.nombre, validatedData.id);
        if (duplicate) throw new Error('Ya existe otra categoría con este nombre');

        const updated = await ProductCategoryModel.update(validatedData.id, validatedData);
        if (!updated) throw new Error('No se pudo actualizar la categoría');

        return await ProductCategoryModel.findById(validatedData.id);
    }

    static async deleteCategory(id) {
        const existing = await ProductCategoryModel.findById(id);
        if (!existing) throw new Error('Categoría no encontrada');

        const deleted = await ProductCategoryModel.delete(id);
        if (!deleted) throw new Error('No se pudo eliminar la categoría');

        return true;
    }
}

module.exports = ProductCategoryService;
