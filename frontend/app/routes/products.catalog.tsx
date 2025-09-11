// frontend/app/routes/products.catalog.tsx
import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import ProductsTable from "../components/productos/ProductsTable";
import InventoryIndex from "../components/Inventory/Index";

export function meta() {
  return [
    { title: "Productos - Inventario ERP" },
    { name: "description", content: "Gestión de productos" },
  ];
}

export default function ProductCatalog() {
  const [activeTab, setActiveTab] = useState("productos");

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Tabs - Fixed at top */}
        <div className="border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white z-10">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("productos")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "productos"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab("inventario")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "inventario"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Inventario
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 mt-6 overflow-auto">
          {activeTab === "productos" && <ProductsTable />}
          {activeTab === "inventario" && <InventoryIndex />}
        </div>
      </div>
    </AppLayout>
  );
}
