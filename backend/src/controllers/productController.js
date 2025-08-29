// backend/src/controllers/productController.js

const ProductService = require('../services/productService');
// Se necesita el servicio de categorías para verificar si la categoría existe
const ProductCategoryService = require('../services/productCategoryService'); 
const ResponseHelper = require('../utils/responseHelper');

class ProductController {
    static async createProduct(req, res) {
        try {
            const { name, description, code, price, categoriaId } = req.body;
            
            const newProductData = {
                nombre: name,
                descripcion: description,
                codigo: code,
                precio: price,
                categoriaId: categoriaId
            };

            const product = await ProductService.createProduct(newProductData);
            return ResponseHelper.success(res, product, 'Producto creado exitosamente', 201);
        } catch (error) {
            console.error('Error al crear producto:', error);
            if (error.statusCode === 404) {
                return ResponseHelper.notFound(res, error.message);
            }
            if (error.statusCode === 409) {
                return ResponseHelper.conflict(res, error.message);
            }
            return ResponseHelper.validationError(res, error.message);
        }
    }

    // --- FUNCIÓN CORREGIDA ---
    static async getAllProducts(req, res) {
        try {
            const { page = 1, limit = 10, search, categoryId, code } = req.query;

            // VALIDACIÓN AÑADIDA: Si se pasa un categoryId, se verifica que exista.
            if (categoryId) {
                const categoryExists = await ProductCategoryService.getCategoryById(parseInt(categoryId, 10));
                if (!categoryExists) {
                    // Si la categoría no existe, se devuelve un 404.
                    return ResponseHelper.notFound(res, `La categoría con ID ${categoryId} no existe.`);
                }
            }

            const result = await ProductService.getAllProducts({
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                nombre: search || null,
                categoriaId: categoryId ? parseInt(categoryId, 10) : null,
                codigo: code || null,
            });

            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
            const buildUrl = (pageNum) => {
                const params = new URLSearchParams();
                params.append('page', pageNum.toString());
                params.append('limit', limit.toString());
                if (search) params.append('search', search);
                if (categoryId) params.append('categoryId', categoryId);
                if (code) params.append('code', code);
                return `${baseUrl}?${params.toString()}`;
            };

            const response = {
                products: result.products,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                hasNextPage: result.hasNextPage,
                hasPreviousPage: result.hasPreviousPage,
                nextPageUrl: result.hasNextPage ? buildUrl(result.currentPage + 1) : null,
                previousPageUrl: result.hasPreviousPage ? buildUrl(result.currentPage - 1) : null,
            };

            return ResponseHelper.success(res, response, 'Productos obtenidos exitosamente');
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return ResponseHelper.error(res, 'Error al obtener los productos');
        }
    }

    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.getProductById(parseInt(id, 10));

            if (!product) {
                // CORRECCIÓN: Se añade un mensaje más específico.
                return ResponseHelper.notFound(res, `El producto con ID ${id} no existe.`);
            }

            return ResponseHelper.success(res, product, 'Producto obtenido exitosamente');
        } catch (error) {
            console.error('Error al obtener producto:', error);
            if (error.statusCode === 404) {
                return ResponseHelper.notFound(res, error.message);
            }
            return ResponseHelper.error(res, 'Error al obtener el producto');
        }
    }

    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, description, code, price, categoriaId } = req.body;
            
            const updatedProductData = {
                nombre: name,
                descripcion: description,
                codigo: code,
                precio: price,
                categoriaId: categoriaId
            };
            
            const updatedProduct = await ProductService.updateProduct(parseInt(id, 10), updatedProductData);
            return ResponseHelper.success(res, updatedProduct, 'Producto actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            if (error.statusCode === 404) {
                return ResponseHelper.notFound(res, error.message);
            }
            if (error.statusCode === 409) {
                return ResponseHelper.conflict(res, error.message);
            }
            return ResponseHelper.validationError(res, error.message);
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            await ProductService.deleteProduct(parseInt(id, 10));
            return ResponseHelper.success(res, null, 'Producto eliminado exitosamente', 204);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            if (error.statusCode === 404) {
                return ResponseHelper.notFound(res, error.message);
            }
            return ResponseHelper.error(res, 'Error al eliminar el producto');
        }
    }
}

module.exports = ProductController;
