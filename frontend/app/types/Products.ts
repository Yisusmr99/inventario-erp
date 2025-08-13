// frontend/app/types/Products.ts

// Lo que envía el backend
export interface ProductApi {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  id_categoria: number;
  categoria_nombre?: string;
  codigo: string;
  precio: number;
  fecha_creacion?: string;
}

// Lo que usa la UI
export interface Product {
  id: string;
  name: string;
  description: string | null;
  categoriaId: number;
  categoriaNombre?: string;
  code: string;
  price: number;
  createdAt?: string;
}

// Parámetros de paginación/filtro en la UI
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;     // se enviará como ?name=
  categoryId?: number; // ?categoryId=
  code?: string;       // ?code=
}

// Respuesta paginada para la UI
export interface ProductsPaginationData {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPageUrl?: string | null;
  previousPageUrl?: string | null;
  currentPageUrl?: string | null;
}
