import mongoose from 'mongoose';

const priceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: true,
    },
    alertType: {
      type: String,
      enum: ['price_below', 'price_above', 'price_change', 'availability'],
      required: true,
    },
    targetPrice: {
      type: Number,
    },
    percentageChange: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggered: {
      type: Date,
    },
    notificationMethod: {
      type: String,
      enum: ['email', 'push', 'both'],
      default: 'email',
    },
    conditions: {
      city: String,
      type: String,
      maxPrice: Number,
      minPrice: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
priceAlertSchema.index({ userId: 1, isActive: 1 });
priceAlertSchema.index({ accommodation: 1 });

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);

export default PriceAlert;
