import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import { useState, useEffect } from 'react';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

export const useInventarioSync = (tenantId) => {
    const queryClient = useQueryClient();
    const [isConnected, setIsConnected] = useState(socket.connected);

    // Configurar conexión de socket
    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket conectado');

            // Unirse al room del tenant
            if (tenantId) {
                socket.emit('join-tenant', tenantId);
            }
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket desconectado');
        });

        socket.on('inventario-actualizado', (data) => {
            // Invalidar y recargar los datos cuando se recibe una actualización
            queryClient.invalidateQueries(['inventario', tenantId]);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('inventario-actualizado');
            if (tenantId) {
                socket.emit('leave-tenant', tenantId);
            }
        };
    }, [tenantId, queryClient]);

    // Query para obtener el inventario
    const { data: productos, isLoading, error } = useQuery({
        queryKey: ['inventario', tenantId],
        queryFn: async () => {
            const response = await fetch(`/api/inventario?tenantId=${tenantId}`);
            if (!response.ok) {
                throw new Error('Error al cargar el inventario');
            }
            return response.json();
        },
        // Configuración de revalidación
        staleTime: 1000 * 60, // Los datos se consideran frescos por 1 minuto
        cacheTime: 1000 * 60 * 5, // Mantener en caché por 5 minutos
    });

    // Mutation para actualizar el stock
    const actualizarStockMutation = useMutation({
        mutationFn: async ({ productoId, cantidad }) => {
            const response = await fetch(`/api/inventario/${productoId}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cantidad, tenantId }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el stock');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Actualizar la caché de React Query
            queryClient.setQueryData(['inventario', tenantId], (oldData) => {
                if (!oldData) return oldData;
                return oldData.map((producto) =>
                    producto.id === data.id ? { ...producto, stock: data.stock } : producto
                );
            });

            // Emitir evento de actualización a otros clientes
            socket.emit('actualizar-inventario', {
                tenantId,
                productoId: data.id,
                nuevoStock: data.stock,
            });
        },
    });

    // Mutation para agregar producto
    const agregarProductoMutation = useMutation({
        mutationFn: async (nuevoProducto) => {
            const response = await fetch('/api/inventario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...nuevoProducto, tenantId }),
            });

            if (!response.ok) {
                throw new Error('Error al agregar el producto');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Actualizar la caché
            queryClient.setQueryData(['inventario', tenantId], (oldData) => {
                return oldData ? [...oldData, data] : [data];
            });

            // Notificar a otros clientes
            socket.emit('actualizar-inventario', {
                tenantId,
                tipo: 'nuevo-producto',
                producto: data,
            });
        },
    });

    // Mutation para eliminar producto
    const eliminarProductoMutation = useMutation({
        mutationFn: async (productoId) => {
            const response = await fetch(`/api/inventario/${productoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tenantId }),
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto');
            }
        },
        onSuccess: (_, productoId) => {
            // Actualizar la caché
            queryClient.setQueryData(['inventario', tenantId], (oldData) => {
                return oldData ? oldData.filter(p => p.id !== productoId) : oldData;
            });

            // Notificar a otros clientes
            socket.emit('actualizar-inventario', {
                tenantId,
                tipo: 'eliminar-producto',
                productoId,
            });
        },
    });

    return {
        productos,
        isLoading,
        error,
        isConnected,
        actualizarStock: (productoId, cantidad) =>
            actualizarStockMutation.mutate({ productoId, cantidad }),
        agregarProducto: (producto) =>
            agregarProductoMutation.mutate(producto),
        eliminarProducto: (productoId) =>
            eliminarProductoMutation.mutate(productoId),
        actualizarStockStatus: actualizarStockMutation.status,
        agregarProductoStatus: agregarProductoMutation.status,
        eliminarProductoStatus: eliminarProductoMutation.status,
    };
}; 