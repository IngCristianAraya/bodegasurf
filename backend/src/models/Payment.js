import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'El monto debe ser mayor o igual a 0']
    },
    currency: {
        type: String,
        required: true,
        enum: ['PEN', 'USD'],
        default: 'PEN'
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    method: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'yape', 'plin', 'transfer', 'other']
    },
    reference: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Índices
paymentSchema.index({ tenantId: 1, createdAt: -1 });
paymentSchema.index({ reference: 1 }, { unique: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 