/*
// app/api/Locations.ts
import ApiClient from 'app/api/ApiClient';
import type {
  CreateLocationRequest,
  GetLocationsRequest,
  LocationApiModel,
  PaginationData,
  UpdateLocationRequest,
  Location,
} from 'app/types/Locations'; //Removed @/app/types...

// Ajustaré el prefijo si nuestro backend expone /api/ubicaciones
const BASE = '/api/locations';

const transformApiToLocation = (x: LocationApiModel): Location => ({
  id: x.id_ubicacion.toString(),
  name: x.nombre_ubicacion,
  description: x.descripcion,
  capacity: x.capacidad,
  status: x.estado === 1 ? 'Activa' : 'Inactiva',
  createdAt: x.fecha_creacion,
});

export const LocationsApi = {
  async getAllWithPagination(params: GetLocationsRequest): Promise<PaginationData> {
    const { data } = await ApiClient.get(`${BASE}`, { params });
    // Se asume formato similar al de categorías
    // {
    //   items: LocationApiModel[],
    //   totalItems, totalPages, currentPage,
    //   hasNextPage, hasPreviousPage, nextPage, previousPage, ...urls
    // }
    const items: LocationApiModel[] = data.items ?? data.locations ?? data.result ?? [];
    return {
      locations: items.map(transformApiToLocation),
      totalLocations: data.totalItems ?? data.totalLocations ?? 0,
      totalPages: data.totalPages ?? 0,
      currentPage: data.currentPage ?? params.page,
      hasNextPage: !!data.hasNextPage,
      hasPreviousPage: !!data.hasPreviousPage,
      nextPage: data.nextPage ?? null,
      previousPage: data.previousPage ?? null,
      nextPageUrl: data.nextPageUrl ?? null,
      previousPageUrl: data.previousPageUrl ?? null,
      currentPageUrl: data.currentPageUrl ?? null,
      firstPageUrl: data.firstPageUrl ?? null,
      lastPageUrl: data.lastPageUrl ?? null,
    };
  },

  async create(payload: CreateLocationRequest): Promise<Location> {
    const { data } = await ApiClient.post(`${BASE}`, payload);
    return transformApiToLocation(data);
  },

  async update(id: number, payload: UpdateLocationRequest): Promise<Location> {
    const { data } = await ApiClient.put(`${BASE}/${id}`, payload);
    return transformApiToLocation(data);
  },

  async delete(id: number): Promise<{ ok: boolean }> {
    const { data } = await ApiClient.delete(`${BASE}/${id}`);
    return data;
  },
};
*/
// app/api/Locations.ts
import ApiClient from './ApiClient';
import type {
  CreateLocationRequest,
  GetLocationsRequest,
  LocationApiModel,
  PaginationData,
  UpdateLocationRequest,
  Location,
} from '../types/Locations';

const BASE = '/api/ubicaciones'; // ← cambia aquí si tu backend usa otro path

function mysqlToISO(dt: string): string {
  // "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
  return dt?.includes(' ') ? dt.replace(' ', 'T') : dt;
}

const transformApiToLocation = (x: LocationApiModel): Location => ({
  id: String(x.id_ubicacion),
  name: x.nombre_ubicacion,
  description: x.descripcion ?? '',
  capacity: typeof x.capacidad === 'number' ? x.capacidad : 0,
  status: x.estado === 1 ? 'Activa' : 'Inactiva',
  createdAt: mysqlToISO(x.created_at),
  updatedAt: mysqlToISO(x.updated_at),
});

export const LocationsApi = {
  async getAllWithPagination(params: GetLocationsRequest): Promise<PaginationData> {
    const { data } = await ApiClient.get(`${BASE}`, { params: {
      page: params.page,
      limit: params.limit,
      search: params.search ?? undefined
    }});

    // Adapta a distintos shapes sin romper
    const items: LocationApiModel[] = data.items ?? data.data ?? data.locations ?? [];
    const page = data.currentPage ?? data.page ?? params.page;
    const total = data.totalItems ?? data.total ?? data.totalLocations ?? items.length;
    const pages = data.totalPages ?? data.pages ?? Math.max(1, Math.ceil(total / (params.limit || 1)));

    return {
      locations: items.map(transformApiToLocation),
      totalLocations: total,
      totalPages: pages,
      currentPage: page,
      hasNextPage: page < pages,
      hasPreviousPage: page > 1,
      nextPage: page < pages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      nextPageUrl: data.nextPageUrl ?? null,
      previousPageUrl: data.previousPageUrl ?? null,
      currentPageUrl: data.currentPageUrl ?? null,
      firstPageUrl: data.firstPageUrl ?? null,
      lastPageUrl: data.lastPageUrl ?? null,
    };
  },

  async create(payload: CreateLocationRequest): Promise<Location> {
    // normalizamos opcionales: '' -> null, NaN -> null
    const body: CreateLocationRequest = {
      nombre_ubicacion: payload.nombre_ubicacion,
      descripcion: payload.descripcion?.trim() ? payload.descripcion : null,
      capacidad: typeof payload.capacidad === 'number' ? payload.capacidad : null,
      estado: payload.estado ?? 1,
    };
    const { data } = await ApiClient.post(`${BASE}`, body);
    return transformApiToLocation(data);
  },

  async update(id: number, payload: UpdateLocationRequest): Promise<Location> {
    const body: UpdateLocationRequest = {
      nombre_ubicacion: payload.nombre_ubicacion,
      descripcion: payload.descripcion?.trim() ? payload.descripcion : null,
      capacidad: typeof payload.capacidad === 'number' ? payload.capacidad : null,
      estado: payload.estado,
    };
    const { data } = await ApiClient.put(`${BASE}/${id}`, body);
    return transformApiToLocation(data);
  },

  // Soft delete / toggle estado
  async setEstado(id: number, estado: 0 | 1): Promise<Location> {
    // Si el backend tiene PATCH /api/ubicaciones/:id/estado usa eso;
    // si no, un PUT parcial al recurso también funciona.
    try {
      const { data } = await ApiClient.patch(`${BASE}/${id}/estado`, { estado });
      return transformApiToLocation(data);
    } catch {
      const { data } = await ApiClient.patch(`${BASE}/${id}`, { estado });
      return transformApiToLocation(data);
    }
  },

  // Si el backend expone DELETE, lo dejamos por compatibilidad (opcional)
  async delete(id: number): Promise<{ ok: boolean }> {
    const { data } = await ApiClient.delete(`${BASE}/${id}`);
    return data;
  },
};
