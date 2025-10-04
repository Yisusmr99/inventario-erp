// src/dtos/reportes.inventario.dto.js

function aEnteroOpcional(valor, nombreCampo) {
  if (valor == null || valor === '') return null;
  const numero = Number(valor);
  if (!Number.isInteger(numero)) throw new Error(`${nombreCampo} debe ser entero`);
  return numero;
}

function aEnteroPositivo(valor, nombreCampo) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) throw new Error(`${nombreCampo} debe ser entero > 0`);
  return numero;
}

function aBooleanoOpcional(valor) {
  if (valor == null || valor === '') return null;
  if (typeof valor === 'boolean') return valor;
  const texto = String(valor).toLowerCase();
  return ['1', 'true', 'sí', 'si', 'yes'].includes(texto);
}

function aFechaISO(valor, nombreCampo, obligatorio = false) {
  if (!valor && !obligatorio) return null;
  const fecha = new Date(String(valor));
  if (Number.isNaN(fecha.getTime())) throw new Error(`${nombreCampo} debe ser una fecha válida`);
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Reporte: niveles y valor actual */
class ReporteNivelesDto {
  static validate(query = {}) {
    const pagina = aEnteroOpcional(query.pagina ?? query.page, 'pagina') ?? 1;
    const limite = aEnteroOpcional(query.limite ?? query.limit, 'limite') ?? 10;
    if (pagina <= 0) throw new Error('pagina debe ser > 0');
    if (limite <= 0 || limite > 200) throw new Error('limite debe estar entre 1 y 200');

    const idCategoria = aEnteroOpcional(query.id_categoria, 'id_categoria');
    const idUbicacion = aEnteroOpcional(query.id_ubicacion, 'id_ubicacion');
    const conStock = aBooleanoOpcional(query.con_stock ?? query.solo_con_stock) ?? false;

    const orden = String(query.orden ?? 'valor_desc').trim();
    const ordenPermitido = new Set(['valor_desc', 'valor_asc', 'stock_desc', 'stock_asc', 'nombre_asc']);
    if (!ordenPermitido.has(orden)) {
      throw new Error('orden inválido. Use: valor_desc | valor_asc | stock_desc | stock_asc | nombre_asc');
    }

    return { pagina, limite, idCategoria, idUbicacion, conStock, orden };
  }
}

/** Reporte: top de movimiento por periodo (basado en bitácora) */
class ReporteTopMovimientosDto {
  static validate(query = {}) {
    const fechaDesde = aFechaISO(query.desde, 'desde', true);
    const fechaHasta = aFechaISO(query.hasta, 'hasta', true);
    const limite = aEnteroPositivo(query.limite ?? 10, 'limite');

    const tipo = String(query.tipo ?? 'ventas').toLowerCase(); // ventas | compras | neto
    const permitidos = new Set(['ventas', 'compras', 'neto']);
    if (!permitidos.has(tipo)) throw new Error('tipo debe ser ventas | compras | neto');

    return { fechaDesde, fechaHasta, limite, tipo };
  }
}

/** Reporte: productos lentos/sin movimiento (basado en bitácora) */
class ReporteLentosDto {
  static validate(query = {}) {
    const limite = aEnteroPositivo(query.limite ?? 10, 'limite');
    const conStock = aBooleanoOpcional(query.con_stock) ?? false;
    return { limite, conStock };
  }
}

module.exports = {
  ReporteNivelesDto,
  ReporteTopMovimientosDto,
  ReporteLentosDto,
};
