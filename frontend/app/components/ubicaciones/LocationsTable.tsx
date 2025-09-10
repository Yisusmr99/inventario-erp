// app/components/ubicaciones/LocationsTable.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import SearchBar from '../categorias/SearchBar'
import LocationsTableContent from './LocationsTableContent'
import LocationForm from './LocationsForm'
import DeleteLocationDialog from './DeleteLocationsDialog'
import { LocationsApi } from '../../api/Locations'
import type {
  Location,
  PaginationData,
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../types/Locations'

const ITEMS_PER_PAGE = 8

const transformApiDataToLocation = (loc: Location): Location => ({
  id: loc.id.toString(),
  name: loc.name,
  description: loc.description,
  capacity: loc.capacity,
  status: loc.status,
  createdAt: loc.createdAt,
  updatedAt: loc.updatedAt,
})

export default function LocationsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLocations = useCallback(async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await LocationsApi.getAllWithPagination({
        page,
        limit: ITEMS_PER_PAGE,
        search: search || undefined
      })
      const transformed = response.locations.map(transformApiDataToLocation)
      setPaginationData({ ...response, locations: transformed })
    } catch (err) {
      console.error('Error loading locations:', err)
      setError('Error al cargar las ubicaciones. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadLocations(1) }, [loadLocations])

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search)
    setCurrentPage(1)
    loadLocations(1, search)
  }, [loadLocations])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    loadLocations(page, searchTerm)
  }, [loadLocations, searchTerm])

  const handleCreateLocation = useCallback(() => {
    setEditingLocation(null)
    setFormMode('create')
    setIsFormOpen(true)
  }, [])

  const handleEditLocation = useCallback((loc: Location) => {
    setEditingLocation(loc)
    setFormMode('edit')
    setIsFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(async (formData: any) => {
    try {
      if (formMode === 'create') {
        const createData: CreateLocationRequest = {
          nombre_ubicacion: formData.nombre_ubicacion,
          descripcion: formData.descripcion?.trim() ? formData.descripcion : null,
          capacidad: typeof formData.capacidad === 'number' ? formData.capacidad : null,
          estado: 1,
        }
        await LocationsApi.create(createData)
      } else if (editingLocation) {
        const updateData: UpdateLocationRequest = {
          nombre_ubicacion: formData.nombre_ubicacion,
          descripcion: formData.descripcion?.trim() ? formData.descripcion : null,
          capacidad: typeof formData.capacidad === 'number' ? formData.capacidad : null,
          estado: editingLocation.status === 'Activa' ? 1 : 0,
        }
        await LocationsApi.update(parseInt(editingLocation.id), updateData)
      }
      await loadLocations(currentPage, searchTerm)
    } catch (err) {
      console.error('Error saving location:', err)
      throw err
    }
  }, [formMode, editingLocation, loadLocations, currentPage, searchTerm])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingLocation(null)
  }, [])

  const handleDeleteLocation = useCallback((loc: Location) => {
    setLocationToDelete(loc)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!locationToDelete) return
    setIsDeleting(true)
    try {
      // Si el backend usa soft delete con estado=0, podrías usar setEstado aquí en lugar de delete:
      // await LocationsApi.setEstado(parseInt(locationToDelete.id), 0);
      await LocationsApi.delete(parseInt(locationToDelete.id))
      await loadLocations(currentPage, searchTerm)
      setIsDeleteDialogOpen(false)
      setLocationToDelete(null)
    } catch (error) {
      console.error('Error deleting location:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [locationToDelete, loadLocations, currentPage, searchTerm])

  const handleCloseDeleteDialog = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false)
      setLocationToDelete(null)
    }
  }, [isDeleting])

  const handleToggleEstado = useCallback(async (loc: Location) => {
    try {
      const next = loc.status === 'Activa' ? 0 : 1
      await LocationsApi.setEstado(parseInt(loc.id), next)
      await loadLocations(currentPage, searchTerm)
    } catch (err) {
      console.error('Error toggling state:', err)
      alert('No se pudo cambiar el estado.')
    }
  }, [loadLocations, currentPage, searchTerm])

  const getFormInitialData = useCallback(() => {
    if (editingLocation) {
      return {
        id: editingLocation.id,
        nombre_ubicacion: editingLocation.name,
        descripcion: editingLocation.description,
        capacidad: editingLocation.capacity,
      }
    }
    return null
  }, [editingLocation])

  const locations = paginationData?.locations || []
  const totalPages = paginationData?.totalPages || 0
  const totalLocations = paginationData?.totalLocations || 0

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadLocations(currentPage)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">Ubicaciones</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de ubicaciones de bodega, incluyendo nombre, descripción, capacidad y estado.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreateLocation}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Agregar ubicación
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <SearchBar
          onSearchChange={handleSearchChange}
          placeholder="Buscar ubicaciones por nombre o descripción..."
          initialValue={searchTerm}
        />
      </div>

      {/* Table */}
      <LocationsTableContent
        locations={locations}
        onEditLocation={handleEditLocation}
        onDeleteLocation={handleDeleteLocation}
        onToggleEstado={handleToggleEstado}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={!paginationData?.hasPreviousPage}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={!paginationData?.hasNextPage}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalLocations)}</span> de{' '}
                <span className="font-medium">{totalLocations}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={!paginationData?.hasPreviousPage}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
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
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === currentPage
                        ? 'z-10 bg-indigo-600 text-white'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={!paginationData?.hasNextPage}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
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
      <LocationForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={getFormInitialData()}
        mode={formMode}
      />

      <DeleteLocationDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        location={locationToDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
