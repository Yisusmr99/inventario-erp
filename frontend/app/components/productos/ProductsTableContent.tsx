'use client';

import { memo } from 'react';
import type { Product } from '~/types/Products';

interface Props {
  products: Product[];
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (p: Product) => void;
  isLoading: boolean;
}

const ProductsTableContent = memo(function ProductsTableContent({
  products,
  onEditProduct,
  onDeleteProduct,
  isLoading
}: Props) {
  if (isLoading) {
    return (
      <div className="mt-8 flow-root">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="mt-8 text-center py-12">
        <p className="text-gray-500">No se encontraron productos con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow-sm outline-1 outline-black/5 sm:rounded-lg">
            <table className="relative min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unidad de medida</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoría</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha de creación</th>
                  <th className="py-3.5 pr-4 pl-3 sm:pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((p) => (
                  <tr key={p.id_producto}>
                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                      {p.nombre}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-700">{p.unidadMedida}</td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-700">
                      {p.categoriaNombre ?? `#${p.categoriaId}`}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                      <button
                        onClick={() => onEditProduct(p)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar<span className="sr-only">, {p.nombre}</span>
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar<span className="sr-only">, {p.nombre}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductsTableContent;