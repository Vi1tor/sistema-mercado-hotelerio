import express from 'express';
import Accommodation from '../models/Accommodation.js';
import { mockCities, generateMockAccommodations } from '../mockData.js';

const router = express.Router();

// Flag para usar dados mock quando DB não estiver disponível
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

// GET all accommodations with filters
router.get('/', async (req, res) => {
  try {
    const {
      city,
      state,
      type,
      minPrice,
      maxPrice,
      minRating,
      available,
      page = 1,
      limit = 20,
      sortBy = 'rating.score',
      sortOrder = 'desc',
    } = req.query;

    // Usar mock data se configurado ou sem conexão DB
    if (USE_MOCK_DATA || !global.mongoConnected) {
      let mockData = [];
      
      if (city) {
        mockData = generateMockAccommodations(city, 40);
      } else {
        // Gerar dados de várias cidades
        mockData = [
          ...generateMockAccommodations('Gramado', 10),
          ...generateMockAccommodations('Campos do Jordão', 10),
          ...generateMockAccommodations('Búzios', 10),
          ...generateMockAccommodations('Jericoacoara', 10),
        ];
      }
      
      // Aplicar filtros
      let filtered = mockData;
      if (type) filtered = filtered.filter(a => a.type === type);
      if (minPrice) filtered = filtered.filter(a => a.currentPrice >= parseFloat(minPrice));
      if (maxPrice) filtered = filtered.filter(a => a.currentPrice <= parseFloat(maxPrice));
      if (minRating) filtered = filtered.filter(a => a.rating.score >= parseFloat(minRating));
      if (available === 'true') filtered = filtered.filter(a => a.availability.isAvailable);
      
      // Ordenar
      if (sortBy === 'rating.score') {
        filtered.sort((a, b) => sortOrder === 'desc' ? b.rating.score - a.rating.score : a.rating.score - b.rating.score);
      } else if (sortBy === 'currentPrice') {
        filtered.sort((a, b) => sortOrder === 'desc' ? b.currentPrice - a.currentPrice : a.currentPrice - b.currentPrice);
      }
      
      // Paginação
      const skip = (Number(page) - 1) * Number(limit);
      const paginatedData = filtered.slice(skip, skip + Number(limit));
      
      return res.json({
        data: paginatedData,
        pagination: {
          total: filtered.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(filtered.length / Number(limit)),
        }
      });
    }

    const query = { isActive: true };

    if (city) query.city = new RegExp(city, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.currentPrice = {};
      if (minPrice) query.currentPrice.$gte = Number(minPrice);
      if (maxPrice) query.currentPrice.$lte = Number(maxPrice);
    }
    if (minRating) query['rating.score'] = { $gte: Number(minRating) };
    if (available === 'true') query['availability.isAvailable'] = true;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [accommodations, total] = await Promise.all([
      Accommodation.find(query)
        .sort(sort)
        .limit(Number(limit))
        .skip(skip)
        .lean(),
      Accommodation.countDocuments(query),
    ]);

    res.json({
      data: accommodations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    // Fallback para mock em caso de erro
    const mockData = generateMockAccommodations('Gramado', 20);
    res.json({
      data: mockData,
      pagination: {
        total: mockData.length,
        page: 1,
        limit: 20,
        pages: 1,
      }
    });
  }
});

// GET accommodation by ID
router.get('/:id', async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    
    if (!accommodation) {
      return res.status(404).json({ error: 'Hospedagem não encontrada' });
    }

    res.json(accommodation);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar hospedagem', details: error.message });
  }
});

// GET accommodations by city with statistics
router.get('/city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const accommodations = await Accommodation.find({
      city: new RegExp(city, 'i'),
      isActive: true,
    }).lean();

    // Calculate statistics
    const stats = {
      total: accommodations.length,
      averagePrice: 0,
      averageRating: 0,
      byType: {},
      availabilityRate: 0,
    };

    if (accommodations.length > 0) {
      stats.averagePrice = accommodations.reduce((sum, acc) => sum + acc.currentPrice, 0) / accommodations.length;
      
      const ratedAccommodations = accommodations.filter((acc) => acc.rating?.score);
      if (ratedAccommodations.length > 0) {
        stats.averageRating = ratedAccommodations.reduce((sum, acc) => sum + acc.rating.score, 0) / ratedAccommodations.length;
      }

      accommodations.forEach((acc) => {
        if (!stats.byType[acc.type]) {
          stats.byType[acc.type] = { count: 0, avgPrice: 0, totalPrice: 0 };
        }
        stats.byType[acc.type].count++;
        stats.byType[acc.type].totalPrice += acc.currentPrice;
      });

      Object.keys(stats.byType).forEach((type) => {
        stats.byType[type].avgPrice = stats.byType[type].totalPrice / stats.byType[type].count;
        delete stats.byType[type].totalPrice;
      });

      const availableCount = accommodations.filter((acc) => acc.availability.isAvailable).length;
      stats.availabilityRate = (availableCount / accommodations.length) * 100;
      
      // Add average occupancy rate
      const occupancyRates = accommodations
        .filter(acc => acc.availability?.occupancyRate != null)
        .map(acc => acc.availability.occupancyRate);
      
      if (occupancyRates.length > 0) {
        stats.averageOccupancy = occupancyRates.reduce((sum, rate) => sum + rate, 0) / occupancyRates.length;
      }
    }

    res.json({
      city,
      stats,
      accommodations,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar hospedagens da cidade', details: error.message });
  }
});

// GET price history for accommodation
router.get('/:id/price-history', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const accommodation = await Accommodation.findById(id);
    
    if (!accommodation) {
      return res.status(404).json({ error: 'Hospedagem não encontrada' });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    const history = accommodation.priceHistory
      .filter((item) => item.date >= cutoffDate)
      .sort((a, b) => a.date - b.date);

    const trend = accommodation.getPriceTrend(Number(days));

    res.json({
      accommodationId: id,
      name: accommodation.name,
      currentPrice: accommodation.currentPrice,
      history,
      trend,
      stats: {
        min: Math.min(...history.map((h) => h.price)),
        max: Math.max(...history.map((h) => h.price)),
        average: history.reduce((sum, h) => sum + h.price, 0) / history.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico de preços', details: error.message });
  }
});

// POST create new accommodation
router.post('/', async (req, res) => {
  try {
    const accommodation = new Accommodation(req.body);
    await accommodation.save();
    res.status(201).json(accommodation);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar hospedagem', details: error.message });
  }
});

// PUT update accommodation
router.put('/:id', async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!accommodation) {
      return res.status(404).json({ error: 'Hospedagem não encontrada' });
    }

    res.json(accommodation);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar hospedagem', details: error.message });
  }
});

// DELETE accommodation (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!accommodation) {
      return res.status(404).json({ error: 'Hospedagem não encontrada' });
    }

    res.json({ message: 'Hospedagem removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover hospedagem', details: error.message });
  }
});

// GET cities list
router.get('/meta/cities', async (req, res) => {
  try {
    if (USE_MOCK_DATA) {
      const cities = mockCities.map(c => c.name);
      return res.json(cities.sort());
    }
    
    const cities = await Accommodation.distinct('city', { isActive: true });
    
    // Se não houver dados no DB, usar mock
    if (!cities || cities.length === 0) {
      const mockCitiesList = mockCities.map(c => c.name);
      return res.json(mockCitiesList.sort());
    }
    
    res.json(cities.sort());
  } catch (error) {
    // Em caso de erro de conexão, usar dados mock
    const mockCitiesList = mockCities.map(c => c.name);
    res.json(mockCitiesList.sort());
  }
});

// GET accommodation types
router.get('/meta/types', async (req, res) => {
  try {
    const types = await Accommodation.distinct('type', { isActive: true });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipos', details: error.message });
  }
});

export default router;
