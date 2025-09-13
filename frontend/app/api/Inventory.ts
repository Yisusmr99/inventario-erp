import { apiClient } from "./ApiClient";

interface Ubicaciones {
    id_ubicacion: number;
    nombre_ubicacion: string;
    estado: number;
    capacidad: number;
}

interface PaginationUbicaciones {
    ubicaciones: Ubicaciones[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export class InventoryApi {

    private static readonly ENDPOINT = "/inventory";


    static async getAllProductsInventory(params: { page?: number; limit?: number; search?: string } = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);

        const response = await apiClient.get(`${this.ENDPOINT}/all-products-inventory?${queryParams.toString()}`);
        return response.data;
    }

    // TODO: Realizar el cambioo del endpoint correcto para obtener todas las ubicaciones
    static async getUbicaciones(): Promise<PaginationUbicaciones> {
        const queryParams = new URLSearchParams();
        queryParams.append("limit", "100"); // Set a default limit
        queryParams.append("page", "1");   // Set a default page

        const response = await apiClient.get<PaginationUbicaciones>(`/ubicaciones?${queryParams.toString()}`);
        return response.data;
    }

    static async createInventoryItem( payload: {
        id_producto: number;
        id_ubicacion: number;
        cantidad: number;
        stock_minimo?: number;
        stock_maximo?: number;
    }) {
        const response = await apiClient.post(`${this.ENDPOINT}/create-inventory`, payload);
        return response.data;
    }

    static async ajustarStock(payload: {
        id_producto: number;
        id_ubicacion: number;
        cantidad: number;
        usuario: string;
        motivo: string;
    }) {
        const response = await apiClient.post(`${this.ENDPOINT}/adjust`, payload);
        return response.data;
    }
}