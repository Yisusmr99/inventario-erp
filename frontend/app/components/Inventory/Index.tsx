import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { InventoryApi } from '~/api/Inventory';
import InventoryTable from './InventoryTable';
import ProductInventory from './ProductInventory';
import StockModal from './StockModal';
import ReorderPointModal from './ReorderPointModal';
import SearchBar from './SearchBar';


const ITEMS_PER_PAGE = 8;

export default function InventoryIndex() {

    const [isLoading, setIsLoading] = React.useState(false);
    const [paginationData, setPaginationData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showReorderPointModal, setShowReorderPointModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);


    const loadInventory = async ( page: number = 1, search: string) => {
        setIsLoading(true);
        try {
            const data = await InventoryApi.getAllProductsInventory({
                page,
                limit: ITEMS_PER_PAGE,
                search: search || undefined,
            });
            setPaginationData(data);
        } catch (error) {
            toast.error(`Error al cargar inventario: ${error}`);   
        }finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadInventory(1, "");
    }, []);

    const handlePageChange = (page: number) => {
        loadInventory(page, searchTerm);
    };

    const handleSearchChange = (search: string) => {
        // Only update if the search term is different
        if (search !== searchTerm) {
            setSearchTerm(search);
            loadInventory(1, search);
        }
    };

    // Extract pagination values
    const currentPage = paginationData?.currentPage || 1;
    const totalPages = paginationData?.totalPages || 1;
    const totalItems = paginationData?.totalItems || 0;

    const handleAddInventory = () => {
        setShowInventoryModal(true);
    };

    const handleCloseInventoryModal = () => {
        setShowInventoryModal(false);
    };

    const handleSaveInventory = async (inventoryData: any) => {
        try {
            await InventoryApi.createInventoryItem({
                id_producto: inventoryData.id_producto,
                id_ubicacion: inventoryData.id_ubicacion,
                cantidad: inventoryData.cantidad_actual,
                stock_minimo: inventoryData.stock_minimo,
                stock_maximo: inventoryData.stock_maximo,
                punto_reorden: inventoryData.punto_reorden,
            });
            
            toast.success('Inventario creado exitosamente');
            
            // Reload inventory data
            loadInventory(currentPage, searchTerm);
        } catch (error: any) {
            const errorMessage = error || 'Error al crear el inventario';
            toast.error(' ' + errorMessage);
            throw error; // Re-throw to let the modal handle the error state
        }
    };

    const handleAddStock = (item: any) => {
        setSelectedItem(item);
        setShowStockModal(true);
    };

    const handleCloseStockModal = () => {
        setShowStockModal(false);
        setSelectedItem(null);
    };

    const handleUpdateStock = async (itemId: number, quantity: number, operation: 'add' | 'subtract', motivo: string) => {
        try {
            // Encontrar el item para obtener la información necesaria
            const item = selectedItem;
            if (!item) {
                throw new Error('Item no encontrado');
            }

            // Calcular la nueva cantidad
            const newQuantity = operation === 'add' 
                ? '+' + quantity 
                :  '-' + quantity;

            // Llamar al API para ajustar el stock
            await InventoryApi.ajustarStock({
                id_producto: item.id_producto,
                id_ubicacion: item.id_ubicacion,
                cantidad: parseFloat(newQuantity),
                usuario: 'sistema',
                motivo: motivo,
            });
            
            toast.success(`Stock ${operation === 'add' ? 'agregado' : 'restado'} exitosamente`);
            
            // Reload inventory data
            loadInventory(currentPage, searchTerm);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar el stock';
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleEditReorderPoint = (item: any) => {
        setSelectedItem(item);
        setShowReorderPointModal(true);
    };

    const handleCloseReorderPointModal = () => {
        setShowReorderPointModal(false);
        setSelectedItem(null);
    };

    const handleSaveReorderPoint = async (id_inventario: number, punto_reorden: number) => {
        try {
            await InventoryApi.editInventory({
                id_inventario,
                punto_reorden,
            });
            
            toast.success('Punto de reorden actualizado exitosamente');
            
            // Reload inventory data
            loadInventory(currentPage, searchTerm);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar el punto de reorden';
            toast.error(errorMessage);
            throw error;
        }
    };




    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-gray-900">Inventario de producto por ubicación</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Lista de inventario de productos organizados por ubicación.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={handleAddInventory}
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Agregar inventario
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mt-6">
                <SearchBar
                    onSearchChange={handleSearchChange}
                    placeholder="Buscar productos por nombre o código..."
                    initialValue={searchTerm}
                />
            </div>

            {/* Table Content */}
            <InventoryTable 
                data={paginationData?.products || []}
                isLoading={isLoading}
                onAddStock={handleAddStock}
                onEditReorderPoint={handleEditReorderPoint}
            />

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={!paginationData?.hasPreviousPage}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={!paginationData?.hasNextPage}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a{' '}
                                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> de{' '}
                                <span className="font-medium">{totalItems}</span> resultados
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={!paginationData?.hasPreviousPage}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Anterior</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage
                                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={!paginationData?.hasNextPage}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Siguiente</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Inventory Modal */}
            <ProductInventory 
                open={showInventoryModal}
                onClose={handleCloseInventoryModal}
                onSave={handleSaveInventory}
            />

            {/* Stock Modal */}
            <StockModal 
                isOpen={showStockModal}
                onClose={handleCloseStockModal}
                item={selectedItem}
                onSubmit={handleUpdateStock}
            />

            {/* Reorder Point Modal */}
            <ReorderPointModal
                isOpen={showReorderPointModal}
                onClose={handleCloseReorderPointModal}
                item={selectedItem}
                onSave={handleSaveReorderPoint}
            />

        </div>
    )
}