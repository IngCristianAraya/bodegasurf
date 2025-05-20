import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Upload, Download, FileText, FileSpreadsheet } from 'lucide-react';

const ImportExport = ({ onImport, productos }) => {
  const fileInputRef = useRef(null);

  const handleExport = (format) => {
    try {
      console.log('Iniciando exportación...');
      console.log('Productos a exportar:', productos);
      
      if (!productos || !Array.isArray(productos) || productos.length === 0) {
        throw new Error('No hay datos para exportar');
      }
      
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new();
      console.log('Libro de trabajo creado');
      
      // Convertir los productos a una hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(productos);
      console.log('Hoja de cálculo creada');
      
      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      console.log('Hoja añadida al libro');
      
      // Generar el archivo
      console.log('Generando archivo...');
      const fileFormat = format.toLowerCase(); // Asegurar minúsculas
      const excelBuffer = XLSX.write(wb, { 
        bookType: fileFormat, 
        type: 'array',
        bookSST: true
      });
      
      console.log('Archivo generado, creando Blob...');
      const mimeType = format === 'CSV' 
        ? 'text/csv;charset=utf-8;' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      
      const data = new Blob([excelBuffer], { type: mimeType });
      
      console.log('Iniciando descarga...');
      saveAs(data, `inventario_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`);
      console.log('Descarga iniciada');
      
    } catch (error) {
      console.error('Error detallado al exportar:', {
        error: error.message,
        stack: error.stack,
        productosLength: productos?.length,
        productosType: typeof productos
      });
      alert(`Error al exportar: ${error.message || 'Ver consola para más detalles'}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Validar los datos antes de importar
        const isValid = jsonData.every(item => 
          item.nombre && 
          item.categoria && 
          item.precioCompra !== undefined && 
          item.precioVenta !== undefined &&
          item.cantidad !== undefined
        );

        if (!isValid) {
          alert('El archivo no tiene el formato correcto');
          return;
        }

        onImport(jsonData);
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        alert('Error al procesar el archivo');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Upload className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Importar Datos</h4>
            <p className="text-xs text-gray-500">Sube un archivo para actualizar tu inventario</p>
          </div>
        </div>
        <div className="mt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-700">Seleccionar archivo</span>
          </button>
          <p className="mt-1 text-xs text-gray-400 text-center">Formatos soportados: .xlsx, .xls, .csv</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Exportar Datos</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExport('XLSX')}
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
          >
            <FileSpreadsheet className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="text-xs font-medium">Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport('CSV')}
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="text-xs font-medium">CSV (.csv)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
