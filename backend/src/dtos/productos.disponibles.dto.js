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

class ListarDisponiblesSimpleDto {
  // GET /api/commerce/products/available
  // Query: pagina|page, limite|limit, con_stock|solo_con_stock, orden
  static validate(query = {}) {
    const pagina = aEnteroOpcional(query.pagina ?? query.page, 'pagina') ?? 1;
    const limite = aEnteroOpcional(query.limite ?? query.limit, 'limite') ?? 10;

    if (pagina <= 0) throw new Error('pagina debe ser > 0');
    if (limite <= 0 || limite > 200) throw new Error('limite debe estar entre 1 y 200');

    const conStock = aBooleanOpcional(query.con_stock ?? query.solo_con_stock);
    const orden = String(query.orden || 'stock_desc').trim();

    // normalizar a valores permitidos
    const ordenPermitido = new Set(['stock_desc', 'stock_asc', 'nombre_asc']);
    if (!ordenPermitido.has(orden)) {
      throw new Error('orden inválido. Use: stock_desc | stock_asc | nombre_asc');
    }

    return {
      pagina,
      limite,
      conStock: conStock === null ? false : conStock,
      orden
    };
  }
}

module.exports = {
  ListarDisponiblesSimpleDto,
};
