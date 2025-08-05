import { apiClient } from './ApiClient';
import type { ProductCategory, CreateProductCategoryRequest, UpdateProductCategoryRequest,
    PaginationParams, PaginatedResponse
  } from '~/types/ProductCategories';

export class ProductCategoriesApi {
    private static readonly ENDPOINT = '/product-categories';

    /**
     * Get all product categories (simple)
     */
    static async getAll(): Promise<ProductCategory[]> {
        const response = await apiClient.get<ProductCategory[]>(this.ENDPOINT);
        return response.data;
    }

    /**
     * Get all product categories with pagination
     */
    static async getAllWithPagination(params: PaginationParams = {}): Promise<PaginatedResponse> {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);

        const url = queryParams.toString() ? `${this.ENDPOINT}?${queryParams}` : this.ENDPOINT;
        const response = await apiClient.get<PaginatedResponse>(url);
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
