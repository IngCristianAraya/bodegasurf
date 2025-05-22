import { StatusCodes } from 'http-status-codes';
import PaymentStatus from '../models/PaymentStatus.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';

/**
 * @desc    Obtener el estado actual de los pagos para el tenant actual
 * @route   GET /api/payments/status
 * @access  Private/Admin
 * @param   {Object} req - Objeto de solicitud de Express
 * @param   {Object} res - Objeto de respuesta de Express
 */
export const getPaymentStatus = async (req, res) => {
  const tenantId = req.tenant?._id || req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'No se pudo identificar el tenant'
    });
  }

  try {
    const status = await PaymentStatus.getPaymentStatus(tenantId);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error al obtener el estado de pagos:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error al obtener el estado de pagos',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar el estado de los pagos para el tenant actual
 * @route   PUT /api/payments/status
 * @access  Private/Admin
 * @param   {Object} req - Objeto de solicitud de Express
 * @param   {Object} res - Objeto de respuesta de Express
 */
export const updatePaymentStatus = async (req, res) => {
  const { isActive, reason } = req.body;
  const tenantId = req.tenant?._id || req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'No se pudo identificar el tenant'
    });
  }
  
  if (typeof isActive !== 'boolean') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'El campo isActive es requerido y debe ser un booleano'
    });
  }

  try {
    const updateData = {
      isActive,
      reason: reason || (isActive ? 'Sistema de pagos activado' : 'Sistema de pagos desactivado'),
      lastUpdatedBy: req.user?.id
    };

    // Actualizar o crear el estado para este tenant
    const status = await PaymentStatus.updatePaymentStatus(tenantId, updateData);
    
    // Registrar la acción en los logs del sistema
    console.log(`[${tenantId}] Sistema de pagos ${isActive ? 'activado' : 'desactivado'} por ${req.user?.email || 'sistema'}. Razón: ${status.reason}`);
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: `Sistema de pagos ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: status
    });
  } catch (error) {
    console.error('Error al actualizar el estado de pagos:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error al actualizar el estado de pagos',
      error: error.message
    });
  }
};

/**
 * @desc    Middleware para verificar si los pagos están habilitados para el tenant actual
 * @param   {Object} req - Objeto de solicitud de Express
 * @param   {Object} res - Objeto de respuesta de Express
 * @param   {Function} next - Función para pasar al siguiente middleware
 */
export const checkPaymentStatus = async (req, res, next) => {
  const tenantId = req.tenant?._id || req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'No se pudo identificar el tenant'
    });
  }

  try {
    const status = await PaymentStatus.getPaymentStatus(tenantId);
    
    if (!status.isActive) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'El sistema de pagos está temporalmente deshabilitado para este cliente. Por favor, intente más tarde.',
        reason: status.reason
      });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar el estado de pagos:', error);
    // En caso de error, permitir la operación por defecto
    next();
  }
};
