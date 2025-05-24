import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

export const useCulqi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const initCulqi = useCallback(() => {
        if (typeof window !== 'undefined' && !window.Culqi) {
            const script = document.createElement('script');
            script.src = 'https://checkout.culqi.com/js/v4';
            script.async = true;
            script.onload = () => {
                if (window.Culqi) {
                    window.Culqi.publicKey = process.env.REACT_APP_CULQI_PUBLIC_KEY;
                    console.log('Culqi initialized successfully');
                }
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        } else if (window.Culqi) {
            window.Culqi.publicKey = process.env.REACT_APP_CULQI_PUBLIC_KEY;
        }
    }, []);

    const processPayment = async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/api/payments/process', paymentData);

            if (response.data.success) {
                toast.success('¡Pago procesado exitosamente!');
                // Esperar un momento antes de redirigir para que el usuario vea el mensaje
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
                return { success: true, data: response.data };
            } else {
                throw new Error(response.data.message || 'Error al procesar el pago');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al procesar el pago';
            toast.error(errorMessage);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async (tenantId) => {
        try {
            const response = await api.get(`/api/payments/status/${tenantId}`);
            return response.data.isActive;
        } catch (error) {
            console.error('Error checking payment status:', error);
            return false;
        }
    };

    return {
        initCulqi,
        processPayment,
        checkPaymentStatus,
        loading,
        error,
    };
}; 