const express = require('express');
const router = express.Router();
const UbicacionController = require('../controllers/ubicacionController');

// Listar ubicaciones (con filtros y paginación)
router.get('/', UbicacionController.getUbicaciones);
// Crear ubicación
router.post('/', UbicacionController.createUbicacion);
// Editar ubicación
router.put('/:id', UbicacionController.updateUbicacion);
// Activar/desactivar ubicación (soft delete)
router.patch('/:id/estado', UbicacionController.setEstadoUbicacion);

module.exports = router;
