import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Upload, Download, FileText, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Esquema de validación para productos
const productSchema = {
  nombre: { required: true, type: 'string' },
  categoria: { required: true, type: 'string' },
  precioCompra: { required: true, type: 'number', min: 0 },
  precioVenta: { required: true, type: 'number', min: 0 },
  stock: { required: true, type: 'number', min: 0, integer: true },
  stockMinimo: { required: true, type: 'number', min: 0, integer: true },
  codigoBarras: { required: false, type: 'string' },
  unidad: { required: true, type: 'string' },
  imagen: { required: false, type: 'string' }
};

const ImportExport = ({ onImport, productos }) => {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Función para validar un producto según el esquema
  const validateProduct = (product) => {
    const errors = [];
    
    Object.entries(productSchema).forEach(([key, rules]) => {
      const value = product[key];
      
      // Verificar campos requeridos
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`El campo '${key}' es requerido`);
        return;
      }
      
      // Verificar tipo de dato
      if (value !== undefined && value !== null && value !== '') {
        if (rules.type === 'number' && isNaN(Number(value))) {
          errors.push(`El campo '${key}' debe ser un número`);
        } else if (rules.type === 'number') {
          const numValue = Number(value);
          if (rules.min !== undefined && numValue < rules.min) {
            errors.push(`El campo '${key}' debe ser mayor o igual a ${rules.min}`);
          }
          if (rules.integer && !Number.isInteger(numValue)) {
            errors.push(`El campo '${key}' debe ser un número entero`);
          }
        }
      }
    });
    
    // Validar que el precio de venta sea mayor o igual al de compra
    if (product.precioVenta < product.precioCompra) {
      errors.push('El precio de venta no puede ser menor al precio de compra');
    }
    
    // Validar que el stock mínimo no sea mayor al stock actual
    if (product.stockMinimo > product.stock) {
      errors.push('El stock mínimo no puede ser mayor al stock actual');
    }
    
    return errors.length > 0 ? errors : null;
  };

  const handleExport = async (format) => {
    setStatus({ type: 'loading', message: 'Preparando la exportación...' });
    setIsLoading(true);
    
    try {
      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        throw new Error('No hay datos para exportar');
      }
      
      // Limpiar datos para la exportación (eliminar propiedades internas de React)
      const cleanProducts = productos.map(({ id, ...rest }) => ({
        ...rest,
        // Asegurar que los valores numéricos se guarden correctamente
        precioCompra: Number(rest.precioCompra || 0),
        precioVenta: Number(rest.precioVenta || 0),
        stock: Number(rest.stock || 0),
        stockMinimo: Number(rest.stockMinimo || 0)
      }));
      
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(cleanProducts);
      
      // Configurar ancho de columnas
      const columnWidths = [
        { wch: 30 }, // nombre
        { wch: 25 }, // categoría
        { wch: 15 }, // precioCompra
        { wch: 15 }, // precioVenta
        { wch: 10 }, // stock
        { wch: 15 }, // stockMinimo
        { wch: 20 }, // código de barras
        { wch: 15 }, // unidad
        { wch: 40 }  // imagen (URL)
      ];
      ws['!cols'] = columnWidths;
      
      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      
      // Generar el archivo
      const excelBuffer = await XLSX.write(wb, { 
        bookType: format.toLowerCase(), 
        type: 'array',
        bookSST: true
      });
      
      const mimeType = format === 'CSV' 
        ? 'text/csv;charset=utf-8;' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      
      const data = new Blob([excelBuffer], { type: mimeType });
      const fileName = `inventario_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      
      saveAs(data, fileName);
      
      setStatus({ 
        type: 'success', 
        message: `Exportación completada: ${fileName}` 
      });
      
    } catch (error) {
      console.error('Error al exportar:', error);
      setStatus({ 
        type: 'error', 
        message: `Error al exportar: ${error.message || 'Error desconocido'}` 
      });
    } finally {
      setIsLoading(false);
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus({ type: 'loading', message: 'Procesando archivo...' });
    setIsLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (!jsonData || jsonData.length === 0) {
          throw new Error('El archivo está vacío');
        }
        
        // Validar cada producto
        const validatedProducts = [];
        const errors = [];
        
        jsonData.forEach((item, index) => {
          const rowNumber = index + 2; // +2 porque la primera fila es el encabezado
          const productErrors = validateProduct(item);
          
          if (productErrors) {
            errors.push(`Fila ${rowNumber}: ${productErrors.join('; ')}`);
          } else {
            // Limpiar y formatear los datos
            const cleanProduct = {
              ...item,
              precioCompra: Number(item.precioCompra),
              precioVenta: Number(item.precioVenta),
              stock: Number(item.stock),
              stockMinimo: Number(item.stockMinimo || 0),
              // Si no hay imagen, usar una por defecto
              imagen: item.imagen || '/productos/sin-imagen.jpg'
            };
            validatedProducts.push(cleanProduct);
          }
        });
        
        if (errors.length > 0) {
          // Mostrar los primeros 5 errores para no abrumar al usuario
          const errorMessage = errors.length > 5 
            ? `${errors.slice(0, 5).join('\n')}\n\n...y ${errors.length - 5} errores más`
            : errors.join('\n');
            
          setStatus({ 
            type: 'error', 
            message: `Se encontraron ${errors.length} error(es) en el archivo:\n\n${errorMessage}` 
          });
          
          if (validatedProducts.length > 0) {
            // Preguntar si desea importar los productos válidos
            if (window.confirm(`Se encontraron ${validatedProducts.length} productos válidos. ¿Desea importarlos de todos modos?`)) {
              onImport(validatedProducts);
              setStatus({ 
                type: 'success', 
                message: `Se importaron ${validatedProducts.length} productos correctamente (con ${errors.length} errores)` 
              });
            }
          }
        } else {
          // Todos los productos son válidos
          onImport(validatedProducts);
          setStatus({ 
            type: 'success', 
            message: `Se importaron ${validatedProducts.length} productos correctamente` 
          });
        }
        
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        setStatus({ 
          type: 'error', 
          message: `Error al procesar el archivo: ${error.message || 'Formato de archivo no válido'}` 
        });
      } finally {
        setIsLoading(false);
        // Limpiar el input de archivo para permitir volver a cargar el mismo archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Limpiar el mensaje después de 10 segundos
        setTimeout(() => setStatus({ type: '', message: '' }), 10000);
      }
    };
    
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Error al leer el archivo' });
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Función para renderizar el estado actual
  const renderStatus = () => {
    if (!status.message) return null;
    
    const statusConfig = {
      loading: {
        icon: <Loader2 className="w-5 h-5 animate-spin text-blue-500" />,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700'
      },
      success: {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700'
      },
      error: {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700'
      },
      warning: {
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700'
      }
    };
    
    const config = statusConfig[status.type] || statusConfig.warning;
    
    return (
      <div className={`p-3 mb-4 rounded-lg border ${config.border} ${config.bg} ${config.text} text-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-2">
            {config.icon}
          </div>
          <div className="whitespace-pre-line">{status.message}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Importar / Exportar Datos</h3>
        
        {/* Mensajes de estado */}
        {renderStatus()}
        
        <div className="space-y-6">
          {/* Sección de Importar */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Importar Inventario</h4>
                <p className="text-xs text-gray-500">Actualiza tu inventario desde un archivo Excel o CSV</p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Arrastra tu archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Formatos soportados: .xlsx, .xls, .csv (Máx. 5MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Procesando...' : 'Seleccionar archivo'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p className="font-medium">Requisitos del archivo:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>La primera fila debe contener los encabezados de las columnas</li>
                  <li>Campos obligatorios: nombre, categoría, precioCompra, precioVenta, stock, stockMinimo, unidad</li>
                  <li>Los precios y cantidades deben ser números válidos</li>
                  <li>Puedes <a href="/plantilla-inventario.xlsx" className="text-blue-600 hover:underline" download>descargar una plantilla de ejemplo</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Sección de Exportar */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Exportar Inventario</h4>
                <p className="text-xs text-gray-500">Descarga una copia de tu inventario actual</p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleExport('XLSX')}
                  disabled={isLoading || !productos?.length}
                  className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-6 h-6 text-green-500 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Excel (.xlsx)</div>
                    <div className="text-xs text-gray-500">Recomendado</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExport('CSV')}
                  disabled={isLoading || !productos?.length}
                  className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-6 h-6 text-green-500 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">CSV (.csv)</div>
                    <div className="text-xs text-gray-500">Para hojas de cálculo</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>Se exportarán {productos?.length || 0} productos del inventario actual.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
