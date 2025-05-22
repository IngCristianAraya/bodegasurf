import React, { useEffect, useRef, useState } from 'react';
import { Barcode, Camera, X } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/library';

const EscanerCodigoBarras = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let codeReader;
    let stream;

    const startScanner = async () => {
      try {
        codeReader = new BrowserQRCodeReader();
        
        // Obtener la lista de cámaras disponibles
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        // Usar la cámara trasera si está disponible, de lo contrario usar la primera disponible
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back')
        );
        
        const deviceId = backCamera?.deviceId || videoInputDevices[0]?.deviceId;
        
        if (!deviceId) {
          throw new Error('No se encontró ninguna cámara disponible');
        }

        // Iniciar el escaneo
        stream = await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              onScan(result.getText());
              stopScanner();
            }
            if (error && !(error instanceof DOMException)) {
              console.error(error);
            }
          }
        );
        
        setIsScanning(true);
      } catch (err) {
        console.error('Error al iniciar el escáner:', err);
        setError('No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios.');
      }
    };

    const stopScanner = () => {
      if (codeReader) {
        codeReader.reset();
        codeReader = null;
      }
      
      if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
        stream = null;
      }
      
      setIsScanning(false);
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            <Barcode className="inline-block w-5 h-5 mr-2" />
            Escanear código de barras
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded"
                playsInline
                muted
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <div className="absolute inset-0 border-4 border-blue-400 rounded m-4 pointer-events-none">
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center text-sm text-gray-500">
            Enfoca el código de barras dentro del área delimitada
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscanerCodigoBarras;
