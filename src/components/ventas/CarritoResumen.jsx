import React, { useRef } from 'react';
import { X, Plus, Minus, Printer, AlertTriangle } from 'lucide-react';
// Importación temporalmente comentada por problemas de compatibilidad
// import ReactToPrint from 'react-to-print';
// Comentado temporalmente por problemas de compatibilidad
// import { TicketVenta } from './TicketVenta';

const CarritoResumen = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const ticketRef = useRef();
  
  // Generar un número de ticket único
  const numeroTicket = 'T' + Date.now().toString().slice(-6);
  const fechaVenta = new Date().toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  // Calcular subtotal, IGV y total
  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const igv = subtotal * 0.18; // 18% IGV
  const total = subtotal + igv;
  
  // Verificar si hay productos sin stock suficiente
  const productosSinStock = items.filter(item => item.cantidad > item.stock);
  
  // Función para manejar la finalización de la venta
  const handleFinalizarVenta = () => {
    if (productosSinStock.length === 0) {
      onCheckout();
    } else {
      // Mostrar mensaje de error si hay productos sin stock suficiente
      alert('Hay productos que superan el stock disponible. Por favor, ajuste las cantidades.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Resumen de Venta</h3>
          <div className="text-xs text-gray-500">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto p-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay productos en el carrito</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div>
                  <p className="font-medium text-gray-800">{item.nombre}</p>
                  <p className="text-sm text-gray-500">S/ {item.precio.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                    className="p-1 text-gray-500 hover:text-orange-500 rounded-full hover:bg-orange-50"
                    disabled={item.cantidad <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                    className="p-1 text-gray-500 hover:text-orange-500 rounded-full hover:bg-orange-50"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contenido del ticket (oculto para impresión) - Temporalmente deshabilitado
      <div className="hidden">
        <div ref={ticketRef}>
          <TicketVenta 
            items={items} 
            total={total} 
            fecha={fechaVenta}
            numeroTicket={numeroTicket}
          />
        </div>
      </div>
      */}
      
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IGV (18%):</span>
              <span className="font-medium">S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2 mt-2">
              <span>Total:</span>
              <span className="text-orange-600">S/ {total.toFixed(2)}</span>
            </div>
          </div>
          
          {productosSinStock.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Algunos productos superan el stock disponible. Ajuste las cantidades.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => {
              // Función temporal para simular la impresión
              console.log('Simulando impresión del ticket...');
              // Llamar a handleFinalizarVenta después de un breve retraso
              setTimeout(() => {
                handleFinalizarVenta();
              }, 500);
            }}
            disabled={items.length === 0 || productosSinStock.length > 0}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              items.length === 0 || productosSinStock.length > 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>Finalizar Venta</span>
          </button>
          
          {/* Botón de ayuda para depuración */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => console.log('Ref de ticket:', ticketRef.current)}
              className="text-xs text-gray-500 mt-2"
            >
              Debug: Ver referencia de ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarritoResumen;
