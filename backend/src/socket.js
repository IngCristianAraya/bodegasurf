import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt.js';

let io;

export const initializeSocket = (server) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3003'
    ];

    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('No permitido por CORS para Socket.IO'));
                }
            },
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware de autenticación
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Autenticación requerida'));
            }

            const decoded = await verifyToken(token);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Token inválido'));
        }
    });

    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id);

        // Unirse al room del tenant
        socket.on('join-tenant', (tenantId) => {
            if (socket.user.tenantId === tenantId) {
                socket.join(`tenant-${tenantId}`);
                console.log(`Cliente ${socket.id} unido al tenant ${tenantId}`);
            }
        });

        // Dejar el room del tenant
        socket.on('leave-tenant', (tenantId) => {
            socket.leave(`tenant-${tenantId}`);
            console.log(`Cliente ${socket.id} dejó el tenant ${tenantId}`);
        });

        // Manejar actualización de inventario
        socket.on('actualizar-inventario', (data) => {
            const room = `tenant-${data.tenantId}`;
            socket.to(room).emit('inventario-actualizado', data);
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado');
    }
    return io;
};

export const emitToTenant = (tenantId, event, data) => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado');
    }
    io.to(`tenant-${tenantId}`).emit(event, data);
}; 