import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Declaración de tipos para Culqi
if (typeof window !== 'undefined') {
  // @ts-ignore - Culqi se carga dinámicamente
  window.Culqi = window.Culqi || {};
}

export const usePayments = (tenantId) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/payments?tenantId=${tenantId}`);
      setPayments(response.data);
    } catch (err) {
      setError('Error al cargar el historial de pagos');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadReceipt = async (file, paymentData) => {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('tenantId', tenantId);
    formData.append('amount', paymentData.amount);
    formData.append('paymentDate', new Date().toISOString());

    try {
      const response = await api.post('/payments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchPayments(); // Actualizar la lista de pagos
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error uploading receipt:', err);
      throw new Error('Error al subir el comprobante');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [tenantId]);

  return {
    payments,
    loading,
    error,
    uploadReceipt,
    refreshPayments: fetchPayments,
  };
};

export const useCulqi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [culqiLoaded, setCulqiLoaded] = useState(false);

  const initCulqi = useCallback(() => {
    if (typeof window !== 'undefined' && window.Culqi) {
      window.Culqi.publicKey = process.env.REACT_APP_CULQI_PUBLIC_KEY || '';
      setCulqiLoaded(true);
      return true;
    }
    return false;
  }, []);
  
  // Cargar script de Culqi dinámicamente
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Culqi) {
      const script = document.createElement('script');
      script.src = 'https://checkout.culqi.com/js/v4';
      script.async = true;
      script.onload = () => {
        console.log('Culqi script loaded successfully');
        initCulqi();
      };
      script.onerror = () => {
        console.error('Error loading Culqi script');
        setError('No se pudo cargar el servicio de pagos. Por favor, recarga la página.');
      };
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    } else if (window.Culqi) {
      initCulqi();
    }
  }, [initCulqi]);

  const processPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/payments/process', {
        ...paymentData,
        // Datos adicionales necesarios para el pago
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      setError('Error al procesar el pago');
      console.error('Payment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    initCulqi,
    processPayment,
    loading,
    error,
  };
};
