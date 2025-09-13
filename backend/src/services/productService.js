const ProductModel = require('../models/productModel');
const ProductCategory = require('../models/productCategoryModel');

class ProductService {
    // Actualizar producto por código
    static async updateProductByCode(codigo, productData) {
        const existingProduct = await ProductModel.findByCode(codigo);
        if (!existingProduct) {
            const error = new Error('Producto no encontrado.');
            error.statusCode = 404;
            throw error;
        }

        // Validaciones similares a updateProduct
        if (productData.nombre && await ProductModel.existsByName(productData.nombre, existingProduct.id_producto)) {
            throw new Error('Ya existe un producto con este nombre.');
        }
        if (productData.codigo && await ProductModel.existsByCode(productData.codigo, existingProduct.id_producto)) {
            throw new Error('Ya existe un producto con este código.');
        }
        if (productData.precio === 0) {
            throw new Error('No es posible agregar productos con precio igual a Q0.00');
        }
        // Aceptar ambos nombres para la categoría
        const categoriaId = productData.categoriaId !== undefined ? productData.categoriaId : productData.id_categoria;
        const updatePayload = {
            ...productData,
            categoriaId
        };

        const success = await ProductModel.updateByCode(codigo, updatePayload);
        if (success) {
            const updatedProduct = await ProductModel.findByCode(productData.codigo || codigo);
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

    // Eliminar producto por código
    static async deleteProductByCode(codigo) {
        const success = await ProductModel.deleteByCode(codigo);
        if (!success) {
            throw new Error('Producto no encontrado o ya fue eliminado.');
        }
    }
    static async createProduct(productData) {
        if (!productData.nombre) {
            throw new Error('El nombre es obligatorio.');
        }
        if (!productData.codigo) {
            throw new Error('El código es obligatorio.');
        }
        if (productData.precio === undefined || productData.precio === null || productData.precio === '') {
            const error = new Error('El precio es obligatorio.');
            error.statusCode = 400;
            throw error;
        }
        if (Number(productData.precio) === 0) {
            const error = new Error('No es posible agregar productos con precio igual a Q0.00');
            error.statusCode = 400;
            throw error;
        }
        if (productData.categoriaId === undefined || productData.categoriaId === null || productData.categoriaId === '' || Number(productData.categoriaId) === 0) {
            const error = new Error('La categoría es obligatoria.');
            error.statusCode = 400;
            throw error;
        }
        // ...existing code...

        const nameExists = await ProductModel.existsByName(productData.nombre);
        if (nameExists) {
            throw new Error('Ya existe un producto con este nombre.');
        }

        const codeExists = await ProductModel.existsByCode(productData.codigo);
        if (codeExists) {
            throw new Error('Ya existe un producto con este código.');
        }

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
        // Devolver los campos con los nombres originales de la base de datos
        return {
            id_producto: product.id_producto ?? null,
            nombre: product.nombre ?? '',
            descripcion: product.descripcion ?? '',
            id_categoria: product.id_categoria ?? null,
            categoria_nombre: product.categoria_nombre ?? '',
            codigo: product.codigo ?? '',
            precio: product.precio ?? null,
            fecha_creacion: product.fecha_creacion ?? null
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

        if (productData.precio === 0) {
            throw new Error('No es posible agregar productos con precio igual a Q0.00');
        }

        // Aceptar ambos nombres para la categoría
        const categoriaId = productData.categoriaId !== undefined ? productData.categoriaId : productData.id_categoria;
        const updatePayload = {
            ...productData,
            categoriaId
        };

        const success = await ProductModel.update(id, updatePayload);
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

    static async getAllRows() {
        const products = await ProductModel.findAllRaw();
        return products;
    }
}

module.exports = ProductService;