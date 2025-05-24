import express from 'express';
import { router as authRouter } from './auth.routes.js';
import transactionRouter from './transaction.routes.js';
import paymentRouter from './payment.routes.js';
import uploadRouter from './upload.routes.js';
import inventarioRouter from './inventario.routes.js';
import { tenantMiddleware, checkSubscription } from '../middleware/tenant.js';
import { protect, authorize } from '../middleware/auth.js';

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
    message: 'Servicio de Backend Activo',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rutas públicas de autenticación (sin middleware de tenant global aquí)
router.use('/auth', authRouter);

// Rutas de Subida
router.use('/uploads', uploadRouter);

// Rutas de Inventario (deben ir antes de los middlewares protect, tenant y subscription si algunas son públicas)
// O después si todas son protegidas. Por ahora las ponemos después de /uploads y antes de protect.
router.use('/inventario', inventarioRouter);

// Middleware de protección para todas las rutas subsiguientes
router.use(protect);

// Middleware de tenant y verificación de suscripción para rutas protegidas
// Se aplicará a /transactions, /payments, /admin/dashboard, /user/profile
router.use(tenantMiddleware);
router.use(checkSubscription);

// Rutas protegidas que requieren tenant y suscripción activa
router.use('/transactions', transactionRouter);
router.use('/payments', paymentRouter);

router.get('/admin/dashboard', authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    data: 'Panel de administrador accesible',
    tenant: req.tenant,
    user: req.user,
  });
});

router.get('/user/profile', (req, res) => {
  res.status(200).json({
    success: true,
    data: 'Perfil de usuario accesible',
    tenant: req.tenant,
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
