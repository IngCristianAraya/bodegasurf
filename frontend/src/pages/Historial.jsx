import React, { useState, useMemo } from 'react';
import { Search, Filter as FilterIcon, Download, RefreshCw, BarChart2, FileText, AlertTriangle, Undo2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Estilos globales para los inputs
const globalInputStyles = `
  /* Estilos para inputs enfocados */
  input:focus, 
  select:focus,
  input[type="date"]:focus,
  input[type="text"]:focus {
    border-color: #f59e0b !important;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2) !important;
    outline: none !important;
    transition: all 0.2s ease-in-out;
  }
  
  /* Estilos para los inputs de fecha */
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.5) sepia(1) saturate(5) hue-rotate(0deg) brightness(0.9);
    cursor: pointer;
    opacity: 1;
  }
  
  input[type="date"] {
    position: relative;
  }
  
  input[type="date"]::before {
    content: '';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
`;

// Datos de ejemplo para el historial
const datosHistorial = [
  {
    id: 1,
    fecha: new Date(2023, 4, 15, 10, 30),
    tipo: 'Venta',
    producto: 'Leche Gloria Deslactosada 1L',
    sku: 'LG-001',
    cantidad: 2,
    precioUnitario: 4.50,
    total: 9.00,
    usuario: 'admin',
    notas: 'Venta normal'
  },
  {
    id: 2,
    fecha: new Date(2023, 4, 15, 11, 15),
    tipo: 'Ajuste',
    producto: 'Arroz Costeño 5kg',
    sku: 'AR-005',
    cantidad: -5,
    precioUnitario: 18.50,
    total: -92.50,
    usuario: 'admin',
    notas: 'Ajuste por inventario físico'
  },
  // Agrega más datos según sea necesario
];

const Historial = () => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoMovimiento: '',
    busqueda: '',
    usuario: ''
  });
  const [vista, setVista] = useState('tabla'); // 'tabla' o 'resumen'

  // Filtrar datos según los filtros aplicados
  const datosFiltrados = useMemo(() => {
    return datosHistorial.filter(item => {
      const cumpleFiltroFecha = !filtros.fechaInicio || item.fecha >= new Date(filtros.fechaInicio);
      const cumpleTipo = !filtros.tipoMovimiento || item.tipo === filtros.tipoMovimiento;
      const cumpleBusqueda = !filtros.busqueda || 
        item.producto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        item.sku.toLowerCase().includes(filtros.busqueda.toLowerCase());
      
      return cumpleFiltroFecha && cumpleTipo && cumpleBusqueda;
    });
  }, [filtros]);

  // Calcular resúmenes
  const resumen = useMemo(() => {
    return {
      totalMovimientos: datosFiltrados.length,
      ingresos: datosFiltrados
        .filter(item => item.tipo === 'Venta' && item.total > 0)
        .reduce((sum, item) => sum + item.total, 0),
      productosMasMovidos: datosFiltrados
        .reduce((acc, item) => {
          const existente = acc.find(p => p.sku === item.sku);
          if (existente) {
            existente.cantidad += Math.abs(item.cantidad);
          } else {
            acc.push({
              sku: item.sku,
              nombre: item.producto,
              cantidad: Math.abs(item.cantidad)
            });
          }
          return acc;
        }, [])
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5)
    };
  }, [datosFiltrados]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      tipoMovimiento: '',
      busqueda: '',
      usuario: ''
    });
  };

  const exportarAExcel = () => {
    // Lógica para exportar a Excel
    alert('Exportando a Excel...');
  };

  const deshacerMovimiento = (id) => {
    // Lógica para deshacer movimiento
    if (window.confirm('¿Estás seguro de deshacer este movimiento?')) {
      alert(`Deshaciendo movimiento ${id}...`);
    }
  };

  // Agregar estilos globales al head del documento
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalInputStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="flex flex-col space-y-6 p-4 h-full">
      {/* Título con estilo consistente */}
      <div className="relative pl-5 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-white shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"></div>
        <div className="flex items-center">
          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
            <FileText className="text-yellow-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Historial de Movimientos</h1>
            <p className="text-sm text-gray-500">Registro completo de todas las transacciones del inventario</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50 text-blue-500 mr-3">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Movimientos</p>
              <p className="text-xl font-semibold">{resumen.totalMovimientos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-500 mr-3">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos Totales</p>
              <p className="text-xl font-semibold">S/ {resumen.ingresos.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-500 mr-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos más movidos</p>
              <p className="text-sm font-medium">{resumen.productosMasMovidos[0]?.nombre || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pb-1 border-b-2 border-orange-500 inline-block">Fecha Inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full p-2 pr-8 border rounded-md appearance-none"
              style={{
                backgroundImage: "url(" + encodeURI("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") + ")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem 1rem'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pb-1 border-b-2 border-orange-500 inline-block">Fecha Fin</label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className="w-full p-2 pr-8 border rounded-md appearance-none"
              style={{
                backgroundImage: "url(" + encodeURI("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") + ")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem 1rem'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pb-1 border-b-2 border-orange-500 inline-block">Tipo de Movimiento</label>
            <select
              name="tipoMovimiento"
              value={filtros.tipoMovimiento}
              onChange={handleFiltroChange}
              className="w-full p-2 pr-8 border rounded-md appearance-none bg-white hover:bg-orange-50 focus:bg-orange-50 text-orange-700 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-colors focus:outline-none"
              style={{
                backgroundImage: "url(" + encodeURI("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23d97706' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") + ")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem 1rem',
                cursor: 'pointer',
                color: '#9a3412',
                borderColor: '#f59e0b',
                outline: 'none'
              }}
            >
              <option value="">Todos</option>
              <option value="Venta">Venta</option>
              <option value="Compra">Compra</option>
              <option value="Ajuste">Ajuste</option>
              <option value="Devolución">Devolución</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pb-1 border-b-2 border-orange-500 inline-block">Buscar</label>
            <div className="relative">
              <input
                type="text"
                name="busqueda"
                value={filtros.busqueda}
                onChange={handleFiltroChange}
                placeholder="Producto o SKU"
                className="w-full pr-10 p-2 border rounded-md focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors focus:outline-none"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={resetFiltros}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <RefreshCw className="w-4 h-4 mr-1 text-orange-500 group-hover:text-orange-600 transition-colors" />
            Restablecer filtros
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => setVista('tabla')}
              className={`px-3 py-1.5 rounded-md text-sm ${vista === 'tabla' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Tabla
            </button>
            <button
              onClick={() => setVista('resumen')}
              className={`px-3 py-1.5 rounded-md text-sm ${vista === 'resumen' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Resumen
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {vista === 'tabla' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(movimiento.fecha, "dd/MM/yyyy HH:mm", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movimiento.tipo === 'Venta' ? 'bg-red-100 text-red-800' :
                        movimiento.tipo === 'Compra' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movimiento.producto}</div>
                      <div className="text-sm text-gray-500">{movimiento.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={movimiento.cantidad < 0 ? 'text-red-600' : 'text-green-600'}>
                        {movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      S/ {movimiento.precioUnitario.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={movimiento.total < 0 ? 'text-red-600' : 'text-green-600'}>
                        S/ {Math.abs(movimiento.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movimiento.usuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deshacerMovimiento(movimiento.id)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3 flex items-center"
                        title="Deshacer movimiento"
                      >
                        <Undo2 className="w-4 h-4 mr-1" />
                        Deshacer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen de Movimientos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Movimientos por Tipo</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Aquí iría el gráfico o tabla de resumen por tipo */}
                <p className="text-sm text-gray-500">Gráfico de movimientos por tipo</p>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Productos más movidos</h3>
              <div className="space-y-2">
                {resumen.productosMasMovidos.map((producto, index) => (
                  <div key={producto.sku} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{index + 1}. {producto.nombre}</span>
                    <span className="text-sm text-gray-500">{producto.cantidad} unidades</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial;
