import React from 'react';

const ProductoItem = ({ producto, onAddToCart }) => {
  // Función para manejar errores de carga de imagen
  const handleImageError = (e) => {
    e.target.src = '/productos/default.jpg'; // Ruta a una imagen por defecto
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Imagen del producto */}
      <div className="w-full h-32 mb-2 bg-gray-100 rounded-md overflow-hidden">
        <img 
          src={producto.imagen || '/productos/default.jpg'} 
          alt={producto.nombre}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 line-clamp-2" title={producto.nombre}>
            {producto.nombre}
          </h3>
          <p className="text-xs text-gray-500 mb-1">{producto.categoria}</p>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-orange-600">S/ {producto.precio.toFixed(2)}</p>
            <p className={`text-xs ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
            </p>
          </div>
          
          <button
            onClick={() => onAddToCart(producto)}
            disabled={producto.stock <= 0}
            className={`mt-2 w-full text-sm font-medium py-1.5 px-3 rounded-md transition-colors ${
              producto.stock > 0 
                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoItem;
