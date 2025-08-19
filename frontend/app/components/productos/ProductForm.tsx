'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { CreateProductRequest, UpdateProductRequest, Product } from '~/types/Products';
import { ProductCategoriesApi } from 'app/api/ProductCategories';

type Mode = 'create' | 'edit';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductRequest | UpdateProductRequest, id?: number) => Promise<void>;
  initialData?: Product | null;
  mode: Mode;
}

interface CategoryOption {
  id: number;
  nombre: string;
}

const UNIDADES = ['Unidad', 'Caja', 'Litro', 'Kilogramo', 'Metro', 'Paquete'];

export default function ProductForm({ open, onClose, onSubmit, initialData = null, mode }: Props) {
  const [nombre, setNombre] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [categorias, setCategorias] = useState<CategoryOption[]>([]);
  const [errors, setErrors] = useState<{ nombre?: string; unidadMedida?: string; categoriaId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar categorías para el select
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await ProductCategoriesApi.getAllWithPagination({ page: 1, limit: 100 });
        const opts = (res.categories || []).map((c: any) => ({
          id: c.id_categoria,
          nombre: c.nombre
        }));
        setCategorias(opts);
      } catch {
        setCategorias([]);
      }
    }
    if (open) loadCategories();
  }, [open]);

  // Prefill si edit
  useEffect(() => {
    if (open) {
      if (initialData) {
        setNombre(initialData.nombre);
        setUnidadMedida(initialData.unidadMedida);
        setCategoriaId(initialData.categoriaId);
      } else {
        setNombre('');
        setUnidadMedida('');
        setCategoriaId('');
      }
      setErrors({});
    }
  }, [open, initialData]);

  const canSubmit = useMemo(() => {
    return nombre.trim() && unidadMedida.trim() && typeof categoriaId === 'number';
  }, [nombre, unidadMedida, categoriaId]);

  const validate = () => {
    const next: typeof errors = {};
    if (!nombre.trim()) next.nombre = 'El nombre es obligatorio';
    if (!unidadMedida.trim()) next.unidadMedida = 'La unidad de medida es obligatoria';
    if (categoriaId === '' || typeof categoriaId !== 'number') next.categoriaId = 'La categoría es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        unidadMedida: unidadMedida.trim(),
        categoriaId: categoriaId as number
      };
      if (mode === 'edit' && initialData) {
        await onSubmit(payload as UpdateProductRequest, parseInt(initialData.id, 10));
      } else {
        await onSubmit(payload as CreateProductRequest);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-lg font-semibold leading-6 text-gray-900">
                  {mode === 'create' ? 'Crear nuevo producto' : 'Editar producto'}
                </DialogTitle>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Cerrar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm ${
                      errors.nombre ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                    }`}
                    placeholder="Ingresa el nombre del producto"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Unidad de medida <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    className={`block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 sm:text-sm ${
                      errors.unidadMedida ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                    }`}
                  >
                    <option value="">Selecciona…</option>
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {errors.unidadMedida && <p className="mt-1 text-sm text-red-600">{errors.unidadMedida}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoriaId === '' ? '' : String(categoriaId)}
                    onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
                    className={`block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 sm:text-sm ${
                      errors.categoriaId ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                    }`}
                  >
                    <option value="">Selecciona…</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  {errors.categoriaId && <p className="mt-1 text-sm text-red-600">{errors.categoriaId}</p>}
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
              >
                {isSubmitting ? 'Guardando…' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
