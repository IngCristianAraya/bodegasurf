import React, { createContext, useContext, useState, useEffect } from 'react';

const InventarioContext = createContext();

export const useInventario = () => {
  return useContext(InventarioContext);
};

export const InventarioProvider = ({ children }) => {
  const [productos, setProductos] = useState(() => {
    const saved = localStorage.getItem('inventario-productos');
    return saved ? JSON.parse(saved) : [
      // Lácteos y Huevos
      { 
        id: 1, 
        nombre: "Leche Gloria 1L", 
        categoria: "Lácteos y Huevos", 
        precioCompra: 3.20, 
        precioVenta: 4.20, 
        unidad: "litros", 
        stock: 50, 
        stockMinimo: 10,
        codigoBarras: "100000000001",
        imagen: "/productos/leche.jpg"
      },
      { 
        id: 2, 
        nombre: "Huevos x12", 
        categoria: "Lácteos y Huevos", 
        precioCompra: 7.50, 
        precioVenta: 9.50, 
        unidad: "docenas", 
        stock: 30, 
        stockMinimo: 5,
        codigoBarras: "100000000002",
        imagen: "/productos/huevos.jpg"
      },
      
      // Abarrotes
      { 
        id: 11, 
        nombre: "Arroz Costeño 1kg", 
        categoria: "Abarrotes", 
        precioCompra: 3.50, 
        precioVenta: 4.50, 
        unidad: "kilos", 
        stock: 80, 
        stockMinimo: 15,
        codigoBarras: "200000000001",
        imagen: "/productos/arroz.jpg"
      },
      { 
        id: 12, 
        nombre: "Aceite Primor 1L", 
        categoria: "Abarrotes", 
        precioCompra: 10.00, 
        precioVenta: 12.00, 
        unidad: "litros", 
        stock: 35, 
        stockMinimo: 8,
        codigoBarras: "200000000002",
        imagen: "/productos/aceite.jpg"
      },
      { 
        id: 13, 
        nombre: "Fideos Tallarín 500g", 
        categoria: "Abarrotes", 
        precioCompra: 2.80, 
        precioVenta: 3.50, 
        unidad: "paquetes", 
        stock: 45, 
        stockMinimo: 10,
        codigoBarras: "200000000003",
        imagen: "/productos/fideos.jpg"
      },
      
      // Snack y Golosinas
      { 
        id: 21, 
        nombre: "Galletas de Vainilla", 
        categoria: "Snack y Golosinas", 
        precioCompra: 2.00, 
        precioVenta: 2.80, 
        unidad: "paquetes", 
        stock: 50, 
        stockMinimo: 15,
        codigoBarras: "300000000001",
        imagen: "/productos/galletas.jpg"
      },
      { 
        id: 22, 
        nombre: "Chocolates Variados", 
        categoria: "Snack y Golosinas", 
        precioCompra: 4.00, 
        precioVenta: 5.50, 
        unidad: "unidades", 
        stock: 40, 
        stockMinimo: 10,
        codigoBarras: "300000000002",
        imagen: "/productos/chocolates.jpg"
      },
      
      // Higiene Personal
      { 
        id: 31, 
        nombre: "Jabón Corporal", 
        categoria: "Higiene Personal", 
        precioCompra: 4.00, 
        precioVenta: 5.80, 
        unidad: "unidades", 
        stock: 35, 
        stockMinimo: 10,
        codigoBarras: "400000000001",
        imagen: "/productos/jabon-corporal.jpg"
      },
      { 
        id: 32, 
        nombre: "Shampoo 400ml", 
        categoria: "Higiene Personal", 
        precioCompra: 8.00, 
        precioVenta: 10.50, 
        unidad: "unidades", 
        stock: 25, 
        stockMinimo: 8,
        codigoBarras: "400000000002",
        imagen: "/productos/shampoo.jpg"
      },
      // Limpieza Hogar
      { 
        id: 41, 
        nombre: "Detergente 1L", 
        categoria: "Limpieza Hogar", 
        precioCompra: 5.50, 
        precioVenta: 7.50, 
        unidad: "botellas", 
        stock: 25, 
        stockMinimo: 8,
        codigoBarras: "500000000001",
        imagen: "/productos/detergente.jpg"
      },
      { 
        id: 42, 
        nombre: "Desinfectante 1L", 
        categoria: "Limpieza Hogar", 
        precioCompra: 4.50, 
        precioVenta: 6.80, 
        unidad: "botellas", 
        stock: 20, 
        stockMinimo: 5,
        codigoBarras: "500000000002",
        imagen: "/productos/desinfectante.jpg"
      },
      
      // Panadería y Pastelería
      { 
        id: 51, 
        nombre: "Pan de Molde Integral", 
        categoria: "Panadería y Pastelería", 
        precioCompra: 5.00, 
        precioVenta: 7.50, 
        unidad: "unidades", 
        stock: 15, 
        stockMinimo: 5,
        codigoBarras: "600000000001",
        imagen: "/productos/pan-molde.jpg"
      },
      
      // Enlatados y Congelados
      { 
        id: 61, 
        nombre: "Atún en Lata", 
        categoria: "Enlatados y Congelados", 
        precioCompra: 4.00, 
        precioVenta: 5.50, 
        unidad: "unidades", 
        stock: 40, 
        stockMinimo: 10,
        codigoBarras: "700000000001",
        imagen: "/productos/atun.jpg"
      },
      { 
        id: 62, 
        nombre: "Pizza Congelada", 
        categoria: "Enlatados y Congelados", 
        precioCompra: 8.00, 
        precioVenta: 12.50, 
        unidad: "unidades", 
        stock: 10, 
        stockMinimo: 3,
        codigoBarras: "700000000002",
        imagen: "/productos/pizza.jpg"
      },
      
      // Frutas y Verduras
      { 
        id: 71, 
        nombre: "Manzanas", 
        categoria: "Frutas y Verduras", 
        precioCompra: 0.80, 
        precioVenta: 1.20, 
        unidad: "kilos", 
        stock: 30, 
        stockMinimo: 10,
        codigoBarras: "800000000001",
        imagen: "/productos/manzana.jpg"
      },
      { 
        id: 72, 
        nombre: "Zanahorias", 
        categoria: "Frutas y Verduras", 
        precioCompra: 0.50, 
        precioVenta: 0.80, 
        unidad: "kilos", 
        stock: 25, 
        stockMinimo: 8,
        codigoBarras: "800000000002",
        imagen: "/productos/zanahoria.jpg"
      },
      
      // Tabaco y Misceláneos
      { 
        id: 81, 
        nombre: "Cigarrillos", 
        categoria: "Tabaco y Misceláneos", 
        precioCompra: 12.00, 
        precioVenta: 15.00, 
        unidad: "cajetillas", 
        stock: 20, 
        stockMinimo: 5,
        codigoBarras: "900000000001",
        imagen: "/productos/cigarrillos.jpg"
      },
      
      // Bebidas
      { 
        id: 91, 
        nombre: "Gaseosa 2L", 
        categoria: "Bebidas", 
        precioCompra: 4.50, 
        precioVenta: 6.50, 
        unidad: "botellas", 
        stock: 35, 
        stockMinimo: 10,
        codigoBarras: "910000000001",
        imagen: "/productos/gaseosa.jpg"
      },
      { 
        id: 92, 
        nombre: "Agua Mineral 1L", 
        categoria: "Bebidas", 
        precioCompra: 1.50, 
        precioVenta: 2.50, 
        unidad: "botellas", 
        stock: 50, 
        stockMinimo: 15,
        codigoBarras: "910000000002",
        imagen: "/productos/agua.jpg"
      },
      
      // Carnes
      { 
        id: 101, 
        nombre: "Pollo Entero", 
        categoria: "Carnes", 
        precioCompra: 8.00, 
        precioVenta: 10.50, 
        unidad: "kilos", 
        stock: 15, 
        stockMinimo: 5,
        codigoBarras: "100000000001",
        imagen: "/productos/pollo.jpg"
      },
      { 
        id: 102, 
        nombre: "Carne Molida", 
        categoria: "Carnes", 
        precioCompra: 12.00, 
        precioVenta: 15.00, 
        unidad: "kilos", 
        stock: 12, 
        stockMinimo: 4,
        codigoBarras: "100000000002",
        imagen: "/productos/carne-molida.jpg"
      },
    ];
  });

  // Guardar en localStorage cuando cambien los productos
  useEffect(() => {
    localStorage.setItem('inventario-productos', JSON.stringify(productos));
  }, [productos]);

  const agregarProducto = (nuevoProducto) => {
    const productoConId = {
      ...nuevoProducto,
      id: Date.now(),
      stock: parseInt(nuevoProducto.stock, 10) || 0,
      stockMinimo: parseInt(nuevoProducto.stockMinimo, 10) || 0,
      precioCompra: parseFloat(nuevoProducto.precioCompra) || 0,
      precioVenta: parseFloat(nuevoProducto.precioVenta) || 0,
    };
    setProductos([...productos, productoConId]);
  };

  const actualizarProducto = (id, productoActualizado) => {
    setProductos(prevProductos => {
      const nuevosProductos = prevProductos.map(producto => 
        producto.id === id ? { ...producto, ...productoActualizado } : producto
      );
      localStorage.setItem('inventario-productos', JSON.stringify(nuevosProductos));
      return nuevosProductos;
    });
  };

  const actualizarStock = (id, cantidadVendida) => {
    setProductos(prevProductos => {
      const nuevosProductos = prevProductos.map(producto => {
        if (producto.id === id) {
          const nuevoStock = (producto.stock || 0) - cantidadVendida;
          return { 
            ...producto, 
            stock: Math.max(0, nuevoStock) // Asegurar que el stock no sea negativo
          };
        }
        return producto;
      });
      localStorage.setItem('inventario-productos', JSON.stringify(nuevosProductos));
      return nuevosProductos;
    });
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(producto => producto.id !== id));
  };

  return (
    <InventarioContext.Provider value={{
      productos,
      agregarProducto,
      actualizarProducto,
      eliminarProducto,
      actualizarStock
    }}>
      {children}
    </InventarioContext.Provider>
  );
};

// Exportar el contexto por defecto
export default InventarioContext;
