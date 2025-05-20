// src/pages/Ventas.jsx
import { useState } from 'react';

function Ventas() {
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const products = [
    { name: 'Arroz', price: 3.5, category: 'Abarrotes' },
    { name: 'Leche', price: 1.2, category: 'Lácteos' },
    { name: 'Fanta', price: 1.8, category: 'Bebidas' },
    // Puedes agregar más productos aquí
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePayment = () => {
    setPaymentMethod('efectivo');
    // Aquí iría la lógica para registrar la venta
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold">Pantalla de Ventas</h1>

      <div className="mt-4">
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <ul>
          {filteredProducts.map((product, index) => (
            <li key={index} className="p-2 border-b">
              <span>{product.name}</span> - <span>S/ {product.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <button
          onClick={handlePayment}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
        >
          Cobrar con Efectivo
        </button>
      </div>

      {paymentMethod && (
        <div className="mt-4 text-green-700 font-semibold">
          Pago registrado con {paymentMethod}
        </div>
      )}
    </div>
  );
}

export default Ventas;
