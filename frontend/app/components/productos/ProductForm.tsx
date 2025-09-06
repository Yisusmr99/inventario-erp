'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

export default function ProductForm({ open, onClose, onSubmit, initialData = null, mode }: Props) {
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Autocomplete de categoría
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [suggestions, setSuggestions] = useState<CategoryOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Búsqueda de categorías (?search=texto)
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
      setSuggestions(opts);
    } catch (e) {
      setSuggestions([]);
    }
  }

  // Rellenar/Limpiar formulario al abrir
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setNombre(initialData.nombre ?? initialData.name ?? '');
      setDescripcion(initialData.description ?? '');
      setCodigo(initialData.code ?? '');
      setPrecio(initialData.price ?? '');
      
      // Manejar el ID de categoría desde diferentes formatos
      const catId = (initialData as any).id_categoria ?? 
                   initialData.categoriaId ?? 
                   (initialData as any).categoria_id ?? '';
      setCategoriaId(catId);
      
      // Intentar mostrar nombre de categoría si viene
      const catNombre = initialData.categoriaNombre ?? 
                       (initialData as any).categoria_nombre ?? 
                       (initialData as any).categoria?.nombre ?? '';
      setCategoriaNombre(catNombre);
    } else {
      setNombre('');
      setDescripcion('');
      setCodigo('');
      setPrecio('');
      setCategoriaId('');
      setCategoriaNombre('');
    }

    setErrors({});
    setSuggestions([]);
    setShowSuggestions(false);
  }, [open, initialData]);

  // Habilitar botón
  const canSubmit = useMemo(() => {
    const precioValido = typeof precio === 'number' && precio > 0;
    const categoriaValida = typeof categoriaId === 'number' && categoriaId > 0;
    return Boolean(nombre.trim() && codigo.trim() && precioValido && categoriaValida);
  }, [nombre, codigo, precio, categoriaId]);

  // Validación
  const validate = () => {
    const nextErrors: { [key: string]: string } = {};
    if (!nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio';
    if (!codigo.trim()) nextErrors.codigo = 'El código es obligatorio';
    if (precio === '' || typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
      nextErrors.precio = 'El precio debe ser un número mayor a cero';
    }
    if (categoriaId === '' || typeof categoriaId !== 'number' || categoriaId <= 0) {
      nextErrors.categoriaId = 'La categoría es obligatoria';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Enviar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        codigo: codigo.trim(),
        precio: Number(precio),
        id_categoria: categoriaId as number,
      };

      if (mode === 'edit' && initialData) {
        // Obtener ID del producto para editar
        const idProducto = (initialData as any).id_producto ?? 
                          (initialData as any).id ?? 
                          (initialData as any).id_producto;
        await onSubmit(payload as UpdateProductRequest, idProducto);
      } else {
        await onSubmit(payload as CreateProductRequest);
      }
      onClose();
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clases de inputs (estilo consistente)
  const inputBase =
    'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm';

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
                  {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
                </DialogTitle>
                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form id="product-main-form" onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`${inputBase} ring-1 ring-inset ${errors.nombre ? 'ring-red-500' : 'ring-gray-300'}`}
                    placeholder="Ej: Tornillo 1/4"
                    name="nombre"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className={`${inputBase} ring-1 ring-inset ring-gray-300`}
                    placeholder="Opcional"
                    name="descripcion"
                  />
                </div>

                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className={`${inputBase} ring-1 ring-inset ${errors.codigo ? 'ring-red-500' : 'ring-gray-300'}`}
                    placeholder="Ej. ABC123"
                    name="codigo"
                  />
                  {errors.codigo && <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>}
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={precio}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') return setPrecio('');
                      const num = Number(raw);
                      setPrecio(Number.isFinite(num) ? num : '');
                    }}
                    className={`${inputBase} ring-1 ring-inset ${errors.precio ? 'ring-red-500' : 'ring-gray-300'}`}
                    placeholder="0.00"
                    name="precio"
                  />
                  {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio}</p>}
                </div>

                {/* Categoría: Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-900">
                    Categoría <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={categoriaNombre}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCategoriaNombre(value);
                      // Hasta seleccionar de la lista, el ID queda vacío
                      setCategoriaId('');
                      setShowSuggestions(true);

                      // Debounce de búsqueda
                      if (searchDebounce.current) clearTimeout(searchDebounce.current);
                      searchDebounce.current = setTimeout(() => {
                        if (value.trim().length >= 2) {
                          searchCategories(value.trim());
                        } else {
                          setSuggestions([]);
                        }
                      }, 200);
                    }}
                    onFocus={() => {
                      if (categoriaNombre.trim().length >= 2 && suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className={`${inputBase} ring-1 ring-inset ${
                      errors.categoriaId ? 'ring-red-500' : 'ring-gray-300'
                    }`}
                    placeholder="Escribí para buscar categoría…"
                    name="categoria"
                    autoComplete="off"
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm text-gray-900">
                      {suggestions.map((s) => (
                        <li
                          key={s.id}
                          onMouseDown={() => {
                            setCategoriaId(s.id); // guarda el ID real
                            setCategoriaNombre(s.nombre);
                            setShowSuggestions(false);
                            setSuggestions([]);
                            // limpiar error si había
                            if (errors.categoriaId) {
                              setErrors((prev) => {
                                const { categoriaId, ...rest } = prev;
                                return rest;
                              });
                            }
                          }}
                          className="cursor-pointer select-none px-3 py-2 hover:bg-indigo-600 hover:text-white"
                        >
                          {s.nombre}
                        </li>
                      ))}
                    </ul>
                  )}

                  {errors.categoriaId && <p className="mt-1 text-sm text-red-600">{errors.categoriaId}</p>}
                </div>
                {/* Fin Autocomplete */}
              </form>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                form="product-main-form"
                disabled={isSubmitting || !canSubmit}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
              >
                {isSubmitting ? 'Guardando…' : mode === 'create' ? 'Guardar' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
