import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getPaymentStatus,
    updatePaymentStatus,
    checkPaymentStatus
} from '../controllers/paymentController.js';

const router = express.Router();

// Todas las rutas aquí ya estarán protegidas por "protect" y "tenantMiddleware" 
// aplicados en routes/index.js antes de llegar a este router.

// Ejemplo: Procesar un nuevo pago
// POST /api/v1/payments/process
router.post('/process', getPaymentStatus);

// Ejemplo: Verificar el estado de un pago
// GET /api/v1/payments/status/:paymentId
router.get('/status/:tenantId', getPaymentStatus);

// PUT /api/v1/payments/status
router.put('/status', updatePaymentStatus);

// Middleware para verificar si los pagos están activos en rutas específicas de pago
// router.use(checkPaymentStatus); // Aplica esto selectivamente si es necesario

export default router; 