import express from 'express';
import MarketAnalysis from '../models/MarketAnalysis.js';
import Accommodation from '../models/Accommodation.js';
import { analyzeCityDemand, generateMarketAnalysis } from '../services/analysisService.js';

const router = express.Router();

// GET demand analysis for a city
router.get('/demand/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const demandAnalysis = await analyzeCityDemand(city);
    res.json(demandAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao analisar demanda', details: error.message });
  }
});

// GET market trends for a city
router.get('/trends/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 30 } = req.query;

    const accommodations = await Accommodation.find({
      city: new RegExp(city, 'i'),
      isActive: true,
    });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    // Aggregate price trends
    const priceTrends = accommodations.map((acc) => {
      const history = acc.priceHistory
        .filter((h) => h.date >= cutoffDate)
        .sort((a, b) => a.date - b.date);

      return {
        accommodationId: acc._id,
        name: acc.name,
        type: acc.type,
        currentPrice: acc.currentPrice,
        trend: acc.getPriceTrend(Number(days)),
        history: history.map((h) => ({
          date: h.date,
          price: h.price,
        })),
      };
    });

    // Calculate overall trend
    const overallTrend = priceTrends.reduce((sum, t) => sum + t.trend, 0) / priceTrends.length;

    res.json({
      city,
      period: {
        days: Number(days),
        startDate: cutoffDate,
        endDate: new Date(),
      },
      overallTrend,
      accommodationTrends: priceTrends,
      summary: {
        increasing: priceTrends.filter((t) => t.trend > 5).length,
        stable: priceTrends.filter((t) => t.trend >= -5 && t.trend <= 5).length,
        decreasing: priceTrends.filter((t) => t.trend < -5).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao analisar tendências', details: error.message });
  }
});

// GET price comparison by type in city
router.get('/comparison/:city', async (req, res) => {
  try {
    const { city } = req.params;

    const accommodations = await Accommodation.find({
      city: new RegExp(city, 'i'),
      isActive: true,
    });

    const comparison = {};

    accommodations.forEach((acc) => {
      if (!comparison[acc.type]) {
        comparison[acc.type] = {
          type: acc.type,
          count: 0,
          prices: [],
          ratings: [],
          averagePrice: 0,
          medianPrice: 0,
          averageRating: 0,
        };
      }

      comparison[acc.type].count++;
      comparison[acc.type].prices.push(acc.currentPrice);
      if (acc.rating?.score) {
        comparison[acc.type].ratings.push(acc.rating.score);
      }
    });

    Object.keys(comparison).forEach((type) => {
      const data = comparison[type];
      
      // Calculate average price
      data.averagePrice = data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length;
      
      // Calculate median price
      const sortedPrices = [...data.prices].sort((a, b) => a - b);
      const mid = Math.floor(sortedPrices.length / 2);
      data.medianPrice = sortedPrices.length % 2 === 0
        ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
        : sortedPrices[mid];
      
      // Calculate average rating
      if (data.ratings.length > 0) {
        data.averageRating = data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length;
      }

      data.minPrice = Math.min(...data.prices);
      data.maxPrice = Math.max(...data.prices);
      
      delete data.prices;
      delete data.ratings;
    });

    res.json({
      city,
      comparison: Object.values(comparison),
      totalAccommodations: accommodations.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao comparar preços', details: error.message });
  }
});

// GET latest market analysis for city
router.get('/market/:city', async (req, res) => {
  try {
    const { city } = req.params;

    let analysis = await MarketAnalysis.findOne({
      city: new RegExp(city, 'i'),
    })
      .sort({ analysisDate: -1 })
      .populate('competitiveAnalysis.topPerformers.accommodationId')
      .populate('competitiveAnalysis.priceLeaders.accommodationId');

    if (!analysis) {
      // Generate new analysis if none exists
      analysis = await generateMarketAnalysis(city);
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar análise de mercado', details: error.message });
  }
});

// POST generate new market analysis
router.post('/market/:city/generate', async (req, res) => {
  try {
    const { city } = req.params;
    const analysis = await generateMarketAnalysis(city);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar análise de mercado', details: error.message });
  }
});

// GET historical analyses for city
router.get('/market/:city/history', async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 10 } = req.query;

    const analyses = await MarketAnalysis.find({
      city: new RegExp(city, 'i'),
    })
      .sort({ analysisDate: -1 })
      .limit(Number(limit))
      .select('-competitiveAnalysis -recommendations');

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico de análises', details: error.message });
  }
});

// GET occupancy analysis
router.get('/occupancy/:city', async (req, res) => {
  try {
    const { city } = req.params;

    const accommodations = await Accommodation.find({
      city: new RegExp(city, 'i'),
      isActive: true,
    });

    const total = accommodations.length;
    const available = accommodations.filter((acc) => acc.availability.isAvailable).length;
    const occupancyRate = ((total - available) / total) * 100;

    const byType = {};
    accommodations.forEach((acc) => {
      if (!byType[acc.type]) {
        byType[acc.type] = { total: 0, available: 0, occupancyRate: 0 };
      }
      byType[acc.type].total++;
      if (acc.availability.isAvailable) {
        byType[acc.type].available++;
      }
    });

    Object.keys(byType).forEach((type) => {
      const data = byType[type];
      data.occupancyRate = ((data.total - data.available) / data.total) * 100;
    });

    res.json({
      city,
      overall: {
        total,
        available,
        occupied: total - available,
        occupancyRate: occupancyRate.toFixed(2),
      },
      byType,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao analisar ocupação', details: error.message });
  }
});

export default router;
