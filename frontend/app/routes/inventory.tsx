import AppLayout from "../components/layout/AppLayout";

export function meta() {
  return [
    { title: "Inventario - Inventario ERP" },
    { name: "description", content: "Gestión de inventario" },
  ];
}

export default function Inventory() {
  return (
    <AppLayout pageTitle="Inventario">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventario</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona el inventario de productos en tiempo real
          </p>
        </div>
        
        {/* Área de contenido principal */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Lista de productos</h2>
          <p className="text-gray-600">
            Aquí se mostrará la tabla de productos del inventario.
            Este contenido puede ser reemplazado con los componentes específicos de inventario.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
