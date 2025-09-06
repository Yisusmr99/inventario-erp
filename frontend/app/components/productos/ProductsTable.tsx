import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProductsApi as ApiProductsApi } from '../../api/Products';
import { ProductCategoriesApi } from '../../api/ProductCategories';
import type { Product, ProductApi, CreateProductRequest, UpdateProductRequest } from '../../types/Products';
import DeleteProductDialog from './DeleteProductDialog';
import ProductsTableContent from './ProductsTableContent';
import ProductForm from './ProductForm';

type FetchState = {
  loading: boolean;
  error: string | null;
};

type CategoryOption = { id: number; nombre: string };

// Transform API data to UI format
const transformProduct = (api: ProductApi): Product => ({
  id: String(api.id_producto),
  name: api.nombre,
  description: api.descripcion,
  categoriaId: api.id_categoria,
  categoriaNombre: api.categoria_nombre || '',
  code: api.codigo,
  price: api.precio,
  createdAt: api.fecha_creacion,
  nombre: api.nombre, // alias for compatibility
});

const DEFAULT_PAGE_SIZE = 8;

/**
 * Genera un rango paginado tipo: 1 ... 4 5 6 ... 20
 */
function usePageNumbers(current: number, total: number, delta = 1) {
  return useMemo(() => {
    if (total <= 1) return [1];

    const pages: (number | 'dots')[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    pages.push(1);
    if (left > 2) pages.push('dots');

    for (let p = left; p <= right; p++) {
      pages.push(p);
    }

    if (right < total - 1) pages.push('dots');
    pages.push(total);

    return pages;
  }, [current, total, delta]);
}

export default function ProductsTable() {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [state, setState] = useState<FetchState>({ loading: false, error: null });

  // Filtros
  const [search, setSearch] = useState<string>('');
  const [code, setCode] = useState<string>('');

  // FILTRO: categoría con autocomplete
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string>('');
  const [catFilterSuggestions, setCatFilterSuggestions] = useState<CategoryOption[]>([]);
  const [showCatFilterSug, setShowCatFilterSug] = useState(false);
  const catFilterDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedCode, setDebouncedCode] = useState(code);

  // Modal crear/editar
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Búsqueda de categorías
  async function searchCategories(query: string) {
    try {
      const res = await ProductCategoriesApi.getAllWithPagination({
        page: 1,
        limit: 10,
        search: query,
      });
      const opts: CategoryOption[] = (res?.categories || []).map((c: any) => ({
        id: c.id_categoria,
        nombre: c.nombre,
      }));
      return opts;
    } catch {
      return [];
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCode(code), 300);
    return () => clearTimeout(t);
  }, [code]);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      code: debouncedCode || undefined,  // Cambiado de 'code' a 'code' (ya era correcto)
      categoryId, // Cambiado de 'categoryId' a 'categoryId' (ya era correcto)
    }),
    [page, limit, debouncedSearch, debouncedCode, categoryId],
  );

  const load = async () => {
    try {
      setState({ loading: true, error: null });
      const data = await ApiProductsApi.getAllWithPagination(queryParams);
      setItems(data.products);
      setTotalPages(data.totalPages);
      setTotalProducts(data.totalItems ?? data.total ?? 0); // si tu API lo trae
    } catch (err: any) {
      setState({
        loading: false,
        error: err?.message || 'Error al cargar productos',
      });
      return;
    }
    setState({ loading: false, error: null });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages || 1, p + 1));
  const onGo = (p: number) => setPage(Math.min(Math.max(1, p), Math.max(1, totalPages)));

  const pageNumbers = usePageNumbers(page, totalPages, 1);

  // -------- Funciones CRUD ----------

  // Abrir modal crear
  const openCreateModal = () => {
    setOpenCreate(true);
  };

  const closeCreateModal = () => {
    setOpenCreate(false);
  };

  // Abrir modal editar
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setOpenEdit(true);
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setEditingProduct(null);
  };

  // Manejar creación de producto
  const handleCreateProduct = async (payload: CreateProductRequest) => {
    try {
      await ApiProductsApi.create({
        nombre: payload.nombre,
        descripcion: payload.descripcion || undefined,
        codigo: payload.codigo,
        precio: payload.precio,
        id_categoria: payload.id_categoria,
      });
      await load(); // Recargar la tabla
      toast.success('Producto creado con éxito');
      setPage(1); // Ir a la primera página
    } catch (error) {
      toast.error('Error al crear el producto');
      throw error; // El ProductForm manejará el error
    }
  };

  // Manejar edición de producto
  const handleEditProduct = async (payload: UpdateProductRequest, id?: number) => {
    if (!id) throw new Error('ID de producto requerido para editar');
    
    try {
      await ApiProductsApi.update(id, {
        nombre: payload.nombre,
        descripcion: payload.descripcion || undefined,
        codigo: payload.codigo,
        precio: payload.precio,
        id_categoria: payload.id_categoria,
      });
      toast.success('Producto actualizado con éxito');
      await load(); // Recargar la tabla
    } catch (error) {
      toast.error('Error al actualizar el producto');
      throw error; // El ProductForm manejará el error
    }
  };

  // Delete handlers
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      await ApiProductsApi.delete((productToDelete as any).id);
      toast.success('Producto eliminado con éxito');
      await load(); // Recargar la tabla
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // -------- /Funciones CRUD ----------

  // Handlers autocomplete (filtro)
  const onFilterCatChange = (value: string) => {
    setCategoryName(value);
    setCategoryId(undefined); // hasta seleccionar
    setShowCatFilterSug(true);

    if (catFilterDebounce.current) clearTimeout(catFilterDebounce.current);
    catFilterDebounce.current = setTimeout(async () => {
      if (value.trim().length >= 2) {
        const opts = await searchCategories(value.trim());
        setCatFilterSuggestions(opts);
      } else {
        setCatFilterSuggestions([]);
      }
    }, 200);
  };

  const selectFilterCategory = (opt: CategoryOption) => {
    setCategoryId(opt.id);
    setCategoryName(opt.nombre);
    setShowCatFilterSug(false);
    setCatFilterSuggestions([]);
    setPage(1);
  };

  // Helpers rango mostrado (solo para el texto descriptivo de paginación)
  const rangeStart = (page - 1) * limit + (items.length ? 1 : 0);
  const rangeEnd = Math.min(page * limit, totalProducts || page * limit);

  return (
  <>
  <div className="px-4 sm:px-6 lg:px-8">
      {/* Header + botón agregar (misma posición/estilo que Categorías) */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">Productos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de productos con búsqueda, filtros y paginación.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={openCreateModal}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Agregar producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
          <input
            type="text"
            placeholder="Ej. Tornillo"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
          <input
            type="text"
            placeholder="Ej. ABC123"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <input
            type="text"
            placeholder="Escribí para buscar…"
            value={categoryName}
            onChange={(e) => onFilterCatChange(e.target.value)}
            onFocus={() => {
              if (categoryName.trim().length >= 2 && catFilterSuggestions.length > 0) {
                setShowCatFilterSug(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowCatFilterSug(false), 150)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {showCatFilterSug && catFilterSuggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
              {catFilterSuggestions.map((s) => (
                <li
                  key={s.id}
                  onMouseDown={() => selectFilterCategory(s)}
                  className="cursor-pointer select-none px-3 py-2 hover:bg-indigo-600 hover:text-white"
                >
                  {s.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Tabla */}
      <ProductsTableContent
        products={items}
        onEditProduct={openEditModal}
        onDeleteProduct={handleDeleteProduct}
        isLoading={state.loading}
        error={state.error}
      />

      {/* Paginación (mismo estilo que Categorías) */}
      {totalPages > 1 && !state.loading && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
          {/* Mobile simple prev/next */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onGo(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onGo(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>

          {/* Desktop detallado */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{rangeStart}</span> a{' '}
                <span className="font-medium">{rangeEnd}</span> de{' '}
                <span className="font-medium">{totalProducts || '—'}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => onGo(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => onGo(p)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      p === page
                        ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => onGo(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Producto */}
      <ProductForm
        open={openCreate}
        onClose={closeCreateModal}
        onSubmit={handleCreateProduct}
        mode="create"
      />

      {/* Modal Editar Producto */}
      <ProductForm
        open={openEdit}
        onClose={closeEditModal}
        onSubmit={handleEditProduct}
        initialData={editingProduct}
        mode="edit"
      />

      {/* Delete Product Dialog */}
      <DeleteProductDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
        isDeleting={isDeleting}
      />
    </div>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    </>
  );
}
