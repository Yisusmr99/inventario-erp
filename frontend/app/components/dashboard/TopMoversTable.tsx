import React, { useEffect, useState, useCallback } from 'react';
import ReportsApi from '../../api/Reports';
import type { TopMover } from '../../api/Reports';

interface TopMoversTableProps {
  desde: string;
  hasta: string;
}

const ITEMS_PER_PAGE = 5;

const TopMoversTable: React.FC<TopMoversTableProps> = ({ 
  desde: initialDesde, 
  hasta: initialHasta
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [topMovers, setTopMovers] = useState<TopMover[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState<string>(initialDesde);
  const [hasta, setHasta] = useState<string>(initialHasta);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = useCallback(async (page: number, startDate: string, endDate: string) => {
    try {
      setLoading(true);
      // We're fetching all the data at once but will implement pagination on the client side
      const response = await ReportsApi.getTopMovers(startDate, endDate);
      if (response.success) {
        setTopMovers(response.data);
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
      } else {
        setError('Error fetching top movers data');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error fetching top movers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1, desde, hasta);
  }, [loadData, desde, hasta]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDateChange = useCallback(() => {
    setCurrentPage(1);
    loadData(1, desde, hasta);
  }, [loadData, desde, hasta]);

  const currentItems = topMovers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Title and Date Range Selection */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
          Productos más vendidos
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <div className="flex items-center gap-2">
            <label htmlFor="desde" className="whitespace-nowrap text-sm font-medium text-gray-700">
              Desde:
            </label>
            <input
              type="date"
              id="desde"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="block rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="hasta" className="whitespace-nowrap text-sm font-medium text-gray-700">
              Hasta:
            </label>
            <input
              type="date"
              id="hasta"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="block rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleDateChange}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Aplicar filtro
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-56">Cargando datos...</div>
      )}

      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
      )}

      {!loading && !error && currentItems.length === 0 && (
        <div className="text-gray-500 p-4">No hay datos disponibles para el rango seleccionado</div>
      )}

      {!loading && !error && currentItems.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidades Movidas
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Movido
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id_producto}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {item.unidades_movidas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${item.valor_movido.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> de{' '}
                <span className="font-medium">{totalItems}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage
                      ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopMoversTable;
