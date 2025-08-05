'use client'

import { useState, useCallback, useEffect } from 'react'
import SearchBar from './SearchBar'
import CategoriesTableContent from './CategoriesTableContent'
import CategoryForm from './CategoryForm'
import DeleteCategoryDialog from './DeleteCategoryDialog'
import { ProductCategoriesApi } from 'app/api/ProductCategories'
import type { Category, PaginationData, ProductCategory, 
    UpdateProductCategoryRequest, CreateProductCategoryRequest,
 } from '~/types/ProductCategories'

const ITEMS_PER_PAGE = 8

// Helper function to transform API data to component format
const transformApiDataToCategory = (apiData: ProductCategory): Category => ({
    id: apiData.id_categoria.toString(),
    name: apiData.nombre,
    description: apiData.descripcion,
    status: apiData.estado === 1 ? 'Activa' : 'Inactiva',
    productCount: 0,
    createdAt: apiData.fecha_creacion,
})

export default function CategoriesTable() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [paginationData, setPaginationData] = useState<PaginationData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load categories function
    const loadCategories = useCallback(async (page: number = 1, search?: string) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await ProductCategoriesApi.getAllWithPagination({
                page,
                limit: ITEMS_PER_PAGE,
                search: search || undefined
            })
            
            const transformedCategories = response.categories.map(transformApiDataToCategory)
            
            setPaginationData({
                categories: transformedCategories,
                totalCategories: response.totalCategories,
                totalPages: response.totalPages,
                currentPage: response.currentPage,
                hasNextPage: response.hasNextPage,
                hasPreviousPage: response.hasPreviousPage,
                nextPage: response.nextPage,
                previousPage: response.previousPage,
                nextPageUrl: response.nextPageUrl,
                previousPageUrl: response.previousPageUrl,
                currentPageUrl: response.currentPageUrl,
                firstPageUrl: response.firstPageUrl,
                lastPageUrl: response.lastPageUrl
            })
        } catch (err) {
            console.error('Error loading categories:', err)
            setError('Error al cargar las categorías. Por favor, intenta de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Load categories on component mount
    useEffect(() => {
        loadCategories(1)
    }, [loadCategories])

    // Handle search change with debouncing
    const handleSearchChange = useCallback((search: string) => {
        setSearchTerm(search)
        setCurrentPage(1)
        loadCategories(1, search)
    }, [loadCategories])

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
        loadCategories(page, searchTerm)
    }, [loadCategories, searchTerm])

    // Form handlers
    const handleCreateCategory = useCallback(() => {
        setEditingCategory(null)
        setFormMode('create')
        setIsFormOpen(true)
    }, [])

    const handleEditCategory = useCallback((category: Category) => {
        setEditingCategory(category)
        setFormMode('edit')
        setIsFormOpen(true)
    }, [])

    const handleFormSubmit = useCallback(async (formData: any) => {
        try {
            if (formMode === 'create') {
                const createData: CreateProductCategoryRequest = {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    estado: formData.estado || 1,
                }
                await ProductCategoriesApi.create(createData)
            } else if (editingCategory) {
                const updateData: UpdateProductCategoryRequest = {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    estado: formData.estado || 1,
                }
                await ProductCategoriesApi.update(parseInt(editingCategory.id), updateData)
            }
            
            await loadCategories(currentPage, searchTerm)
        } catch (err) {
            console.error('Error saving category:', err)
            throw err
        }
    }, [formMode, editingCategory, loadCategories, currentPage, searchTerm])

    const handleCloseForm = useCallback(() => {
        setIsFormOpen(false)
        setEditingCategory(null)
    }, [])

    // Delete handlers
    const handleDeleteCategory = useCallback((category: Category) => {
        setCategoryToDelete(category)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (!categoryToDelete) return
        
        setIsDeleting(true)
        try {
            await ProductCategoriesApi.delete(parseInt(categoryToDelete.id))
            await loadCategories(currentPage, searchTerm)
            setIsDeleteDialogOpen(false)
            setCategoryToDelete(null)
        } catch (error) {
            console.error('Error deleting category:', error)
        } finally {
            setIsDeleting(false)
        }
    }, [categoryToDelete, loadCategories, currentPage, searchTerm])

    const handleCloseDeleteDialog = useCallback(() => {
        if (!isDeleting) {
            setIsDeleteDialogOpen(false)
            setCategoryToDelete(null)
        }
    }, [isDeleting])

    // Get form initial data
    const getFormInitialData = useCallback(() => {
        if (editingCategory) {
            return {
                id: editingCategory.id,
                nombre: editingCategory.name,
                descripcion: editingCategory.description
            }
        }
        return null
    }, [editingCategory])

    if (error) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => loadCategories(currentPage)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    const categories = paginationData?.categories || []
    const totalPages = paginationData?.totalPages || 0
    const totalCategories = paginationData?.totalCategories || 0

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-gray-900">Categorías de Productos</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Lista de todas las categorías de productos en el sistema incluyendo su nombre, descripción y estado.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Agregar categoría
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mt-6">
                <SearchBar
                    onSearchChange={handleSearchChange}
                    placeholder="Buscar categorías por nombre o descripción..."
                    initialValue={searchTerm}
                />
            </div>

            {/* Table Content */}
            <CategoriesTableContent
                categories={categories}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                isLoading={isLoading}
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
                                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCategories)}</span> de{' '}
                                <span className="font-medium">{totalCategories}</span> resultados
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

            {/* Modals */}
            <CategoryForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                initialData={getFormInitialData()}
                mode={formMode}
            />

            <DeleteCategoryDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                category={categoryToDelete}
                isDeleting={isDeleting}
            />
        </div>
    )
}