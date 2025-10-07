const ProductoDisponibilidadModelo = require('../models/productoDisponibilidad.modelo');

class ProductoDisponibilidadServicio {

  static async listarDisponiblesSimple(parametros) {
    const { pagina, limite, conStock, orden } = parametros;

    const total = await ProductoDisponibilidadModelo.contarDisponiblesSimple({ conStock });
    const totalPaginas = Math.max(1, Math.ceil(total / limite));
    const paginaEfectiva = Math.min(Math.max(1, pagina), totalPaginas);
    const offset = (paginaEfectiva - 1) * limite;

    const productos = await ProductoDisponibilidadModelo.listarDisponiblesSimple({
      offset, limit: limite, conStock, orden
    });

    return {
      productos,
      total,
      pagina: paginaEfectiva,
      totalPaginas,
      tieneSiguiente: paginaEfectiva < totalPaginas,
      tieneAnterior: paginaEfectiva > 1
    };
  }


  static async listarDisponiblesSinPaginacion({ conStock, orden }) {
    return ProductoDisponibilidadModelo.listarDisponiblesSinPaginacion({ conStock, orden });
  }

  // NUEVO: sin paginación + ubicaciones
  static async listarDisponiblesConUbicaciones({ conStock, orden }) {
    return ProductoDisponibilidadModelo.listarDisponiblesConUbicaciones({ conStock, orden });
  }
}

module.exports = ProductoDisponibilidadServicio;
