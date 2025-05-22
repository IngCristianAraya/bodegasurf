import React from 'react';
import { Info, Mail, Phone, Globe, Code, Users, Shield, Clock, Heart } from 'lucide-react';

const Informacion = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Info className="mr-2 h-8 w-8 text-orange-500" />
          Acerca de BodegaApp
        </h1>
        <p className="text-gray-600">Información detallada sobre el sistema y soporte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta de Versión */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-orange-50 text-orange-500 mr-3">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Versión del Sistema</h3>
          </div>
          <div className="pl-10">
            <p className="text-gray-700 mb-1"><span className="font-medium">Versión:</span> 1.0.0</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Última actualización:</span> Mayo 2025</p>
            <p className="text-gray-700"><span className="font-medium">Estado:</span> <span className="text-green-500">Activo</span></p>
          </div>
        </div>

        {/* Tarjeta de Soporte */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-blue-50 text-blue-500 mr-3">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Soporte y Contacto</h3>
          </div>
          <div className="pl-10 space-y-2">
            <p className="text-gray-700 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              soporte@bodegapp.com
            </p>
            <p className="text-gray-700 flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              +1 (555) 123-4567
            </p>
            <p className="text-gray-700 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              www.bodegapp.com/soporte
            </p>
          </div>
        </div>

        {/* Tarjeta de Términos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-purple-50 text-purple-500 mr-3">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Términos y Condiciones</h3>
          </div>
          <div className="pl-10">
            <p className="text-gray-700 mb-3">
              BodegaApp está protegido por derechos de autor. El uso no autorizado está estrictamente prohibido.
            </p>
            <a 
              href="#" 
              className="text-orange-500 hover:underline text-sm font-medium inline-flex items-center"
            >
              Leer términos completos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Sección de Créditos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-amber-50 text-amber-500 mr-3">
            <Code className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Tecnologías Utilizadas</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-10">
          {[
            { name: 'React', version: '18.2.0' },
            { name: 'Tailwind CSS', version: '3.3.0' },
            { name: 'React Router', version: '6.10.0' },
            { name: 'Lucide Icons', version: '0.263.1' },
          ].map((tech, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">{tech.name}</p>
              <p className="text-sm text-gray-500">v{tech.version}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center mb-2">
          <Heart className="h-4 w-4 text-red-500 mr-1" />
          <span>Hecho con pasión por el equipo de BodegaApp</span>
        </div>
        <p>© {currentYear} BodegaApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Informacion;
