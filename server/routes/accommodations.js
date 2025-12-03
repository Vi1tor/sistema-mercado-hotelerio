import express from 'express';
import Accommodation from '../models/Accommodation.js';

const router = express.Router();

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
    res.status(500).json({ error: 'Erro ao buscar hospedagens', details: error.message });
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
    const cities = await Accommodation.distinct('city', { isActive: true });
    res.json(cities.sort());
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cidades', details: error.message });
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
