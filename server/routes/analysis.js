import express from 'express';
import MarketAnalysis from '../models/MarketAnalysis.js';
import Accommodation from '../models/Accommodation.js';
import { analyzeCityDemand, generateMarketAnalysis } from '../services/analysisService.js';
import { generateMockAccommodations, generateMockAnalysis } from '../mockData.js';

const router = express.Router();

// GET demand analysis for a city
router.get('/demand/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // Use mock data if MongoDB is not connected
    if (!global.mongoConnected) {
      const mockAnalysis = generateMockAnalysis(city);
      return res.json(mockAnalysis.demandAnalysis);
    }
    
    const demandAnalysis = await analyzeCityDemand(city);
    res.json(demandAnalysis);
  } catch (error) {
    console.error('Erro ao analisar demanda:', error);
    res.status(500).json({ error: 'Erro ao analisar demanda', details: error.message });
  }
});

// GET market trends for a city
router.get('/trends/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 30 } = req.query;

    // Use mock data if MongoDB is not connected
    let accommodations;
    if (!global.mongoConnected) {
      accommodations = generateMockAccommodations(city, 50);
    } else {
      accommodations = await Accommodation.find({
        city: new RegExp(city, 'i'),
        isActive: true,
      });
    }

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

    // Use mock data if MongoDB is not connected
    let accommodations;
    if (!global.mongoConnected) {
      accommodations = generateMockAccommodations(city, 50);
    } else {
      accommodations = await Accommodation.find({
        city: new RegExp(city, 'i'),
        isActive: true,
      });
    }

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

    // Use mock data if MongoDB is not connected
    if (!global.mongoConnected) {
      const mockAnalysis = generateMockAnalysis(city);
      return res.json(mockAnalysis);
    }

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
    
    // Use mock data if MongoDB is not connected
    if (!global.mongoConnected) {
      const mockAnalysis = generateMockAnalysis(city);
      return res.json(mockAnalysis);
    }
    
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

    // Use mock data if MongoDB is not connected
    if (!global.mongoConnected) {
      const mockAnalysis = generateMockAnalysis(city);
      return res.json([mockAnalysis]);
    }

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

    // Use mock data if MongoDB is not connected
    let accommodations;
    if (!global.mongoConnected) {
      accommodations = generateMockAccommodations(city, 50);
    } else {
      accommodations = await Accommodation.find({
        city: new RegExp(city, 'i'),
        isActive: true,
      });
    }

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

// GET detailed comparison by category/type
router.get('/category/:city/:type', async (req, res) => {
  try {
    const { city, type } = req.params;

    // Use mock data if MongoDB is not connected
    let accommodations;
    if (!global.mongoConnected) {
      accommodations = generateMockAccommodations(city, 50);
    } else {
      accommodations = await Accommodation.find({
        city: new RegExp(city, 'i'),
        type: type,
        isActive: true,
      });
    }

    // Filter by type for mock data
    accommodations = accommodations.filter(acc => acc.type === type);

    if (accommodations.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhuma hospedagem encontrada',
        message: `Não há ${type}s disponíveis em ${city}` 
      });
    }

    // Calculate detailed statistics
    const prices = accommodations.map(acc => acc.currentPrice);
    const ratings = accommodations.filter(acc => acc.rating?.score).map(acc => acc.rating.score);
    const occupancyRates = accommodations
      .filter(acc => acc.availability?.occupancyRate != null)
      .map(acc => acc.availability.occupancyRate);

    // Sort accommodations by price
    const sortedByPrice = [...accommodations].sort((a, b) => a.currentPrice - b.currentPrice);
    const sortedByRating = [...accommodations]
      .filter(acc => acc.rating?.score)
      .sort((a, b) => b.rating.score - a.rating.score);

    // Calculate price statistics
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    const medianPrice = sortedPrices.length % 2 === 0
      ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
      : sortedPrices[mid];

    // Calculate price ranges (quartiles)
    const q1Index = Math.floor(sortedPrices.length * 0.25);
    const q3Index = Math.floor(sortedPrices.length * 0.75);
    const q1 = sortedPrices[q1Index];
    const q3 = sortedPrices[q3Index];

    // Calculate rating statistics
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : null;

    // Calculate occupancy statistics
    const avgOccupancy = occupancyRates.length > 0
      ? occupancyRates.reduce((sum, r) => sum + r, 0) / occupancyRates.length
      : null;

    // Best value (high rating, low-medium price)
    const bestValue = sortedByRating
      .filter(acc => acc.currentPrice <= medianPrice)
      .slice(0, 5);

    // Price trends for this category
    const priceTrends = accommodations.map(acc => ({
      id: acc._id,
      name: acc.name,
      currentPrice: acc.currentPrice,
      trend: acc.getPriceTrend(7),
      pricePosition: acc.currentPrice < q1 ? 'baixo' : 
                     acc.currentPrice > q3 ? 'alto' : 'médio',
    }));

    res.json({
      city,
      type,
      summary: {
        total: accommodations.length,
        available: accommodations.filter(acc => acc.availability.isAvailable).length,
        withRatings: ratings.length,
      },
      priceAnalysis: {
        average: Math.round(avgPrice * 100) / 100,
        median: Math.round(medianPrice * 100) / 100,
        min: Math.min(...prices),
        max: Math.max(...prices),
        quartiles: {
          q1: Math.round(q1 * 100) / 100,
          q3: Math.round(q3 * 100) / 100,
        },
        distribution: {
          budget: sortedByPrice.filter(acc => acc.currentPrice < q1).length,
          midRange: sortedByPrice.filter(acc => acc.currentPrice >= q1 && acc.currentPrice <= q3).length,
          premium: sortedByPrice.filter(acc => acc.currentPrice > q3).length,
        }
      },
      ratingAnalysis: avgRating ? {
        average: Math.round(avgRating * 10) / 10,
        highest: Math.max(...ratings),
        lowest: Math.min(...ratings),
        excellentCount: ratings.filter(r => r >= 9).length,
        goodCount: ratings.filter(r => r >= 7 && r < 9).length,
        fairCount: ratings.filter(r => r < 7).length,
      } : null,
      occupancyAnalysis: avgOccupancy ? {
        average: Math.round(avgOccupancy * 10) / 10,
        high: occupancyRates.filter(r => r >= 80).length,
        medium: occupancyRates.filter(r => r >= 50 && r < 80).length,
        low: occupancyRates.filter(r => r < 50).length,
      } : null,
      topPerformers: {
        bestRated: sortedByRating.slice(0, 5).map(acc => ({
          id: acc._id,
          name: acc.name,
          rating: acc.rating.score,
          price: acc.currentPrice,
          reviews: acc.rating.totalReviews,
        })),
        bestValue: bestValue.map(acc => ({
          id: acc._id,
          name: acc.name,
          rating: acc.rating.score,
          price: acc.currentPrice,
          valueScore: Math.round((acc.rating.score / acc.currentPrice) * 1000) / 10,
        })),
        cheapest: sortedByPrice.slice(0, 5).map(acc => ({
          id: acc._id,
          name: acc.name,
          price: acc.currentPrice,
          rating: acc.rating?.score || null,
        })),
        mostExpensive: sortedByPrice.slice(-5).reverse().map(acc => ({
          id: acc._id,
          name: acc.name,
          price: acc.currentPrice,
          rating: acc.rating?.score || null,
        })),
      },
      priceTrends: priceTrends.sort((a, b) => b.trend - a.trend).slice(0, 10),
      recommendations: {
        budget: sortedByPrice.filter(acc => acc.currentPrice < q1 && acc.rating?.score >= 7).slice(0, 3),
        quality: sortedByRating.filter(acc => acc.rating?.score >= 8.5).slice(0, 3),
        balanced: bestValue.slice(0, 3),
      }
    });
  } catch (error) {
    console.error('Erro ao analisar categoria:', error);
    res.status(500).json({ error: 'Erro ao analisar categoria', details: error.message });
  }
});

export default router;
