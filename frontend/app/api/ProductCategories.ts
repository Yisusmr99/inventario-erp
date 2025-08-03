import { apiClient } from './ApiClient';

export interface ProductCategory {
    id_categoria: number;
    nombre: string;
    descripcion: string;
    estado: number;
    fecha_creacion: string;
}

export interface CreateProductCategoryRequest {
    nombre: string;
    descripcion: string;
    estado?: number;
}

export interface UpdateProductCategoryRequest {
    nombre: string;
    descripcion: string;
    estado: number;
}

export class ProductCategoriesApi {
    private static readonly ENDPOINT = '/product-categories';

    /**
     * Get all product categories
     */
    static async getAll(): Promise<ProductCategory[]> {
        const response = await apiClient.get<ProductCategory[]>(this.ENDPOINT);
        return response.data;
    }

    /**
     * Get a product category by ID
     */
    static async getById(id: number): Promise<ProductCategory> {
        const response = await apiClient.get<ProductCategory>(`${this.ENDPOINT}/${id}`);
        return response.data;
    }

    /**
     * Create a new product category
     */
    static async create(data: CreateProductCategoryRequest): Promise<ProductCategory> {
        const response = await apiClient.post<ProductCategory>(this.ENDPOINT, data);
        return response.data;
    }

    /**
     * Update an existing product category
     */
    static async update(id: number, data: UpdateProductCategoryRequest): Promise<ProductCategory> {
        const response = await apiClient.put<ProductCategory>(`${this.ENDPOINT}/${id}`, data);
        return response.data;
    }

    /**
     * Delete a product category
     */
    static async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.ENDPOINT}/${id}`);
    }
}

// Export individual methods for convenience
export const {
    getAll: getAllCategories,
    getById: getCategoryById,
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory,
} = ProductCategoriesApi;
