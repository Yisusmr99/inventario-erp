import AppLayout from "../components/layout/AppLayout";
import CategoriesTable from "../components/categorias/CategoriesTable";

export function meta() {
    return [
        { title: "Categorías - Inventario ERP" },
        { name: "description", content: "Gestión de categorías de productos" },
    ];
}

export default function ProductCategories() {
    return (
        <AppLayout pageTitle="Categorías">
            <div className="space-y-8">
                <CategoriesTable />
            </div>
        </AppLayout>
    );
}
