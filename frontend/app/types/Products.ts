// Product type definitions for the frontend

// UI-friendly Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  categoriaId: number;
  categoriaNombre: string;
  code: string;
  price: number;
  createdAt: string;
  nombre?: string; // Alias for name (for compatibility)
}

// API Product interface (what comes from backend)
export interface ProductApi {
  id_producto: number;
  nombre: string;
  descripcion: string;
  id_categoria: number;
  categoria_nombre: string;
  codigo: string;
  precio: number;
  fecha_creacion: string;
}

// Request interfaces
export interface CreateProductRequest {
  nombre: string;
  descripcion?: string | null;
  codigo: string;
  precio: number;
  id_categoria: number;
}

export interface UpdateProductRequest {
  nombre: string;
  descripcion?: string | null;
  codigo: string;
  precio: number;
  id_categoria: number;
}

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  categoryId?: number;
}

export interface ProductsPaginationData {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
  currentPageUrl: string | null;
  total?: number; // compatibility alias
}
