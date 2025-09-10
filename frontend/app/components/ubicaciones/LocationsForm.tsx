// app/components/ubicaciones/LocationForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  id?: string;
  nombre_ubicacion: string;
  descripcion: string;
  capacidad: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void> | void;
  initialData?: FormData | null;
  mode: 'create' | 'edit';
}

export default function LocationForm({
  open,
  onClose,
  onSubmit,
  initialData = null,
  mode
}: Props) {
  const [formData, setFormData] = useState<FormData>({
    nombre_ubicacion: '',
    descripcion: '',
    capacidad: 0
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData) setFormData(initialData)
      else setFormData({ nombre_ubicacion: '', descripcion: '', capacidad: 0 })
      setErrors({})
    }
  }, [open, initialData])

  const validate = () => {
    const e: Partial<FormData> = {}
    if (!formData.nombre_ubicacion.trim()) e.nombre_ubicacion = 'El nombre es obligatorio'
    else if (formData.nombre_ubicacion.trim().length > 100) e.nombre_ubicacion = 'El nombre no puede exceder 100 caracteres'
    if (!formData.descripcion.trim()) e.descripcion = 'La descripción es obligatoria'
    if (typeof formData.capacidad !== 'number' || isNaN(formData.capacidad) || formData.capacidad < 0)
      e.capacidad = 'La capacidad debe ser un número mayor o igual a 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido'
      if (errorMessage.includes('Ya existe')) {
        setErrors(prev => ({ ...prev, nombre_ubicacion: errorMessage }))
      } else {
        toast.error('Ya existe una ubicación con ese nombre.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const set = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                  {mode === 'create' ? 'Crear Nueva Ubicación' : 'Editar Ubicación'}
                </DialogTitle>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Cerrar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre_ubicacion" className="block text-sm font-medium leading-6 text-gray-900">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="nombre_ubicacion"
                      value={formData.nombre_ubicacion}
                      onChange={(e) => set('nombre_ubicacion', e.target.value)}
                      maxLength={100}
                      className={`block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                        errors.nombre_ubicacion ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                      }`}
                      placeholder="Ingresa el nombre de la ubicación"
                    />
                    {errors.nombre_ubicacion && <p className="mt-1 text-sm text-red-600">{errors.nombre_ubicacion}</p>}
                    <p className="mt-1 text-sm text-gray-500 px-1.5">{formData.nombre_ubicacion.length}/100 caracteres</p>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium leading-6 text-gray-900">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="descripcion"
                      rows={4}
                      value={formData.descripcion}
                      onChange={(e) => set('descripcion', e.target.value)}
                      className={`block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                        errors.descripcion ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                      }`}
                      placeholder="Describe la ubicación (zona, tipo de estantería, etc.)"
                    />
                    {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
                  </div>
                </div>

                {/* Capacidad */}
                <div>
                  <label htmlFor="capacidad" className="block text-sm font-medium leading-6 text-gray-900">
                    Capacidad <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      id="capacidad"
                      min={0}
                      value={formData.capacidad}
                      onChange={(e) => set('capacidad', Number(e.target.value))}
                      className={`block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                        errors.capacidad ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'
                      }`}
                      placeholder="0"
                    />
                    {errors.capacidad && <p className="mt-1 text-sm text-red-600">{errors.capacidad}</p>}
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
              >
                {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Ubicación' : 'Guardar Cambios')}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
              >
                Cancelar
              </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
