// frontend/app/routes/products.catalog.tsx
import AppLayout from "../components/layout/AppLayout";
import ProductsTable from "../components/productos/ProductsTable";

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
                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Catálogo de Productos
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Administra el catálogo completo de productos del sistema.
                    </p>
                </div>

                {/* Contenedor de la tabla */}
                <div className="bg-white shadow-sm rounded-lg">
                    <ProductsTable />
                </div>
            </div>
        </AppLayout>
    );
}
