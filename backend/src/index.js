import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import { tenantMiddleware, checkSubscription } from './middleware/tenant.js';
import { initializeSocket } from './socket.js';
import routes from './routes/index.js';

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();

// Crear servidor HTTP
const server = createServer(app);

// Inicializar Socket.IO
initializeSocket(server);

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
    origin: (origin, callback) => {
        // En desarrollo permitir cualquier origen
        if (process.env.NODE_ENV === 'development') {
            callback(null, true);
            return;
        }

        // En producción, verificar el origen contra los subdominios permitidos
        const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
        if (!origin || allowedDomains.some(domain => origin.endsWith(domain))) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware de tenant y suscripción
app.use(tenantMiddleware);
app.use(checkSubscription);

// Rutas de la API
app.use('/api', routes);

// Ruta de health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
});

// Manejador de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Conectar a la base de datos
        await connectDB();

        // Iniciar el servidor HTTP
        server.listen(PORT, () => {
            console.log(`