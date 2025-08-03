'use client'

import { useState, useMemo, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import CategoryForm from './CategoryForm'
import DeleteCategoryDialog from './DeleteCategoryDialog'
import { ProductCategoriesApi, type ProductCategory, type CreateProductCategoryRequest, type UpdateProductCategoryRequest } from 'app/api/ProductCategories'


interface Category {
    id: string
    name: string
    description: string
    status: 'Activa' | 'Inactiva'
    productCount: number
    createdAt: string
}

const ITEMS_PER_PAGE = 10

// Helper function to transform API data to component format
const transformApiDataToCategory = (apiData: ProductCategory): Category => ({
    id: apiData.id_categoria.toString(),
    name: apiData.nombre,
    description: apiData.descripcion,
    status: apiData.estado === 1 ? 'Activa' : 'Inactiva',
    productCount: 0, // This would come from another API call if needed
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
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load categories on component mount
    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const apiCategories = await ProductCategoriesApi.getAll()
            const transformedCategories = apiCategories.map(transformApiDataToCategory)
            setCategories(transformedCategories)
        } catch (err) {
            console.error('Error loading categories:', err)
            setError('Error al cargar las categorías. Por favor, intenta de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    // Filter categories based on search term
    const filteredCategories = useMemo(() => {
        return categories.filter((category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [categories, searchTerm])

    // Calculate pagination
    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

    // Reset to first page when search changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const getStatusBadge = (status: Category['status']) => {
        const baseClasses = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium'
        if (status === 'Activa') {
            return `${baseClasses} bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20`
        }
        return `${baseClasses} bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20`
    }

    const handleCreateCategory = () => {
        setEditingCategory(null)
        setFormMode('create')
        setIsFormOpen(true)
    }

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category)
        setFormMode('edit')
        setIsFormOpen(true)
    }

    const handleFormSubmit = async (formData: any) => {
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
            
            // Reload categories after successful operation
            await loadCategories()
        } catch (err) {
            console.error('Error saving category:', err)
            throw err // Re-throw to let the form handle the error
        }
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditingCategory(null)
    }

    const getFormInitialData = () => {
        if (editingCategory) {
            return {
                id: editingCategory.id,
                nombre: editingCategory.name,
                descripcion: editingCategory.description
            }
        }
        return null
    }

    const handleDeleteCategory = (category: Category) => {
        setCategoryToDelete(category)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return
        
        setIsDeleting(true)
        try {
            await ProductCategoriesApi.delete(parseInt(categoryToDelete.id))
            
            // Reload categories after successful deletion
            await loadCategories()
            
            // Close dialog after successful deletion
            setIsDeleteDialogOpen(false)
            setCategoryToDelete(null)
        } catch (error) {
            console.error('Error deleting category:', error)
            // You might want to show an error message to the user here
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCloseDeleteDialog = () => {
        if (!isDeleting) {
            setIsDeleteDialogOpen(false)
            setCategoryToDelete(null)
        }
    }

    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Cargando categorías...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadCategories}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
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
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar categorías..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-sm outline-1 outline-black/5 sm:rounded-lg">
                            <table className="relative min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Nombre
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Descripción
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Fecha de creación
                                        </th>
                                        <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-6">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {paginatedCategories.map((category) => (
                                        <tr key={category.id}>
                                            <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                                {category.name}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {category.description}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap">
                                                <span className={getStatusBadge(category.status)}>
                                                    {category.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {new Date(category.createdAt).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Editar<span className="sr-only">, {category.name}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar<span className="sr-only">, {category.name}</span>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                                <span className="font-medium">{Math.min(endIndex, filteredCategories.length)}</span> de{' '}
                                <span className="font-medium">{filteredCategories.length}</span> resultados
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
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
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage
                                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
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

            {/* Empty state */}
            {filteredCategories.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No se encontraron categorías que coincidan con la búsqueda.</p>
                </div>
            )}

            {/* Category Form Modal */}
            <CategoryForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                initialData={getFormInitialData()}
                mode={formMode}
            />

            {/* Delete Confirmation Dialog */}
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
