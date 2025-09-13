const UbicacionModel = require('../models/ubicacionModel');
const AuditoriaModel = require('../models/auditoriaModel'); // Debes crear este modelo si no existe

class UbicacionService {
  static async createUbicacion(data, usuario) {
    if (!data.nombre_ubicacion) throw new Error('El nombre de la ubicación es obligatorio.');
    if (data.capacidad === undefined || data.capacidad === null || isNaN(Number(data.capacidad))) throw new Error('La capacidad es obligatoria.');
    if (Number(data.capacidad) <= 0) throw new Error('La capacidad debe ser mayor a 0.');
    const exists = await UbicacionModel.existsByNombre(data.nombre_ubicacion);
    if (exists) throw new Error('Ya existe una ubicación con ese nombre.');
    const id = await UbicacionModel.create(data);
    await AuditoriaModel.registrar('ubicacion', id, 'crear', usuario);
    return await UbicacionModel.findById(id);
  }

  static async getUbicaciones({ page = 1, limit = 10, nombre_ubicacion, estado }) {
    const offset = (page - 1) * limit;
    const ubicaciones = await UbicacionModel.findAll({ offset, limit, nombre_ubicacion, estado });
    const totalItems = await UbicacionModel.count({ nombre_ubicacion, estado });
    return {
      ubicaciones,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  }

  static async updateUbicacion(id, data, usuario) {
    const ubicacion = await UbicacionModel.findById(id);
    if (!ubicacion) throw new Error('Ubicación no encontrada.');
    if (!data.nombre_ubicacion) throw new Error('El nombre de la ubicación es obligatorio.');
    if (data.capacidad === undefined || data.capacidad === null || isNaN(Number(data.capacidad))) throw new Error('La capacidad es obligatoria.');
    if (Number(data.capacidad) <= 0) throw new Error('La capacidad debe ser mayor a 0.');
    const exists = await UbicacionModel.existsByNombre(data.nombre_ubicacion, id);
    if (exists) throw new Error('Ya existe una ubicación con ese nombre.');
    await UbicacionModel.update(id, data);
    await AuditoriaModel.registrar('ubicacion', id, 'editar', usuario);
    return await UbicacionModel.findById(id);
  }

  static async setEstadoUbicacion(id, estado, usuario) {
    const ubicacion = await UbicacionModel.findById(id);
    if (!ubicacion) throw new Error('Ubicación no encontrada.');
    await UbicacionModel.setEstado(id, estado);
    await AuditoriaModel.registrar('ubicacion', id, estado ? 'activar' : 'desactivar', usuario);
    return await UbicacionModel.findById(id);
  }
}

module.exports = UbicacionService;
