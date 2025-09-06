const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// --- Rutas existentes ---

// CRUD por ID
router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.delete('/:id', ProductController.deleteProduct);
router.put('/:id', ProductController.updateProduct);

// --- NUEVAS rutas por código ---
router.put('/by-code/:codigo', ProductController.updateProductByCode);
router.delete('/by-code/:codigo', ProductController.deleteProductByCode);

module.exports = router;