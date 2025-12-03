import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['hotel', 'pousada', 'resort', 'hostel', 'chalé', 'apartamento', 'outro'],
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    neighborhood: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'BRL',
    },
    rating: {
      score: {
        type: Number,
        min: 0,
        max: 10,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    amenities: [String],
    images: [String],
    capacity: {
      rooms: Number,
      guests: Number,
    },
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      lastChecked: {
        type: Date,
        default: Date.now,
      },
      occupancyRate: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    source: {
      platform: {
        type: String,
        enum: ['booking', 'expedia', 'airbnb', 'manual', 'other'],
        required: true,
      },
      externalId: String,
      url: String,
    },
    priceHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        price: Number,
        available: Boolean,
        occupancyRate: Number,
      },
    ],
    demandLevel: {
      type: String,
      enum: ['baixa', 'média', 'alta', 'muito alta'],
      default: 'média',
    },
    lastScrapedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
accommodationSchema.index({ city: 1, type: 1 });
accommodationSchema.index({ currentPrice: 1 });
accommodationSchema.index({ 'rating.score': -1 });
accommodationSchema.index({ 'source.platform': 1 });
accommodationSchema.index({ lastScrapedAt: 1 });

// Virtual for average price from history
accommodationSchema.virtual('averagePrice').get(function () {
  if (this.priceHistory.length === 0) return this.currentPrice;
  const sum = this.priceHistory.reduce((acc, item) => acc + item.price, 0);
  return sum / this.priceHistory.length;
});

// Method to add price to history
accommodationSchema.methods.addPriceToHistory = function (price, available = true, occupancyRate = null) {
  this.priceHistory.push({
    date: new Date(),
    price,
    available,
    occupancyRate,
  });
  
  // Keep only last 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  this.priceHistory = this.priceHistory.filter((item) => item.date >= oneYearAgo);
  
  return this.save();
};

// Method to calculate price trend
accommodationSchema.methods.getPriceTrend = function (days = 30) {
  if (this.priceHistory.length < 2) return 0;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentPrices = this.priceHistory
    .filter((item) => item.date >= cutoffDate)
    .sort((a, b) => a.date - b.date);
  
  if (recentPrices.length < 2) return 0;
  
  const oldPrice = recentPrices[0].price;
  const newPrice = recentPrices[recentPrices.length - 1].price;
  
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

export default Accommodation;
