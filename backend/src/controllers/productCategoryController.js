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
            const { page = 1, limit = 10, search } = req.query;
            const result = await ProductCategoryService.getAllCategories({ 
                page: parseInt(page, 10), 
                limit: parseInt(limit, 10),
                search: search || null
            });

            // Construir URLs base
            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
            
            // Construir query params para las URLs
            const buildUrl = (pageNum) => {
                const params = new URLSearchParams();
                params.append('page', pageNum.toString());
                params.append('limit', limit.toString());
                if (search) params.append('search', search);
                return `${baseUrl}?${params.toString()}`;
            };

            // Agregar información adicional de paginación con URLs
            const response = {
                ...result,
                nextPage: result.hasNextPage ? result.currentPage + 1 : null,
                previousPage: result.hasPreviousPage ? result.currentPage - 1 : null,
                nextPageUrl: result.hasNextPage ? buildUrl(result.currentPage + 1) : null,
                previousPageUrl: result.hasPreviousPage ? buildUrl(result.currentPage - 1) : null,
                currentPageUrl: buildUrl(result.currentPage),
                firstPageUrl: buildUrl(1),
                lastPageUrl: result.totalPages > 0 ? buildUrl(result.totalPages) : null
            };

            return ResponseHelper.success(
                res, 
                response, 
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
            // CORRECCIÓN: Convierte el ID a un número entero para evitar errores de tipo.
            const category = await ProductCategoryService.getCategoryById(parseInt(id, 10));
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
            const updateData = { ...req.body, id: parseInt(id, 10) };
            
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
            // CORRECCIÓN: Convierte el ID a un número entero para evitar errores de tipo.
            await ProductCategoryService.deleteCategory(parseInt(id, 10));
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
