// app/routes/products.categories.tsx

import AppLayout from '../components/layout/AppLayout';
// CORRECCIÓN: Se importa el componente de la tabla de categorías que creaste.
import CategoriesTable from '../components/categorias/CategoriesTable';

export function meta() {
    return [
        { title: "Categorías - Inventario ERP" },
        { name: "description", content: "Gestión de categorías de productos" },
    ];
}

export default function ProductCategories() {
    return (
        <AppLayout pageTitle="Categorías">
            {/* El componente CategoriesTable ya tiene su propio encabezado y estructura,
                así que podemos colocarlo directamente aquí. */}
            <CategoriesTable />
        </AppLayout>
    );
}
