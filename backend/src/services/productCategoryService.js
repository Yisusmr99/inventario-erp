const ProductCategoryModel = require('../models/productCategoryModel');
const { CreateProductCategoryDto, UpdateProductCategoryDto } = require('../dtos/products.categories.dto');

class ProductCategoryService {
    /**
     * Crear una nueva categoría de producto
     */
    static async createCategory(data) {
        try {
            // Validar datos de entrada
            const validatedData = CreateProductCategoryDto.validate(data);
            
            // Verificar si ya existe una categoría con el mismo nombre
            const existingCategory = await ProductCategoryModel.existsByName(validatedData.nombre);
            if (existingCategory) {
                throw new Error('Ya existe una categoría con este nombre');
            }

            // Crear la categoría
            const categoryId = await ProductCategoryModel.create(validatedData);
            
            // Obtener la categoría creada
            const newCategory = await ProductCategoryModel.findById(categoryId);
            
            return newCategory;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener todas las categorías
     */
    static async getAllCategories({ page = 1, limit = 10, search = null } = {}) {
        try {
            const total = await ProductCategoryModel.count(search);
            const totalPages = Math.ceil(total / limit);
            const offset = (page - 1) * limit;

            // Si no hay registros, devolver estructura vacía
            if (total === 0) {
                return {
                    categories: [],
                    totalCategories: 0,
                    totalPages: 0,
                    currentPage: page,
                    hasNextPage: false,
                    hasPreviousPage: false
                };
            }

            // Si la página solicitada excede el total, devolver la última página
            let currentPage = page;
            let currentOffset = offset;
            if (offset >= total) {
                currentPage = totalPages;
                currentOffset = (currentPage - 1) * limit;
            }
            
            const categories = await ProductCategoryModel.findAll({ 
                offset: parseInt(currentOffset), 
                limit: parseInt(limit),
                search
            });

            return {
                categories,
                totalCategories: total,
                totalPages,
                currentPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener una categoría por ID
     */
    static async getCategoryById(id) {
        try {
            const category = await ProductCategoryModel.findById(id);
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            return category;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar una categoría
     */
    static async updateCategory(data) {
        try {
            // Validar datos de entrada
            const validatedData = UpdateProductCategoryDto.validate(data);
            
            // Verificar si la categoría existe
            const existingCategory = await ProductCategoryModel.findById(validatedData.id);
            if (!existingCategory) {
                throw new Error('Categoría no encontrada');
            }

            // Verificar si ya existe otra categoría con el mismo nombre
            const duplicateCategory = await ProductCategoryModel.existsByName(
                validatedData.nombre, 
                validatedData.id
            );
            if (duplicateCategory) {
                throw new Error('Ya existe otra categoría con este nombre');
            }

            // Actualizar la categoría
            const updated = await ProductCategoryModel.update(validatedData.id, validatedData);
            if (!updated) {
                throw new Error('No se pudo actualizar la categoría');
            }

            // Obtener la categoría actualizada
            const updatedCategory = await ProductCategoryModel.findById(validatedData.id);
            
            return updatedCategory;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Eliminar una categoría
     */
    static async deleteCategory(id) {
        try {
            // Verificar si la categoría existe
            const existingCategory = await ProductCategoryModel.findById(id);
            if (!existingCategory) {
                throw new Error('Categoría no encontrada');
            }

            // Eliminar la categoría
            const deleted = await ProductCategoryModel.delete(id);
            if (!deleted) {
                throw new Error('No se pudo eliminar la categoría');
            }

            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductCategoryService;
