import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('\n=== UNCAUGHT EXCEPTION ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  // @ts-ignore - Algunos errores pueden tener la propiedad code
  console.error('Error code:', err.code || 'No code');
  console.error('Error stack:', '\n' + (err.stack || 'No stack trace available'));
  
  // Mostrar información adicional sobre el entorno
  console.error('\n=== ENVIRONMENT ===');
  console.error('NODE_ENV:', process.env.NODE_ENV);
  console.error('MONGODB_URI:', process.env.MONGODB_URI ? '***' + process.env.MONGODB_URI.slice(-20) : 'No definido');
  
  // Registrar en el logger también
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error('Error name:', err.name);
  logger.error('Error message:', err.message);
  logger.error('Error stack:', err.stack);
  
  // Dar tiempo para que los logs se escriban
  setTimeout(() => {
    process.exit(1);
  }, 2000);
});

// Configuración del puerto
const PORT = 5002; // Cambiado a 5002 para evitar conflictos

// Crear servidor HTTP
const server = http.createServer(app);

// Conectar a la base de datos y luego iniciar el servidor
const startServer = async () => {
  try {
    logger.info('Conectando a la base de datos...');
    
    try {
      // Conectar a MongoDB
      await connectDB();
      logger.info('✅ Base de datos conectada exitosamente.');
    } catch (error) {
      const dbError = error instanceof Error ? error : new Error(String(error));
      
      logger.error('❌ Error al conectar a la base de datos:');
      logger.error(`🔍 Nombre del error: ${dbError.name || 'Desconocido'}`);
      logger.error(`📝 Mensaje: ${dbError.message}`);
      
      // Verificar si el error tiene propiedades adicionales
      const errorCode = 'code' in dbError ? dbError.code : null;
      const errorCodeName = 'codeName' in dbError ? dbError.codeName : null;
      
      if (errorCode) {
        logger.error(`🔢 Código de error: ${errorCode}`);
      }
      
      if (errorCodeName) {
        logger.error(`🏷️  Nombre del código: ${errorCodeName}`);
      }
      
      // Mostrar stack trace en modo desarrollo
      if (process.env.NODE_ENV === 'development' && dbError.stack) {
        logger.error('\n📌 Stack trace:');
        logger.error(dbError.stack);
      }
      
      // Mensajes de ayuda según el tipo de error
      logger.error('\n🔧 Por favor verifica lo siguiente:');
      
      if (dbError.name === 'MongoServerSelectionError') {
        logger.error('1. Que el servicio de MongoDB esté en ejecución');
        logger.error('2. Que el puerto 27017 esté accesible');
        logger.error('3. Que no haya un firewall bloqueando la conexión');
      } else if (dbError.name === 'MongooseServerSelectionError') {
        logger.error('1. Que la URL de conexión sea correcta');
        logger.error('2. Que el servidor MongoDB esté accesible');
        logger.error('3. Que las credenciales sean correctas (si se requieren)');
      } else if (dbError.name === 'MongoNetworkError') {
        logger.error('1. Que tu conexión de red esté activa');
        logger.error('2. Que no haya un proxy bloqueando la conexión');
        logger.error('3. Que el servidor MongoDB esté accesible desde tu red');
      } else {
        logger.error('1. Que MongoDB esté instalado correctamente');
        logger.error('2. Que el servicio esté en ejecución');
        logger.error('3. Que la configuración sea correcta');
      }
      
      // Información adicional
      logger.error(`\n🔍 URL de conexión: ${process.env.MONGODB_URI || 'No definida'}`);
      logger.error(`🕒 Hora del error: ${new Date().toISOString()}`);
      
      logger.error('\n💡 Para más ayuda, puedes intentar:');
      logger.error('1. Verificar el estado del servicio: `net start MongoDB`');
      logger.error('2. Revisar los logs de MongoDB');
      logger.error('3. Probar la conexión con MongoDB Compass o el shell de MongoDB');
      logger.error('2. Verifica que MongoDB esté instalado correctamente');
      logger.error('3. Intenta conectarte manualmente con MongoDB Compass');
      
      process.exit(1);
    }
    
    // Iniciar el servidor HTTP
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor ejecutándose en el puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`);
      logger.info(`URL: http://localhost:${PORT}`);
      logger.info('Servidor listo para recibir conexiones');
    });
    
    // Manejar errores del servidor
    server.on('error', (error) => {
      logger.error('Error en el servidor HTTP:');
      logger.error('Error name:', error.name);
      logger.error('Error message:', error.message);
      
      // @ts-ignore - Algunos errores pueden tener la propiedad code
      const errorCode = error.code || 'No code';
      logger.error('Error code:', errorCode);
      
      logger.error('Error stack:', error.stack);
      
      if (errorCode === 'EADDRINUSE') {
        logger.error(`El puerto ${PORT} ya está en uso. Por favor, detén el proceso que lo está utilizando o usa un puerto diferente.`);
      }
      
      process.exit(1);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:');
    
    if (error instanceof Error) {
      logger.error('Error name:', error.name);
      logger.error('Error message:', error.message);
      // @ts-ignore - Algunos errores pueden tener la propiedad code
      logger.error('Error code:', error.code || 'No code');
      logger.error('Error stack:', error.stack);
    } else {
      logger.error('Error desconocido:', String(error));
    }
    
    // Cerrar el servidor si está abierto
    if (server.listening) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
};

// Iniciar el servidor
startServer();

// Manejar promesas no manejadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Reason name:', reason.name);
  logger.error('Reason message:', reason.message);
  logger.error('Reason stack:', reason.stack);
  
  server.close(() => {
    process.exit(1);
  });
});

// Manejar la señal SIGTERM (para terminaciones limpias)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});