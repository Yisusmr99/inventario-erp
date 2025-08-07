import type { Route } from "./+types/home";
import AppLayout from "../components/layout/AppLayout";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Inventario ERP" },
    { name: "description", content: "Sistema de gestión de inventario ERP" },
  ];
}

export default function Home() {

  useEffect(() => {
    toast.success('Prueba de notificación');
  }, []);

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Bienvenido al sistema de gestión de inventario ERP
          </p>
        </div>
        
        {/* Área de contenido principal - aquí irá el contenido específico de cada página */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen de inventario</h2>
          <p className="text-gray-600">
            Este es el espacio donde se mostrará el contenido específico de cada página.
            Puedes reemplazar este contenido según las necesidades de cada sección.
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AppLayout>
  );
}
