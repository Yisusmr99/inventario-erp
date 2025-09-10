// app/routes/inventory.locations.tsx
import AppLayout from "../components/layout/AppLayout";
import LocationsTable from "../components/ubicaciones/LocationsTable";

export function meta() {
  return [
    { title: "Ubicaciones - Inventario ERP" },
    { name: "description", content: "Gestión de ubicaciones de bodega" },
  ];
}

export default function InventoryLocationsPage() {
  return (
    <AppLayout pageTitle="Ubicaciones">
      <div className="space-y-8">
        <LocationsTable />
      </div>
    </AppLayout>
  );
}
