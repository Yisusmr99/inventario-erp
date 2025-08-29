'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ProductsApi } from '../../api/Products';
import { ProductCategoriesApi } from '../../api/ProductCategories'; 
import type { Product } from '../../types/Products';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Tipos y Constantes ---
type FetchState = {
  loading: boolean;
  error: string | null;
};
type CategoryOption = { id: number; nombre: string };
const DEFAULT_PAGE_SIZE = 8;

// --- Hooks de Utilidad ---
function usePageNumbers(current: number, total: number, delta = 1) {
  return useMemo(() => {
    if (total <= 1) return [];
    const pages: (number | 'dots')[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    pages.push(1);
    if (left > 2) pages.push('dots');
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push('dots');
    if (total > 1) pages.push(total);

    return pages.filter((p, i, arr) => p !== 'dots' || (p === 'dots' && arr[i - 1] !== 'dots'));
  }, [current, total, delta]);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Componente Principal ---
export default function ProductsTable() {
  // --- Estados ---
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [state, setState] = useState<FetchState>({ loading: true, error: null });

  const [searchByName, setSearchByName] = useState('');
  const [searchByCode, setSearchByCode] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categoryFilterName, setCategoryFilterName] = useState('');
  const [catFilterSuggestions, setCatFilterSuggestions] = useState<CategoryOption[]>([]);
  const [showCatFilterSug, setShowCatFilterSug] = useState(false);
  const catFilterDebounce = useRef<NodeJS.Timeout>();

  const debouncedName = useDebounce(searchByName, 300);
  const debouncedCode = useDebounce(searchByCode, 300);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);
  const [formState, setFormState] = useState<{
    data: Partial<Product>; error: string | null; isSaving: boolean; catName: string;
    catSuggestions: CategoryOption[]; showCatSuggestions: boolean;
  }>({
    data: {}, error: null, isSaving: false, catName: '', catSuggestions: [], showCatSuggestions: false,
  });
  const formDebounce = useRef<NodeJS.Timeout>();

  const isModalOpen = !!editingProduct || formState.data.id === 'new';

  // --- Carga de Datos ---
  const queryParams = useMemo(() => ({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: debouncedName || undefined,
    codigo: debouncedCode || undefined,
    categoriaId: categoryId,
  }), [page, debouncedName, debouncedCode, categoryId]);

  const loadProducts = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const data = await ProductsApi.getAllWithPagination(queryParams);
      setItems(data.products);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar productos';
      setState({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, [queryParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const pageNumbers = usePageNumbers(page, totalPages, 1);
  const goToPage = (p: number) => setPage(Math.min(Math.max(1, p), Math.max(1, totalPages)));

  const searchCategories = async (query: string): Promise<CategoryOption[]> => {
    try {
      const res = await ProductCategoriesApi.getAllWithPagination({ page: 1, limit: 10, search: query });
      return (res?.categories || []).map((c: any) => ({ id: c.id_categoria, nombre: c.nombre }));
    } catch {
      toast.error('No se pudieron buscar las categorías.');
      return [];
    }
  };

  const handleFilterReset = () => {
    setSearchByName('');
    setSearchByCode('');
    setCategoryId(undefined);
    setCategoryFilterName('');
    setPage(1);
  };
  
  const handleFilterCatChange = (value: string) => {
    setCategoryFilterName(value);
    setCategoryId(undefined);
    setShowCatFilterSug(true);
    if (catFilterDebounce.current) clearTimeout(catFilterDebounce.current);
    catFilterDebounce.current = setTimeout(async () => {
      if (value.trim().length >= 2) {
        setCatFilterSuggestions(await searchCategories(value.trim()));
      } else {
        setCatFilterSuggestions([]);
      }
    }, 300);
  };

  const selectFilterCategory = (opt: CategoryOption) => {
    setCategoryId(opt.id);
    setCategoryFilterName(opt.nombre);
    setShowCatFilterSug(false);
    setPage(1);
  };

  const closeModals = () => {
    setEditingProduct(null);
    setFormState({ data: {}, error: null, isSaving: false, catName: '', catSuggestions: [], showCatSuggestions: false });
  };

  const openCreateModal = () => {
    closeModals();
    setFormState(s => ({ ...s, data: { id: 'new' } }));
  };

  const openEditModal = (product: Product) => {
    closeModals();
    setEditingProduct(product);
    setFormState(s => ({
      ...s,
      data: { ...product },
      catName: (product as any).categoriaNombre || '',
    }));
  };

  const handleDelete = (id: number, name: string) => {
    setConfirmDelete({ id, name });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await ProductsApi.delete(confirmDelete.id);
      toast.success(`Producto "${confirmDelete.name}" eliminado.`);
      setConfirmDelete(null);
      await loadProducts();
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al eliminar el producto.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState(s => ({ ...s, error: null }));

    const { data } = formState;
    const priceNum = Number(data.price);
    const categoriaNum = Number(data.categoriaId);

    if (!data.name?.trim()) return setFormState(s => ({ ...s, error: 'El nombre es obligatorio.' }));
    if (!data.code?.trim()) return setFormState(s => ({ ...s, error: 'El código es obligatorio.' }));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return setFormState(s => ({ ...s, error: 'El precio debe ser un número mayor a cero.' }));
    }
    if (!Number.isInteger(categoriaNum) || categoriaNum <= 0) {
      return setFormState(s => ({ ...s, error: 'La categoría es obligatoria.' }));
    }

    setFormState(s => ({ ...s, isSaving: true }));
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        code: data.code.trim(),
        price: priceNum,
        categoriaId: categoriaNum,
      };

      if (editingProduct) {
        await ProductsApi.update(editingProduct.id, payload);
        toast.success('Producto actualizado exitosamente.');
      } else {
        await ProductsApi.create(payload);
        toast.success('Producto creado exitosamente.');
        setPage(1);
      }
      closeModals();
      await loadProducts();
    } catch (err: any) {
      const errorMessage = err?.message || 'Ocurrió un error inesperado.';
      setFormState(s => ({ ...s, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setFormState(s => ({ ...s, isSaving: false }));
    }
  };
  
  const handleFormChange = (field: keyof Product, value: any) => {
    setFormState(s => ({ ...s, data: { ...s.data, [field]: value } }));
  };

  const handleFormCatChange = (value: string) => {
    setFormState(s => ({
      ...s,
      catName: value,
      data: { ...s.data, categoriaId: undefined },
      showCatSuggestions: true,
    }));
    if (formDebounce.current) clearTimeout(formDebounce.current);
    formDebounce.current = setTimeout(() => {
        if (value.trim().length >= 2) {
            searchCategories(value.trim()).then(suggestions => {
                setFormState(s => ({ ...s, catSuggestions: suggestions }));
            });
        } else {
            setFormState(s => ({ ...s, catSuggestions: [] }));
        }
    }, 300);
  };

  const selectFormCategory = (opt: CategoryOption) => {
    setFormState(s => ({
      ...s,
      catName: opt.nombre,
      data: { ...s.data, categoriaId: opt.id },
      showCatSuggestions: false,
      error: null,
    }));
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchByName}
            onChange={(e) => { setSearchByName(e.target.value); setPage(1); }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            placeholder="Buscar por código..."
            value={searchByCode}
            onChange={(e) => { setSearchByCode(e.target.value); setPage(1); }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Filtrar por categoría..."
              value={categoryFilterName}
              onChange={(e) => handleFilterCatChange(e.target.value)}
              onFocus={() => catFilterSuggestions.length > 0 && setShowCatFilterSug(true)}
              onBlur={() => setTimeout(() => setShowCatFilterSug(false), 200)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {showCatFilterSug && catFilterSuggestions.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm text-gray-900">
                {catFilterSuggestions.map((s) => (
                  <li key={s.id} onMouseDown={() => selectFilterCategory(s)} className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white">
                    {s.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleFilterReset} className="w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Limpiar
            </button>
            <button onClick={openCreateModal} className="w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
              Agregar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre / Código</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.loading && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando productos...</td></tr>}
            {state.error && !state.loading && <tr><td colSpan={5} className="p-8 text-center text-red-600">{state.error}</td></tr>}
            {!state.loading && !state.error && items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No se encontraron productos.</td></tr>}
            
            {!state.loading && !state.error && items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-500 font-mono">{p.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{(p as any).categoriaNombre || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={p.description}>{p.description || <span className="text-gray-400">—</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-800">
                  Q{Number((p as any).price).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button onClick={() => openEditModal(p)} className="text-indigo-600 hover:text-indigo-900 transition-colors">Editar</button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="text-red-600 hover:text-red-900 transition-colors">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!state.loading && totalPages > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(1)} disabled={page <= 1} className="rounded border bg-white px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">«</button>
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="rounded border bg-white px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">‹</button>
            {pageNumbers.map((p, idx) => p === 'dots' ? <span key={`d_${idx}`} className="px-2 text-gray-500">…</span> : (
              <button key={p} onClick={() => goToPage(p)} className={`rounded border px-3 py-1 text-sm ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="rounded border bg-white px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">›</button>
            <button onClick={() => goToPage(totalPages)} disabled={page >= totalPages} className="rounded border bg-white px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">»</button>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREAR / EDITAR CON BUSCADOR DE CATEGORÍA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            {formState.error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formState.error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={formState.data.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="Nombre *" className="w-full rounded-md border-gray-300"/>
              <textarea value={formState.data.description || ''} onChange={(e) => handleFormChange('description', e.target.value)} placeholder="Descripción (opcional)" className="w-full rounded-md border-gray-300 min-h-[80px]"/>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formState.data.code || ''} onChange={(e) => handleFormChange('code', e.target.value)} placeholder="Código *" className="w-full rounded-md border-gray-300"/>
                <input type="number" step="0.01" value={formState.data.price || ''} onChange={(e) => handleFormChange('price', e.target.value)} placeholder="Precio *" className="w-full rounded-md border-gray-300"/>
              </div>
              
              {/* --- CAMPO DE CATEGORÍA CON BUSCADOR --- */}
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">Categoría *</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={formState.catName} 
                        onChange={(e) => handleFormCatChange(e.target.value)} 
                        placeholder="Escribe para buscar..." 
                        onFocus={() => formState.catSuggestions.length > 0 && setFormState(s=>({...s, showCatSuggestions: true}))} 
                        onBlur={() => setTimeout(() => setFormState(s=>({...s, showCatSuggestions: false})), 200)} 
                        className="w-full rounded-md border-gray-300"
                    />
                    <button type="button" onClick={() => toast.info('No se econtraron coicidencias con la categoría buscada.')} className="flex-shrink-0 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                        Buscar
                    </button>
                </div>
                {formState.showCatSuggestions && formState.catSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 text-gray-900">
                    {formState.catSuggestions.map((s) => (
                      <li key={s.id} onMouseDown={() => selectFormCategory(s)} className="cursor-pointer select-none py-2 px-3 hover:bg-indigo-600 hover:text-white">{s.nombre}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModals} disabled={formState.isSaving} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={formState.isSaving} className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {formState.isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            <p className="mt-2 text-sm text-gray-600">
              ¿Estás seguro de que quieres eliminar el producto <strong className="font-medium">{confirmDelete.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={executeDelete} className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
