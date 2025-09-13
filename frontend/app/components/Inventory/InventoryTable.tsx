'use client';

import { memo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface InventoryItem {
    id_inventario: number;
    id_producto: number;
    id_ubicacion: number;
    cantidad_actual: number;
    stock_minimo: number | null;
    stock_maximo: number | null;
    nombre_producto: string;
    codigo_producto: string;
    nombre_ubicacion: string;
    estado_ubicacion: number;
    capacidad: number | null;
}

interface InventoryTableProps {
    data: InventoryItem[];
    isLoading: boolean;
    error?: string | null;
    onAddStock?: (item: InventoryItem) => void;
}

const InventoryTable = memo(function InventoryTable({ 
    data, 
    isLoading, 
    error,
    onAddStock
}: InventoryTableProps) {
    const getStockStatus = (cantidad: number, minimo: number | null, maximo: number | null) => {
        if (minimo && cantidad <= minimo) {
            return { status: 'Bajo', color: 'text-red-600 bg-red-50' };
        }
        if (maximo && cantidad >= maximo) {
            return { status: 'Alto', color: 'text-orange-600 bg-orange-50' };
        }
        return { status: 'Normal', color: 'text-green-600 bg-green-50' };
    };

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-900">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Producto</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Código</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Ubicación</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Cantidad Actual</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Stock Mín/Máx</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                    {isLoading && (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Cargando...</td>
                        </tr>
                    )}

                    {!isLoading && error && (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-red-600">{error}</td>
                        </tr>
                    )}

                    {!isLoading && !error && data.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No hay inventarios para mostrar.</td>
                        </tr>
                    )}

                    {!isLoading &&
                        !error &&
                        data.map((item) => {
                            const stockStatus = getStockStatus(item.cantidad_actual, item.stock_minimo, item.stock_maximo);
                            return (
                                <tr key={item.id_inventario} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{item.nombre_producto}</td>
                                    <td className="px-4 py-3 font-mono">{item.codigo_producto}</td>
                                    <td className="px-4 py-3">{item.nombre_ubicacion}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-900">{item.cantidad_actual}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.stock_minimo ?? '—'} / {item.stock_maximo ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${stockStatus.color}`}>
                                            {stockStatus.status}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                                        {onAddStock && (
                                            <button
                                                className="inline-flex items-center rounded-md border border-green-300 bg-white px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                                onClick={() => onAddStock(item)}
                                                title="Agregar/Restar Stock"
                                            >
                                                <PlusIcon className="h-4 w-4 mr-1" />
                                                Stock
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
});

export default InventoryTable;