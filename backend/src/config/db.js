import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// Configuración de conexión a MongoDB Atlas usando SRV
const MONGODB_URI = 'mongodb+srv://ingcristianaraya:HPLXAn17gou4e80F@ventasbodega.d0rujmo.mongodb.net/ventas_bodega?retryWrites=true&w=majority';

/**
 * Intenta establecer una conexión a MongoDB
 * @returns {Promise<mongoose.Connection>} Conexión a MongoDB
 */
const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI no está definido en las variables de entorno');
    }
    
    // Mostrar información de conexión (sin credenciales)
    const safeUrl = 'mongodb+srv://ventasbodega.d0rujmo.mongodb.net/ventas_bodega';
    logger.info(`🔌 Intentando conectar a MongoDB Atlas en: ${safeUrl}`);
    
    // Configuración de opciones de conexión para MongoDB Atlas
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 segundos
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // 10 segundos
      heartbeatFrequencyMS: 10000, // 10 segundos
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      w: 1, // 'majority' como número
      retryReads: true,
      appName: 'ventas-bodega-app'
    };
    
    // Establecer la conexión
    logger.info('🔍 Estableciendo conexión con MongoDB...');
    try {
      // Mostrar la URI completa (sin contraseña) para depuración
      const debugUri = MONGODB_URI.replace(/:[^:]+@/, ':***@');
      logger.info(`🔗 Intentando conectar a: ${debugUri}`);
      
      // Conectar a MongoDB
      const conn = await mongoose.connect(MONGODB_URI, options);
      
      // Mostrar información de la conexión exitosa
      logger.info('✅ Conexión a MongoDB establecida correctamente');
      
      // Obtener información de la conexión
      const connection = mongoose.connection;
      const db = connection.db;
      
      // Obtener información de la base de datos
      const dbInfo = await db.command({ buildInfo: 1 });
      
      logger.info(`📊 Base de datos: ${db.databaseName}`);
      logger.info(`📡 Host: ${connection.host}:${connection.port}`);
      logger.info(`🔄 MongoDB versión: ${dbInfo.version}`);
      
      return connection;
    } catch (/** @type {unknown} */ error) {
      // Definir el tipo para el objeto de error
      /** @type {Error & {
        code?: string | number;
        codeName?: string;
        errorLabels?: string[];
        operation?: any;
        [key: string]: any;
      }} */
      let errorObj;
      
      // Función para verificar si un objeto es similar a un error
      const isErrorLike = (/** @type {unknown} */ value) => {
        return (
          value && 
          typeof value === 'object' && 
          'name' in value && 
          'message' in value &&
          'stack' in value
        );
      };
      
      // Determinar cómo crear el objeto de error basado en el tipo de error capturado
      if (error instanceof Error) {
        // Si ya es una instancia de Error, usarla directamente
        errorObj = error;
      } else if (typeof error === 'string') {
        // Si es un string, crear un nuevo Error con ese mensaje
        errorObj = new Error(error);
      } else if (error && typeof error === 'object') {
        // Si es un objeto, intentar extraer propiedades útiles
        const errorLike = error;
        errorObj = new Error(
          'message' in errorLike ? String(errorLike.message) : 'Error desconocido al conectar a MongoDB'
        );
        
        // Copiar propiedades relevantes del error original
        if ('name' in errorLike) errorObj.name = String(errorLike.name);
        if ('stack' in errorLike) errorObj.stack = String(errorLike.stack);
        if ('code' in errorLike) {
          const code = errorLike.code;
          errorObj.code = typeof code === 'string' || typeof code === 'number' ? code : undefined;
        }
        if ('codeName' in errorLike) errorObj.codeName = String(errorLike.codeName);
        if ('errorLabels' in errorLike && Array.isArray(errorLike.errorLabels)) {
          errorObj.errorLabels = errorLike.errorLabels.map(String);
        }
        if ('operation' in errorLike) errorObj.operation = errorLike.operation;
      } else {
        // Cualquier otro caso, crear un error genérico
        errorObj = new Error('Error desconocido al conectar a MongoDB');
      }
      
      // Asegurarse de que errorObj tenga las propiedades necesarias
      if (!('code' in errorObj)) errorObj.code = undefined;
      if (!('codeName' in errorObj)) errorObj.codeName = undefined;
      if (!('errorLabels' in errorObj)) errorObj.errorLabels = undefined;
      if (!('operation' in errorObj)) errorObj.operation = undefined;
      
      // Mostrar información detallada del error
      logger.error('❌ Error al conectar a MongoDB:');
      
      // Función auxiliar para acceder de forma segura a las propiedades
      const safeGet = (/** @type {any} */ obj, /** @type {string} */ prop) => {
        try {
          return obj && typeof obj === 'object' && prop in obj ? obj[prop] : undefined;
        } catch (e) {
          return undefined;
        }
      };
      
      // Función auxiliar para registrar errores de forma segura
      const safeLog = (/** @type {string} */ message, /** @type {any} */ data = null) => {
        try {
          if (data !== null) {
            logger.error(message, data);
          } else {
            logger.error(message);
          }
        } catch (logError) {
          console.error('Error al registrar en el logger:', logError);
        }
      };
      
      // Definir un tipo para el objeto de error JSON
      /** @type {Record<string, any>} */
      const errorJson = {};
      
      // Mostrar información básica del error
      if (errorObj) {
        try {
          // Mostrar tipo y propiedades básicas
          safeLog(`🔴 Tipo de error: ${typeof errorObj}`);
          
          // Mostrar propiedades estándar de Error
          const errorName = safeGet(errorObj, 'name');
          const errorMessage = safeGet(errorObj, 'message');
          
          if (errorName) safeLog(`🔴 Nombre: ${String(errorName)}`);
          if (errorMessage) safeLog(`📝 Mensaje: ${String(errorMessage)}`);
          
          // Mostrar propiedades adicionales comunes en errores de MongoDB
          const errorCode = safeGet(errorObj, 'code');
          const errorCodeName = safeGet(errorObj, 'codeName');
          
          if (errorCode !== undefined) safeLog(`🔢 Código: ${String(errorCode)}`);
          if (errorCodeName) safeLog(`🏷️  Código Nombre: ${String(errorCodeName)}`);
          
          // Mostrar stack trace si está disponible
          const errorStack = safeGet(errorObj, 'stack');
          if (errorStack) {
            safeLog('🔍 Stack trace:');
            // Dividir el stack trace en líneas para mejor legibilidad
            const stackLines = String(errorStack).split('\n');
            stackLines.forEach((/** @type {string} */ line) => safeLog(`  ${line.trim()}`));
          }
          
          // Mostrar detalles adicionales si es un error de MongoDB
          const errorLabels = safeGet(errorObj, 'errorLabels');
          if (errorLabels) {
            try {
              safeLog('🏷️  Etiquetas de error:', JSON.stringify(errorLabels, null, 2));
            } catch (e) {
              safeLog('No se pudieron serializar las etiquetas de error');
            }
          }
          
          // Mostrar información de la operación si está disponible
          const operation = safeGet(errorObj, 'operation');
          if (operation) {
            safeLog('🔧 Operación fallida:');
            try {
              safeLog(JSON.stringify(operation, null, 2));
            } catch (e) {
              safeLog('No se pudo serializar la operación');
            }
          }
          
          // Mostrar el error completo como JSON si es posible
          try {
            const errorProperties = Object.getOwnPropertyNames(errorObj);
            
            // Copiar propiedades de forma segura
            for (const prop of errorProperties) {
              try {
                errorJson[prop] = safeGet(errorObj, prop);
              } catch (e) {
                errorJson[prop] = `[Error al obtener la propiedad: ${String(e)}]`;
              }
            }
            
            safeLog('📄 Error completo (JSON):', JSON.stringify(errorJson, null, 2));
          } catch (e) {
            safeLog('No se pudo serializar el error completo');
          }
        } catch (logError) {
          // Si hay un error al registrar los detalles, mostrar un mensaje genérico
          safeLog('Error al registrar los detalles del error');
          try {
            safeLog('Error original (stringified):', JSON.stringify(errorObj));
          } catch (e) {
            safeLog('No se pudo serializar el error original');
          }
        }
      } else {
        safeLog('Se produjo un error desconocido sin detalles');
      }
      
      // Lanzar un error más amigable
      const errorMessage = (errorObj && typeof errorObj === 'object' && 'message' in errorObj) 
        ? String(safeGet(errorObj, 'message')) 
        : 'Error desconocido al conectar a MongoDB';
      
      throw new Error(`No se pudo conectar a MongoDB: ${errorMessage}`);
    }
    
    const { connection } = mongoose;
    
    // Configurar manejadores de eventos
    connection.on('connected', () => {
      logger.info('✅ Conexión a MongoDB establecida correctamente');
      if (connection.db) {
        logger.info(`📊 Base de datos: ${connection.db.databaseName}`);
      }
      if (connection.host) {
        logger.info(`📡 Host: ${connection.host}`);
      }
    });
    
    connection.on('error', (/** @type {Error} */ err) => {
      logger.error('❌ Error de conexión a MongoDB:', err.message || 'Error desconocido');
    });
    
    connection.on('disconnected', () => {
      logger.warn('⚠️  Desconectado de MongoDB');
    });
    
    // Manejar cierre de la aplicación
    const gracefulShutdown = async () => {
      try {
        await connection.close();
        logger.info('🔌 Conexión a MongoDB cerrada correctamente');
        process.exit(0);
      } catch (err) {
        logger.error('❌ Error al cerrar la conexión a MongoDB:', err);
        process.exit(1);
      }
    };
    
    // Capturar eventos de terminación
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    
    return connection;
    
  } catch (/** @type {unknown} */ error) {
    // Extraer propiedades del error de forma segura
    const errorObj = error && typeof error === 'object' ? error : {};
    const errorMessage = 'message' in errorObj ? String(errorObj.message) : 'Error desconocido';
    const errorName = 'name' in errorObj ? String(errorObj.name) : 'Error';
    const errorCode = 'code' in errorObj ? errorObj.code : undefined;
    const errorCodeName = 'codeName' in errorObj ? String(errorObj.codeName) : undefined;
    
    logger.error(`❌ No se pudo conectar a MongoDB: ${errorMessage}`);
    
    // Información detallada del error
    logger.error('\n🔍 Detalles del error:');
    logger.error(`- Nombre: ${errorName || 'No disponible'}`);
    
    if (errorCode) {
      logger.error(`- Código: ${errorCode}`);
    }
    
    if (errorCodeName) {
      logger.error(`- Código de error: ${errorCodeName}`);
    }
    
    // Mensajes de ayuda según el tipo de error
    logger.error('\n🔧 Por favor verifica lo siguiente:');
    
    // Extraer el nombre del error de forma segura
    const errorType = 'name' in errorObj ? String(errorObj.name) : '';
    
    if (errorType === 'MongoServerSelectionError') {
      logger.error('1. Que el servicio de MongoDB esté en ejecución');
      logger.error('2. Que el puerto 27017 esté accesible');
      logger.error('3. Que no haya un firewall bloqueando la conexión');
    } else if (errorType === 'MongooseServerSelectionError') {
      logger.error('1. Que la URL de conexión sea correcta');
      logger.error('2. Que el servidor MongoDB esté accesible');
      logger.error('3. Que las credenciales sean correctas (si se requieren)');
    } else if (errorType === 'MongoNetworkError') {
      logger.error('1. Que tu conexión de red esté activa');
      logger.error('2. Que no haya un proxy bloqueando la conexión');
      logger.error('3. Que el servidor MongoDB esté accesible desde tu red');
    } else {
      logger.error('1. Que MongoDB esté instalado correctamente');
      logger.error('2. Que el servicio esté en ejecución');
      logger.error('3. Que la configuración sea correcta');
    }
    
    // Información adicional
    logger.error('\n💡 Para más ayuda, puedes intentar:');
    logger.error('1. Verificar el estado del servicio: `net start MongoDB`');
    logger.error('2. Revisar los logs de MongoDB');
    logger.error('3. Probar la conexión con MongoDB Compass o el shell de MongoDB');
    
    // Finalizar el proceso con error
    process.exit(1);
  }
};

export { connectDB };
