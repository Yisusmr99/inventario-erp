// src/controllers/productController.js
const ProductService = require('../services/productService');
const ResponseHelper = require('../utils/responseHelper');

class ProductController {
  static async createProduct(req, res) {
    try {
      const product = await ProductService.createProduct(req.body);
      return ResponseHelper.success(res, product, 'Producto creado exitosamente', 201);
    } catch (error) {
      console.error('Error al crear producto:', error);
      return ResponseHelper.validationError(res, error.message);
    }
  }

  static async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 10, name, categoryId, code } = req.query;

      const result = await ProductService.getAllProducts({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        nombre: name || null,
        categoriaId: categoryId ? parseInt(categoryId, 10) : null,
        codigo: code || null,
      });

      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const buildUrl = (pageNum) => {
        const params = new URLSearchParams();
        params.append('page', pageNum.toString());
        params.append('limit', limit.toString());
        if (name) params.append('name', name);
        if (categoryId) params.append('categoryId', categoryId);
        if (code) params.append('code', code);
        return `${baseUrl}?${params.toString()}`;
      };

      const response = {
        ...result,
        nextPageUrl: result.hasNextPage ? buildUrl(result.currentPage + 1) : null,
        previousPageUrl: result.hasPreviousPage ? buildUrl(result.currentPage - 1) : null,
        currentPageUrl: buildUrl(result.currentPage),
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
      if (error.message === 'Producto no encontrado') {
        return ResponseHelper.notFound(res, error.message);
      }
      return ResponseHelper.error(res, 'Error al obtener el producto');
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updated = await ProductService.updateProduct({ ...req.body, id: parseInt(id, 10) });
      return ResponseHelper.success(res, updated, 'Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar producto:', error);
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
      return ResponseHelper.error(res, 'Error al eliminar el producto');
    }
  }
}

module.exports = ProductController;
