// src/dtos/products.dto.js
class CreateProductDto {
  static validate(data) {
    if (!data.nombre || typeof data.nombre !== 'string') {
      throw new Error('El nombre es obligatorio y debe ser una cadena');
    }
    // descripcion es opcional pero si viene debe ser string
    if (data.descripcion !== undefined && typeof data.descripcion !== 'string') {
      throw new Error('La descripción debe ser una cadena');
    }
    if (!data.categoriaId || typeof data.categoriaId !== 'number') {
      throw new Error('La categoría es obligatoria y debe ser numérica');
    }
    if (!data.codigo || typeof data.codigo !== 'string') {
      throw new Error('El código es obligatorio y debe ser una cadena');
    }
    if (data.codigo.length > 12) {
      throw new Error('El código no puede exceder 12 caracteres');
    }
    if (data.precio === undefined || typeof data.precio !== 'number' || isNaN(data.precio)) {
      throw new Error('El precio es obligatorio y debe ser numérico');
    }

    return {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion ? data.descripcion.trim() : null,
      categoriaId: data.categoriaId,
      codigo: data.codigo.trim(),
      precio: Number(data.precio),
    };
  }
}

class UpdateProductDto {
  static validate(data) {
    if (!data.id || typeof data.id !== 'number') {
      throw new Error('El ID es obligatorio y debe ser numérico');
    }
    if (!data.nombre || typeof data.nombre !== 'string') {
      throw new Error('El nombre es obligatorio y debe ser una cadena');
    }
    if (data.descripcion !== undefined && typeof data.descripcion !== 'string') {
      throw new Error('La descripción debe ser una cadena');
    }
    if (!data.categoriaId || typeof data.categoriaId !== 'number') {
      throw new Error('La categoría es obligatoria y debe ser numérica');
    }
    if (!data.codigo || typeof data.codigo !== 'string') {
      throw new Error('El código es obligatorio y debe ser una cadena');
    }
    if (data.codigo.length > 12) {
      throw new Error('El código no puede exceder 12 caracteres');
    }
    if (data.precio === undefined || typeof data.precio !== 'number' || isNaN(data.precio)) {
      throw new Error('El precio es obligatorio y debe ser numérico');
    }

    return {
      id: data.id,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion ? data.descripcion.trim() : null,
      categoriaId: data.categoriaId,
      codigo: data.codigo.trim(),
      precio: Number(data.precio),
    };
  }
}

module.exports = { CreateProductDto, UpdateProductDto };
