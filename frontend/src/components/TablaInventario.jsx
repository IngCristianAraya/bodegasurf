import { useState, useMemo, useEffect } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Filter,
  X,
  Edit2,
  Trash2,
  Search
} from "lucide-react";

const TablaInventario = ({ 
  productos, 
  onEditar, 
  onEliminar, 
  searchTerm = "",
  onSearchChange = () => {},
  itemsPerPage = 8
}) => {
  // Estados para ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Estados para filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoria: '',
    precioMin: '',
    precioMax: '',
    cantidadMin: '',
    cantidadMax: ''
  });
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener categorías únicas para el filtro
  const categoriasUnicas = useMemo(() => {
    return [...new Set(productos.map(p => p.categoria))];
  }, [productos]);

  // Función para manejar el ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Resetear a la primera página al cambiar filtros
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      categoria: '',
      precioMin: '',
      precioMax: '',
      cantidadMin: '',
      cantidadMax: ''
    });
  };

  // Encabezados de la tabla con ordenamiento
  const headers = [
    { key: 'codigoBarras', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'precioVenta', label: 'Precio Venta' },
    { key: 'precioCompra', label: 'Precio Compra' },
    { key: 'stock', label: 'Stock' },
    { key: 'stockMinimo', label: 'Mínimo' },
    { key: 'unidad', label: 'Unidad' },
    { key: 'acciones', label: 'Acciones' }
  ];

  // Aplicar filtros y ordenamiento
  const filteredAndSortedProductos = useMemo(() => {
    let result = [...productos];

    // Aplicar búsqueda por término
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.categoria.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros avanzados
    if (filters.categoria) {
      result = result.filter(p => p.categoria === filters.categoria);
    }
    if (filters.precioMin) {
      result = result.filter(p => p.precioVenta >= Number(filters.precioMin));
    }
    if (filters.precioMax) {
      result = result.filter(p => p.precioVenta <= Number(filters.precioMax));
    }
    if (filters.cantidadMin) {
      result = result.filter(p => p.stock >= Number(filters.cantidadMin));
    }
    if (filters.cantidadMax) {
      result = result.filter(p => p.stock <= Number(filters.cantidadMax));
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [productos, searchTerm, filters, sortConfig]);

  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredAndSortedProductos.length / itemsPerPage);
  
  // Asegurarse de que la página actual sea válida
  useEffect(() => {
    if (currentPage > 1 && filteredAndSortedProductos.length <= (currentPage - 1) * itemsPerPage) {
      setCurrentPage(1);
    }
  }, [filteredAndSortedProductos, currentPage, itemsPerPage]);
  
  // Obtener productos para la página actual
  const paginatedProductos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProductos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProductos, currentPage, itemsPerPage]);

  // Renderizado de las celdas de la tabla
  const renderCell = (producto, key) => {
    if (!producto) return '-';
    
    switch (key) {
      case 'codigoBarras':
        return (
          <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
            {producto[key] || 'N/A'}
          </div>
        );
      case 'precioVenta':
      case 'precioCompra':
        return `S/ ${parseFloat(producto[key] || 0).toFixed(2)}`;
      case 'stock':
        const bajoStock = producto.stock <= producto.stockMinimo;
        return (
          <div className="flex flex-col">
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
              bajoStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {producto.stock} {producto.unidad}
            </span>
            {bajoStock && (
              <span className="text-xs text-red-500 mt-1">¡Stock bajo!</span>
            )}
          </div>
        );
      case 'stockMinimo':
        return (
          <span className="text-sm text-gray-700">
            {producto.stockMinimo} {producto.unidad}
          </span>
        );
      default:
        return producto[key] || '-';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controles de búsqueda y filtros */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              showFilters 
                ? 'bg-yellow-500 border-yellow-600 text-white shadow-md hover:bg-yellow-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700'
            } transition-all duration-200 font-medium`}
          >
            <Filter className={`h-4 w-4 ${showFilters ? 'text-white' : 'text-yellow-500'}`} />
            <span className="text-sm">Filtros</span>
            {Object.values(filters).some(Boolean) && (
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                showFilters 
                  ? 'bg-white text-yellow-600' 
                  : 'bg-yellow-500 text-white'
              }`}>
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Filtros avanzados</h3>
              <button
                onClick={clearFilters}
                className="text-xs text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 px-2 py-1 rounded flex items-center transition-colors duration-200"
              >
                <X className="h-3 w-3 mr-1" /> Limpiar filtros
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  name="categoria"
                  value={filters.categoria}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas las categorías</option>
                  {categoriasUnicas.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mín.</label>
                <input
                  type="number"
                  name="precioMin"
                  value={filters.precioMin}
                  onChange={handleFilterChange}
                  placeholder="S/ 0.00"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Máx.</label>
                <input
                  type="number"
                  name="precioMax"
                  value={filters.precioMax}
                  onChange={handleFilterChange}
                  placeholder="S/ 0.00"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de productos */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 z-10">
                <tr className="bg-white border-b-2 border-gray-200">
                  {headers.map((header, index) => {
                    // Determinar si es la primera o última columna para redondear las esquinas
                    const isFirst = index === 0;
                    const isLast = index === headers.length - 1;
                    
                    return (
                      <th
                        key={header.key}
                        scope="col"
                        className={`px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                          header.key !== 'acciones' ? 'cursor-pointer hover:text-yellow-600' : ''
                        } ${isFirst ? 'pl-6' : ''} ${isLast ? 'pr-6' : ''}`}
                        onClick={() => header.key !== 'acciones' && handleSort(header.key)}
                      >
                        <div className="flex items-center justify-between border-b-2 border-yellow-500 pb-1">
                          <span>{header.label}</span>
                          {header.key !== 'acciones' && (
                            <span className="ml-1">
                              {sortConfig.key === header.key ? (
                                sortConfig.direction === 'asc' ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-white" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-white" />
                                )
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5 text-yellow-100 opacity-70" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProductos.length > 0 ? (
                  paginatedProductos.map((producto, rowIndex) => (
                    <tr 
                      key={producto.id} 
                      className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                    >
                      {headers.map((header) => (
                        <td 
                          key={`${producto.id}-${header.key}`} 
                          className={`px-3 py-4 whitespace-nowrap ${header.key === 'acciones' ? 'text-right pr-6' : ''}`}
                        >
                          {header.key === 'acciones' ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => onEditar(producto)}
                                className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onEliminar(producto.id)}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            renderCell(producto, header.key)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedProductos.length)}
                </span>{' '}
                de <span className="font-medium">{filteredAndSortedProductos.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Primera</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNum
                          ? 'z-10 bg-yellow-500 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default TablaInventario;
