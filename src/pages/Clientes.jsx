
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Filter, 
  Download, 
  Upload, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Users,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Pencil
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente de tarjeta de resumen
const ResumenCard = ({ titulo, valor, color }) => (
  <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${color} flex flex-col h-full`}>
    <p className="text-sm font-medium text-gray-500">{titulo}</p>
    <p className="text-2xl font-bold">{valor}</p>
  </div>
);

// Componente principal de Clientes
const Clientes = () => {
  // Estados
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Datos de ejemplo
  const clientesIniciales = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      tipoDocumento: 'DNI',
      documento: '12345678',
      telefono: '987654321',
      email: 'juan@example.com',
      direccion: 'Av. Principal 123',
      tipoCliente: 'minorista',
      fechaRegistro: '2023-01-15',
      activo: true,
      comprasTotales: 15,
      montoTotal: 12500.50
    },
    {
      id: 2,
      nombre: 'María García',
      tipoDocumento: 'RUC',
      documento: '20123456789',
      telefono: '987123456',
      email: 'maria@empresa.com',
      direccion: 'Calle Comercial 456',
      tipoCliente: 'mayorista',
      fechaRegistro: '2023-02-20',
      activo: true,
      comprasTotales: 8,
      montoTotal: 8500.75
    },
    {
      id: 3,
      nombre: 'Carlos López',
      tipoDocumento: 'DNI',
      documento: '87654321',
      telefono: '987987987',
      email: 'carlos@example.com',
      direccion: 'Jr. Libertad 789',
      tipoCliente: 'minorista',
      fechaRegistro: '2023-03-10',
      activo: false,
      comprasTotales: 3,
      montoTotal: 1200.00
    },
  ];

  // Cargar clientes al montar el componente
  useEffect(() => {
    setClientes(clientesIniciales);
  }, []);

  // Filtrar, ordenar y paginar clientes
  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes];

    // Aplicar filtro de búsqueda
    if (filtro) {
      const termino = filtro.toLowerCase();
      resultado = resultado.filter(cliente => 
        cliente.nombre.toLowerCase().includes(termino) ||
        cliente.documento.includes(termino) ||
        (cliente.email && cliente.email.toLowerCase().includes(termino))
      );
    }

    // Aplicar filtro de estado
    if (filtroActivo === 'activos') {
      resultado = resultado.filter(cliente => cliente.activo);
    } else if (filtroActivo === 'inactivos') {
      resultado = resultado.filter(cliente => !cliente.activo);
    }

    // Ordenar
    resultado.sort((a, b) => {
      const valorA = a[ordenarPor];
      const valorB = b[ordenarPor];

      if (valorA < valorB) return ordenAscendente ? -1 : 1;
      if (valorA > valorB) return ordenAscendente ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [clientes, filtro, filtroActivo, ordenarPor, ordenAscendente]);

  // Calcular estadísticas
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.activo).length;
  const ingresosTotales = clientes.reduce((sum, c) => sum + (c.montoTotal || 0), 0);
  
  // Paginación
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const paginatedClientes = clientesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejadores de eventos
  const handleEliminarCliente = (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
      toast.success('Cliente eliminado correctamente');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevoCliente = {
      id: clienteSeleccionado?.id || Date.now(),
      nombre: formData.get('nombre'),
      tipoDocumento: formData.get('tipoDocumento'),
      documento: formData.get('documento'),
      telefono: formData.get('telefono'),
      email: formData.get('email'),
      direccion: formData.get('direccion'),
      tipoCliente: formData.get('tipoCliente'),
      activo: formData.get('activo') === 'on',
      fechaRegistro: clienteSeleccionado?.fechaRegistro || new Date().toISOString().split('T')[0],
      comprasTotales: clienteSeleccionado?.comprasTotales || 0,
      montoTotal: clienteSeleccionado?.montoTotal || 0
    };

    if (clienteSeleccionado) {
      setClientes(clientes.map(c => c.id === nuevoCliente.id ? nuevoCliente : c));
      toast.success('Cliente actualizado correctamente');
    } else {
      setClientes([...clientes, nuevoCliente]);
      toast.success('Cliente agregado correctamente');
    }

    setMostrarFormulario(false);
    setClienteSeleccionado(null);
  };

  // Función para exportar a Excel
  const exportarAExcel = () => {
    toast.info('Exportando datos a Excel...');
    // Implementar lógica de exportación
  };

  // Función para importar desde Excel
  const importarDesdeExcel = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.info(`Importando clientes desde ${file.name}...`);
      // Implementar lógica de importación
    }
  };

  // Función para cambiar de página
  const cambiarPagina = (nuevaPagina) => {
    setCurrentPage(Math.max(1, Math.min(nuevaPagina, totalPages)));
  };

  // Función para ordenar por columna
  const handleOrdenar = (columna) => {
    if (ordenarPor === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(columna);
      setOrdenAscendente(true);
    }
  };

  // Renderizar el componente
  return (
    <div className="flex flex-col space-y-6 p-4 h-full">
      {/* Título con estilo mejorado */}
      <div className="mb-6 relative pl-5 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-white shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"></div>
        <div className="flex items-center">
          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
            <Users className="text-yellow-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
            <p className="text-sm text-gray-500">Administra y controla la información de tus clientes</p>
          </div>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ResumenCard 
          titulo="Total de Clientes" 
          valor={totalClientes} 
          color="border-blue-500" 
        />
        <ResumenCard 
          titulo="Clientes Activos" 
          valor={clientesActivos} 
          color="border-green-500" 
        />
        <ResumenCard 
          titulo="Ingresos Totales" 
          valor={`S/ ${ingresosTotales.toFixed(2)}`} 
          color="border-purple-500" 
        />
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o correo..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => {
                setClienteSeleccionado(null);
                setMostrarFormulario(true);
              }}
            >
              <Plus size={16} /> Nuevo Cliente
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button 
            className="text-sm text-gray-600 hover:text-yellow-600 flex items-center gap-1 transition-colors"
            onClick={exportarAExcel}
          >
            <FileSpreadsheet size={16} /> Exportar
          </button>
          <label className="text-sm text-gray-600 hover:text-yellow-600 flex items-center gap-1 cursor-pointer transition-colors">
            <FileText size={16} /> Importar
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={importarDesdeExcel} />
          </label>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleOrdenar('nombre')}
                >
                  <div className="flex items-center gap-1">
                    Nombre
                    {ordenarPor === 'nombre' ? (
                      ordenAscendente ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : <ChevronsUpDown size={14} className="text-gray-400" />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedClientes.length > 0 ? (
                paginatedClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                          <div className="text-xs text-gray-500">{cliente.tipoDocumento}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.documento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cliente.tipoCliente === 'mayorista' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {cliente.tipoCliente === 'mayorista' ? 'Mayorista' : 'Minorista'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cliente.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            setClienteSeleccionado(cliente);
                            setMostrarFormulario(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleEliminarCliente(cliente.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron clientes que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => cambiarPagina(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => cambiarPagina(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, clientesFiltrados.length)}
                  </span>{' '}
                  de <span className="font-medium">{clientesFiltrados.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => cambiarPagina(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Primera</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => cambiarPagina(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Página {currentPage} de {totalPages}
                  </div>
                  <button
                    onClick={() => cambiarPagina(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={() => cambiarPagina(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Última</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {clienteSeleccionado ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button 
                  onClick={() => {
                    setMostrarFormulario(false);
                    setClienteSeleccionado(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      name="nombre"
                      defaultValue={clienteSeleccionado?.nombre || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                      <select
                        name="tipoDocumento"
                        defaultValue={clienteSeleccionado?.tipoDocumento || 'DNI'}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      >
                        <option value="DNI">DNI</option>
                        <option value="RUC">RUC</option>
                        <option value="CE">Carné de Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">N° Documento *</label>
                      <input
                        type="text"
                        name="documento"
                        defaultValue={clienteSeleccionado?.documento || ''}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="telefono"
                        defaultValue={clienteSeleccionado?.telefono || ''}
                        className="pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        defaultValue={clienteSeleccionado?.email || ''}
                        className="pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="direccion"
                        defaultValue={clienteSeleccionado?.direccion || ''}
                        className="pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                    <select
                      name="tipoCliente"
                      defaultValue={clienteSeleccionado?.tipoCliente || 'minorista'}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    >
                      <option value="minorista">Minorista</option>
                      <option value="mayorista">Mayorista</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center h-5">
                      <input
                        id="activo"
                        name="activo"
                        type="checkbox"
                        defaultChecked={clienteSeleccionado ? clienteSeleccionado.activo : true}
                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                    </div>
                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                      Cliente activo
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setClienteSeleccionado(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    {clienteSeleccionado ? 'Actualizar Cliente' : 'Agregar Cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;