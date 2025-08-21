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

export default function ProductForm({ open, onClose, onSubmit, initialData = null, mode }: Props) {
  // Estados existentes
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [categorias, setCategorias] = useState<CategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // <-- AÑADIDO: Estados para los nuevos campos del backend
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');

  // <-- MEJORA: Estado de errores unificado para todos los campos
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  // Cargar categorías para el select (sin cambios, ya estaba perfecto)
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

  // Rellenar el formulario si estamos en modo de edición
  useEffect(() => {
    if (open) {
      if (initialData) {
        setNombre(initialData.nombre);
        setDescripcion(initialData.descripcion || '');
        setCodigo(initialData.codigo);
        setPrecio(initialData.precio);
        setCategoriaId(initialData.id_categoria);
      } else {
        // Limpiar formulario para modo creación
        setNombre('');
        setDescripcion('');
        setCodigo('');
        setPrecio('');
        setCategoriaId('');
      }
      setErrors({});
    }
  }, [open, initialData]);

  // Lógica para habilitar/deshabilitar el botón de envío
  const canSubmit = useMemo(() => {
    return nombre.trim() && codigo.trim() && precio !== '' && categoriaId !== '';
  }, [nombre, codigo, precio, categoriaId]);

  // <-- MEJORA: Función de validación actualizada
  const validate = () => {
    const nextErrors: { [key: string]: string } = {};
    if (!nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio';
    if (!codigo.trim()) nextErrors.codigo = 'El código es obligatorio';
    if (precio === '' || Number(precio) <= 0) nextErrors.precio = 'El precio debe ser un número mayor a cero';
    if (categoriaId === '') nextErrors.categoriaId = 'La categoría es obligatoria';
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // <-- MEJORA: Función de envío actualizada con todos los campos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        codigo: codigo.trim(),
        precio: Number(precio),
        categoriaId: categoriaId as number
      };

      if (mode === 'edit' && initialData) {
        await onSubmit(payload as UpdateProductRequest, initialData.id_producto);
      } else {
        await onSubmit(payload as CreateProductRequest);
      }
      onClose(); // Cierra el modal solo si el envío es exitoso
    } catch (error) {
        console.error("Error al enviar el formulario:", error);
        // Opcional: Mostrar un mensaje de error al usuario
    }
    finally {
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
                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* El formulario ahora tiene un ID y no necesita su propio botón de submit */}
              <form id="product-main-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre del producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">Nombre <span className="text-red-500">*</span></label>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={`... ${errors.nombre ? 'ring-red-500' : 'ring-gray-300'}`} placeholder="Ej: Laptop Gamer" />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                {/* <-- AÑADIDO: Campo de Código --> */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">Código / SKU <span className="text-red-500">*</span></label>
                  <input value={codigo} onChange={(e) => setCodigo(e.target.value)} className={`... ${errors.codigo ? 'ring-red-500' : 'ring-gray-300'}`} placeholder="Ej: LAP-GAM-001" />
                  {errors.codigo && <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>}
                </div>

                {/* <-- AÑADIDO: Campo de Precio --> */}
                 <div>
                  <label className="block text-sm font-medium text-gray-900">Precio <span className="text-red-500">*</span></label>
                  <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`... ${errors.precio ? 'ring-red-500' : 'ring-gray-300'}`} placeholder="Ej: 7500.50" />
                  {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio}</p>}
                </div>

                {/* Selector de Categoría (ya estaba bien) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">Categoría <span className="text-red-500">*</span></label>
                  <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')} className={`... ${errors.categoriaId ? 'ring-red-500' : 'ring-gray-300'}`}>
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                  </select>
                  {errors.categoriaId && <p className="mt-1 text-sm text-red-600">{errors.categoriaId}</p>}
                </div>

                {/* <-- AÑADIDO: Campo de Descripción (opcional) --> */}
                <div>
                  <label className="block text-sm font-medium text-gray-900">Descripción</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Detalles adicionales del producto..."></textarea>
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {/* Este botón ahora envía el formulario por su atributo "form" */}
              <button
                type="submit"
                form="product-main-form"
                disabled={isSubmitting || !canSubmit}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
              >
                {isSubmitting ? 'Guardando…' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={onClose} disabled={isSubmitting} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
                Cancelar
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
