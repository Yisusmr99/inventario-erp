// app/components/ubicaciones/DeleteLocationsDialog.tsx
'use client'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import React from 'react'
import type { Location } from '../../types/Locations' // ajusta la ruta si la tienes distinta

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  location: Location | null
  isDeleting: boolean
}

export default function DeleteLocationDialog({ open, onClose, onConfirm, location, isDeleting }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-lg bg-white shadow-xl">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                  Desactivar ubicación
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    ¿Estás seguro de que querés desactivar la ubicación{' '}
                    <span className="font-semibold">“{location?.name ?? ''}”</span>?
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Podrás reactivarla más adelante desde este listado.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
            >
              {isDeleting ? 'Desactivando...' : 'Desactivar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancelar
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
