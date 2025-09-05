// frontend/app/routes/products.catalog.tsx
import AppLayout from "../components/layout/AppLayout";
import ProductsTable from "../components/productos/ProductsTable";

export function meta() {
  return [
    { title: "Productos - Inventario ERP" },
    { name: "description", content: "Gestión de productos" },
  ];
}

export default function ProductCatalog() {
  return (
    // No pasamos pageTitle para que NO aparezca "Catálogo de Productos"
    <AppLayout>
      <div className="space-y-8">
        <ProductsTable />
      </div>
    </AppLayout>
  );
}
