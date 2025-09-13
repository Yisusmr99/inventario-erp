'use client'

import { memo } from 'react'
import type { Location } from '../../types/Locations'
import { PencilSquareIcon } from '@heroicons/react/24/outline'

interface Props {
  locations: Location[];
  isLoading: boolean;
  onEditLocation: (it: Location) => void;
  onDeleteLocation: (it: Location) => void;
  onToggleEstado: (it: Location) => void;
}

function formatES(dt: string) {
  // Acepta "YYYY-MM-DDTHH:mm:ss" o "YYYY-MM-DD HH:mm:ss"
  const safe = dt?.includes(' ') ? dt.replace(' ', 'T') : dt;
  const d = new Date(safe);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES');
}

const LocationsTableContent = memo(function LocationsTableContent({
  locations,
  isLoading,
  onEditLocation,
  onDeleteLocation,
  onToggleEstado
}: Props) {
  const getStatusBadge = (status: Location['status']) => {
    const base = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium'
    return status === 'Activa'
      ? `${base} bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20`
      : `${base} bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20`
  }

  if (isLoading) {
    return (
      <div className="mt-8 flow-root">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="mt-8 text-center py-12">
        <p className="text-gray-500">No se encontraron ubicaciones.</p>
      </div>
    )
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
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descripción</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacidad</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Creada</th>
                  <th className="py-3.5 pr-4 pl-3 sm:pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                      {loc.name}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {loc.description || '—'}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-700">
                      {loc.capacity ?? 0}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      <span className={getStatusBadge(loc.status)}>{loc.status}</span>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      {formatES(loc.createdAt)}
                    </td>
                    <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => onToggleEstado(loc)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          title={loc.status === 'Activa' ? 'Desactivar' : 'Activar'}
                        >
                          {loc.status === 'Activa' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => onEditLocation(loc)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          title="Editar"
                        >
                          <PencilSquareIcon className="h-4 w-4 mr-1" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
})

export default LocationsTableContent
