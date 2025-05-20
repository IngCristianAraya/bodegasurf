// components/FormularioProducto.jsx
import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, Upload, Image as ImageIcon, X, Package, Tag, Scale, DollarSign, Box, Hash, Barcode } from "lucide-react";

// Categorías predefinidas
const CATEGORIAS = [
  "Alimentos",
  "Bebidas",
  "Lácteos",
  "Panadería",
  "Frutas y Verduras",
  "Carnes",
  "Limpieza",
  "Abarrotes",
  "Otros"
];

// Unidades estándar
const UNIDADES = [
  { valor: "unidad", etiqueta: "Unidad" },
  { valor: "kg", etiqueta: "Kilogramo (kg)" },
  { valor: "g", etiqueta: "Gramo (g)" },
  { valor: "l", etiqueta: "Litro (l)" },
  { valor: "ml", etiqueta: "Mililitro (ml)" },
  { valor: "docena", etiqueta: "Docena" },
  { valor: "paquete", etiqueta: "Paquete" },
  { valor: "caja", etiqueta: "Caja" },
  { valor: "otro", etiqueta: "Otro" }
];

const FormularioProducto = ({ producto, onChange, onSubmit, onScanClick, hideHeader = false }) => {
  const [imagenPreview, setImagenPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errores, setErrores] = useState({});
  const fileInputRef = useRef(null);
  // El estado del escáner ahora se maneja en el componente padre

  // Efecto para validar precios y stock cuando cambian
  useEffect(() => {
    const nuevosErrores = { ...errores };
    
    // Validar precios
    if (producto.precioCompra && producto.precioVenta) {
      if (Number(producto.precioVenta) <= Number(producto.precioCompra)) {
        nuevosErrores.precioVenta = 'El precio de venta debe ser mayor al de compra';
      } else if (nuevosErrores.precioVenta === 'El precio de venta debe ser mayor al de compra') {
        delete nuevosErrores.precioVenta;
      }
    }
    
    // Validar stock mínimo
    if (producto.stockMinimo !== undefined && producto.stockMinimo !== '' && 
        (isNaN(producto.stockMinimo) || Number(producto.stockMinimo) < 0)) {
      nuevosErrores.stockMinimo = 'El stock mínimo debe ser un número positivo';
    } else if (nuevosErrores.stockMinimo) {
      delete nuevosErrores.stockMinimo;
    }
    
    // Validar stock
    if (producto.stock !== undefined && producto.stock !== '' && 
        (isNaN(producto.stock) || !Number.isInteger(Number(producto.stock)) || Number(producto.stock) < 0)) {
      nuevosErrores.stock = 'El stock debe ser un número entero positivo';
    } else if (nuevosErrores.stock) {
      delete nuevosErrores.stock;
    }
    
    setErrores(nuevosErrores);
  }, [producto.precioCompra, producto.precioVenta, producto.stock, producto.stockMinimo]);

  const validarCampos = () => {
    const nuevosErrores = {};
    
    // Validaciones básicas
    if (!producto.nombre?.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!producto.categoria?.trim()) nuevosErrores.categoria = 'La categoría es requerida';
    if (!producto.unidad?.trim()) nuevosErrores.unidad = 'La unidad es requerida';
    
    // Validación de precios
    if (!producto.precioCompra || isNaN(producto.precioCompra) || Number(producto.precioCompra) < 0) {
      nuevosErrores.precioCompra = 'Precio de compra inválido';
    }
    
    if (!producto.precioVenta || isNaN(producto.precioVenta) || Number(producto.precioVenta) < 0) {
      nuevosErrores.precioVenta = 'Precio de venta inválido';
    } else if (Number(producto.precioVenta) <= Number(producto.precioCompra || 0)) {
      nuevosErrores.precioVenta = 'El precio de venta debe ser mayor al de compra';
    }
    
    // Validación de stock
    if (producto.stock === '' || isNaN(producto.stock) || !Number.isInteger(Number(producto.stock)) || Number(producto.stock) < 0) {
      nuevosErrores.stock = 'Stock inválido';
    }
    
    // Validación de stock mínimo
    if (producto.stockMinimo === '' || isNaN(producto.stockMinimo) || !Number.isInteger(Number(producto.stockMinimo)) || Number(producto.stockMinimo) < 0) {
      nuevosErrores.stockMinimo = 'Stock mínimo inválido';
    } else if (Number(producto.stockMinimo) > Number(producto.stock || 0)) {
      nuevosErrores.stockMinimo = 'No puede ser mayor que el stock actual';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validarCampos()) {
      onSubmit(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simular carga de archivo (en un caso real, aquí iría tu lógica de subida)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // No llegamos al 100% hasta que termine todo
          }
          return prev + 10;
        });
      }, 100);

      const reader = new FileReader();
      reader.onloadend = () => {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setImagenPreview(reader.result);
          onChange({ target: { name: 'imagen', value: file } });
          setIsUploading(false);
          setUploadProgress(0);
        }, 300);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange({ target: { name: 'imagen', value: null } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <form onSubmit={handleFormSubmit}>
        <div className="space-y-6">
          {/* ENCABEZADO */}
          {!hideHeader && (
            <div className="flex items-center mb-6 border-b pb-4">
              <ShoppingCart className="text-yellow-500 w-8 h-8 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Agregar Producto</h2>
                <p className="text-sm text-gray-500">Llena los campos para registrar un nuevo producto</p>
              </div>
            </div>
          )}

          {/* FORMULARIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Código de Barras */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="border-b-2 border-yellow-500 pb-0.5">Código de Barras</span>
        </label>
        <div className="flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Barcode className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="codigoBarras"
              value={producto.codigoBarras || ''}
              onChange={onChange}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md pl-10 sm:text-sm border-gray-300"
              placeholder="Escanear o ingresar código"
            />
          </div>
          <button
            type="button"
            onClick={onScanClick}
            className="ml-0.5 relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            title="Escanear código de barras"
          >
            <Barcode className="h-5 w-5 text-white" />
            <span className="ml-2">Escanear</span>
          </button>
        </div>
      </div>

      {/* Nombre */}
      <div className="col-span-2">
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          <span className="border-b-2 border-yellow-500 pb-0.5">Nombre del producto</span>
        </label>
        <input
          type="text"
          name="nombre"
          value={producto.nombre}
          onChange={onChange}
          className={`w-full p-2 border ${
            errores.nombre ? 'border-red-500' : 'border-gray-300'
          } rounded-lg`}
          placeholder="Ej. Coca Cola 500ml"
        />
        {errores.nombre && (
          <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
        )}
      </div>

      {/* Categoría y Unidad en la misma línea */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            <span className="border-b-2 border-yellow-500 pb-0.5">Categoría</span>
          </label>
          <div className="relative">
            <select
              name="categoria"
              value={producto.categoria || ''}
              onChange={onChange}
              className={`w-full pr-10 p-2 border ${
                errores.categoria ? 'border-red-500' : 'border-gray-300'
              } rounded-lg appearance-none bg-white`}
            >
              <option value="">Seleccione una categoría</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errores.categoria && (
            <p className="text-red-500 text-xs mt-1">{errores.categoria}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            <span className="border-b-2 border-yellow-500 pb-0.5">Unidad de Medida</span>
          </label>
          <div className="relative">
            <select
              name="unidad"
              value={producto.unidad || ''}
              onChange={onChange}
              className={`w-full pr-10 p-2 border ${
                errores.unidad ? 'border-red-500' : 'border-gray-300'
              } rounded-lg appearance-none bg-white`}
            >
              <option value="">Seleccione una unidad</option>
              {UNIDADES.map((unidad) => (
                <option key={unidad.valor} value={unidad.valor}>
                  {unidad.etiqueta}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Scale className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errores.unidad && (
            <p className="text-red-500 text-xs mt-1">{errores.unidad}</p>
          )}
        </div>
      </div>

      {/* Precio Compra y Venta en la misma línea */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            <span className="border-b-2 border-yellow-500 pb-0.5">Precio de Compra (S/)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="precioCompra"
              value={producto.precioCompra ?? ''}
              onChange={onChange}
              className={`pl-10 w-full p-2 border ${
                errores.precioCompra ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errores.precioCompra && (
            <p className="text-red-500 text-xs mt-1">{errores.precioCompra}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            <span className="border-b-2 border-yellow-500 pb-0.5">Precio de Venta (S/)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="precioVenta"
              value={producto.precioVenta ?? ''}
              onChange={onChange}
              className={`pl-10 w-full p-2 border ${
                errores.precioVenta ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errores.precioVenta ? (
            <p className="text-red-500 text-xs mt-1">{errores.precioVenta}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Precio de venta al público</p>
          )}
        </div>
      </div>

      {/* Stock y Stock Mínimo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            <span className="border-b-2 border-yellow-500 pb-0.5">Stock Actual</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Box className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="stock"
              value={producto.stock ?? ''}
              onChange={onChange}
              className={`pl-10 w-full p-2 border ${
                errores.stock ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
          {errores.stock ? (
            <p className="text-red-500 text-xs mt-1">{errores.stock}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Cantidad disponible en inventario</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            <span className="border-b-2 border-yellow-500 pb-0.5">Stock Mínimo</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="stockMinimo"
              value={producto.stockMinimo ?? ''}
              onChange={onChange}
              className={`pl-10 w-full p-2 border ${
                errores.stockMinimo ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
          {errores.stockMinimo ? (
            <p className="text-red-500 text-xs mt-1">{errores.stockMinimo}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Se notificará cuando el stock esté por debajo de este valor</p>
          )}
        </div>
      </div>

      {/* Subir Imagen */}
      <div className="col-span-2 mt-2">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          <span className="border-b-2 border-yellow-500 pb-0.5">Imagen del Producto</span>
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-auto">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Haz clic para subir</span> o arrastra una imagen
                </p>
                <p className="text-xs text-gray-500">PNG, JPG (Max. 2MB)</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
            </label>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex items-center">
              <span className="inline-block h-12 w-12 min-w-[3rem] overflow-hidden rounded-full bg-gray-100">
                {imagenPreview ? (
                  <img src={imagenPreview} alt="Vista previa" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </span>
              <div className="ml-3 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <label className="cursor-pointer rounded-md border border-yellow-500 bg-white py-1.5 px-4 text-sm font-medium text-yellow-600 hover:bg-yellow-50 text-center transition-colors duration-200">
                    {imagenPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    <input 
                      type="file" 
                      className="sr-only" 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      disabled={isUploading} 
                    />
                  </label>
                  {imagenPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                      disabled={isUploading}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                {isUploading && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
          </div>

      {/* BOTÓN */}
      <div className="mt-5 flex justify-center col-span-2">
        {onSubmit && (
          <button
            type="submit"
            className="w-80 bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-base py-2.5 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center justify-center space-x-2"
            disabled={Object.keys(errores).length > 0}
          >
            Guardar Producto
          </button>
        )}
      </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormularioProducto;

