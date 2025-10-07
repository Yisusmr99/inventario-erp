import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ReportsApi from '../../api/Reports';
import type { FastMover } from '../../api/Reports';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FastMoversChart: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [fastMovers, setFastMovers] = useState<FastMover[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await ReportsApi.getFastMovers();
        if (response.success) {
          setFastMovers(response.data);
        } else {
          setError('Error fetching fast movers data');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching fast movers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: fastMovers.map(item => item.nombre),
    datasets: [
      {
        label: 'Productos con Movimiento Rápido',
        data: fastMovers.map(item => item.unidades_vendidas),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top 10 más vendidos',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return <div className="flex justify-center items-center h-56">Cargando datos...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  if (fastMovers.length === 0) {
    return <div className="text-gray-500 p-4">No hay datos disponibles</div>;
  }

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default FastMoversChart;
