import React from 'react';

const CategoriaItem = ({ categoria, cantidad, onClick, isActive }) => {
  // Mapeo de iconos por categoría
  const iconosCategorias = {
    'todos': '📋',
    'Abarrotes': '🍚',
    'Snack y Golosinas': '🍬',
    'Higiene Personal': '🧴',
    'Limpieza Hogar': '🧹',
    'Lácteos y Huevos': '🥛',
    'Panadería y Pastelería': '🥖',
    'Enlatados y Congelados': '🥫',
    'Frutas y Verduras': '🥦',
    'Otros': '📦',
    'Tabaco y Misceláneos': '🚬',
    'Bebidas': '🥤',
    'Carnes': '🥩',
    'Lácteos': '🧀',
    'Verduras': '🥕',
    'Frutas': '🍎',
    'Limpieza': '🧼',
    'Golosinas': '🍭'
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-sm border transition-all duration-200 ${
        isActive 
          ? 'bg-orange-50 border-orange-200 scale-105' 
          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
      }`}
    >
      <span className="text-3xl mb-2">{iconosCategorias[categoria] || '📦'}</span>
      <h3 className="font-medium text-gray-800">
        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
      </h3>
      <span className="text-xs text-gray-500 mt-1">{cantidad} productos</span>
    </button>
  );
};

export default CategoriaItem;
