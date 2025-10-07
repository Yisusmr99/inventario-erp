import type { Route } from "./+types/home";
import AppLayout from "../components/layout/AppLayout";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";
import FastMoversChart from "../components/dashboard/FastMoversChart";
import SlowMoversChart from "../components/dashboard/SlowMoversChart";
import TopMoversTable from "../components/dashboard/TopMoversTable";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Inventario ERP" },
    { name: "description", content: "Sistema de gestión de inventario ERP" },
  ];
}

export default function Home() {
  // Establecer el rango de fechas para el reporte de Top Movers
  const currentYear = new Date().getFullYear();
  const defaultDesde = `${currentYear}-01-01`;
  const defaultHasta = `${currentYear}-12-31`;

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fast Movers Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top 10 más vendidos</h2>
            <FastMoversChart />
          </div>
          
          {/* Slow Movers Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top 10 menos movimiento</h2>
            <SlowMoversChart />
          </div>
        </div>
        
        {/* Top Movers Table */}
        <div className="bg-white shadow rounded-lg p-6">
          <TopMoversTable 
            desde={defaultDesde} 
            hasta={defaultHasta}
          />
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
