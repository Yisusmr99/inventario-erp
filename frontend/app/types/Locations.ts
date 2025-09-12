// app/types/Locations.ts
export interface LocationApiModel {
  id_ubicacion: number;
  nombre_ubicacion: string;
  descripcion: string | null;
  capacidad: number | null;
  estado: 0 | 1;
  created_at: string;   // "YYYY-MM-DD HH:mm:ss"
  updated_at: string;   // "YYYY-MM-DD HH:mm:ss"
}

export interface Location {
  id: string;
  name: string;
  description: string;          // en UI: '' si null
  capacity: number;             // en UI: 0 si null
  status: 'Activa' | 'Inactiva';
  createdAt: string;            // ISO-like para Date()
  updatedAt: string;
}

export interface GetLocationsRequest {
  page: number;
  limit: number;
  search?: string;              // mapeado a nombre_ubicacion en la API
}

export interface CreateLocationRequest {
  nombre_ubicacion: string;
  descripcion?: string | null;
  capacidad?: number | null;
  estado?: 0 | 1;
}

export interface UpdateLocationRequest {
  nombre_ubicacion: string;
  descripcion?: string | null;
  capacidad?: number | null;
  estado?: 0 | 1;
}

export interface PaginationData {
  locations: Location[];
  totalLocations: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  nextPageUrl?: string | null;
  previousPageUrl?: string | null;
  currentPageUrl?: string | null;
  firstPageUrl?: string | null;
  lastPageUrl?: string | null;
}
