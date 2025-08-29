// backend/src/controllers/productCategoryController.js

const ProductCategoryService = require('../services/productCategoryService');
const ResponseHelper = require('../utils/responseHelper');

class ProductCategoryController {
    static async createCategory(req, res) {
        try {
            if (req.body.name && typeof req.body.name === 'string') {
                req.body.name = req.body.name.trim();
            }
            const category = await ProductCategoryService.createCategory(req.body);
            return ResponseHelper.success(res, category, 'Categoría creada exitosamente', 201);
        } catch (error) {
            console.error('Error al crear categoría:', error);
            if (error.statusCode === 409) {
                return ResponseHelper.conflict(res, error.message);
            }
            return ResponseHelper.validationError(res, error.message);
        }
    }

    static async getAllCategories(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const result = await ProductCategoryService.getAllCategories({ 
                page: parseInt(page, 10), 
                limit: parseInt(limit, 10),
                search: search || null
            });

            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
            const buildUrl = (pageNum) => {
                const params = new URLSearchParams({ page: pageNum.toString(), limit: limit.toString() });
                if (search) params.append('search', search);
                return `${baseUrl}?${params.toString()}`;
            };

            const response = {
                ...result,
                nextPageUrl: result.hasNextPage ? buildUrl(result.currentPage + 1) : null,
                previousPageUrl: result.hasPreviousPage ? buildUrl(result.currentPage - 1) : null,
            };

            return ResponseHelper.success(res, response, 'Categorías obtenidas exitosamente');
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return ResponseHelper.error(res, 'Error al obtener las categorías');
        }
    }

    // --- FUNCIÓN CORREGIDA ---
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await ProductCategoryService.getCategoryById(parseInt(id, 10));

            // Si el servicio no encuentra la categoría, devolvemos un 404.
            if (!category) {
                return ResponseHelper.notFound(res, 'Categoría no encontrada.');
            }

            return ResponseHelper.success(res, category, 'Categoría obtenida exitosamente');
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            if (error.statusCode === 404) {
                return ResponseHelper.notFound(res, error.message);
            }
            return ResponseHelper.error(res, 'Error al obtener la categoría');
        }
    }

    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body, id: parseInt(id, 10) };
            
            const category = await ProductCategoryService.updateCategory(updateData);
            return ResponseHelper.success(res, category, 'Categoría actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            if (error.statusCode === 404) {
                return ResponseHelper.notFound(res, error.message);
            }
             if (error.statusCode === 409) {
                return ResponseHelper.conflict(res, error.message);
            }
            return ResponseHelper.validationError(res, error.message);
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await ProductCategoryService.deleteCategory(parseInt(id, 10));
            return ResponseHelper.success(res, null, 'Categoría eliminada exitosamente', 204);
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            if (error.statusCode === 404) {
                return ResponseHelper.notFound(res, error.message);
            }
            return ResponseHelper.error(res, 'Error al eliminar la categoría');
        }
    }
}

module.exports = ProductCategoryController;
