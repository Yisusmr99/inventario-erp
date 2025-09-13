// app/api/Locations.ts
import { apiClient as ApiClient } from './ApiClient'
import type {
  CreateLocationRequest,
  GetLocationsRequest,
  LocationApiModel,
  PaginationData,
  UpdateLocationRequest,
  Location,
} from '../types/Locations'   // ← FIX ruta

// La base del cliente ya incluye /api desde .env, aquí solo el recurso
const BASE = '/ubicaciones'

// Tipo flexible para evitar 'unknown'
type UbicacionesListResponse = {
  ubicaciones?: LocationApiModel[];
  items?: LocationApiModel[];
  data?: LocationApiModel[];

  totalItems?: number;
  total?: number;
  totalLocations?: number;

  totalPages?: number;
  pages?: number;
  currentPage?: number;
  page?: number;

  nextPageUrl?: string | null;
  previousPageUrl?: string | null;
  currentPageUrl?: string | null;
  firstPageUrl?: string | null;
  lastPageUrl?: string | null;
};

function mysqlToISO(dt: string): string {
  return dt?.includes(' ') ? dt.replace(' ', 'T') : dt
}

const transformApiToLocation = (x: LocationApiModel): Location => ({
  id: String(x.id_ubicacion),
  name: x.nombre_ubicacion,
  description: x.descripcion ?? '',
  capacity: typeof x.capacidad === 'number' ? x.capacidad : 0,
  status: x.estado === 1 ? 'Activa' : 'Inactiva',
  createdAt: mysqlToISO(x.created_at),
  updatedAt: mysqlToISO(x.updated_at),
})

export const LocationsApi = {
  async getAllWithPagination(params: GetLocationsRequest): Promise<PaginationData> {
    // Armamos el querystring manual para no depender de 'params' en el tipo del cliente
    const qs = new URLSearchParams()
    qs.set('page', String(params.page))
    qs.set('limit', String(params.limit))
    if (params.search) qs.set('nombre_ubicacion', params.search)

    const res = await ApiClient.get(`${BASE}?${qs.toString()}`)
    const data = res.data as UbicacionesListResponse   // ← evita 'unknown'

    const items: LocationApiModel[] = data.items ?? data.ubicaciones ?? data.data ?? []
    const page = data.currentPage ?? data.page ?? params.page
    const total = data.totalItems ?? data.total ?? data.totalLocations ?? items.length

    // Calculamos páginas usando el limit enviado desde el front
    const limitUsed = Number(params.limit) || 10
    const pages = Math.max(1, Math.ceil(total / limitUsed))

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
    }
  },

  async create(payload: CreateLocationRequest): Promise<Location> {
    const body: CreateLocationRequest = {
      nombre_ubicacion: payload.nombre_ubicacion,
      descripcion: payload.descripcion?.trim() ? payload.descripcion : null,
      capacidad: typeof payload.capacidad === 'number' ? payload.capacidad : null,
      estado: payload.estado ?? 1,
    }
    const res = await ApiClient.post(`${BASE}`, body)
    const data = res.data as LocationApiModel
    return transformApiToLocation(data)
  },

  async update(id: number, payload: UpdateLocationRequest): Promise<Location> {
    const body: UpdateLocationRequest = {
      nombre_ubicacion: payload.nombre_ubicacion,
      descripcion: payload.descripcion?.trim() ? payload.descripcion : null,
      capacidad: typeof payload.capacidad === 'number' ? payload.capacidad : null,
      estado: payload.estado,
    }
    const res = await ApiClient.put(`${BASE}/${id}`, body)
    const data = res.data as LocationApiModel
    return transformApiToLocation(data)
  },

  async setEstado(id: number, estado: 0 | 1): Promise<Location> {
    const nEstado = Number(estado)
    try {
      const res = await ApiClient.patch(`${BASE}/${id}/estado`, { estado: nEstado })
      const data = res.data as LocationApiModel
      return transformApiToLocation(data)
    } catch (e1) {
      // Fallbacks por si el backend usa otra firma
      const attempts: Array<{ m: 'patch' | 'put'; url: string; body: any }> = [
        { m: 'patch', url: `${BASE}/${id}`,        body: { estado: nEstado } },
        { m: 'put',   url: `${BASE}/${id}/estado`, body: { estado: nEstado } },
        { m: 'put',   url: `${BASE}/${id}`,        body: { estado: nEstado } },
        { m: 'patch', url: `${BASE}/${id}/estado`, body: { newEstado: nEstado } },
      ]
      for (const a of attempts) {
        try {
          const res2 = await (a.m === 'patch'
            ? ApiClient.patch(a.url, a.body)
            : ApiClient.put(a.url, a.body))
          const data2 = res2.data as LocationApiModel
          return transformApiToLocation(data2)
        } catch { /* sigue intentando */ }
      }
      throw e1
    }
  },

  async delete(id: number): Promise<{ ok: boolean }> {
    await this.setEstado(id, 0)
    return { ok: true }
  },
}
