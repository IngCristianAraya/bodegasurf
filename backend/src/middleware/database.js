import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Establece una capa de aislamiento para datos multi-tenant
 */
const tenantIsolation = () => {
  // Guardar la función original de mongoose
  const originalExecute = mongoose.Query.prototype.exec;

  // Sobreescribir el método exec para incluir el filtrado por tenant
  mongoose.Query.prototype.exec = async function() {
    if (this._mongooseOptions && this._mongooseOptions.tenantId) {
      // Si ya tiene un filtro específico por tenant, aplicar
      if (!this._conditions.tenantId) {
        this._conditions.tenantId = this._mongooseOptions.tenantId;
      }
    }

    // Llamar a la implementación original
    return originalExecute.apply(this, arguments);
  };

  // Agregar un método para establecer el contexto de tenant
  mongoose.Query.prototype.byTenant = function(tenantId) {
    if (!tenantId) {
      logger.warn('Se intentó filtrar por tenant sin proporcionar un ID');
      return this;
    }

    // Guardar el ID del tenant en las opciones
    this._mongooseOptions = this._mongooseOptions || {};
    this._mongooseOptions.tenantId = tenantId;

    return this;
  };

  logger.info('Middleware de aislamiento de datos multi-tenant inicializado');
};

export default tenantIsolation; 