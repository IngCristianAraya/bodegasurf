import express from 'express';
import authRouter from './auth.js';
import transactionRouter from './transaction.routes.js';
import paymentRouter from './payment.routes.js';
import { tenantMiddleware, checkSubscription } from '../middleware/tenant.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar el estado del servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servidor en funcionamiento
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Aplicar middleware de tenant a todas las rutas
router.use(tenantMiddleware);

// Rutas públicas de autenticación
router.use('/auth', authRouter);

// Middleware de autenticación para rutas protegidas
router.use(authenticate);

// Aplicar verificación de suscripción a rutas protegidas
router.use(checkSubscription);

// Rutas protegidas de la API

// Rutas de transacciones (protegidas)
router.use('/transactions', transactionRouter);

// Rutas de pagos (protegidas)
router.use('/payments', paymentRouter);

// Ruta de ejemplo protegida que requiere rol de administrador
router.get('/admin/dashboard', authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    data: 'Panel de administrador',
  });
});

// Ruta de ejemplo protegida que requiere rol de usuario
router.get('/user/profile', (req, res) => {
  res.status(200).json({
    success: true,
    data: 'Perfil de usuario',
    user: req.user,
  });
});

// Manejador de rutas no encontradas (debe ir al final)
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.originalUrl}`,
    },
  });
});

export { router };
