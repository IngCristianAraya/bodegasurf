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
import { router as apiRoutes } from './routes/index.js'; // Renombrado para claridad

// Importar middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Configuración de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.__basedir = __dirname;

// Configuración de variables de entorno
const isProduction = process.env.NODE_ENV === 'production';

// Inicializar la aplicación Express
const app = express();

// --- Servir archivos estáticos ---
// Construir la ruta absoluta a la carpeta 'public'
const publicFolderPath = path.join(__dirname, 'public');
// Servir la carpeta 'public' estáticamente
app.use(express.static(publicFolderPath));
// También podrías prefijar la ruta estática si quieres, ej:
// app.use('/static', express.static(publicFolderPath));
// En ese caso, las URLs a las imágenes serían /static/uploads/images/...
// Por ahora, la dejaremos en la raíz para que sea /uploads/images/...
// ---------------------------------

// Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000', // Puerto por defecto de create-react-app
      'http://localhost:3001', // Puerto alternativo común frontend
      'http://localhost:3002', // Puerto que hemos configurado para el frontend
      'http://localhost:5173', // Puerto por defecto de Vite
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-XSRF-TOKEN'],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar pre-flight para todas las rutas

// Middlewares básicos
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Middlewares de seguridad
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

// Limitar peticiones (Rate Limiting)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas peticiones desde esta IP, por favor inténtalo de nuevo más tarde.',
    },
  },
});
app.use('/api', apiLimiter); // Aplicar a todas las rutas bajo /api

// Rutas de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', apiRoutes); // Usar las rutas definidas en routes/index.js

// Configuración para servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist'); // o 'build' si es create-react-app
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'API funcionando en modo desarrollo' });
  });
}

// Manejador de rutas no encontradas para la API (debe ir después de las rutas de la API)
app.use('/api', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta de API no encontrada: ${req.originalUrl}`,
    },
  });
});

// Manejador de errores global (debe ser el último middleware)
app.use(errorHandler);

// Manejo de excepciones no capturadas y promesas rechazadas
process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: { name: error.name, message: error.message, stack: error.stack },
  });
  // Considera cerrar el servidor de forma controlada
  // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled Rejection',
    reason: reason && typeof reason === 'object' ?
      {
        name: 'name' in reason ? String(reason.name) : 'Unknown',
        message: 'message' in reason ? String(reason.message) : 'Unknown reason',
        stack: 'stack' in reason ? String(reason.stack) : ''
      } :
      { name: 'Unknown', message: String(reason), stack: '' },
  });
  // Considera cerrar el servidor de forma controlada
});

// Exportar la aplicación
export { app };

export default app;
