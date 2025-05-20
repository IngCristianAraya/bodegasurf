import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter, ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

// Datos de ejemplo para la tabla
const datosEjemplo = [
  {
    id: 1,
    nombre: 'Distribuidora La Economía',
    nit: '900123456-7',
    contacto: 'Carlos Andrés López',
    telefono: '6012345678',
    whatsapp: '3001234567',
    email: 'contacto@laeconomia.com',
    terminosPago: '30 días',
    limiteCredito: 5000000,
    estado: 'activo',
    productos: ['Abarrotes', 'Lácteos', 'Aseo']
  },
  {
    id: 2,
    nombre: 'Alimentos Del Valle',
    nit: '800987654-3',
    contacto: 'María Fernanda Gómez',
    telefono: '6023456789',
    whatsapp: '3109876543',
    email: 'ventas@alimentosvalle.com',
    terminosPago: '15 días',
    limiteCredito: 3000000,
    estado: 'activo',
    productos: ['Lácteos', 'Embutidos', 'Quesos']
  },
  {
    id: 3,
    nombre: 'Importaciones Andinas',
    nit: '700456789-1',
    contacto: 'Roberto Mendoza',
    telefono: '3134567890',
    whatsapp: '3134567890',
    email: 'rmendoza@importacionesandinas.com',
    terminosPago: '60 días',
    limiteCredito: 10000000,
    estado: 'inactivo',
    productos: ['Importados', 'Licores', 'Gourmet']
  }
];

const TablaProveedores = ({ 
  onEditarProveedor, 
  onEliminarProveedor, 
  filtro = 'todos', 
  busqueda = '',
  cargando = false
}) => {
  const [proveedores, setProveedores] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  // Cargar datos de ejemplo al montar el componente
  useEffect(() => {
    setProveedores(datosEjemplo);
  }, []);

  // Función para manejar el ordenamiento
  const manejarOrdenar = (campo) => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdenAscendente(true);
    }
  };

  // Función para obtener el ícono de ordenación
  const obtenerIconoOrdenacion = (campo) => {
    if (ordenarPor !== campo) return <ChevronsUpDown className="ml-1 h-4 w-4 inline" />;
    return ordenAscendente 
      ? <ChevronUp className="ml-1 h-4 w-4 inline" /> 
      : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  };

  // Filtrar y ordenar los proveedores
  const proveedoresFiltrados = proveedores
    .filter(proveedor => {
      // Filtrar por búsqueda
      const coincideBusqueda = 
        proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        proveedor.nit.includes(busqueda) ||
        proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
        proveedor.telefono.includes(busqueda) ||
        (proveedor.email && proveedor.email.toLowerCase().includes(busqueda.toLowerCase()));
      
      // Filtrar por estado
      const coincideEstado = filtro === 'todos' || 
                           (filtro === 'activos' && proveedor.estado === 'activo') ||
                           (filtro === 'inactivos' && proveedor.estado === 'inactivo');
      
      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => {
      // Ordenar los resultados
      const valorA = a[ordenarPor];
      const valorB = b[ordenarPor];
      
      if (valorA < valorB) return ordenAscendente ? -1 : 1;
      if (valorA > valorB) return ordenAscendente ? 1 : -1;
      return 0;
    });

  // Obtener los proveedores de la página actual
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const proveedoresPaginados = proveedoresFiltrados.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / itemsPorPagina);

  // Cambiar de página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo(0, 0);
  };

  // Formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="overflow-x-auto">
      {cargando ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <span className="ml-2">Cargando proveedores...</span>
        </div>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => manejarOrdenar('nombre')}
                >
                  <div className="flex items-center">
                    Nombre
                    {obtenerIconoOrdenacion('nombre')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => manejarOrdenar('nit')}
                >
                  <div className="flex items-center">
                    NIT/RUT
                    {obtenerIconoOrdenacion('nit')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => manejarOrdenar('contacto')}
                >
                  <div className="flex items-center">
                    Contacto
                    {obtenerIconoOrdenacion('contacto')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Teléfono
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => manejarOrdenar('terminosPago')}
                >
                  <div className="flex items-center">
                    Términos
                    {obtenerIconoOrdenacion('terminosPago')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => manejarOrdenar('limiteCredito')}
                >
                  <div className="flex items-center">
                    Límite Crédito
                    {obtenerIconoOrdenacion('limiteCredito')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => manejarOrdenar('estado')}
                >
                  <div className="flex items-center">
                    Estado
                    {obtenerIconoOrdenacion('estado')}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proveedoresPaginados.length > 0 ? (
                proveedoresPaginados.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-yellow-100 rounded-md text-yellow-600">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{proveedor.nombre}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {proveedor.productos.slice(0, 2).map((producto, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                              >
                                {producto}
                              </span>
                            ))}
                            {proveedor.productos.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{proveedor.productos.length - 2} más
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proveedor.nit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{proveedor.contacto}</div>
                      <div className="text-sm text-gray-500">{proveedor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{proveedor.telefono}</div>
                      {proveedor.whatsapp && (
                        <div className="text-sm text-green-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.795-1.484-1.77-1.66-2.07-.173-.297-.018-.458.132-.606.136-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.508-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.273-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.742.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.887-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.55 4.142 1.595 5.945L0 24l6.335-1.652a11.88 11.88 0 005.723 1.465h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          {proveedor.whatsapp}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {proveedor.terminosPago}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearMoneda(proveedor.limiteCredito)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        proveedor.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onEditarProveedor(proveedor)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onEliminarProveedor(proveedor.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron proveedores que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {proveedoresFiltrados.length > itemsPorPagina && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indicePrimerItem + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(indiceUltimoItem, proveedoresFiltrados.length)}
                    </span>{' '}
                    de <span className="font-medium">{proveedoresFiltrados.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => cambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        paginaActual === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      let numeroPagina;
                      if (totalPaginas <= 5) {
                        numeroPagina = i + 1;
                      } else if (paginaActual <= 3) {
                        numeroPagina = i + 1;
                      } else if (paginaActual >= totalPaginas - 2) {
                        numeroPagina = totalPaginas - 4 + i;
                      } else {
                        numeroPagina = paginaActual - 2 + i;
                      }
                      
                      return (
                        <button
                          key={numeroPagina}
                          onClick={() => cambiarPagina(numeroPagina)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            paginaActual === numeroPagina
                              ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {numeroPagina}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => cambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        paginaActual === totalPaginas ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TablaProveedores;
