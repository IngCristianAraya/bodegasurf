import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from './routes/auth.js';
import { router } from './routes/index.js';

// Importar middlewares
import { 
  errorHandler, 
  notFoundHandler, 
  validationErrorHandler, 
  jwtErrorHandler, 
  duplicateKeyErrorHandler 
} from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { authenticate } from './middleware/auth.js';

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.__basedir = __dirname;

// Configuración de variables de entorno
const isProduction = process.env.NODE_ENV === 'production';

// Inicializar la aplicación Express
const app = express();

// Middleware para parsear el body con límite de tamaño
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    // En desarrollo, permitir todos los orígenes
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5001',
      'http://127.0.0.1:5001',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Si el origen no está permitido
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-XSRF-TOKEN'],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200
};

// Aplicar CORS con las opciones configuradas
app.use(cors(corsOptions));

// Manejar las solicitudes OPTIONS (preflight)
app.options('*', cors(corsOptions));

// Configuración de cookies
app.use(cookieParser());

// Sanitizar datos
app.use(mongoSanitize());

// Establecer cabeceras de seguridad
app.use(helmet());

// Prevenir ataques XSS
app.use(xss());

// Prevenir inyección de parámetros HTTP
app.use(hpp());

// Limitar peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // límite de 200 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas peticiones desde esta IP, por favor inténtalo de nuevo más tarde',
    },
  },
  skip: (req) => {
    // No aplicar límite a rutas de autenticación
    const authRoutes = ['/api/v1/auth/login', '/api/v1/auth/refresh-token'];
    return authRoutes.some(route => req.path.startsWith(route));
  },
});

// Aplicar limitador de tasa solo en producción
if (isProduction) {
  app.use(limiter);
}

// Configuración de rate limiting para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos por ventana
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo más tarde.',
    },
  },
});

// Aplicar limitador de tasa para rutas de autenticación
app.use(['/api/v1/auth/login', '/api/v1/auth/register'], authLimiter);

// Configuración para servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
  });
});

// Manejador de rutas no encontradas
app.use(notFoundHandler);

// Manejadores de errores
app.use(jwtErrorHandler);
app.use(validationErrorHandler);
app.use(duplicateKeyErrorHandler);
app.use(errorHandler);

// Servir el frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });

  // Cerrar la aplicación de manera controlada
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled Rejection',
    reason: {
      name: reason?.name,
      message: reason?.message,
      stack: reason?.stack,
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Manejar señales de terminación
const shutdown = async (signal) => {
  logger.info(`Recibida señal ${signal}. Cerrando servidor...`);
  
  // Cerrar conexiones a bases de datos, etc.
  // Ejemplo: await mongoose.connection.close();
  
  // Cerrar el servidor
  process.exit(0);
};

// Manejar señales de terminación
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Exportar la aplicación para pruebas
export { app };

// Variable para el servidor HTTP
/** @type {import('http').Server} */
let httpServer;

// Iniciar el servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  httpServer = app.listen(PORT, () => {
    logger.info(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
  });
}
    httpServer.close(() => {
      logger.info('HTTP server closed');
      setTimeout(() => process.exit(1), 2000);
    });
  } else {
    setTimeout(() => process.exit(1), 2000);
  }
});

export default app;
