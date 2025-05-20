import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertasInventario = ({ productos, limiteMinimo = 5 }) => {
  // Filtrar productos con stock por debajo del límite
  const productosBajoStock = productos.filter(
    producto => producto.cantidad <= limiteMinimo
  );

  if (productosBajoStock.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            ¡Atención! Productos con bajo stock
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc pl-5 space-y-1">
              {productosBajoStock.map((producto) => (
                <li key={producto.id}>
                  {producto.nombre} - {producto.cantidad} {producto.unidad} restantes
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertasInventario;
