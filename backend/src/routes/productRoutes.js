const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// --- Rutas existentes ---
router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.delete('/:id', ProductController.deleteProduct);

// --- Ruta para actualizar (SCRUM-73) ---
router.put('/:id', ProductController.updateProduct);

module.exports = router;