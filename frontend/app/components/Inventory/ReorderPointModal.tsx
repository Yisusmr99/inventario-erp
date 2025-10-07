import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id_inventario: number, punto_reorden: number) => Promise<void>;
    item: any;
}

export default function ReorderPointModal({ isOpen, onClose, onSave, item }: Props) {
    const [puntoReorden, setPuntoReorden] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            setPuntoReorden(item.punto_reorden || 0);
        }
    }, [isOpen, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!item) return;
        
        setIsSubmitting(true);
        try {
            await onSave(item.id_inventario, puntoReorden);
            onClose();
        } catch (error) {
            console.error('Error saving reorder point:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-10">
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
                                    Editar Punto de Reorden
                                </DialogTitle>
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {item && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Producto: <span className="font-medium">{item.nombre_producto}</span></p>
                                    <p className="text-sm text-gray-600">Ubicación: <span className="font-medium">{item.nombre_ubicacion}</span></p>
                                </div>
                            )}

                            <form id="reorder-point-form" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="punto_reorden" className="block text-sm font-medium leading-6 text-gray-900">
                                        Punto de Reorden
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="number"
                                            name="punto_reorden"
                                            id="punto_reorden"
                                            min="0"
                                            value={puntoReorden}
                                            onChange={(e) => setPuntoReorden(Number(e.target.value) || 0)}
                                            className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="submit"
                                form="reorder-point-form"
                                disabled={isSubmitting}
                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
                            >
                                {isSubmitting ? 'Guardando…' : 'Guardar'}
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
