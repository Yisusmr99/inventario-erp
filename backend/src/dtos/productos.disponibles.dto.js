function aEnteroOpcional(valor, nombreCampo) {
  if (valor == null || valor === '') return null;
  const n = Number(valor);
  if (!Number.isInteger(n)) throw new Error(`${nombreCampo} debe ser entero`);
  return n;
}

function aBooleanOpcional(valor) {
  if (valor == null || valor === '') return null;
  if (typeof valor === 'boolean') return valor;
  const s = String(valor).toLowerCase();
  return ['1', 'true', 'sí', 'si', 'yes'].includes(s);
}

function normalizarOrden(orden) {
  const o = String(orden || 'stock_desc').trim();
  const permitidos = new Set(['stock_desc', 'stock_asc', 'nombre_asc']);
  if (!permitidos.has(o)) {
    throw new Error('orden inválido. Use: stock_desc | stock_asc | nombre_asc');
  }
  return o;
}

class ListarDisponiblesSimpleDto {
  // GET /api/commerce/products/available (paginado)
  static validate(query = {}) {
    const pagina = aEnteroOpcional(query.pagina ?? query.page, 'pagina') ?? 1;
    const limite = aEnteroOpcional(query.limite ?? query.limit, 'limite') ?? 10;

    if (pagina <= 0) throw new Error('pagina debe ser > 0');
    if (limite <= 0 || limite > 200) throw new Error('limite debe estar entre 1 y 200');

    const conStock = aBooleanOpcional(query.con_stock ?? query.solo_con_stock);
    const orden = normalizarOrden(query.orden);

    return {
      pagina,
      limite,
      conStock: conStock === null ? false : conStock,
      orden
    };
  }
}

// Nuevo DTO para endpoints SIN paginación
class ListarSinPaginacionDto {
  // GET /api/commerce/products/available/all
  // GET /api/commerce/products/available/with-locations
  static validate(query = {}) {
    const conStock = aBooleanOpcional(query.con_stock ?? query.solo_con_stock);
    const orden = normalizarOrden(query.orden);
    return {
      conStock: conStock === null ? false : conStock,
      orden
    };
  }
}

module.exports = {
  ListarDisponiblesSimpleDto,
  ListarSinPaginacionDto
};
