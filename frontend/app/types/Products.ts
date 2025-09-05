// frontend/app/api/Products.ts
import type {
  PaginationParams,
  Product,
  ProductApi,
  ProductsPaginationData,
} from '~/types/Products'

// Mapper API -> UI
const toProduct = (api: ProductApi): Product => ({
  id: String(api.id_producto),
  name: api.nombre,
  description: api.descripcion,
  categoriaId: api.id_categoria,
  categoriaNombre: api.categoria_nombre,
  code: api.codigo,
  price: api.precio,
  createdAt: api.fecha_creacion,
})

// Mapper UI -> API (para crear/actualizar)
type UiPayload = {
  name: string
  description?: string | null
  code: string
  price: number
  categoriaId: number
}
const toApiPayload = (ui: UiPayload) => ({
  nombre: ui.name,
  descripcion: ui.description ?? null,
  codigo: ui.code,
  precio: ui.price,
  id_categoria: ui.categoriaId,
})

// Mapea params UI -> querystring del backend
const mapParams = (p: PaginationParams = {}) => {
  const params = new URLSearchParams()

  if (p.page) params.set('page', String(p.page))
  if (p.limit) params.set('limit', String(p.limit))

  // UI.search -> ?name= (según tu comentario en types)
  if (p.search && p.search.trim()) params.set('name', p.search.trim())

  // UI.code -> ?codigo=
  if (p.code && p.code.trim()) params.set('codigo', p.code.trim())

  // UI.categoryId -> ?id_categoria=
  if (p.categoryId) params.set('id_categoria', String(p.categoryId))

  return params
}

export const ProductsApi = {
  async getAllWithPagination(p: PaginationParams = {}): Promise<ProductsPaginationData> {
    const qs = mapParams(p).toString()
    const res = await fetch(`/api/productos?${qs}`)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al listar productos`)
    }

    // Ajusta a tu shape real del backend si cambia algún nombre
    const raw = await res.json() as {
      products?: ProductApi[]
      data?: ProductApi[] // por si el backend usa 'data'
      totalProducts?: number
      total?: number
      totalPages?: number
      currentPage?: number
      hasNextPage?: boolean
      hasPreviousPage?: boolean
      nextPageUrl?: string | null
      previousPageUrl?: string | null
      currentPageUrl?: string | null
    }

    const list = (raw.products ?? raw.data ?? []) as ProductApi[]
    const products = list.map(toProduct)

    return {
      products,
      totalProducts: raw.totalProducts ?? raw.total ?? products.length,
      totalPages: raw.totalPages ?? 1,
      currentPage: raw.currentPage ?? (p.page ?? 1),
      hasNextPage: raw.hasNextPage ?? false,
      hasPreviousPage: raw.hasPreviousPage ?? false,
      nextPageUrl: raw.nextPageUrl ?? null,
      previousPageUrl: raw.previousPageUrl ?? null,
      currentPageUrl: raw.currentPageUrl ?? null,
    }
  },

  async getById(id: number): Promise<Product> {
    const res = await fetch(`/api/productos/${id}`)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al obtener producto ${id}`)
    }
    const api = (await res.json()) as ProductApi
    return toProduct(api)
  },

  async create(data: UiPayload): Promise<void> {
    const res = await fetch(`/api/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiPayload(data)),
    })
    if (!res.ok) {
      const msg = await safeText(res)
      throw new Error(`HTTP ${res.status} al crear producto: ${msg}`)
    }
  },

  async update(id: number, data: UiPayload): Promise<void> {
    const res = await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiPayload(data)),
    })
    if (!res.ok) {
      const msg = await safeText(res)
      throw new Error(`HTTP ${res.status} al actualizar producto ${id}: ${msg}`)
    }
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const msg = await safeText(res)
      throw new Error(`HTTP ${res.status} al eliminar producto ${id}: ${msg}`)
    }
  },
}

// Helper: intenta leer texto de error del backend
async function safeText(res: Response) {
  try { return await res.text() } catch { return '' }
}
