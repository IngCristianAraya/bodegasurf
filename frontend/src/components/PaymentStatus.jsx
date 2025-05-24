import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { useCulqi } from '../hooks/useCulqi';
import { useAuth } from '../context/AuthContext';
import SubscriptionModel from '../models/subscription';

const PaymentStatus = ({ tenantId }) => {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { checkPaymentStatus, processPayment, loading: paymentLoading } = useCulqi();

    useEffect(() => {
        const checkStatus = async () => {
            setIsLoading(true);
            try {
                const status = await checkPaymentStatus(tenantId);
                setIsActive(status);
            } catch (error) {
                console.error('Error checking payment status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [tenantId, checkPaymentStatus]);

    const handlePayment = async () => {
        if (!window.Culqi) {
            console.error('Culqi no está inicializado');
            return;
        }

        window.Culqi.settings({
            title: 'BodegaSurf',
            currency: 'PEN',
            description: 'Suscripción Premium',
            amount: 9900, // S/. 99.00 en centavos
            order: `order-${Date.now()}` // Agregando el campo order requerido
        });

        window.Culqi.options({
            lang: 'auto',
            installments: false,
            paymentMethods: {
                tarjeta: true,
                yape: true,
                bancaMovil: true,
                billetera: true,
                cuotealo: false,
            },
            style: {
                logo: '/logo.png',
                bannerColor: '#f0f0f0',
                buttonBackground: '#2196f3',
                menuColor: '#2196f3',
                linksColor: '#2196f3',
                buttonText: 'Pagar',
                buttonTextColor: '#ffffff',
                priceColor: '#000000'
            }
        });

        window.Culqi.open();

        // Usar el evento payment_event para Culqi v4
        window.addEventListener('payment_event', async (event) => {
            try {
                const { token } = event.detail;
                await processPayment({
                    token: token.id,
                    amount: 9900,
                    currency: 'PEN',
                    description: 'Suscripción Premium',
                    email: user.email,
                    tenantId
                });
            } catch (error) {
                console.error('Error processing payment:', error);
            }
        });

        return () => {
            window.removeEventListener('payment_event', handlePayment);
        };
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            {isActive ? (
                <Alert severity="success">
                    Tu suscripción está activa
                </Alert>
            ) : (
                <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Tu suscripción está inactiva
                    </Alert>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PaymentIcon />}
                        onClick={handlePayment}
                        disabled={paymentLoading}
                    >
                        {paymentLoading ? 'Procesando...' : 'Realizar Pago'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default PaymentStatus; 