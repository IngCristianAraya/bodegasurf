import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import api from '../../config/axios';
import CancelTransactionButton from './CancelTransactionButton';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
  failed: 'Fallida'
};

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/transactions/${id}`);
        setTransaction(data.data);
      } catch (err) {
        console.error('Error al cargar la transacción:', err);
        setError('No se pudo cargar la transacción');
        toast.error('Error al cargar la transacción');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleTransactionCancelled = () => {
    // Actualizar el estado local de la transacción
    setTransaction(prev => ({
      ...prev,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    }));
    
    toast.success('Transacción cancelada exitosamente');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error || 'No se pudo cargar la transacción solicitada'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Transacción #{transaction._id.substring(0, 8).toUpperCase()}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalles de la transacción
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${statusColors[transaction.status] || 'bg-gray-100 text-gray-800'}`}>
          {statusLabels[transaction.status] || transaction.status}
        </span>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Fecha</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {format(new Date(transaction.createdAt), "PPPPpppp", { locale: es })}
            </dd>
          </div>
          
          {transaction.cancelledAt && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cancelada el</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(transaction.cancelledAt), "PPPPpppp", { locale: es })}
                {transaction.cancellationReason && (
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Motivo:</span> {transaction.cancellationReason}
                  </div>
                )}
              </dd>
            </div>
          )}
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Monto total</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
              ${transaction.amount.toFixed(2)}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Método de pago</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
              {transaction.paymentMethod}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Productos</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {transaction.items.map((item, index) => (
                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {item.product?.name || `Producto ${index + 1}`}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-gray-500">{item.quantity} × ${item.price.toFixed(2)}</span>
                      <span className="ml-2 font-medium">${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
        >
          Volver
        </button>
        
        {transaction.status === 'pending' && (
          <CancelTransactionButton 
            transactionId={transaction._id}
            onCancel={handleTransactionCancelled}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;
