import { useState } from 'react';
import { Plus, Search, Filter, Download, RefreshCw, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TablaProveedores from '../components/proveedores/TablaProveedores';
import ProveedorForm from '../components/proveedores/ProveedorForm';

// Componente de tarjeta de resumen
const ResumenCard = ({ titulo, valor, cambio, esAumento, color }) => (
  <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${color} flex flex-col h-full`}>
    <p className="text-sm font-medium text-gray-500">{titulo}</p>
    <div className="flex items-end justify-between mt-2">
      <p className="text-2xl font-bold">{valor}</p>
      {cambio && (
        <span className={`text-xs px-2 py-1 rounded-full ${esAumento ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {cambio} {esAumento ? '↑' : '↓'}
        </span>
      )}
    </div>
  </div>
);

// Datos de ejemplo para las tarjetas de resumen
const resumenData = [
  {
    titulo: 'Total Proveedores',
    valor: '24',
    cambio: '+5%',
    esAumento: true,
    color: 'border-l-blue-500',
  },
  {
    titulo: 'Activos',
    valor: '18',
    cambio: '+12%',
    esAumento: true,
    color: 'border-l-green-500',
  },
  {
    titulo: 'Inactivos',
    valor: '6',
    cambio: '-2%',
    esAumento: false,
    color: 'border-l-yellow-500',
  },
  {
    titulo: 'Límite Crédito Total',
    valor: '$45.000.000',
    cambio: '+8%',
    esAumento: true,
    color: 'border-l-purple-500',
  },
];

const Proveedores = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Función para manejar la creación/actualización de un proveedor
  const manejarGuardarProveedor = (proveedor) => {
    // Aquí iría la lógica para guardar en la API
    console.log('Guardando proveedor:', proveedor);
    
    // Cerrar el formulario
    setMostrarFormulario(false);
    setProveedorSeleccionado(null);
    
    // Mostrar notificación
    toast.success(proveedorSeleccionado ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente');
  };

  // Función para manejar la eliminación de un proveedor
  const manejarEliminarProveedor = (id) => {
    // Aquí iría la lógica para eliminar en la API
    console.log('Eliminando proveedor con ID:', id);
    
    // Mostrar notificación
    toast.success('Proveedor eliminado correctamente');
  };

  // Función para manejar la edición de un proveedor
  const manejarEditarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setMostrarFormulario(true);
  };

  // Función para manejar el cambio de filtro
  const handleFiltroChange = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
  };

  // Función para manejar la búsqueda
  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
  };

  // Función para recargar la tabla
  const recargarTabla = () => {
    setCargando(true);
    // Simular carga de datos
    setTimeout(() => {
      setCargando(false);
      toast.info('Datos actualizados');
    }, 1000);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 h-full">
      {/* Título con estilo mejorado */}
      <div className="mb-6 relative pl-5 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-white shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"></div>
        <div className="flex items-center">
          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
            <Truck className="text-yellow-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Proveedores</h1>
            <p className="text-sm text-gray-500">Administra y controla la información de tus proveedores</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {resumenData.map((item, index) => (
          <ResumenCard key={index} {...item} />
        ))}
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proveedores..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
              value={busqueda}
              onChange={handleBuscar}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
              value={filtro}
              onChange={(e) => handleFiltroChange(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => {
                setProveedorSeleccionado(null);
                setMostrarFormulario(true);
              }}
            >
              <Plus size={16} /> Nuevo Proveedor
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button 
            type="button"
            onClick={recargarTabla}
            disabled={cargando}
            className="text-sm text-gray-600 hover:text-yellow-600 flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} /> 
            {cargando ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button className="text-sm text-gray-600 hover:text-yellow-600 flex items-center gap-1 transition-colors">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Tabla de proveedores */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <TablaProveedores
          onEditarProveedor={manejarEditarProveedor}
          onEliminarProveedor={manejarEliminarProveedor}
          filtro={filtro}
          busqueda={busqueda}
          cargando={cargando}
        />
      </div>

      {/* Formulario de proveedor */}
      {mostrarFormulario && (
        <ProveedorForm
          proveedor={proveedorSeleccionado}
          onClose={() => {
            setMostrarFormulario(false);
            setProveedorSeleccionado(null);
          }}
          onSave={manejarGuardarProveedor}
        />
      )}
    </div>
  );
};

export default Proveedores;
