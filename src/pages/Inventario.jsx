// pages/Inventario.jsx
import React, { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { Search, Plus, Barcode, CheckCircle, XCircle } from 'lucide-react';
import { useSearch } from "../context/SearchContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormularioProducto from "../components/FormularioProducto";
import TablaInventario from "../components/TablaInventario";
import ImportExport from "../components/ImportExport";
import AlertasInventario from "../components/AlertasInventario";
import EscanerCodigoBarras from "../components/EscanerCodigoBarras";

// Componente personalizado para notificaciones
const CustomToast = ({ message, type = 'success' }) => (
  <div className="flex items-start">
    {type === 'success' ? (
      <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
    ) : (
      <XCircle className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
    )}
    <div>
      <p className="font-medium">{type === 'success' ? '¡Éxito!' : 'Error'}</p>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

const Inventario = () => {
  const { searchTerm, updateSearchTerm } = useSearch();
  
  const handleSearchChange = (e) => {
    updateSearchTerm(e.target.value);
  };
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Leche Gloria", categoria: "Lácteos", precioCompra: 3, precioVenta: 4, unidad: "litros", cantidad: 1, codigoBarras: "123456789012" },
    { id: 2, nombre: "Arroz Costeño", categoria: "Abarrotes", precioCompra: 1, precioVenta: 2, unidad: "kilos", cantidad: 5, codigoBarras: "987654321098" },
    { id: 3, nombre: "Aceite Primor", categoria: "Abarrotes", precioCompra: 5, precioVenta: 6, unidad: "litros", cantidad: 10, codigoBarras: "456789012345" },
    { id: 4, nombre: "Atún Isabel", categoria: "Conservas", precioCompra: 4, precioVenta: 5, unidad: "latas", cantidad: 20, codigoBarras: "321098765432" },
  ]);

  // Filtrar productos según el término de búsqueda
  const productosFiltrados = useMemo(() => {
    if (!searchTerm) return productos;
    
    return productos.filter(producto => 
      producto.nombre.toLowerCase().includes(searchTerm) ||
      producto.categoria.toLowerCase().includes(searchTerm)
    );
  }, [productos, searchTerm]);

  const [showModal, setShowModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "", categoria: "Abarrotes", precioCompra: "", precioVenta: "", unidad: "unidad", cantidad: "", codigoBarras: ""
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Convertir a número si el campo es numérico
    const processedValue = ['precioCompra', 'precioVenta', 'cantidad'].includes(name) 
      ? value === '' ? '' : Number(value)
      : value;
      
    if (productoEdit) {
      setProductoEdit((prev) => ({ ...prev, [name]: processedValue }));
    } else {
      setNuevoProducto((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleEditar = (producto) => {
    setProductoEdit(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSaveChanges = () => {
    try {
      setProductos((prev) => prev.map((p) => (p.id === productoEdit.id ? productoEdit : p)));
      handleCloseModal();
      toast.success('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const handleAddProducto = (e) => {
    e.preventDefault();
    try {
      const newProduct = { 
        ...nuevoProducto, 
        id: Date.now(),
        fechaCreacion: new Date().toISOString()
      };
      setProductos((prev) => [...prev, newProduct]);
      setNuevoProducto({ nombre: "", categoria: "Abarrotes", precioCompra: "", precioVenta: "", unidad: "unidad", cantidad: "" });
      toast.success('Producto agregado correctamente');
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      toast.error('Error al agregar el producto');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setProductos((prev) => prev.filter((producto) => producto.id !== id));
        toast.success('Producto eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar el producto');
        console.error('Error al eliminar el producto:', error);
      }
    }
  };

  const [showScanner, setShowScanner] = useState(false);

  const handleBarcodeScanned = (barcode) => {
    // Buscar si el código de barras ya existe
    const productoExistente = productos.find(p => p.codigoBarras === barcode);
    
    if (productoExistente) {
      // Si el producto existe, abrir el modal de edición
      setProductoEdit(productoExistente);
      setShowModal(true);
    } else {
      // Si no existe, abrir el modal para crear un nuevo producto
      setNuevoProducto(prev => ({
        ...prev,
        codigoBarras: barcode,
        nombre: `Producto ${barcode.substring(0, 6)}`
      }));
      setShowModal(true);
    }
  };
  
  const handleImportData = (importedData) => {
    try {
      // Asignar IDs a los productos importados si no los tienen
      const formattedData = importedData.map(item => ({
        ...item,
        id: item.id || Date.now() + Math.random(),
        codigoBarras: item.codigoBarras || `CB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        fechaCreacion: item.fechaCreacion || new Date().toISOString()
      }));
      
      setProductos(prev => [...prev, ...formattedData]);
      toast.success(`Se importaron ${formattedData.length} productos correctamente`);
    } catch (error) {
      console.error('Error al importar datos:', error);
      toast.error('Error al importar los datos');
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 h-full">
      {/* Sección superior con dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Columna izquierda: Formulario de producto */}
        <div className="md:col-span-1 flex flex-col h-full">
          <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Agregar Producto</h2>
            <div className="flex-1 overflow-y-auto">
              <FormularioProducto 
                producto={nuevoProducto} 
                onChange={handleChange} 
                onSubmit={handleAddProducto}
                onScanClick={() => setShowScanner(true)}
              />
            </div>
          </div>
        </div>

        {/* Columna derecha: Inventario Actual */}
        <div className="md:col-span-2 flex flex-col h-full">
          <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Inventario de Productos</h2>
            <div className="flex-1 flex flex-col min-h-0">
              <TablaInventario 
                productos={productosFiltrados} 
                onEditar={handleEditar} 
                onEliminar={handleDelete}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                itemsPerPage={8}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de herramientas */}
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-yellow-50 rounded-lg mr-3 border border-yellow-100">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Gestión de Datos</h3>
              <p className="text-sm text-gray-500">Importa o exporta la información de tu inventario</p>
            </div>
          </div>
          <ImportExport 
            productos={productos} 
            onImport={handleImportData} 
          />
        </div>

        {/* Alertas de inventario */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Alertas de Inventario</h2>
          <AlertasInventario 
            productos={productos} 
            nivelMinimo={5} 
          />
        </div>
      </div>
      {showScanner && (
        <EscanerCodigoBarras
          onScan={(barcode) => {
            handleBarcodeScanned(barcode);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormularioProducto producto={productoEdit || {}} onChange={handleChange} />
        </Modal.Body>
        <Modal.Footer>
          <button className="bg-gray-400 text-white px-4 py-2 rounded-md" onClick={handleCloseModal}>Cancelar</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleSaveChanges}>Guardar Cambios</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Inventario;
