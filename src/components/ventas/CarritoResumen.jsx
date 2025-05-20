import React from 'react';
import { X, Plus, Minus } from 'lucide-react';

const CarritoResumen = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  // Calcular subtotal, IGV y total
  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const igv = subtotal * 0.18; // 18% IGV
  const total = subtotal + igv;
  
  // Verificar si hay productos sin stock suficiente
  const productosSinStock = items.filter(item => item.cantidad > item.stock);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Resumen de Venta</h3>
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

      <div className="p-4 border-t border-gray-100">
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IGV (18%):</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-2">
            <span>Total:</span>
            <span className="text-lg">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {productosSinStock.length > 0 && (
            <div className="text-red-500 text-sm mb-2">
              Algunos productos no tienen suficiente stock disponible.
            </div>
          )}
          <button
            onClick={onCheckout}
            className={`w-full py-2 px-4 rounded-lg transition-colors ${
              items.length === 0 || productosSinStock.length > 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
            disabled={items.length === 0 || productosSinStock.length > 0}
          >
            Realizar Venta (S/. {total.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarritoResumen;
