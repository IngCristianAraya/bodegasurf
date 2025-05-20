import React from 'react';

const ProductoItem = ({ producto, onAddToCart }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{producto.nombre}</h3>
          <p className="text-sm text-gray-500">{producto.categoria}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-orange-600">S/ {producto.precio.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Stock: {producto.stock}</p>
        </div>
      </div>
      <button
        onClick={() => onAddToCart(producto)}
        className="mt-2 w-full bg-orange-50 text-orange-600 hover:bg-orange-100 text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
      >
        Agregar al carrito
      </button>
    </div>
  );
};

export default ProductoItem;
