import { useState, useCallback } from 'react';
import api from '../config/axios';

export const usePaymentStatus = (tenant, user) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    isActive: true,
    reason: '',
    lastUpdated: '',
    lastUpdatedBy: ''
  });

  const parseError = (error) => {
    if (error.response) {
      return error.response.data?.message || 'Error en el servidor';
    } else if (error.request) {
      return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    }
    return 'Ocurrió un error inesperado';
  };

  const shouldRetryError = (error, retryCount) => {
    // Solo reintentar para errores de red o timeout
    return (error.code === 'ECONNABORTED' || !error.response) && retryCount < 2;
  };

  const fetchPaymentStatus = useCallback(async (retryCount = 0) => {
    if (!tenant?.id) {
      setError('No se ha seleccionado un inquilino');
      setIsLoading(false);
      return;
    }

    try {
      setShowRetry(false);
      const response = await api.get('/payments/status', {
        headers: { 'x-tenant-id': tenant.id },
        timeout: 5000
      });

      const { isActive, reason, updatedAt, updatedBy } = response.data;
      setPaymentStatus(prev => ({
        ...prev,
        isActive,
        reason: reason || '',
        lastUpdated: updatedAt ? new Date(updatedAt).toLocaleString() : '',
        lastUpdatedBy: updatedBy?.name || 'Sistema'
      }));
      setError(null);
      return true;
    } catch (errorCaught) {
      const errorMessage = parseError(errorCaught);
      const shouldRetry = shouldRetryError(errorCaught, retryCount);

      setError(errorMessage);

      if (shouldRetry) {
        setTimeout(() => fetchPaymentStatus(retryCount + 1), 2000);
        return false;
      } else {
        setShowRetry(true);
        return false;
      }
    } finally {
      if (retryCount >= 2 || !shouldRetryError(error, retryCount)) {
        setIsLoading(false);
      }
    }
  }, [tenant, error]);

  const updatePaymentStatus = async (isActive, reason = '') => {
    if (!tenant?.id) {
      setError('No se ha seleccionado un inquilino');
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const response = await api.put(
        '/payments/status',
        { isActive, reason },
        { 
          headers: { 'x-tenant-id': tenant.id },
          timeout: 5000
        }
      );

      setPaymentStatus(prev => ({
        ...prev,
        isActive,
        reason,
        lastUpdated: new Date().toLocaleString(),
        lastUpdatedBy: user?.name || 'Tú'
      }));
      
      return true;
    } catch (error) {
      const errorMessage = parseError(error);
      setError(errorMessage);
      setShowRetry(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    ...paymentStatus,
    isLoading,
    isSaving,
    error,
    showRetry,
    fetchPaymentStatus,
    updatePaymentStatus,
    setPaymentStatus
  };
};
