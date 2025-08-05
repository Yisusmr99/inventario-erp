export interface Category {
    id: string
    name: string
    description: string
    status: 'Activa' | 'Inactiva'
    productCount: number
    createdAt: string
}

export interface PaginationData {
    categories: Category[]
    totalCategories: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextPage: number | null
    previousPage: number | null
    nextPageUrl: string | null
    previousPageUrl: string | null
    currentPageUrl: string
    firstPageUrl: string
    lastPageUrl: string | null
}

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

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginatedResponse {
    categories: ProductCategory[];
    totalCategories: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
    currentPageUrl: string;
    firstPageUrl: string;
    lastPageUrl: string | null;
}