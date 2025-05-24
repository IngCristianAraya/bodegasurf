import { Producto } from '../models/index.js';
import { emitToTenant } from '../socket.js';

export const getInventario = async (req, res) => {
    try {
        const productos = await Producto.find({ tenantId: req.tenant._id });
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el inventario'
        });
    }
};

export const actualizarStock = async (req, res) => {
    try {
        const { productoId } = req.params;
        const { cantidad } = req.body;
        const tenantId = req.tenant._id;

        const producto = await Producto.findOne({
            _id: productoId,
            tenantId
        });

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Validar que haya suficiente stock
        if (producto.stock < cantidad) {
            return res.status(400).json({
                success: false,
                message: 'No hay suficiente stock disponible'
            });
        }

        // Actualizar stock
        producto.stock -= cantidad;
        await producto.save();

        // Emitir evento de actualización
        emitToTenant(tenantId, 'inventario-actualizado', {
            tipo: 'actualizar-stock',
            productoId: producto._id,
            nuevoStock: producto.stock
        });

        res.json({
            success: true,
            producto
        });
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el stock'
        });
    }
};

export const agregarProducto = async (req, res, next) => {
    try {
        const tenantId = req.tenant?._id;
        const userId = req.user?._id; // Asume que req.user es poblado por middleware de autenticación

        if (!tenantId) {
            return res.status(400).json({
                success: false,
                message: 'Tenant ID no encontrado en la solicitud.'
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado o ID de usuario no encontrado.'
            });
        }

        const datosProducto = {
            ...req.body,
            tenantId,
            createdBy: userId, // Añadir el ID del usuario que crea el producto
        };

        const nuevoProducto = new Producto(datosProducto);
        await nuevoProducto.save();

        emitToTenant(tenantId, 'inventario-actualizado', {
            tipo: 'nuevo-producto',
            producto: nuevoProducto
        });

        res.status(201).json({
            success: true,
            producto: nuevoProducto
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            // Log detallado para el servidor
            console.error('Error de Validación al agregar producto:', JSON.stringify(error.errors, null, 2));
            return res.status(400).json({
                success: false,
                message: 'Error de validación al agregar el producto.',
                errors: error.errors
            });
        }
        // Log detallado para otros errores en el servidor
        console.error('Error interno al agregar producto:', error);
        // Para el cliente, un mensaje más general o el mensaje del error si es seguro mostrarlo
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno al agregar el producto.'
        });
        // Si tienes un manejador de errores global centralizado, podrías usar next(error) aquí.
    }
};

export const eliminarProducto = async (req, res) => {
    try {
        const { productoId } = req.params;
        const tenantId = req.tenant._id;

        const producto = await Producto.findOneAndDelete({
            _id: productoId,
            tenantId
        });

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Emitir evento de eliminación
        emitToTenant(tenantId, 'inventario-actualizado', {
            tipo: 'eliminar-producto',
            productoId
        });

        res.json({
            success: true,
            message: 'Producto eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto'
        });
    }
};

export const actualizarProducto = async (req, res) => {
    try {
        const { productoId } = req.params;
        const tenantId = req.tenant._id;
        const actualizaciones = req.body;

        const producto = await Producto.findOneAndUpdate(
            { _id: productoId, tenantId },
            actualizaciones,
            { new: true }
        );

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Emitir evento de actualización
        emitToTenant(tenantId, 'inventario-actualizado', {
            tipo: 'actualizar-producto',
            producto
        });

        res.json({
            success: true,
            producto
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto'
        });
    }
}; 