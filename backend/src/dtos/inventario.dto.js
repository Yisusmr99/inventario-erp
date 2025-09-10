// src/dtos/inventario.dto.js
function convertirAEntero(valor, nombreCampo) {
  let valorConvertido = valor;
  if (typeof valorConvertido === 'string' && valorConvertido.trim() !== '') {
    valorConvertido = Number(valorConvertido);
  }
  if (!Number.isInteger(valorConvertido)) {
    throw new Error(`${nombreCampo} debe ser un entero`);
  }
  return valorConvertido;
}

function convertirAEnteroNoNegativo(valor, nombreCampo) {
  const numero = convertirAEntero(valor, nombreCampo);
  if (numero < 0) {
    throw new Error(`${nombreCampo} debe ser un entero >= 0`);
  }
  return numero;
}

function convertirAEnteroPositivo(valor, nombreCampo) {
  const numero = convertirAEntero(valor, nombreCampo);
  if (numero <= 0) {
    throw new Error(`${nombreCampo} debe ser un entero > 0`);
  }
  return numero;
}

function exigirCadenaNoVacia(valor, nombreCampo) {
  if (typeof valor !== 'string') {
    throw new Error(`${nombreCampo} es obligatorio`);
  }
  const cadena = valor.trim();
  if (!cadena) {
    throw new Error(`${nombreCampo} no puede estar vacío`);
  }
  return cadena;
}

function cadenaOpcionalPorDefecto(valor, valorPorDefecto = 'sistema') {
  if (valor == null) return valorPorDefecto;
  const normalizada = String(valor).trim();
  return normalizada || valorPorDefecto;
}

// ---------- DTOs ----------
class AjusteInventarioDto {
  /**
   * POST /api/inventory/adjust
   * - id_producto (entero)
   * - id_ubicacion (entero)
   * - cantidad (entero ≠ 0) → positivo suma, negativo resta
   * - motivo (string obligatorio)
   * - usuario (string opcional, por defecto 'sistema')
   */
  static validate(cuerpo = {}) {
    const id_producto  = convertirAEntero(cuerpo.id_producto, 'id_producto');
    const id_ubicacion = convertirAEntero(cuerpo.id_ubicacion, 'id_ubicacion');
    const cantidad     = convertirAEntero(cuerpo.cantidad, 'cantidad');
    if (cantidad === 0) {
      throw new Error('cantidad debe ser un entero distinto de 0');
    }
    const motivo  = exigirCadenaNoVacia(cuerpo.motivo, 'motivo');
    const usuario = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');

    return { id_producto, id_ubicacion, cantidad, motivo, usuario };
  }
}

class CrearInventarioDto {
  /**
   * POST /api/inventory/create-inventory
   * - id_producto (entero)
   * - id_ubicacion (entero)
   * - cantidad (entero >= 0)
   * - stock_minimo (entero >= 0)
   * - stock_maximo (entero >= 0) y stock_minimo <= stock_maximo
   * - motivo (string opcional)
   * - usuario (string opcional, por defecto 'sistema')
   */
  static validate(cuerpo = {}) {
    const id_producto  = convertirAEntero(cuerpo.id_producto, 'id_producto');
    const id_ubicacion = convertirAEntero(cuerpo.id_ubicacion, 'id_ubicacion');
    const cantidad     = convertirAEnteroNoNegativo(cuerpo.cantidad, 'cantidad');
    const stock_minimo = convertirAEnteroNoNegativo(cuerpo.stock_minimo, 'stock_minimo');
    const stock_maximo = convertirAEnteroNoNegativo(cuerpo.stock_maximo, 'stock_maximo');

    if (stock_minimo > stock_maximo) {
      throw new Error('stock_minimo no puede ser mayor que stock_maximo');
    }

    const motivo  = cuerpo.motivo != null ? String(cuerpo.motivo).trim() : undefined;
    const usuario = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');

    return { id_producto, id_ubicacion, cantidad, stock_minimo, stock_maximo, motivo, usuario };
  }
}

class EditarInventarioDto {
  /**
   * PATCH /api/inventory/edit-inventory
   * - id_inventario (entero)
   * - cualquiera de: stock_minimo, stock_maximo, id_ubicacion
   * - NO acepta 'cantidad' (eso es por /adjust)
   */
  static validate(cuerpo = {}) {
    const id_inventario = convertirAEntero(cuerpo.id_inventario, 'id_inventario');

    if (Object.prototype.hasOwnProperty.call(cuerpo, 'cantidad')) {
      throw new Error('Este endpoint no permite editar cantidad_actual; usa /api/inventory/adjust');
    }

    let stock_minimo = null;
    let stock_maximo = null;
    let id_ubicacion = null;
    let cantidadCamposAEditar = 0;

    if (cuerpo.stock_minimo != null) {
      stock_minimo = convertirAEnteroNoNegativo(cuerpo.stock_minimo, 'stock_minimo');
      cantidadCamposAEditar++;
    }
    if (cuerpo.stock_maximo != null) {
      stock_maximo = convertirAEnteroNoNegativo(cuerpo.stock_maximo, 'stock_maximo');
      cantidadCamposAEditar++;
    }
    if (stock_minimo != null && stock_maximo != null && stock_minimo > stock_maximo) {
      throw new Error('stock_minimo no puede ser mayor que stock_maximo');
    }
    if (cuerpo.id_ubicacion != null) {
      id_ubicacion = convertirAEntero(cuerpo.id_ubicacion, 'id_ubicacion');
      cantidadCamposAEditar++;
    }

    if (cantidadCamposAEditar === 0) {
      throw new Error('Debe enviar al menos uno de: stock_minimo, stock_maximo, id_ubicacion');
    }

    const motivo  = cuerpo.motivo != null ? String(cuerpo.motivo).trim() : undefined;
    const usuario = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');

    return { id_inventario, stock_minimo, stock_maximo, id_ubicacion, motivo, usuario };
  }
}

class TransferirInventarioDto {
  /**
   * POST /api/inventory/transfer
   * - id_producto (entero)
   * - id_origen (entero)
   * - id_destino (entero, distinto a id_origen)
   * - cantidad (entero > 0)
   * - motivo (string obligatorio)
   * - usuario (string opcional, por defecto 'sistema')
   */
  static validate(cuerpo = {}) {
    const id_producto = convertirAEntero(cuerpo.id_producto, 'id_producto');
    const id_origen   = convertirAEntero(cuerpo.id_origen, 'id_origen');
    const id_destino  = convertirAEntero(cuerpo.id_destino, 'id_destino');

    if (id_origen === id_destino) {
      throw new Error('id_origen y id_destino deben ser distintos');
    }

    const cantidad = convertirAEnteroPositivo(cuerpo.cantidad, 'cantidad');
    const motivo   = exigirCadenaNoVacia(cuerpo.motivo, 'motivo');
    const usuario  = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');

    return { id_producto, id_origen, id_destino, cantidad, motivo, usuario };
  }
}

class ParametroProductoDto {
  /**
   * Valida :idProducto en la ruta (GET /by-product/:idProducto)
   */
  static validate(parametros = {}) {
    const idProducto = convertirAEntero(parametros.idProducto, 'idProducto');
    return { idProducto };
  }
}

module.exports = {
  AjusteInventarioDto,
  CrearInventarioDto,
  EditarInventarioDto,
  TransferirInventarioDto,
  ParametroProductoDto,
};
