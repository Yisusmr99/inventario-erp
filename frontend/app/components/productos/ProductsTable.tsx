import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProductsApi } from '../../api/Products';
import { ProductCategoriesApi } from '../../api/ProductCategories';
import type { Product } from '../../types/Products';

type FetchState = {
  loading: boolean;
  error: string | null;
};

type CategoryOption = { id: number; nombre: string };

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

  // Modal crear
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    code: '',
    price: '' as string | number,
    categoriaId: '' as string | number,
    categoriaNombre: '', // para el autocomplete visible
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Autocomplete en crear
  const [createCatSuggestions, setCreateCatSuggestions] = useState<CategoryOption[]>([]);
  const [showCreateCatSug, setShowCreateCatSug] = useState(false);
  const createDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modal editar
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [editCatName, setEditCatName] = useState<string>(''); // visible
  const [editCatSuggestions, setEditCatSuggestions] = useState<CategoryOption[]>([]);
  const [showEditCatSug, setShowEditCatSug] = useState(false);
  const editDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      code: debouncedCode || undefined,
      categoryId, // el backend sigue recibiendo ID
    }),
    [page, limit, debouncedSearch, debouncedCode, categoryId],
  );

  const load = async () => {
    try {
      setState({ loading: true, error: null });
      const data = await ProductsApi.getAllWithPagination(queryParams);
      setItems(data.products);
      setTotalPages(data.totalPages);
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

  // Abrir modal editar
  const openEditModal = async (id: number) => {
    try {
      setState((s) => ({ ...s, loading: true }));
      const data = await ProductsApi.getById(id);
      setEditForm(data);
      // precargar nombre de categoría si viene
      // @ts-ignore por si tu tipo Product no lo define
      const nombreCat = (data as any).categoriaNombre ?? '';
      setEditCatName(nombreCat);
      setOpenEdit(true);
    } catch (err: any) {
      alert(`Error al cargar los datos del producto: ${err?.message}`);
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setEditForm(null);
    setEditCatName('');
    setEditCatSuggestions([]);
    setShowEditCatSug(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!editForm) return;

    if (!String(editForm.name || '').trim()) return setFormError('El nombre es obligatorio.');
    if (!String(editForm.code || '').trim()) return setFormError('El código es obligatorio.');
    const priceNum = Number((editForm as any).price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return setFormError('El precio debe ser un número válido y no negativo.');
    }
    const categoriaNum = Number((editForm as any).categoriaId);
    if (!Number.isInteger(categoriaNum) || categoriaNum <= 0) {
      return setFormError('La categoría es obligatoria (seleccioná una de la lista).');
    }

    try {
      setSaving(true);
      await ProductsApi.update(Number((editForm as any).id), {
        ...editForm,
        price: priceNum,
        categoriaId: categoriaNum,
      });
      setSaving(false);
      closeEditModal();
      alert('Producto actualizado exitosamente.');
      await load(); // Recargar la tabla
    } catch (err: any) {
      setSaving(false);
      setFormError(err?.message || 'No se pudo actualizar el producto.');
    }
  };

  // Eliminar
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar producto "${name}"?`)) return;
    try {
      await ProductsApi.delete(id);
      alert('Producto eliminado exitosamente.');
      await load(); // Recargar la tabla
    } catch (e: any) {
      alert(e?.message ?? 'Error al eliminar');
    }
  };

  // -------- Modal Crear Producto --------
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      code: '',
      price: '',
      categoriaId: '',
      categoriaNombre: '',
    });
    setFormError(null);
    setCreateCatSuggestions([]);
    setShowCreateCatSug(false);
  };

  const openCreateModal = () => {
    resetForm();
    setOpenCreate(true);
  };

  const closeCreateModal = () => {
    setOpenCreate(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) return setFormError('El nombre es obligatorio.');
    if (!form.code.trim()) return setFormError('El código es obligatorio.');
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return setFormError('El precio debe ser un número válido y no negativo.');
    }
    const categoriaNum = Number(form.categoriaId);
    if (!Number.isInteger(categoriaNum) || categoriaNum <= 0) {
      return setFormError('La categoría es obligatoria (seleccioná una de la lista).');
    }

    try {
      setSaving(true);
      await ProductsApi.create({
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        code: form.code.trim(),
        price: priceNum,
        categoriaId: categoriaNum,
      });
      setSaving(false);
      closeCreateModal();
      setPage(1);
      await load();
      alert('Producto creado exitosamente.');
    } catch (err: any) {
      setSaving(false);
      setFormError(err?.message || 'No se pudo crear el producto.');
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

  // Handlers autocomplete (crear)
  const onCreateCatChange = (value: string) => {
    setForm((f) => ({ ...f, categoriaNombre: value, categoriaId: '' }));
    setShowCreateCatSug(true);

    if (createDebounce.current) clearTimeout(createDebounce.current);
    createDebounce.current = setTimeout(async () => {
      if (value.trim().length >= 2) {
        const opts = await searchCategories(value.trim());
        setCreateCatSuggestions(opts);
      } else {
        setCreateCatSuggestions([]);
      }
    }, 200);
  };

  const selectCreateCategory = (opt: CategoryOption) => {
    setForm((f) => ({
      ...f,
      categoriaNombre: opt.nombre,
      categoriaId: opt.id,
    }));
    setShowCreateCatSug(false);
    setCreateCatSuggestions([]);
  };

  // Handlers autocomplete (editar)
  const onEditCatChange = (value: string) => {
    setEditCatName(value);
    setEditForm((f) => (f ? ({ ...f, categoriaId: '' } as any) : f));
    setShowEditCatSug(true);

    if (editDebounce.current) clearTimeout(editDebounce.current);
    editDebounce.current = setTimeout(async () => {
      if (value.trim().length >= 2) {
        const opts = await searchCategories(value.trim());
        setEditCatSuggestions(opts);
      } else {
        setEditCatSuggestions([]);
      }
    }, 200);
  };

  const selectEditCategory = (opt: CategoryOption) => {
    setEditForm((f) => (f ? ({ ...f, categoriaId: opt.id } as any) : f));
    setEditCatName(opt.nombre);
    setShowEditCatSug(false);
    setEditCatSuggestions([]);
    // limpiar error si lo había
    setFormError(null);
  };

  return (
    <div className="p-6">
      {/* Botón agregar producto */}
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          onClick={openCreateModal}
        >
          Agregar producto
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table table className="min-w-full divide-y divide-gray-200 text-sm text-gray-900">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Descripción</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Categoría</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Código</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Precio</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {state.loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!state.loading && state.error && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                  {state.error}
                </td>
              </tr>
            )}

            {!state.loading && !state.error && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No hay productos para mostrar.
                </td>
              </tr>
            )}

            {!state.loading &&
              !state.error &&
              items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.description ? (
                      <span title={p.description}>
                        {p.description.length > 80 ? p.description.slice(0, 80) + '…' : p.description}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{(p as any).categoriaNombre ?? `ID ${ (p as any).categoriaId }`}</td>
                  <td className="px-4 py-3 font-mono">{p.code}</td>
                  
                  <td className="px-4 py-3 text-gray-900">
                    {(() => {
                        const raw = (p as any).price ?? (p as any).precio; // soporta price o precio y lo despliega en pantalla
                        if (raw === undefined || raw === null || String(raw).trim() === '') return '—';
                        const num = Number(raw);
                        return Number.isFinite(num) ? num.toFixed(2) : '—';
                    })()}
                    </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      className="inline-flex items-center rounded-md border px-3 py-1 text-xs hover:bg-gray-50"
                      onClick={() => openEditModal((p as any).id)}
                    >
                      Editar
                    </button>
                    <button
                      className="inline-flex items-center rounded-md border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete((p as any).id, p.name)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Paginación estilo categorías */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Página {page} de {Math.max(totalPages, 1)}</div>

        <div className="flex items-center gap-1">
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            onClick={() => onGo(1)}
            disabled={page <= 1}
            title="Primera"
          >
            «
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            onClick={onPrev}
            disabled={page <= 1}
            title="Anterior"
          >
            ‹
          </button>

          {pageNumbers.map((p, idx) =>
            p === 'dots' ? (
              <span key={`d_${idx}`} className="px-2 text-gray-500 select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onGo(p)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            onClick={onNext}
            disabled={page >= totalPages || totalPages === 0}
            title="Siguiente"
          >
            ›
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            onClick={() => onGo(totalPages)}
            disabled={page >= totalPages || totalPages === 0}
            title="Última"
          >
            »
          </button>
        </div>
      </div>

      {/* -------- Modal Crear Producto -------- */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo */}
          <div className="absolute inset-0 bg-black/40" onClick={closeCreateModal} aria-hidden="true" />
          {/* Contenido */}
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Nuevo producto</h2>
              <button onClick={closeCreateModal} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. Tornillo 1/4"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Código *</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="Ej. ABC123"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Autocomplete Categoría (crear) */}
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">Categoría *</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.categoriaNombre}
                  onChange={(e) => onCreateCatChange(e.target.value)}
                  onFocus={() => {
                    if (form.categoriaNombre.trim().length >= 2 && createCatSuggestions.length > 0) {
                      setShowCreateCatSug(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowCreateCatSug(false), 150)}
                  placeholder="Escribí para buscar categoría…"
                />
                {showCreateCatSug && createCatSuggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm text-gray-900">
                    {createCatSuggestions.map((s) => (
                      <li
                        key={s.id}
                        onMouseDown={() => selectCreateCategory(s)}
                        className="cursor-pointer select-none px-3 py-2 hover:bg-indigo-600 hover:text-white"
                      >
                        {s.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- Modal Editar Producto -------- */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo */}
          <div className="absolute inset-0 bg-black/40" onClick={closeEditModal} aria-hidden="true" />
          {/* Contenido */}
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Editar producto: {editForm?.name}
              </h2>
              <button
                onClick={closeEditModal}
                className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editForm?.name || ''}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, name: e.target.value } : null))}
                  placeholder="Ej. Tornillo 1/4"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editForm?.description || ''}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, description: e.target.value } : null))}
                  placeholder="Opcional"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Código *</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm?.code || ''}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, code: e.target.value } : null))}
                    placeholder="Ej. ABC123"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={(editForm as any)?.price ?? ''}
                    onChange={(e) =>
                      setEditForm((f) => (f ? ({ ...f, price: e.target.value } as any) : f))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Autocomplete Categoría (editar) */}
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">Categoría *</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editCatName}
                  onChange={(e) => onEditCatChange(e.target.value)}
                  onFocus={() => {
                    if (editCatName.trim().length >= 2 && editCatSuggestions.length > 0) {
                      setShowEditCatSug(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowEditCatSug(false), 150)}
                  placeholder="Escribí para buscar categoría…"
                />
                {showEditCatSug && editCatSuggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
                    {editCatSuggestions.map((s) => (
                      <li
                        key={s.id}
                        onMouseDown={() => selectEditCategory(s)}
                        className="cursor-pointer select-none px-3 py-2 hover:bg-indigo-600 hover:text-white"
                      >
                        {s.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* -------- /Modal Editar Producto -------- */}
    </div>
  );
}
