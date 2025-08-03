import AppLayout from "../components/layout/AppLayout";

export function meta() {
    return [
        { title: "Catálogo de Productos - Inventario ERP" },
        { name: "description", content: "Gestión del catálogo de productos" },
    ];
}

export default function ProductCatalog() {
    return (
        <AppLayout pageTitle="Catálogo">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Catálogo de Productos</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Administra el catálogo completo de productos
                    </p>
                </div>

                {/* Área de contenido principal */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Lista de productos</h2>
                    <p className="text-gray-600">
                        Aquí se mostrará la gestión del catálogo de productos.
                        Puedes agregar, editar y eliminar productos del sistema.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
