import { Link } from 'react-router';
import AppLayout from "../components/layout/AppLayout";

export function meta() {
  return [
    { title: "Productos - Inventario ERP" },
    { name: "description", content: "Gestión de productos" },
  ];
}

export default function Products() {
  return (
    <AppLayout pageTitle="Productos">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra el catálogo de productos y categorías
          </p>
        </div>
        
        {/* Navegación rápida */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/products/categories"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          >
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Categorías</p>
              <p className="text-sm text-gray-500 truncate">Gestionar categorías de productos</p>
            </div>
          </Link>

          <Link
            to="/products/catalog"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          >
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Catálogo</p>
              <p className="text-sm text-gray-500 truncate">Gestionar productos del catálogo</p>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
