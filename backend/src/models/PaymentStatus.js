import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

/**
 * @typedef {Object} IPaymentSettings
 * @property {string[]} paymentMethods - Allowed payment methods
 * @property {string} currency - Default currency
 * @property {number} taxRate - Tax rate
 * @property {string} [paymentTerms] - Payment terms
 */

/**
 * @typedef {mongoose.Document & {
 *  tenantId: mongoose.Types.ObjectId;
 *  isActive: boolean;
 *  reason?: string;
 *  lastUpdated: Date;
 *  lastUpdatedBy?: mongoose.Types.ObjectId;
 *  settings: IPaymentSettings;
 * }} PaymentStatusDocument
 */

/**
 * @typedef {import('mongoose').Model<PaymentStatusDocument> & {
 *   getPaymentStatus(tenantId: string | mongoose.Types.ObjectId): Promise<PaymentStatusDocument>;
 *   updatePaymentStatus(
 *     tenantId: string | mongoose.Types.ObjectId, 
 *     updateData: Partial<PaymentStatusDocument>,
 *     userId?: string | mongoose.Types.ObjectId
 *   ): Promise<PaymentStatusDocument>;
 * }} PaymentStatusModel
 */

// Define the schema
const paymentStatusSchema = new Schema({
  tenantId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tenant',
    required: true,
    unique: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  reason: { 
    type: String,
    required: [
      function() { 
        // @ts-ignore - this is available in the schema context
        return !this.isActive; 
      },
      'Reason is required when deactivating payments'
    ]
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  lastUpdatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  settings: {
    paymentMethods: [{ 
      type: String, 
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer'] 
    }],
    currency: { 
      type: String, 
      default: 'USD' 
    },
    taxRate: { 
      type: Number, 
      default: 0 
    },
    paymentTerms: { 
      type: String 
    }
  }
}, {
  timestamps: true
});

// Add static methods with proper type annotations
paymentStatusSchema.statics.getPaymentStatus = /** @type {PaymentStatusModel['getPaymentStatus']} */ (async function(tenantId) {
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    throw new Error('Invalid tenant ID');
  }
  
  const status = await this.findOne({ tenantId });
  if (status) {
    return status;
  }
  
  // Create default settings if not exists
  const newStatus = new this({ 
    tenantId: new mongoose.Types.ObjectId(tenantId),
    isActive: true,
    lastUpdated: new Date(),
    settings: {
      paymentMethods: [],
      currency: 'USD',
      taxRate: 0
    }
  });
  
  return newStatus.save();
});

paymentStatusSchema.statics.updatePaymentStatus = /** @type {PaymentStatusModel['updatePaymentStatus']} */ (async function(tenantId, updateData, userId) {
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    throw new Error('Invalid tenant ID');
  }
  
  const update = { 
    ...updateData,
    lastUpdated: new Date()
  };
  
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    update.lastUpdatedBy = new mongoose.Types.ObjectId(userId);
  }
  
  const options = { 
    new: true, 
    upsert: true,
    setDefaultsOnInsert: true
  };
  
  const result = await this.findOneAndUpdate(
    { tenantId: new mongoose.Types.ObjectId(tenantId) },
    { $set: update },
    options
  );
  
  if (!result) {
    throw new Error('Failed to update payment status');
  }
  
  return result;
});

// Create and export the model
const PaymentStatus = mongoose.model('PaymentStatus', paymentStatusSchema);

export default PaymentStatus;
