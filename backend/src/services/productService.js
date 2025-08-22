const ProductModel = require('../models/productModel');
const ProductCategory = require('../models/productCategoryModel'); // <-- Tu modelo personalizado

class ProductService {
    static async createProduct(productData) {
        if (!productData.nombre) {
            throw new Error('El nombre es obligatorio.');
        }
        if (!productData.codigo) {
            throw new Error('El código es obligatorio.');
        }
        if (!productData.precio) {
            throw new Error('El precio es obligatorio.');
        }
        if (!productData.categoriaId) {
            throw new Error('La categoría es obligatoria.');
        }

        const nameExists = await ProductModel.existsByName(productData.nombre);
        if (nameExists) {
            throw new Error('Ya existe un producto con este nombre.');
        }

        const codeExists = await ProductModel.existsByCode(productData.codigo);
        if (codeExists) {
            throw new Error('Ya existe un producto con este código.');
        }

        // CORRECCIÓN: Usar findById en lugar de findByPk
        const categoryExists = await ProductCategory.findById(productData.categoriaId);
        if (!categoryExists) {
            const error = new Error('La categoría especificada no existe.');
            error.statusCode = 404;
            throw error;
        }

        const newProductId = await ProductModel.create(productData);
        return await this.getProductById(newProductId);
    }

    static async getAllProducts({ page, limit, nombre, categoriaId, codigo }) {
        const offset = (page - 1) * limit;

        const products = await ProductModel.findAll({ offset, limit, nombre, categoriaId, codigo });
        const totalItems = await ProductModel.count({ nombre, categoriaId, codigo });

        const totalPages = Math.ceil(totalItems / limit);
        return {
            products: products.map(p => ({
                id: p.id_producto,
                name: p.nombre,
                description: p.descripcion,
                categoriaId: p.id_categoria,
                categoriaNombre: p.categoria_nombre,
                code: p.codigo,
                price: p.precio,
            })),
            totalItems,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }

    static async getProductById(id) {
        const product = await ProductModel.findById(id);
        if (!product) {
            const error = new Error('Producto no encontrado');
            error.statusCode = 404;
            throw error;
        }
        return {
            id: product.id_producto,
            name: product.nombre,
            description: product.descripcion,
            categoriaId: product.id_categoria,
            categoriaNombre: product.categoria_nombre,
            code: product.codigo,
            price: product.precio
        };
    }

    static async updateProduct(id, productData) {
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) {
            throw new Error('Producto no encontrado.');
        }

        if (productData.nombre && await ProductModel.existsByName(productData.nombre, id)) {
            throw new Error('Ya existe un producto con este nombre.');
        }

        if (productData.codigo && await ProductModel.existsByCode(productData.codigo, id)) {
            throw new Error('Ya existe un producto con este código.');
        }

        const success = await ProductModel.update(id, productData);
        if (success) {
            const updatedProduct = await ProductModel.findById(id);
            return {
                id: updatedProduct.id_producto,
                name: updatedProduct.nombre,
                description: updatedProduct.descripcion,
                categoriaId: updatedProduct.id_categoria,
                categoriaNombre: updatedProduct.categoria_nombre,
                code: updatedProduct.codigo,
                price: updatedProduct.precio
            };
        }
        return null;
    }

    static async deleteProduct(id) {
        const success = await ProductModel.delete(id);
        if (!success) {
            throw new Error('Producto no encontrado o ya fue eliminado.');
        }
    }
}

module.exports = ProductService;