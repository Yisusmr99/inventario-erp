import ApiClient from './ApiClient';

export interface FastMover {
  id_producto: number;
  nombre: string;
  stock_total: number;
  fecha_ultimo_movimiento: string;
  dias_sin_movimiento: number;
}

export interface SlowMover {
  id_producto: number;
  nombre: string;
  stock_total: number;
  fecha_ultimo_movimiento: string;
  dias_sin_movimiento: number;
}

export interface TopMover {
  id_producto: number;
  nombre: string;
  unidades_movidas: number;
  valor_movido: number;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T[];
}

class ReportsApi {
  private api: ApiClient;

  constructor() {
    this.api = new ApiClient();
  }

  async getFastMovers(limite: number = 10, con_stock: number = 1): Promise<ApiResponse<FastMover>> {
    return this.api.get(`/reports/inventory/fast-movers?limite=${limite}&con_stock=${con_stock}`);
  }

  async getSlowMovers(limite: number = 10, con_stock: number = 1): Promise<ApiResponse<SlowMover>> {
    return this.api.get(`/reports/inventory/slow-movers?limite=${limite}&con_stock=${con_stock}`);
  }

  async getTopMovers(
    desde: string, 
    hasta: string, 
    tipo: string = 'ventas', 
    limite: number = 10
  ): Promise<ApiResponse<TopMover>> {
    return this.api.get(
      `/reports/inventory/top-movers?desde=${desde}&hasta=${hasta}&tipo=${tipo}&limite=${limite}`
    );
  }
}

export default new ReportsApi();
