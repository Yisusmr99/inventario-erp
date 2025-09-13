'use client';

import { memo } from 'react';
import { PencilSquareIcon, TrashIcon, EyeIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import type { Product } from '~/types/Products';

interface Props {
  products: Product[];
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (p: Product) => void;
  isLoading: boolean;
  error?: string | null;
  onViewProduct: (p: Product) => void;
}

const ProductsTableContent = memo(function ProductsTableContent({
  products,
  onEditProduct,
  onDeleteProduct,
  isLoading,
  error,
  onViewProduct
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-900">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Categoría</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Código</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Precio</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {isLoading && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Cargando...</td>
            </tr>
          )}

          {!isLoading && error && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-red-600">{error}</td>
            </tr>
          )}

          {!isLoading && !error && products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No hay productos para mostrar.</td>
            </tr>
          )}

          {!isLoading &&
            !error &&
            products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{(p as any).categoriaNombre ?? `ID ${(p as any).categoriaId}`}</td>
                <td className="px-4 py-3 font-mono">{p.code}</td>
                <td className="px-4 py-3 text-gray-900">
                  {(() => {
                    const raw = (p as any).price ?? (p as any).precio;
                    if (raw === undefined || raw === null || String(raw).trim() === '') return '—';
                    const num = Number(raw);
                    return Number.isFinite(num) ? num.toFixed(2) : '—';
                  })()}
                </td>

                <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                  <button
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => onEditProduct(p)}
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>&nbsp;&nbsp;
                  <button
                    className="inline-flex items-center rounded-md border border-red-200 bg-white px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    onClick={() => onDeleteProduct(p)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>&nbsp;&nbsp;
                  <button
                    className="inline-flex items-center rounded-md border border-blue-300 bg-white px-2 py-2 text-xs font-medium text-blue-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => onViewProduct(p)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button> 
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
});

export default ProductsTableContent;