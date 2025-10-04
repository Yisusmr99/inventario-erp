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

function enteroOpcionalNoNegativo(valor, nombre) {
  if (valor == null || valor === '') return null;
  return convertirAEnteroNoNegativo(valor, nombre);
}

// ---------- DTOs ----------
class AjusteInventarioDto {
  // POST /api/inventory/adjust
  static validate(cuerpo = {}) {
    const id_producto  = convertirAEntero(cuerpo.id_producto, 'id_producto');
    const id_ubicacion = convertirAEntero(cuerpo.id_ubicacion, 'id_ubicacion');
    const cantidad     = convertirAEntero(cuerpo.cantidad, 'cantidad');
    if (cantidad === 0) throw new Error('cantidad debe ser un entero distinto de 0');
    const motivo  = exigirCadenaNoVacia(cuerpo.motivo, 'motivo');
    const usuario = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');
    return { id_producto, id_ubicacion, cantidad, motivo, usuario };
  }
}

class CrearInventarioDto {
  // POST /api/inventory/create-inventory
  static validate(cuerpo = {}) {
    const id_producto   = convertirAEntero(cuerpo.id_producto, 'id_producto');
    const id_ubicacion  = convertirAEntero(cuerpo.id_ubicacion, 'id_ubicacion');
    const cantidad      = convertirAEnteroNoNegativo(cuerpo.cantidad, 'cantidad');

    const punto_reorden = enteroOpcionalNoNegativo(cuerpo.punto_reorden, 'punto_reorden');
    const stock_minimo  = enteroOpcionalNoNegativo(cuerpo.stock_minimo, 'stock_minimo');
    const stock_maximo  = enteroOpcionalNoNegativo(cuerpo.stock_maximo, 'stock_maximo');

    if (stock_minimo != null && stock_maximo != null && stock_minimo > stock_maximo) {
      throw new Error('stock_minimo no puede ser mayor que stock_maximo');
    }
    if (punto_reorden != null) {
      if (stock_minimo != null && punto_reorden < stock_minimo)
        throw new Error('punto_reorden no puede ser menor que stock_minimo');
      if (stock_maximo != null && punto_reorden > stock_maximo)
        throw new Error('punto_reorden no puede ser mayor que stock_maximo');
    }

    const motivo  = cuerpo.motivo != null ? String(cuerpo.motivo).trim() : undefined;
    const usuario = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');

    return { id_producto, id_ubicacion, cantidad, punto_reorden, stock_minimo, stock_maximo, motivo, usuario };
  }
}

class EditarInventarioDto {
  // PATCH /api/inventory/edit-inventory (NO cantidad)
  static validate(cuerpo = {}) {
    const id_inventario = convertirAEntero(cuerpo.id_inventario, 'id_inventario');

    if (Object.prototype.hasOwnProperty.call(cuerpo, 'cantidad')) {
      throw new Error('Este endpoint no permite editar cantidad_actual; usa /api/inventory/adjust');
    }

    let punto_reorden = null;
    let stock_minimo  = null;
    let stock_maximo  = null;
    let id_ubicacion  = null;
    let campos = 0;

    if (cuerpo.punto_reorden != null) {
      punto_reorden = convertirAEnteroNoNegativo(cuerpo.punto_reorden, 'punto_reorden');
      campos++;
    }
    if (cuerpo.stock_minimo != null) {
      stock_minimo = convertirAEnteroNoNegativo(cuerpo.stock_minimo, 'stock_minimo');
      campos++;
    }
    if (cuerpo.stock_maximo != null) {
      stock_maximo = convertirAEnteroNoNegativo(cuerpo.stock_maximo, 'stock_maximo');
      campos++;
    }
    if (stock_minimo != null && stock_maximo != null && stock_minimo > stock_maximo) {
      throw new Error('stock_minimo no puede ser mayor que stock_maximo');
    }
    if (punto_reorden != null) {
      if (stock_minimo != null && punto_reorden < stock_minimo)
        throw new Error('punto_reorden no puede ser menor que stock_minimo');
      if (stock_maximo != null && punto_reorden > stock_maximo)
        throw new Error('punto_reorden no puede ser mayor que stock_maximo');
    }

    if (cuerpo.id_ubicacion != null) {
      id_ubicacion = convertirAEntero(cuerpo.id_ubicacion, 'id_ubicacion');
      campos++;
    }

    if (campos === 0) {
      throw new Error('Debe enviar al menos uno de: punto_reorden, stock_minimo, stock_maximo, id_ubicacion');
    }

    const motivo  = cuerpo.motivo != null ? String(cuerpo.motivo).trim() : undefined;
    const usuario = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');

    return { id_inventario, punto_reorden, stock_minimo, stock_maximo, id_ubicacion, motivo, usuario };
  }
}

class TransferirInventarioDto {
  // POST /api/inventory/transfer
  static validate(cuerpo = {}) {
    const id_producto = convertirAEntero(cuerpo.id_producto, 'id_producto');
    const id_origen   = convertirAEntero(cuerpo.id_origen, 'id_origen');
    const id_destino  = convertirAEntero(cuerpo.id_destino, 'id_destino');
    if (id_origen === id_destino) throw new Error('id_origen y id_destino deben ser distintos');
    const cantidad = convertirAEnteroPositivo(cuerpo.cantidad, 'cantidad');
    const motivo   = exigirCadenaNoVacia(cuerpo.motivo, 'motivo');
    const usuario  = cadenaOpcionalPorDefecto(cuerpo.usuario, 'sistema');
    return { id_producto, id_origen, id_destino, cantidad, motivo, usuario };
  }
}

class ParametroProductoDto {
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
