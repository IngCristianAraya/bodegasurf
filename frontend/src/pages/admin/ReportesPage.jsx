import React from 'react';
import { FileText } from 'lucide-react';

const ReportesPage = () => {
    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <FileText className="h-8 w-8 mr-3 text-orange-500" />
                <h1 className="text-3xl font-semibold text-gray-800">Sección de Reportes</h1>
            </div>
            <p className="text-gray-600">
                Aquí podrás visualizar y generar reportes de tu sistema.
            </p>
            {/* Próximamente: Opciones para generar reportes de inventario, ventas, etc. */}
        </div>
    );
};

export default ReportesPage; 