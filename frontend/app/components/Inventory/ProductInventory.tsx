import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useState, useEffect } from "react";
import { InventoryApi } from "~/api/Inventory";
import { ProductsApi } from "~/api/Products";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (data: InventoryData) => Promise<void>;
}

interface InventoryData {
    id_producto: number;
    cantidad_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    id_ubicacion: number;
}

interface Ubicacion {
    id: string;
    nombre: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
}

export default function ProductInventory({ open, onClose, onSave }: Props) {
    const [inventoryData, setInventoryData] = useState<InventoryData>({
        id_producto: 0,
        cantidad_actual: 0,
        stock_minimo: 0,
        stock_maximo: 0,
        id_ubicacion: 0
    });

    const [query, setQuery] = useState('');
    const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [isLoadingUbicaciones, setIsLoadingUbicaciones] = useState(false);

    // Product selection state
    const [productQuery, setProductQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load ubicaciones and products when component mounts or when modal opens
    useEffect(() => {
        if (open) {
            loadUbicaciones();
            loadProducts();
        } else {
            // Reset form state when modal closes
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setInventoryData({
            id_producto: 0,
            cantidad_actual: 0,
            stock_minimo: 0,
            stock_maximo: 0,
            id_ubicacion: 0
        });
        setSelectedProduct(null);
        setSelectedUbicacion(null);
        setQuery('');
        setProductQuery('');
        setIsSubmitting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct || !selectedUbicacion || inventoryData.cantidad_actual < 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(inventoryData);
            onClose();
        } catch (error) {
            console.error('Error saving inventory:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = selectedProduct && selectedUbicacion && inventoryData.cantidad_actual >= 0;

    const loadUbicaciones = async () => {
        setIsLoadingUbicaciones(true);
        try {
            const response = await InventoryApi.getUbicaciones();

            setUbicaciones(response.ubicaciones.map(ubicacion => ({
                id: ubicacion.id_ubicacion.toString(),
                nombre: ubicacion.nombre_ubicacion
            })));
        } catch (error) {
            console.error('Error loading ubicaciones:', error);
            // Fallback to empty array on error
            setUbicaciones([]);
        } finally {
            setIsLoadingUbicaciones(false);
        }
    };

    const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await ProductsApi.getAll();
            // Map the response data to match our interface
            const mappedProducts = response.map((product: any) => ({
                id: product.id_producto,
                name: product.nombre,
                code: product.codigo
            }));
            setProducts(mappedProducts);
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to empty array on error
            setProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const filteredUbicaciones =
        query === ''
            ? ubicaciones
            : ubicaciones.filter((ubicacion) => {
                return ubicacion.nombre.toLowerCase().includes(query.toLowerCase())
            });

    const filteredProducts =
        productQuery === ''
            ? products
            : products.filter((product) => {
                return product.name.toLowerCase().includes(productQuery.toLowerCase()) ||
                    product.code.toLowerCase().includes(productQuery.toLowerCase())
            });

    const handleInputChange = (field: keyof InventoryData, value: string | number) => {
        setInventoryData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUbicacionChange = (ubicacion: Ubicacion | null) => {
        setQuery('');
        setSelectedUbicacion(ubicacion);
        setInventoryData(prev => ({
            ...prev,
            id_ubicacion: ubicacion ? Number(ubicacion.id) : 0
        }));
    };

    const handleProductChange = (product: Product | null) => {
        setProductQuery('');
        setSelectedProduct(product);
        setInventoryData(prev => ({
            ...prev,
            id_producto: product?.id || 0
        }));
    };

    const styleInput = 'block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'

    return (
        <>

            <Dialog open={open} onClose={onClose} className={"relative z-10"}>
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
                                        Inventario de Producto
                                    </DialogTitle>
                                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form id="inventory-form" className="space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="id_producto" className="block text-sm font-medium leading-6 text-gray-900">
                                            Producto
                                        </label>
                                        <div className="mt-2">
                                            <Combobox
                                                as="div"
                                                value={selectedProduct}
                                                onChange={handleProductChange}
                                                by="id"
                                            >
                                                <div className="relative mt-2">
                                                    <ComboboxInput
                                                        className="block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setProductQuery(event.target.value)}
                                                        displayValue={(product: Product | null) => product ? `${product.name} (${product.code})` : ''}
                                                        placeholder="Seleccionar producto"
                                                        disabled={isLoadingProducts}
                                                    />
                                                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
                                                        <ChevronDownIcon className="size-5 text-gray-400" aria-hidden="true" />
                                                    </ComboboxButton>
                                                    {isLoadingProducts ? (
                                                        <div className="absolute z-60 mt-1 w-full rounded-md bg-white py-2 text-center text-sm text-gray-500 shadow-lg ring-1 ring-black/5">
                                                            Cargando productos...
                                                        </div>
                                                    ) : (
                                                        <ComboboxOptions
                                                            transition
                                                            className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                                                        >
                                                            {filteredProducts.length === 0 ? (
                                                                <div className="px-3 py-2 text-gray-500 text-sm">
                                                                    No se encontraron productos
                                                                </div>
                                                            ) : (
                                                                filteredProducts.map((product) => (
                                                                    <ComboboxOption
                                                                        key={product.id}
                                                                        value={product}
                                                                        className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                                                                    >
                                                                        <span className="block truncate">{product.name} ({product.code})</span>
                                                                    </ComboboxOption>
                                                                ))
                                                            )}
                                                        </ComboboxOptions>
                                                    )}
                                                </div>
                                            </Combobox>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="cantidad_actual" className="block text-sm font-medium leading-6 text-gray-900">
                                            Cantidad Actual
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="cantidad_actual"
                                                id="cantidad_actual"
                                                min="0"
                                                value={inventoryData.cantidad_actual}
                                                onChange={(e) => handleInputChange('cantidad_actual', parseInt(e.target.value) || 0)}
                                                className={styleInput}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="stock_minimo" className="block text-sm font-medium leading-6 text-gray-900">
                                            Stock Mínimo
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="stock_minimo"
                                                id="stock_minimo"
                                                min="0"
                                                value={inventoryData.stock_minimo}
                                                onChange={(e) => handleInputChange('stock_minimo', parseInt(e.target.value) || 0)}
                                                className={styleInput}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="stock_maximo" className="block text-sm font-medium leading-6 text-gray-900">
                                            Stock Máximo
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="stock_maximo"
                                                id="stock_maximo"
                                                min="0"
                                                value={inventoryData.stock_maximo}
                                                onChange={(e) => handleInputChange('stock_maximo', parseInt(e.target.value) || 0)}
                                                className={styleInput}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="id_ubicacion" className="block text-sm font-medium leading-6 text-gray-900">
                                            Ubicación
                                        </label>
                                        <div className="mt-2">
                                            <Combobox
                                                as="div"
                                                value={selectedUbicacion}
                                                onChange={handleUbicacionChange}
                                                by="id"
                                            >
                                                <div className="relative mt-2">
                                                    <ComboboxInput
                                                        className="block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                                                        displayValue={(ubicacion: Ubicacion | null) => ubicacion?.nombre || ''}
                                                        placeholder="Seleccionar ubicación"
                                                        disabled={isLoadingUbicaciones}
                                                    />
                                                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
                                                        <ChevronDownIcon className="size-5 text-gray-400" aria-hidden="true" />
                                                    </ComboboxButton>
                                                    {isLoadingUbicaciones ? (
                                                        <div className="absolute z-50 mt-1 w-full rounded-md bg-white py-2 text-center text-sm text-gray-500 shadow-lg ring-1 ring-black/5">
                                                            Cargando ubicaciones...
                                                        </div>
                                                    ) : (
                                                        <ComboboxOptions
                                                            transition
                                                            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                                                        >
                                                            {filteredUbicaciones.length === 0 ? (
                                                                <div className="px-3 py-2 text-gray-500 text-sm">
                                                                    No se encontraron ubicaciones
                                                                </div>
                                                            ) : (
                                                                filteredUbicaciones.map((ubicacion) => (
                                                                    <ComboboxOption
                                                                        key={ubicacion.id}
                                                                        value={ubicacion}
                                                                        className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                                                                    >
                                                                        <span className="block truncate">{ubicacion.nombre}</span>
                                                                    </ComboboxOption>
                                                                ))
                                                            )}
                                                        </ComboboxOptions>
                                                    )}
                                                </div>
                                            </Combobox>
                                        </div>
                                    </div>
                                </form>

                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="submit"
                                    form="inventory-form"
                                    disabled={isSubmitting || !canSubmit}
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
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </>
    )
}