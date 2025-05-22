import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/axios';

const CancelTransactionButton = ({ transactionId, onCancel, disabled = false, size = 'md' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('¿Está seguro de cancelar esta transacción? Esta acción no se puede deshacer.')) {
      return;
    }

    const reason = prompt('Ingrese el motivo de la cancelación:', 'Solicitado por el usuario');
    
    if (reason === null) {
      return; // Usuario canceló
    }

    setIsLoading(true);
    
    try {
      await api.put(`/transactions/${transactionId}/cancel`, { reason });
      toast.success('Transacción cancelada exitosamente');
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error al cancelar transacción:', error);
      const errorMessage = error.response?.data?.message || 'Error al cancelar la transacción';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <button
      onClick={handleCancel}
      disabled={disabled || isLoading}
      className={`inline-flex items-center rounded-md bg-red-600 ${sizeClasses[size]} font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cancelando...
        </>
      ) : (
        'Cancelar Transacción'
      )}
    </button>
  );
};

export default CancelTransactionButton;
