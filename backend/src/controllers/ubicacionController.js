const UbicacionService = require('../services/ubicacionService');
const ResponseHelper = require('../utils/responseHelper');

class UbicacionController {
  static async createUbicacion(req, res) {
    try {
      const usuario = req.user?.id || 'sistema';
      const ubicacion = await UbicacionService.createUbicacion(req.body, usuario);
      return ResponseHelper.success(res, ubicacion, 'Ubicación creada exitosamente', 201);
    } catch (error) {
      return ResponseHelper.validationError(res, error.message);
    }
  }

  static async getUbicaciones(req, res) {
    try {
      const { page = 1, limit = 10, nombre_ubicacion, estado } = req.query;
      const result = await UbicacionService.getUbicaciones({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        nombre_ubicacion: nombre_ubicacion || undefined,
        estado: estado !== undefined ? Number(estado) : undefined
      });
      return ResponseHelper.success(res, result, 'Ubicaciones obtenidas exitosamente');
    } catch (error) {
      return ResponseHelper.error(res, error.message);
    }
  }

  static async updateUbicacion(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.user?.id || 'sistema';
      const ubicacion = await UbicacionService.updateUbicacion(Number(id), req.body, usuario);
      return ResponseHelper.success(res, ubicacion, 'Ubicación actualizada exitosamente');
    } catch (error) {
      return ResponseHelper.validationError(res, error.message);
    }
  }

  static async setEstadoUbicacion(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const usuario = req.user?.id || 'sistema';
      const ubicacion = await UbicacionService.setEstadoUbicacion(Number(id), Number(estado), usuario);
      return ResponseHelper.success(res, ubicacion, `Ubicación ${estado ? 'activada' : 'desactivada'} exitosamente`);
    } catch (error) {
      return ResponseHelper.validationError(res, error.message);
    }
  }
}

module.exports = UbicacionController;
