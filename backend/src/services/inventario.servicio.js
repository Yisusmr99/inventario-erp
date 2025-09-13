// src/services/inventario.servicio.js
const conexionBD = require('../config/db');
const InventarioModelo = require('../models/inventario.modelo');

class InventarioServicio {
  // GET: /by-product/:idProducto
  static async obtenerPorProducto(idProducto) {
    return InventarioModelo.resumenPorProducto(idProducto);
  }

  // GET: /all-products-inventory
  static async obtenerTodosProductosConInventario({ page = 1, limit = 10, search = null } = {}) {
    const totalItems = await InventarioModelo.contarProductosConInventario(search);
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Si no hay registros, devolver estructura vacía
    if (totalItems === 0) {
      return {
        products: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }

    // Si la página solicitada excede el total, devolver la última página
    let currentPage = page;
    let currentOffset = offset;
    if (offset >= totalItems) {
      currentPage = totalPages;
      currentOffset = (currentPage - 1) * limit;
    }

    const products = await InventarioModelo.obtenerProductosConInventarioPaginado({
      offset: parseInt(currentOffset),
      limit: parseInt(limit),
      search
    });

    return {
      products,
      totalItems,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }

  // POST: /adjust  (solo cantidad ±N)
  static async ajustarCantidad({ id_producto, id_ubicacion, cantidad, motivo, usuario }) {
    if (!Number.isInteger(id_producto) || !Number.isInteger(id_ubicacion)) {
      throw new Error('id_producto e id_ubicacion son obligatorios');
    }
    if (!Number.isInteger(cantidad) || cantidad === 0) {
      throw new Error('cantidad debe ser un entero distinto de 0');
    }
    if (!motivo || !motivo.trim()) {
      throw new Error('motivo es obligatorio');
    }

    const datosProducto = await InventarioModelo.obtenerProductoPorId(id_producto);
    if (!datosProducto) throw new Error('Producto no existe');

    const datosUbicacion = await InventarioModelo.obtenerUbicacionPorId(id_ubicacion);
    if (!datosUbicacion) throw new Error('Ubicación no existe');
    if (!datosUbicacion.estado) throw new Error('Ubicación inactiva');

    const conexion = await conexionBD.getConnection();
    try {
      await conexion.beginTransaction();

      const filaInventario = await InventarioModelo
        .obtenerFilaPorProductoUbicacion(conexion, id_producto, id_ubicacion, true);

      const cantidadActual = filaInventario ? filaInventario.cantidad_actual : 0;
      const cantidadNueva  = cantidadActual + cantidad;

      if (cantidadNueva < 0) throw new Error('No puede quedar stock negativo');
      if (datosUbicacion.capacidad != null && cantidadNueva > datosUbicacion.capacidad) {
        throw new Error('Capacidad de destino excedida');
      }

      if (filaInventario) {
        await InventarioModelo.actualizarSoloCantidad(conexion, filaInventario.id_inventario, cantidadNueva);
      } else if (cantidadNueva > 0) {
        await InventarioModelo.crearInventario(conexion, {
          idProducto:  id_producto,
          idUbicacion: id_ubicacion,
          cantidad:    cantidadNueva,
          stockMinimo: null,
          stockMaximo: null
        });
      } // cantidadNueva === 0 → no crear fila

      await InventarioModelo.registrarBitacora(conexion, {
        idProducto:          id_producto,
        idUbicacionOrigen:   cantidad < 0 ? id_ubicacion : null,
        idUbicacionDestino:  cantidad > 0 ? id_ubicacion : null,
        tipo:                'AJUSTE',
        cantidad,
        motivo,
        usuario
      });

      await conexion.commit();
      return { id_producto, id_ubicacion, cantidad_actual: cantidadNueva };
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  // POST: /create-inventory
  static async crearInventario({ id_producto, id_ubicacion, cantidad, stock_minimo, stock_maximo, motivo, usuario }) {
    if (!Number.isInteger(id_producto) || !Number.isInteger(id_ubicacion)) {
      throw new Error('id_producto e id_ubicacion son obligatorios');
    }
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      throw new Error('cantidad debe ser un entero >= 0');
    }
    if (!Number.isInteger(stock_minimo) || stock_minimo < 0) {
      throw new Error('stock_minimo debe ser un entero >= 0');
    }
    if (!Number.isInteger(stock_maximo) || stock_maximo < 0) {
      throw new Error('stock_maximo debe ser un entero >= 0');
    }
    if (stock_minimo > stock_maximo) {
      throw new Error('stock_minimo no puede ser mayor que stock_maximo');
    }

    const datosProducto = await InventarioModelo.obtenerProductoPorId(id_producto);
    if (!datosProducto) throw new Error('Producto no existe');

    const datosUbicacion = await InventarioModelo.obtenerUbicacionPorId(id_ubicacion);
    if (!datosUbicacion) throw new Error('Ubicación no existe');
    if (!datosUbicacion.estado) throw new Error('Ubicación inactiva');
    if (datosUbicacion.capacidad != null && cantidad > datosUbicacion.capacidad) {
      throw new Error('Capacidad de destino excedida');
    }

    const conexion = await conexionBD.getConnection();
    try {
      await conexion.beginTransaction();

      // Insertar (si existe combinación, la restricción UNIQUE disparará error que capturamos)
      await InventarioModelo.crearInventario(conexion, {
        idProducto:  id_producto,
        idUbicacion: id_ubicacion,
        cantidad,
        stockMinimo: stock_minimo,
        stockMaximo: stock_maximo
      });

      // Registrar como AJUSTE positivo (entrada inicial)
      await InventarioModelo.registrarBitacora(conexion, {
        idProducto:         id_producto,
        idUbicacionDestino: id_ubicacion,
        tipo:               'AJUSTE',
        cantidad,
        motivo:             motivo || 'Creación de inventario',
        usuario:            usuario || 'sistema'
      });

      await conexion.commit();
      return {
        id_producto,
        id_ubicacion,
        cantidad_actual: cantidad,
        stock_minimo,
        stock_maximo
      };
    } catch (error) {
      await conexion.rollback();
      if (error && error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe inventario para ese producto en esa ubicación');
      }
      throw error;
    } finally {
      conexion.release();
    }
  }

  // PATCH: /edit-inventory  (solo stock_min/max y/o id_ubicacion; NO cantidad)
  static async editarInventario({ id_inventario, stock_minimo = null, stock_maximo = null, id_ubicacion = null, motivo, usuario }) {
    if (!Number.isInteger(id_inventario) || id_inventario <= 0) {
      throw new Error('id_inventario inválido');
    }
    if (stock_minimo != null && (!Number.isInteger(stock_minimo) || stock_minimo < 0)) {
      throw new Error('stock_minimo debe ser un entero >= 0');
    }
    if (stock_maximo != null && (!Number.isInteger(stock_maximo) || stock_maximo < 0)) {
      throw new Error('stock_maximo debe ser un entero >= 0');
    }
    if (stock_minimo != null && stock_maximo != null && stock_minimo > stock_maximo) {
      throw new Error('stock_minimo no puede ser mayor que stock_maximo');
    }

    const conexion = await conexionBD.getConnection();
    try {
      await conexion.beginTransaction();

      const filaInventario = await InventarioModelo.obtenerFilaPorId(conexion, id_inventario, true);
      if (!filaInventario) throw new Error('Inventario no existe');

      const ubicacionAnterior = filaInventario.id_ubicacion;
      let ubicacionFinal = ubicacionAnterior;

      // Si cambia la ubicación, validar destino
      if (id_ubicacion != null && id_ubicacion !== ubicacionAnterior) {
        const metaUbicacionDestino = await InventarioModelo.obtenerUbicacionPorId(id_ubicacion);
        if (!metaUbicacionDestino) throw new Error('Ubicación destino no existe');
        if (!metaUbicacionDestino.estado) throw new Error('Ubicación destino inactiva');
        if (metaUbicacionDestino.capacidad != null && filaInventario.cantidad_actual > metaUbicacionDestino.capacidad) {
          throw new Error('Capacidad de destino excedida');
        }

        // Evitar duplicado usando la restricción UNIQUE (capturamos ER_DUP_ENTRY abajo)
        ubicacionFinal = id_ubicacion;
      }

      await InventarioModelo.editarInventario(conexion, {
        idInventario: id_inventario,
        stockMinimo:  stock_minimo,
        stockMaximo:  stock_maximo,
        idUbicacion:  id_ubicacion
      });

      // Bitácora: solo si cambió la ubicación y hay stock > 0
      const cambioUbicacion = id_ubicacion != null && id_ubicacion !== ubicacionAnterior;
      if (cambioUbicacion && filaInventario.cantidad_actual > 0) {
        await InventarioModelo.registrarBitacora(conexion, {
          idProducto:         filaInventario.id_producto,
          idUbicacionOrigen:  ubicacionAnterior,
          idUbicacionDestino: id_ubicacion,
          tipo:               'TRANSFERENCIA',
          cantidad:           filaInventario.cantidad_actual,
          motivo:             motivo || 'Edición: cambio de ubicación',
          usuario:            usuario || 'sistema'
        });
      }

      await conexion.commit();

      const [[inventarioActualizado]] = await conexionBD.query(
        `SELECT id_inventario, id_producto, id_ubicacion, cantidad_actual, stock_minimo, stock_maximo
         FROM inventario WHERE id_inventario=?`,
        [id_inventario]
      );

      return inventarioActualizado;
    } catch (error) {
      await conexion.rollback();
      if (error && error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe inventario de ese producto en la ubicación destino');
      }
      throw error;
    } finally {
      conexion.release();
    }
  }

  // POST: /transfer
  static async transferir({ id_producto, id_origen, id_destino, cantidad, motivo, usuario }) {
    if (!Number.isInteger(id_producto) || !Number.isInteger(id_origen) || !Number.isInteger(id_destino)) {
      throw new Error('id_producto, id_origen y id_destino son obligatorios');
    }
    if (id_origen === id_destino) {
      throw new Error('Origen y destino deben ser distintos');
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('cantidad debe ser un entero > 0');
    }
    if (!motivo || !motivo.trim()) {
      throw new Error('motivo es obligatorio');
    }

    const datosProducto = await InventarioModelo.obtenerProductoPorId(id_producto);
    if (!datosProducto) throw new Error('Producto no existe');

    const metaUbicacionOrigen  = await InventarioModelo.obtenerUbicacionPorId(id_origen);
    const metaUbicacionDestino = await InventarioModelo.obtenerUbicacionPorId(id_destino);
    if (!metaUbicacionOrigen)  throw new Error('Ubicación origen no existe');
    if (!metaUbicacionDestino) throw new Error('Ubicación destino no existe');
    if (!metaUbicacionOrigen.estado)  throw new Error('Ubicación origen inactiva');
    if (!metaUbicacionDestino.estado) throw new Error('Ubicación destino inactiva');

    const conexion = await conexionBD.getConnection();
    try {
      await conexion.beginTransaction();

      // Bloqueo consistente de filas para evitar interbloqueos
      const [primeraUbicacion, segundaUbicacion] =
        id_origen < id_destino ? [id_origen, id_destino] : [id_destino, id_origen];

      const filaPrimera = await InventarioModelo
        .obtenerFilaPorProductoUbicacion(conexion, id_producto, primeraUbicacion, true);
      const filaSegunda = await InventarioModelo
        .obtenerFilaPorProductoUbicacion(conexion, id_producto, segundaUbicacion, true);

      const filaOrigen  = (primeraUbicacion === id_origen)  ? filaPrimera : filaSegunda;
      const filaDestino = (primeraUbicacion === id_destino) ? filaPrimera : filaSegunda;

      const cantidadEnOrigen  = filaOrigen  ? filaOrigen.cantidad_actual  : 0;
      const cantidadEnDestino = filaDestino ? filaDestino.cantidad_actual : 0;

      if (cantidadEnOrigen < cantidad) {
        throw new Error('Saldo insuficiente en origen');
      }

      const nuevaCantidadDestino = cantidadEnDestino + cantidad;
      if (metaUbicacionDestino.capacidad != null && nuevaCantidadDestino > metaUbicacionDestino.capacidad) {
        throw new Error('Capacidad de destino excedida');
      }

      if (!filaOrigen) {
        throw new Error('No existe inventario en origen');
      }
      await InventarioModelo.actualizarSoloCantidad(conexion, filaOrigen.id_inventario, cantidadEnOrigen - cantidad);

      if (filaDestino) {
        await InventarioModelo.actualizarSoloCantidad(conexion, filaDestino.id_inventario, nuevaCantidadDestino);
      } else {
        await InventarioModelo.crearInventario(conexion, {
          idProducto:  id_producto,
          idUbicacion: id_destino,
          cantidad:    nuevaCantidadDestino,
          stockMinimo: null,
          stockMaximo: null
        });
      }

      await InventarioModelo.registrarBitacora(conexion, {
        idProducto:         id_producto,
        idUbicacionOrigen:  id_origen,
        idUbicacionDestino: id_destino,
        tipo:               'TRANSFERENCIA',
        cantidad,
        motivo,
        usuario
      });

      await conexion.commit();
      return {
        id_producto,
        origen:  { id_ubicacion: id_origen,  cantidad_actual: cantidadEnOrigen - cantidad },
        destino: { id_ubicacion: id_destino, cantidad_actual: nuevaCantidadDestino }
      };
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }
}

module.exports = InventarioServicio;
