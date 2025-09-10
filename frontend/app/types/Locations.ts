/*
// app/types/Locations.ts
export interface LocationApiModel {
  id_ubicacion: number;
  nombre_ubicacion: string;
  descripcion: string;
  capacidad: number;
  estado: number; // 1 = Activa, 0 = Inactiva
  fecha_creacion: string; // ISO
}

export interface Location {
  id: string;                 // ui id
  name: string;               // nombre_ubicacion
  description: string;        // descripcion
  capacity: number;           // capacidad
  status: 'Activa' | 'Inactiva';
  createdAt: string;          // fecha_creacion
}

export interface GetLocationsRequest {
  page: number;
  limit: number;
  search?: string;
}

export interface CreateLocationRequest {
  nombre_ubicacion: string;
  descripcion: string;
  capacidad: number;
  estado?: number; // default 1
}

export interface UpdateLocationRequest {
  nombre_ubicacion: string;
  descripcion: string;
  capacidad: number;
  estado?: number;
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
  */

// app/types/Locations.ts
export interface LocationApiModel {
  id_ubicacion: number;
  nombre_ubicacion: string;
  descripcion: string | null;
  capacidad: number | null;
  estado: 0 | 1;                 // soft delete: 1=activa, 0=inactiva
  created_at: string;            // MySQL DATETIME "YYYY-MM-DD HH:mm:ss"
  updated_at: string;            // MySQL DATETIME
}

export interface Location {
  id: string;
  name: string;
  description: string;
  capacity: number;              // en UI lo tratamos como número (0 si viene null)
  status: 'Activa' | 'Inactiva';
  createdAt: string;             // lo que muestre la UI (string)
  updatedAt: string;
}

export interface GetLocationsRequest {
  page: number;
  limit: number;
  search?: string;
}

export interface CreateLocationRequest {
  nombre_ubicacion: string;
  descripcion?: string | null;
  capacidad?: number | null;
  estado?: 0 | 1;                 // default 1
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

