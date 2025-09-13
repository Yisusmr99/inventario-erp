'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
    onSearchChange: (searchTerm: string) => void
    placeholder?: string
    initialValue?: string
}

export default function InventorySearchBar({ 
    onSearchChange, 
    placeholder = "Buscar productos por nombre o código...", 
    initialValue = "" 
}: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState(initialValue)

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearchChange(searchTerm)
        }, 500) // 500ms delay for inventory search

        return () => clearTimeout(timeoutId)
    }, [searchTerm]) // Removed onSearchChange from dependencies to avoid infinite loop

    // Update local state when initialValue changes (only if different)
    useEffect(() => {
        if (initialValue !== searchTerm) {
            setSearchTerm(initialValue)
        }
    }, [initialValue]) // Removed searchTerm from dependencies

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const clearSearch = () => {
        setSearchTerm('')
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearchChange(searchTerm)
        }
    }

    return (
        <div className="w-full max-w-lg mb-4">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-colors duration-200"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Limpiar búsqueda"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                    Buscando: <span className="font-medium text-gray-900">"{searchTerm}"</span>
                </div>
            )}
        </div>
    )
}
