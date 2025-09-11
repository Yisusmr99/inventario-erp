'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

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

interface StockModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    onSubmit: (itemId: number, quantity: number, operation: 'add' | 'subtract', motivo: string) => Promise<void>;
}

export default function StockModal({ isOpen, onClose, item, onSubmit }: StockModalProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [motivo, setMotivo] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setOperation('add');
            setMotivo('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!item) return;

        if (quantity <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        if (!motivo.trim()) {
            setError('El motivo es requerido');
            return;
        }

        if (operation === 'subtract' && quantity > item.cantidad_actual) {
            setError('No puedes restar más stock del disponible');
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(item.id_inventario, quantity, operation, motivo.trim());
            onClose();
        } catch (err) {
            setError('Error al actualizar el stock');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !item) return null;

    const newQuantity = operation === 'add' 
        ? item.cantidad_actual + quantity 
        : item.cantidad_actual - quantity;

    const canSubmit = quantity > 0 && motivo.trim() && !(operation === 'subtract' && quantity > item.cantidad_actual);

    const styleInput = 'block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-visible rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <DialogTitle className="text-lg font-semibold leading-6 text-gray-900">
                                    Ajustar Stock
                                </DialogTitle>
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Product Info */}
                            <div className="mb-6 rounded-lg border border-gray-200 p-4 bg-gray-50">
                                <h4 className="font-medium text-gray-900">{item.nombre_producto}</h4>
                                <p className="text-sm text-gray-600">Código: {item.codigo_producto}</p>
                                <p className="text-sm text-gray-600">Ubicación: {item.nombre_ubicacion}</p>
                                <p className="text-sm font-medium text-gray-900 mt-2">
                                    Stock actual: <span className="text-lg">{item.cantidad_actual}</span>
                                </p>
                            </div>

                            <form id="stock-form" className="space-y-4" onSubmit={handleSubmit}>
                                {/* Operation Type */}
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                        Tipo de operación
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setOperation('add')}
                                            className={`flex items-center justify-center px-4 py-2 rounded-md border transition-colors ${
                                                operation === 'add'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Agregar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setOperation('subtract')}
                                            className={`flex items-center justify-center px-4 py-2 rounded-md border transition-colors ${
                                                operation === 'subtract'
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <MinusIcon className="h-4 w-4 mr-2" />
                                            Restar
                                        </button>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium leading-6 text-gray-900">
                                        Cantidad
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="number"
                                            id="quantity"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className={styleInput}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Motivo */}
                                <div>
                                    <label htmlFor="motivo" className="block text-sm font-medium leading-6 text-gray-900">
                                        Motivo
                                    </label>
                                    <div className="mt-2">
                                        <textarea
                                            id="motivo"
                                            rows={3}
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                            className={styleInput}
                                            placeholder="Describe el motivo del ajuste de stock..."
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="rounded-lg border border-gray-200 p-3 bg-blue-50">
                                    <p className="text-sm text-gray-600">
                                        Nuevo stock: <span className="font-semibold text-gray-900">{newQuantity}</span>
                                    </p>
                                    {operation === 'add' && (
                                        <p className="text-xs text-green-600">+{quantity} unidades</p>
                                    )}
                                    {operation === 'subtract' && (
                                        <p className="text-xs text-red-600">-{quantity} unidades</p>
                                    )}
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="rounded-md bg-red-50 p-3">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="submit"
                                form="stock-form"
                                disabled={isSubmitting || !canSubmit}
                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
                            >
                                {isSubmitting ? 'Actualizando...' : 'Confirmar'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
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
