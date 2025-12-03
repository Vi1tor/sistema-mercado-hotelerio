import mongoose from 'mongoose';

const marketAnalysisSchema = new mongoose.Schema(
  {
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
    analysisDate: {
      type: Date,
      default: Date.now,
    },
    period: {
      startDate: Date,
      endDate: Date,
    },
    demandAnalysis: {
      level: {
        type: String,
        enum: ['baixa', 'média', 'alta', 'muito alta'],
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      trend: {
        type: String,
        enum: ['crescente', 'estável', 'decrescente'],
      },
      factors: [String],
    },
    priceAnalysis: {
      averagePrice: Number,
      medianPrice: Number,
      minPrice: Number,
      maxPrice: Number,
      priceVariation: Number, // Percentual
      byType: [
        {
          type: String,
          averagePrice: Number,
          count: Number,
        },
      ],
    },
    occupancyAnalysis: {
      averageOccupancy: Number,
      totalAccommodations: Number,
      availableAccommodations: Number,
      occupancyRate: Number,
      byType: [
        {
          type: String,
          occupancyRate: Number,
          count: Number,
        },
      ],
    },
    ratingAnalysis: {
      averageRating: Number,
      totalReviews: Number,
      distributionByScore: [
        {
          scoreRange: String,
          count: Number,
          percentage: Number,
        },
      ],
    },
    seasonality: {
      season: {
        type: String,
        enum: ['alta', 'média', 'baixa'],
      },
      prediction: {
        nextMonth: String,
        confidence: Number,
      },
    },
    competitiveAnalysis: {
      topPerformers: [
        {
          accommodationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Accommodation',
          },
          name: String,
          score: Number,
        },
      ],
      priceLeaders: [
        {
          accommodationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Accommodation',
          },
          name: String,
          price: Number,
        },
      ],
    },
    alerts: [
      {
        type: {
          type: String,
          enum: ['price_surge', 'price_drop', 'high_demand', 'low_availability'],
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
        message: String,
        affectedAccommodations: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    recommendations: [
      {
        category: String,
        title: String,
        description: String,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
marketAnalysisSchema.index({ city: 1, analysisDate: -1 });
marketAnalysisSchema.index({ 'demandAnalysis.level': 1 });

const MarketAnalysis = mongoose.model('MarketAnalysis', marketAnalysisSchema);

export default MarketAnalysis;
