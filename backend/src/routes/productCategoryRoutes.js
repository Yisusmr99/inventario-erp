const express = require('express');
const router = express.Router();
const ProductCategoryController = require('../controllers/productCategoryController');

// Crear una nueva categoría
router.post('/', ProductCategoryController.createCategory);

// Obtener todas las categorías
router.get('/', ProductCategoryController.getAllCategories);

// Obtener una categoría por ID
router.get('/:id', ProductCategoryController.getCategoryById);

// Actualizar una categoría
router.put('/:id', ProductCategoryController.updateCategory);

// Eliminar una categoría
router.delete('/:id', ProductCategoryController.deleteCategory);

module.exports = router;