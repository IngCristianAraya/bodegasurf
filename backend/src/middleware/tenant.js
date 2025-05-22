import { StatusCodes } from 'http-status-codes';
import { Tenant } from '../models/index.js';

/**
 * Middleware para obtener el tenant del subdominio
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 */
export const tenantMiddleware = async (req, res, next) => {
  try {
    // Obtener el hostname de la solicitud (ej: tenant1.midominio.com)
    const hostname = req.hostname;
    
    // Extraer el subdominio (asumiendo formato: subdominio.dominio.tld)
    const subdomain = hostname.split('.')[0];
    
    // Si es localhost o la IP del servidor, usar un tenant por defecto
    if (subdomain === 'localhost' || subdomain === '127.0.0.1') {
      // Buscar un tenant por defecto o usar uno genérico
      const defaultTenant = await Tenant.findOne({ subdomain: 'default' });
      
      if (!defaultTenant) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'No se encontró un tenant por defecto configurado',
        });
      }
      
      req.tenant = defaultTenant;
      return next();
    }
    
    // Buscar el tenant por subdominio
    const tenant = await Tenant.findOne({ subdomain });
    
    if (!tenant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No se encontró el tenant especificado',
      });
    }
    
    // Verificar si el tenant está activo
    if (!tenant.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Este tenant ha sido desactivado',
      });
    }
    
    // Adjuntar el tenant al objeto de solicitud
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Error en middleware de tenant:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error al procesar la solicitud de tenant',
    });
  }
};

/**
 * Middleware para verificar la suscripción del tenant
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 */
export const checkSubscription = async (req, res, next) => {
  try {
    // Si no hay tenant configurado, continuar (para rutas públicas)
    if (!req.tenant) {
      return next();
    }
    
    const { subscription } = req.tenant;
    const now = new Date();
    
    // Verificar si la suscripción está activa y no ha expirado
    if (subscription.status !== 'active' || (subscription.endDate && new Date(subscription.endDate) < now)) {
      return res.status(StatusCodes.PAYMENT_REQUIRED).json({
        success: false,
        message: 'La suscripción ha expirado o ha sido suspendida',
        subscription: {
          status: subscription.status,
          endDate: subscription.endDate,
          plan: subscription.plan,
        },
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en verificación de suscripción:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error al verificar la suscripción',
    });
  }
};

/**
 * Middleware para verificar el plan del tenant
 * @param {...string} allowedPlans - Planes permitidos
 * @returns {Function} Middleware para verificar el plan
 */
export const checkPlan = (...allowedPlans) => {
  return (req, res, next) => {
    // Si no hay tenant configurado, denegar acceso
    if (!req.tenant) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Acceso no autorizado',
      });
    }
    
    const { plan } = req.tenant.subscription;
    
    // Verificar si el plan del tenant está en los permitidos
    if (!allowedPlans.includes(plan)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: `El plan actual (${plan}) no tiene acceso a esta funcionalidad`,
        requiredPlans: allowedPlans,
      });
    }
    
    next();
  };
};