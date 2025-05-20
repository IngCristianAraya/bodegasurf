import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  Upload, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Printer,
  FileText,
  User,
  ShoppingCart,
  ListOrdered
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente de tarjeta de resumen
const ResumenCard = ({ titulo, valor, color, icon: Icon }) => (
  <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${color} flex flex-col h-full`}>
    <div className="flex items-center">
      <div className="p-2 rounded-lg mr-3 bg-opacity-20" style={{ backgroundColor: `${color}20` }}>
        <Icon className={`w-5 h-5`} style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{titulo}</p>
        <p className="text-2xl font-bold">{valor}</p>
      </div>
    </div>
  </div>
);

// Componente principal de Pedidos
const Pedidos = () => {
  // Estados
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [ordenarPor, setOrdenarPor] = useState('fecha');
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Datos de ejemplo para pedidos de delivery
  const pedidosIniciales = [
    {
      id: 1,
      numero: 'DEL-001',
      cliente: 'Juan Pérez',
      telefono: '3001234567',
      direccion: 'Calle 123 #45-67, Barrio Centro',
      fecha: '2025-05-20',
      estado: 'pendiente',
      total: 125000,
      tipo: 'domicilio',
      repartidor: 'Sin asignar',
      productos: [
        { id: 1, nombre: 'Arroz 5kg', cantidad: 2, precio: 25000 },
        { id: 2, nombre: 'Aceite 1Lt', cantidad: 3, precio: 25000 }
      ]
    },
    {
      id: 2,
      numero: 'DEL-002',
      cliente: 'María González',
      telefono: '3109876543',
      direccion: 'Carrera 8 #12-34, Barrio Modelo',
      fecha: '2025-05-19',
      estado: 'en_camino',
      total: 85000,
      tipo: 'domicilio',
      repartidor: 'Carlos Rojas',
      productos: [
        { id: 3, nombre: 'Leche 1Lt', cantidad: 6, precio: 3000 },
        { id: 4, nombre: 'Huevos x30', cantidad: 1, precio: 15000 },
        { id: 5, nombre: 'Pan tajado', cantidad: 2, precio: 5000 }
      ]
    },
    {
      id: 3,
      numero: 'DEL-003',
      cliente: 'Carlos López',
      telefono: '3155551234',
      direccion: 'Avenida 6 #78-90, Barrio San José',
      fecha: '2025-05-18',
      estado: 'entregado',
      total: 320000,
      tipo: 'domicilio',
      repartidor: 'Ana Martínez',
      productos: [
        { id: 6, nombre: 'Mercado Familiar', cantidad: 1, precio: 300000 },
        { id: 7, nombre: 'Gaseosa 2.5Lt', cantidad: 2, precio: 10000 }
      ]
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    setPedidos(pedidosIniciales);
  }, []);

  // Filtrar y ordenar pedidos
  const pedidosFiltradosYOrdenados = useMemo(() => {
    let resultado = [...pedidos];
    
    // Aplicar filtro de búsqueda
    if (filtro) {
      const busqueda = filtro.toLowerCase();
      resultado = resultado.filter(pedido => 
        pedido.numero.toLowerCase().includes(busqueda) ||
        pedido.cliente.toLowerCase().includes(busqueda) ||
        pedido.productos.some(p => p.nombre.toLowerCase().includes(busqueda))
      );
    }
    
    // Aplicar filtro de estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(pedido => pedido.estado === filtroEstado);
    }
    
    // Ordenar
    resultado.sort((a, b) => {
      if (ordenarPor === 'fecha') {
        return ordenAscendente 
          ? new Date(a.fecha) - new Date(b.fecha)
          : new Date(b.fecha) - new Date(a.fecha);
      } else if (ordenarPor === 'total') {
        return ordenAscendente ? a.total - b.total : b.total - a.total;
      } else if (ordenarPor === 'cliente') {
        return ordenAscendente
          ? a.cliente.localeCompare(b.cliente)
          : b.cliente.localeCompare(a.cliente);
      }
      return 0;
    });
    
    return resultado;
  }, [pedidos, filtro, filtroEstado, ordenarPor, ordenAscendente]);

  // Calcular totales
  const totalPedidos = pedidos.length;
  const totalPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const totalEnCamino = pedidos.filter(p => p.estado === 'en_camino').length;
  const totalEntregados = pedidos.filter(p => p.estado === 'entregado').length;
  const totalCancelados = pedidos.filter(p => p.estado === 'cancelado').length;
  const montoTotal = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);

  // Paginación
  const totalPages = Math.ceil(pedidosFiltradosYOrdenados.length / itemsPerPage);
  const paginatedPedidos = pedidosFiltradosYOrdenados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Función para cambiar de página
  const cambiarPagina = (pagina) => {
    setCurrentPage(pagina);
  };

  // Función para manejar la ordenación
  const handleOrdenar = (columna) => {
    if (ordenarPor === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(columna);
      setOrdenAscendente(true);
    }
  };

  // Función para obtener el color según el estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_camino':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el ícono según el estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'en_camino':
        return <Truck className="w-4 h-4 mr-1" />;
      case 'entregado':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  // Función para formatear el estado
  const formatearEstado = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'en_camino': 'En Camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
  };

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valor);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 h-full">
      {/* Título con estilo mejorado */}
      <div className="mb-6 relative pl-5 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-white shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"></div>
        <div className="flex items-center">
          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
            <ListOrdered className="text-yellow-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pedidos a Domicilio</h1>
            <p className="text-sm text-gray-500">Gestiona los pedidos de delivery de tu bodega</p>
          </div>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <ResumenCard 
          titulo="Pedidos Hoy" 
          valor={totalPedidos} 
          color="border-blue-500"
          icon={ShoppingCart}
        />
        <ResumenCard 
          titulo="Pendientes" 
          valor={totalPendientes} 
          color="border-yellow-500"
          icon={Clock}
        />
        <ResumenCard 
          titulo="En Camino" 
          valor={totalEnCamino} 
          color="border-blue-500"
          icon={Truck}
        />
        <ResumenCard 
          titulo="Entregados" 
          valor={totalEntregados} 
          color="border-green-500"
          icon={CheckCircle}
        />
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Filtros de Pedidos</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Mostrar:</span>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_camino">En Camino</option>
              <option value="entregado">Entregados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-200 pt-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Buscar pedidos..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="en_camino">En Camino</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              onClick={() => setMostrarFormulario(true)}
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="flex-1 overflow-hidden">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleOrdenar('numero')}
                  >
                    <div className="flex items-center">
                      N° Pedido
                      {ordenarPor === 'numero' ? (
                        ordenAscendente ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      ) : <ChevronsUpDown className="ml-1 h-4 w-4 text-gray-400" />}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleOrdenar('cliente')}
                  >
                    <div className="flex items-center">
                      Cliente
                      {ordenarPor === 'cliente' ? (
                        ordenAscendente ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      ) : <ChevronsUpDown className="ml-1 h-4 w-4 text-gray-400" />}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Productos
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dirección
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Repartidor
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleOrdenar('fecha')}
                  >
                    <div className="flex items-center">
                      Fecha
                      {ordenarPor === 'fecha' ? (
                        ordenAscendente ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      ) : <ChevronsUpDown className="ml-1 h-4 w-4 text-gray-400" />}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleOrdenar('total')}
                  >
                    <div className="flex items-center justify-end">
                      Total
                      {ordenarPor === 'total' ? (
                        ordenAscendente ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      ) : <ChevronsUpDown className="ml-1 h-4 w-4 text-gray-400" />}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPedidos.length > 0 ? (
                  paginatedPedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pedido.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                          {pedido.cliente}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col">
                          {pedido.productos.slice(0, 2).map((producto, idx) => (
                            <span key={idx} className="truncate">
                              {producto.cantidad} x {producto.nombre}
                            </span>
                          ))}
                          {pedido.productos.length > 2 && (
                            <span className="text-xs text-gray-400">+{pedido.productos.length - 2} más</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="truncate max-w-xs">
                            {pedido.direccion}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {pedido.repartidor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                          {getEstadoIcon(pedido.estado)}
                          {formatearEstado(pedido.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatearMoneda(pedido.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-yellow-600 hover:text-yellow-900"
                            onClick={() => {
                              setPedidoSeleccionado(pedido);
                              setMostrarFormulario(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron pedidos que coincidan con la búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => cambiarPagina(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => cambiarPagina(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, pedidosFiltradosYOrdenados.length)}
                    </span>{' '}
                    de <span className="font-medium">{pedidosFiltradosYOrdenados.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => cambiarPagina(1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Primera</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      <ChevronLeft className="h-5 w-5 -ml-2" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => cambiarPagina(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Números de página */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => cambiarPagina(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => cambiarPagina(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => cambiarPagina(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Última</span>
                      <ChevronRight className="h-5 w-5 -mr-2" aria-hidden="true" />
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario (pendiente de implementación) */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {pedidoSeleccionado ? 'Editar Pedido' : 'Nuevo Pedido'}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setPedidoSeleccionado(null);
                  }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-500">Formulario de pedido pendiente de implementación.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                onClick={() => {
                  setMostrarFormulario(false);
                  setPedidoSeleccionado(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                {pedidoSeleccionado ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;