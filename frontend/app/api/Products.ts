import { apiClient } from './ApiClient';
import type { ProductApi, ProductsPaginationData } from '~/types/Products';

interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    code?: string;  // Cambiado de 'codigo' a 'code' para ser consistente
}

export const ProductsApi = {
    async getAllWithPagination(params: GetProductsParams = {}): Promise<ProductsPaginationData> {
        const q = new URLSearchParams();
        if (params.page) q.set('page', String(params.page));
        if (params.limit) q.set('limit', String(params.limit));
        // Nota: El backend espera 'nombre', no 'search'.
        // Se corrigió en el backend para aceptar 'search' y mapearlo a 'nombre'.
        if (params.search) q.set('search', params.search);
        if (typeof params.categoryId === 'number') q.set('categoryId', String(params.categoryId));
        // El parámetro correcto para código
        if (params.code) q.set('code', params.code);

        const endpoint = `/products${q.toString() ? `?${q.toString()}` : ''}`;
        const { data } = await apiClient.get<ProductsPaginationData>(endpoint);
        return data;
    },

    // NUEVO: Método para obtener un producto por su ID
    async getById(id: number): Promise<ProductApi> {
        const { data } = await apiClient.get<ProductApi>(`/products/${id}`);
        return data;
    },

    async create(payload: Partial<ProductApi>): Promise<ProductApi> {
        // Se envía el payload tal cual, con los nombres 'name', 'code', 'price', etc.
        // El backend ahora está preparado para recibirlos y mapearlos.
        const { data } = await apiClient.post<ProductApi>('/products', payload);
        return data;
    },

    async update(id: number, payload: Partial<ProductApi>): Promise<ProductApi> {
        const { data } = await apiClient.put<ProductApi>(`/products/${id}`, payload);
        return data;
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/products/${id}`);
    },

    async getAll(): Promise<ProductApi[]> {
        const { data } = await apiClient.get<ProductApi[]>('/products/all');
        return data;
    }
};