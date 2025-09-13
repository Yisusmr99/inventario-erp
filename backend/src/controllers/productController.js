const ProductService = require('../services/productService');
const ResponseHelper = require('../utils/responseHelper');

class ProductController {
    static async createProduct(req, res) {
        try {
            const nombre = req.body.nombre || req.body.name;
            const descripcion = req.body.descripcion || req.body.description;
            const codigo = req.body.codigo || req.body.code;
            const precio = req.body.precio !== undefined ? Number(req.body.precio) : (req.body.price !== undefined ? Number(req.body.price) : undefined);
            const categoriaId = req.body.categoriaId !== undefined ? Number(req.body.categoriaId) : (req.body.id_categoria !== undefined ? Number(req.body.id_categoria) : undefined);
            const newProductData = { nombre, descripcion, codigo, precio, categoriaId };
            const product = await ProductService.createProduct(newProductData);
            return ResponseHelper.success(res, product, 'Producto creado exitosamente', 201);
        } catch (error) {
            console.error('Error al crear producto:', error);
            if (error.statusCode === 404) return ResponseHelper.notFound(res, error.message);
            if (error.statusCode === 409) return ResponseHelper.conflict(res, error.message);
            return ResponseHelper.validationError(res, error.message);
        }
    }

    static async getAllProducts(req, res) {
        try {
            const { page = 1, limit = 10, search, categoryId, code } = req.query;
            const result = await ProductService.getAllProducts({
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                nombre: search || null,
                categoriaId: categoryId ? parseInt(categoryId, 10) : null,
                codigo: code || null,
            });
            if (!result.products || result.products.length === 0) {
                return ResponseHelper.notFound(res, 'No se encontraron productos con los filtros especificados');
            }
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
            return ResponseHelper.success(res, product, 'Producto obtenido exitosamente');
        } catch (error) {
            console.error('Error al obtener producto:', error);
            if (error.statusCode === 404) return ResponseHelper.notFound(res, error.message);
            return ResponseHelper.error(res, 'Error al obtener el producto');
        }
    }

    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const nombre = req.body.nombre || req.body.name;
            const descripcion = req.body.descripcion || req.body.description;
            const codigo = req.body.codigo || req.body.code;
            const precio = req.body.precio !== undefined ? Number(req.body.precio) : (req.body.price !== undefined ? Number(req.body.price) : undefined);
            const categoriaId = req.body.categoriaId !== undefined ? Number(req.body.categoriaId) : (req.body.id_categoria !== undefined ? Number(req.body.id_categoria) : undefined);
            const updatedProductData = { nombre, descripcion, codigo, precio, categoriaId };
            const updatedProduct = await ProductService.updateProduct(parseInt(id, 10), updatedProductData);
            return ResponseHelper.success(res, updatedProduct, 'Producto actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            if (error.statusCode === 404) return ResponseHelper.notFound(res, error.message);
            if (error.statusCode === 409) return ResponseHelper.conflict(res, error.message);
            return ResponseHelper.validationError(res, error.message);
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            await ProductService.deleteProduct(parseInt(id, 10));
            return ResponseHelper.success(res, null, 'Producto eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            if (error.message === 'Producto no encontrado o ya fue eliminado.') return ResponseHelper.notFound(res, error.message);
            return ResponseHelper.error(res, 'Error al eliminar el producto');
        }
    }

    // --- Métodos por código ---
    static async updateProductByCode(req, res) {
        try {
            const { codigo } = req.params;
            const nombre = req.body.nombre || req.body.name;
            const descripcion = req.body.descripcion || req.body.description;
            const code = req.body.codigo || req.body.code || codigo;
            const precio = req.body.precio !== undefined ? Number(req.body.precio) : (req.body.price !== undefined ? Number(req.body.price) : undefined);
            const categoriaId = req.body.categoriaId !== undefined ? Number(req.body.categoriaId) : (req.body.id_categoria !== undefined ? Number(req.body.id_categoria) : undefined);
            const updatedProductData = { nombre, descripcion, codigo: code, precio, categoriaId };
            const updatedProduct = await ProductService.updateProductByCode(codigo, updatedProductData);
            return ResponseHelper.success(res, updatedProduct, 'Producto actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar producto por código:', error);
            if (error.statusCode === 404) return ResponseHelper.notFound(res, error.message);
            if (error.statusCode === 409) return ResponseHelper.conflict(res, error.message);
            return ResponseHelper.validationError(res, error.message);
        }
    }

    static async deleteProductByCode(req, res) {
        try {
            const { codigo } = req.params;
            await ProductService.deleteProductByCode(codigo);
            return ResponseHelper.success(res, null, 'Producto eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar producto por código:', error);
            if (error.message === 'Producto no encontrado o ya fue eliminado.') return ResponseHelper.notFound(res, error.message);
            return ResponseHelper.error(res, 'Error al eliminar el producto');
        }
    }

    static async getAllRows(req, res) {
        try {
            const products = await ProductService.getAllRows();
            return ResponseHelper.success(res, products, 'Productos obtenidos exitosamente');
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return ResponseHelper.error(res, 'Error al obtener los productos');
        }
    }
}
module.exports = ProductController;
