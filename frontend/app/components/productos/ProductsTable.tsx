import React, { useEffect, useMemo, useState } from 'react';
import { ProductsApi } from '../../api/Products';
import type { Product } from '../../types/Products';

type FetchState = {
    loading: boolean;
    error: string | null;
};

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
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

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
    });
    const [formError, setFormError] = useState<string | null>(null);

    // NUEVO: Estado para el modal de edición
    const [openEdit, setOpenEdit] = useState(false);
    const [editForm, setEditForm] = useState<Product | null>(null);

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
            categoryId,
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

    // NUEVO: Función para abrir el modal de edición y cargar datos
    const openEditModal = async (id: number) => {
        try {
            setState((s) => ({ ...s, loading: true }));
            const data = await ProductsApi.getById(id);
            setEditForm(data);
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
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!editForm) return;

        if (!editForm.name.trim()) return setFormError('El nombre es obligatorio.');
        if (!editForm.code.trim()) return setFormError('El código es obligatorio.');
        const priceNum = Number(editForm.price);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
            return setFormError('El precio debe ser un número válido y no negativo.');
        }
        const categoriaNum = Number(editForm.categoriaId);
        if (!Number.isInteger(categoriaNum) || categoriaNum <= 0) {
            return setFormError('La categoría (ID) debe ser un entero positivo.');
        }
        
        try {
            setSaving(true);
            await ProductsApi.update(Number(editForm.id), {
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

    // NUEVO: Función para eliminar
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
        });
        setFormError(null);
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
            return setFormError('La categoría (ID) debe ser un entero positivo.');
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar por nombre
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código
                    </label>
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría (ID)
                    </label>
                    <input
                        type="number"
                        placeholder="Ej. 1"
                        value={categoryId ?? ''}
                        onChange={(e) => {
                            const v = e.target.value;
                            setCategoryId(v === '' ? undefined : Number(v));
                            setPage(1);
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Descripción</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Categoría</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Código</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Precio</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Fecha creación</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                        {state.loading && (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                    Cargando...
                                </td>
                            </tr>
                        )}

                        {!state.loading && state.error && (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                                    {state.error}
                                </td>
                            </tr>
                        )}

                        {!state.loading && !state.error && items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
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
                                                {p.description.length > 80
                                                    ? p.description.slice(0, 80) + '…'
                                                    : p.description}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.categoriaNombre ?? `ID ${p.categoriaId}`}
                                    </td>
                                    <td className="px-4 py-3 font-mono">{p.code}</td>
                                    <td className="px-4 py-3">
                                        {Number.isFinite(p.price) ? p.price.toFixed(2) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            className="inline-flex items-center rounded-md border px-3 py-1 text-xs hover:bg-gray-50"
                                            onClick={() => openEditModal(p.id)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="inline-flex items-center rounded-md border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(p.id, p.name)}
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
                <div className="text-sm text-gray-600">
                    Página {page} de {Math.max(totalPages, 1)}
                </div>

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
                                    p === page
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'hover:bg-gray-50'
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
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={closeCreateModal}
                        aria-hidden="true"
                    />
                    {/* Contenido */}
                    <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Nuevo producto</h2>
                            <button
                                onClick={closeCreateModal}
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

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Categoría (ID) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={form.categoriaId}
                                    onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
                                    placeholder="Ej. 1"
                                />
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
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={closeEditModal}
                        aria-hidden="true"
                    />
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
                                    onChange={(e) =>
                                        setEditForm((f) => (f ? { ...f, name: e.target.value } : null))
                                    }
                                    placeholder="Ej. Tornillo 1/4"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm?.description || ''}
                                    onChange={(e) =>
                                        setEditForm((f) => (f ? { ...f, description: e.target.value } : null))
                                    }
                                    placeholder="Opcional"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Código *</label>
                                    <input
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={editForm?.code || ''}
                                        onChange={(e) =>
                                            setEditForm((f) => (f ? { ...f, code: e.target.value } : null))
                                        }
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
                                        value={editForm?.price || ''}
                                        onChange={(e) =>
                                            setEditForm((f) => (f ? { ...f, price: e.target.value } : null))
                                        }
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Categoría (ID) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm?.categoriaId || ''}
                                    onChange={(e) =>
                                        setEditForm((f) => (f ? { ...f, categoriaId: e.target.value } : null))
                                    }
                                    placeholder="Ej. 1"
                                />
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