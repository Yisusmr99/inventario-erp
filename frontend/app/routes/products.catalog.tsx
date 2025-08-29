// app/routes/products.catalog.tsx

// CORRECCIÓN: Se ajusta la ruta relativa según la estructura de tu proyecto.
import AppLayout from '../components/layout/AppLayout';
import ProductsTable from '../components/productos/ProductsTable';

// La función meta es una excelente adición para el SEO de la página.
export function meta() {
    return [
        { title: "Catálogo de Productos - Inventario ERP" },
        { name: "description", content: "Gestión del catálogo de productos" },
    ];
}

export default function ProductCatalog() {
    return (
        <AppLayout pageTitle="Catálogo de Productos">
            <div className="space-y-6">
                {/* Encabezado de la página */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Catálogo de Productos
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Administra el catálogo completo de productos del sistema.
                    </p>
                </div>

                {/* Contenedor para la tabla con un estilo limpio */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <ProductsTable />
                </div>
            </div>
        </AppLayout>
    );
}
