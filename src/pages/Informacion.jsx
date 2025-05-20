import React from 'react';

const Informacion = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Información del Sistema</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Versión</h3>
            <p className="mt-1 text-gray-600">1.0.0</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Soporte</h3>
            <p className="mt-1 text-gray-600">soporte@tudominio.com</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Términos y Condiciones</h3>
            <p className="mt-1 text-gray-600">
              Este software está protegido por derechos de autor. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informacion;
