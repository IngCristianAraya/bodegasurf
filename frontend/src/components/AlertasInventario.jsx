import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, X } from 'lucide-react';

const AlertasInventario = ({ productos, limiteMinimo = 5 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAlerts, setHasAlerts] = useState(false);

  // Filtrar productos con stock por debajo del límite
  const productosBajoStock = productos.filter(
    producto => producto.cantidad <= limiteMinimo
  );

  // Actualizar estado cuando hay alertas
  useEffect(() => {
    setHasAlerts(productosBajoStock.length > 0);
  }, [productosBajoStock.length]);

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform hover:scale-105">
      {/* Botón flotante mejorado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl ${
          hasAlerts 
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' 
            : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
        } text-white transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-orange-400 focus:ring-opacity-50`}
        aria-label="Ver alertas de inventario"
      >
        <div className="relative">
          <Bell className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'animate-bounce' : ''}`} />
          {hasAlerts && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-sm">
              {productosBajoStock.length}
            </span>
          )}
        </div>
        <span className={`absolute left-0 w-full text-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 -bottom-6 text-gray-700`}>
          Alertas
        </span>
      </button>

      {/* Popup de alertas */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="font-medium text-yellow-800">
                Alertas de Inventario
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-80 overflow-hidden">
            {productosBajoStock.length > 0 ? (
              <>
                <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  <ul className="divide-y divide-gray-200">
                    {productosBajoStock.slice(0, 5).map((producto) => (
                      <li key={producto.id} className="p-3 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900 line-clamp-1">
                            {producto.nombre}
                          </span>
                          <span className={`text-sm font-medium ${
                            producto.cantidad <= 2 ? 'text-red-600' : 'text-yellow-600'
                          } whitespace-nowrap ml-2`}>
                            {producto.cantidad} {producto.unidad || 'unid'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex justify-between">
                          <span>Código: {producto.codigo || 'N/A'}</span>
                          <span className="text-gray-400">
                            {producto.categoria || 'Sin categoría'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {productosBajoStock.length > 5 && (
                  <div className="text-center py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                    Mostrando 5 de {productosBajoStock.length} productos
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No hay alertas en este momento
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right">
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasInventario;
