// src/pages/Ventas.jsx
import { useState, useEffect, useContext } from 'react';
import { Plus, ShoppingCart, X, Search, Filter, ArrowLeft, CheckCircle } from 'lucide-react';
import ProductoItem from '../components/ventas/ProductoItem';
import CarritoResumen from '../components/ventas/CarritoResumen';
import { useInventario } from '../context/InventarioContext';
import SearchBar from '../components/ventas/SearchBar';
import CategoriaItem from '../components/ventas/CategoriaItem';

// Componente de Ventas
function Ventas() {
  const { productos: productosInventario, actualizarStock } = useInventario();
  
  // Mapear los productos del inventario al formato esperado por la página de ventas
  const productosEjemplo = productosInventario.map(producto => ({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precioVenta, // Usamos el precio de venta
    categoria: producto.categoria,
    stock: producto.stock,
    imagen: producto.imagen || '/productos/default.jpg',
    precioCompra: producto.precioCompra,
    codigoBarras: producto.codigoBarras
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarProductos, setMostrarProductos] = useState(false);

  // Obtener categorías únicas de los productos con conteo
  const categorias = [
    { nombre: 'todos', cantidad: productosEjemplo.length },
    ...Object.entries(
      productosEjemplo.reduce((acc, producto) => {
        acc[producto.categoria] = (acc[producto.categoria] || 0) + 1;
        return acc;
      }, {})
    ).map(([nombre, cantidad]) => ({ nombre, cantidad }))
  ];

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados = productosEjemplo.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideCategoria = categoriaActiva === null || categoriaActiva === 'todos' || 
                             producto.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  // Manejar clic en categoría
  const handleCategoriaClick = (categoria) => {
    setCategoriaActiva(categoria);
    setMostrarProductos(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Volver a la vista de categorías
  const volverACategorias = () => {
    setCategoriaActiva(null);
    setMostrarProductos(false);
    setSearchTerm('');
  };

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito(prevCarrito => {
      const existeEnCarrito = prevCarrito.find(item => item.id === producto.id);
      
      if (existeEnCarrito) {
        return prevCarrito.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      
      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });
  };

  // Actualizar cantidad de un producto en el carrito
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    setCarrito(prevCarrito =>
      prevCarrito.map(item =>
        item.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (productoId) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== productoId));
  };

  // Estado para controlar la notificación de venta exitosa
  const [ventaExitosa, setVentaExitosa] = useState(false);
  
  // Realizar venta
  const realizarVenta = async () => {
    try {
      // Validar que haya productos en el carrito
      if (carrito.length === 0) {
        throw new Error('No hay productos en el carrito');
      }
      
      // Validar que todos los productos tengan stock suficiente
      const productosSinStock = carrito.filter(item => item.cantidad > item.stock);
      if (productosSinStock.length > 0) {
        const nombresProductos = productosSinStock.map(p => p.nombre).join(', ');
        throw new Error(`No hay suficiente stock para: ${nombresProductos}`);
      }
      
      // Actualizar el stock de cada producto vendido
      carrito.forEach(item => {
        actualizarStock(item.id, item.cantidad);
      });
      
      // Aquí podrías agregar la lógica para guardar la venta en el historial
      console.log('Venta realizada:', carrito);
      
      // Mostrar notificación de éxito
      setVentaExitosa(true);
      
      // Ocultar la notificación después de 3 segundos
      setTimeout(() => {
        setVentaExitosa(false);
      }, 3000);
      
      // Limpiar carrito
      setCarrito([]);
      
      // Cerrar el carrito después de la venta
      setCarritoAbierto(false);
    } catch (error) {
      console.error('Error al realizar la venta:', error);
      alert(error.message || 'Ocurrió un error al procesar la venta');
    }
  };
  
  // Calcular total de la venta
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Calcular total de productos en el carrito
  const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);

  // Efecto para manejar la sincronización del carrito con el inventario
  useEffect(() => {
    // Verificar si algún producto del carrito ya no está disponible
    const carritoActualizado = carrito.map(item => {
      const productoEnInventario = productosEjemplo.find(p => p.id === item.id);
      if (!productoEnInventario) return null;
      
      // Actualizar el stock disponible
      return {
        ...item,
        stock: productoEnInventario.stock,
        // Si la cantidad en el carrito supera el nuevo stock, ajustarla
        cantidad: Math.min(item.cantidad, productoEnInventario.stock)
      };
    }).filter(Boolean); // Eliminar productos que ya no existen
    
    if (carritoActualizado.length !== carrito.length) {
      setCarrito(carritoActualizado);
    }
  }, [productosEjemplo]);

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {/* Notificación de venta exitosa */}
      {ventaExitosa && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">¡Venta registrada con éxito!</p>
              <p className="text-sm text-green-600">Total: S/ {calcularTotal().toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setVentaExitosa(false)}
              className="ml-4 text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {mostrarProductos && (
            <button
              onClick={volverACategorias}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Volver a categorías"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-800">
            {mostrarProductos 
              ? categoriaActiva === 'todos' 
                ? 'Todos los productos' 
                : categoriaActiva
              : 'Categorías'}
          </h1>
        </div>
        <button
          onClick={() => setMostrarCarrito(!mostrarCarrito)}
          className="relative p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalProductos > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalProductos}
            </span>
          )}
          <span className="ml-2 hidden sm:inline">
            {mostrarCarrito ? 'Ocultar' : 'Ver'} Carrito
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sección Principal */}
        <div className={`${mostrarCarrito ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          {mostrarProductos ? (
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <SearchBar 
                      value={searchTerm}
                      onChange={setSearchTerm}
                      onClear={() => setSearchTerm('')}
                      placeholder={`Buscar en ${categoriaActiva === 'todos' ? 'todos los productos' : categoriaActiva}...`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((producto) => (
                    <ProductoItem
                      key={producto.id}
                      producto={producto}
                      onAddToCart={agregarAlCarrito}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No se encontraron productos</p>
                    <button
                      onClick={volverACategorias}
                      className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Volver a categorías
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <SearchBar 
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm('')}
                  placeholder="Buscar categorías..."
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categorias
                  .filter(cat => 
                    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    searchTerm === ''
                  )
                  .map((categoria, index) => (
                    <CategoriaItem
                      key={index}
                      categoria={categoria.nombre}
                      cantidad={categoria.cantidad}
                      isActive={categoria.nombre === categoriaActiva}
                      onClick={() => handleCategoriaClick(categoria.nombre)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel del Carrito */}
        <div className={`${mostrarCarrito ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-4">
            <CarritoResumen
              items={carrito}
              onUpdateQuantity={actualizarCantidad}
              onRemoveItem={eliminarDelCarrito}
              onCheckout={realizarVenta}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ventas;
