import mongoose from 'mongoose';

const ProductoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del producto es requerido'],
            trim: true,
            maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
        },
        descripcion: {
            type: String,
            maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
        },
        codigoBarras: {
            type: String,
            default: '',
            trim: true
        },
        categoria: {
            type: String,
            required: [true, 'La categoría es requerida'],
            trim: true
        },
        precioCompra: {
            type: Number,
            required: [true, 'El precio de compra es requerido'],
            min: [0, 'El precio no puede ser negativo']
        },
        precioVenta: {
            type: Number,
            required: [true, 'El precio de venta es requerido'],
            min: [0, 'El precio no puede ser negativo']
        },
        stock: {
            type: Number,
            required: [true, 'El stock es requerido'],
            min: [0, 'El stock no puede ser negativo'],
            default: 0
        },
        imagen: {
            type: String,
            default: '/productos/default.jpg'
        },
        tenantId: {
            type: String,
            required: [true, 'El ID del tenant es requerido']
        }
    },
    {
        timestamps: true
    }
);

// Crear índices para búsquedas más rápidas
ProductoSchema.index({ nombre: 1 });
ProductoSchema.index({ codigoBarras: 1 });
ProductoSchema.index({ categoria: 1 });
ProductoSchema.index({ tenantId: 1 });

const Producto = mongoose.model('Producto', ProductoSchema);

export default Producto; 