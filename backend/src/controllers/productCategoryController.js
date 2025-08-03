const ProductCategoryService = require('../services/productCategoryService');
const ResponseHelper = require('../utils/responseHelper');

class ProductCategoryController {
    /**
     * Crear una nueva categoría de producto
     */
    static async createCategory(req, res) {
        try {
            const category = await ProductCategoryService.createCategory(req.body);
            return ResponseHelper.success(
                res, 
                category, 
                'Categoría creada exitosamente', 
                201
            );
        } catch (error) {
            console.error('Error al crear categoría:', error);
            return ResponseHelper.validationError(res, error.message);
        }
    }

    /**
     * Obtener todas las categorías
     */
    static async getAllCategories(req, res) {
        try {
            const categories = await ProductCategoryService.getAllCategories();
            return ResponseHelper.success(
                res, 
                categories, 
                'Categorías obtenidas exitosamente'
            );
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return ResponseHelper.error(res, 'Error al obtener las categorías');
        }
    }

    /**
     * Obtener una categoría por ID
     */
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await ProductCategoryService.getCategoryById(id);
            return ResponseHelper.success(
                res, 
                category, 
                'Categoría obtenida exitosamente'
            );
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            if (error.message === 'Categoría no encontrada') {
                return ResponseHelper.notFound(res, error.message);
            }
            return ResponseHelper.error(res, 'Error al obtener la categoría');
        }
    }

    /**
     * Actualizar una categoría
     */
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body, id: parseInt(id) };
            
            const category = await ProductCategoryService.updateCategory(updateData);
            return ResponseHelper.success(
                res, 
                category, 
                'Categoría actualizada exitosamente'
            );
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            if (error.message.includes('no encontrada')) {
                return ResponseHelper.notFound(res, error.message);
            }
            return ResponseHelper.validationError(res, error.message);
        }
    }

    /**
     * Eliminar una categoría
     */
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await ProductCategoryService.deleteCategory(id);
            return ResponseHelper.success(
                res, 
                null, 
                'Categoría eliminada exitosamente'
            );
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            if (error.message === 'Categoría no encontrada') {
                return ResponseHelper.notFound(res, error.message);
            }
            return ResponseHelper.error(res, 'Error al eliminar la categoría');
        }
    }
}

module.exports = ProductCategoryController;