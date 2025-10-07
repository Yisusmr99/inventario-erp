import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";

// --- Interfaces para definir la estructura de los datos ---
interface ContactoPrincipal {
    id: string;
    name: string;
    dpi: number;
    direccion: string;
    telefono: string;
    correo: string;
    fecha_Nacimiento: string;
    estado: boolean;
}

interface Proveedor {
    id: string;
    name: string;
    email: string;
    phone: string;
    nit: number;
    isActive: boolean;
    contactoPrincipalDto: ContactoPrincipal;
}

// --- Componente para una Fila de la Tabla (con su propia lógica) ---
function ProveedorRow({ proveedor }: { proveedor: Proveedor }) {
    // Estado para saber si los detalles de ESTA fila están visibles
    const [detallesVisibles, setDetallesVisibles] = useState(false);

    return (
        <>
            {/* Fila principal con los datos del proveedor */}
            <tr className="bg-white">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proveedor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proveedor.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proveedor.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proveedor.nit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {proveedor.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Activo
                        </span>
                    ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Inactivo
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                        onClick={() => setDetallesVisibles(!detallesVisibles)}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        {detallesVisibles ? 'Ocultar' : 'Detalles'}
                    </button>
                </td>
            </tr>

            {/* Fila desplegable con los detalles del contacto */}
            {detallesVisibles && (
                <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                        <div className="p-4 rounded-md bg-gray-100">
                            <h4 className="font-bold text-gray-700">Contacto Principal: {proveedor.contactoPrincipalDto.name}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <div><span className="font-semibold">DPI:</span> {proveedor.contactoPrincipalDto.dpi}</div>
                                <div><span className="font-semibold">Teléfono:</span> {proveedor.contactoPrincipalDto.telefono}</div>
                                <div><span className="font-semibold">Correo:</span> {proveedor.contactoPrincipalDto.correo}</div>
                                <div><span className="font-semibold">Dirección:</span> {proveedor.contactoPrincipalDto.direccion}</div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}


// --- Componente Principal de la Página ---
export default function ProveedoresPagina() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProveedores = async () => {
            const apiUrl = "https://gestioncontactosapi-production.up.railway.app";
            const credentials = { email: "InventarioUMG@miumg.edu.gt", password: "UMGinv2025$" };
            try {
                const authResponse = await fetch(`${apiUrl}/api/Auth/Login`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
                });
                if (!authResponse.ok) throw new Error(`Error de autenticación: ${authResponse.statusText}`);
                const { token } = await authResponse.json();

                const proveedoresResponse = await fetch(`${apiUrl}/api/Proveedor`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!proveedoresResponse.ok) throw new Error(`Error al obtener proveedores: ${proveedoresResponse.statusText}`);
                const data: Proveedor[] = await proveedoresResponse.json();
                setProveedores(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setCargando(false);
            }
        };
        fetchProveedores();
    }, []);

    const renderContent = () => {
        if (cargando) return <p className="text-center">Cargando proveedores...</p>;
        if (error) return <div className="p-4 bg-red-100 text-red-700 rounded"><p><b>Error:</b> {error}</p></div>;
        return (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {proveedores.map((proveedor) => (
                        <ProveedorRow key={proveedor.id} proveedor={proveedor} />
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <AppLayout pageTitle="Gestión de Proveedores">
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">Listado de Proveedores</h1>
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    {renderContent()}
                </div>
            </div>
        </AppLayout>
    );
}