// src/services/productService.js
const ProductModel = require('../models/productModel');
const { CreateProductDto, UpdateProductDto } = require('../dtos/products.dto');

class ProductService {
  static async createProduct(data) {
    const validated = CreateProductDto.validate(data);
    const duplicate = await ProductModel.existsByName(validated.nombre);
    if (duplicate) throw new Error('Ya existe un producto con este nombre');

    const id = await ProductModel.create(validated);
    return await ProductModel.findById(id);
  }

  static async getAllProducts({ page = 1, limit = 10, nombre, categoriaId, codigo } = {}) {
    const total = await ProductModel.count({ nombre, categoriaId, codigo });
    const totalPages = Math.ceil(total / limit) || 0;
    const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    const offset = (safePage - 1) * limit;

    if (total === 0) {
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
        currentPage: safePage,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    const products = await ProductModel.findAll({
      offset,
      limit,
      nombre,
      categoriaId,
      codigo,
    });

    return {
      products,
      totalProducts: total,
      totalPages,
      currentPage: safePage,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    };
  }

  static async getProductById(id) {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  static async updateProduct(data) {
    const validated = UpdateProductDto.validate(data);
    const existing = await ProductModel.findById(validated.id);
    if (!existing) throw new Error('Producto no encontrado');

    const duplicate = await ProductModel.existsByName(validated.nombre, validated.id);
    if (duplicate) throw new Error('Ya existe otro producto con este nombre');

    const ok = await ProductModel.update(validated.id, validated);
    if (!ok) throw new Error('No se pudo actualizar el producto');

    return await ProductModel.findById(validated.id);
  }

  static async deleteProduct(id) {
    const existing = await ProductModel.findById(id);
    if (!existing) throw new Error('Producto no encontrado');

    const ok = await ProductModel.delete(id);
    if (!ok) throw new Error('No se pudo eliminar el producto');
    return true;
  }
}

module.exports = ProductService;
