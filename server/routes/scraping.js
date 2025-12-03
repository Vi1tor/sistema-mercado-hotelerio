import express from 'express';
import { scrapeBooking, scrapeExpedia } from '../scrapers/index.js';
import Accommodation from '../models/Accommodation.js';

const router = express.Router();

// POST trigger manual scraping for a city
router.post('/trigger/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { platform = 'booking' } = req.body;

    res.json({
      message: 'Scraping iniciado',
      city,
      platform,
      status: 'processing',
    });

    // Run scraping in background
    if (platform === 'booking' || platform === 'all') {
      scrapeBooking(city).catch((err) => console.error('Erro no scraping Booking:', err));
    }
    if (platform === 'expedia' || platform === 'all') {
      scrapeExpedia(city).catch((err) => console.error('Erro no scraping Expedia:', err));
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao iniciar scraping', details: error.message });
  }
});

// GET scraping status
router.get('/status', async (req, res) => {
  try {
    const lastScrapedAccommodations = await Accommodation.find({ isActive: true })
      .sort({ lastScrapedAt: -1 })
      .limit(10)
      .select('name city lastScrapedAt source.platform');

    const stats = await Accommodation.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$source.platform',
          count: { $sum: 1 },
          lastUpdate: { $max: '$lastScrapedAt' },
        },
      },
    ]);

    res.json({
      lastScrapedAccommodations,
      statsByPlatform: stats,
      totalActive: await Accommodation.countDocuments({ isActive: true }),
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar status', details: error.message });
  }
});

// GET cities that need scraping update
router.get('/cities-to-update', async (req, res) => {
  try {
    const { hoursThreshold = 6 } = req.query;

    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - Number(hoursThreshold));

    const cities = await Accommodation.aggregate([
      { $match: { isActive: true, lastScrapedAt: { $lt: thresholdDate } } },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          oldestUpdate: { $min: '$lastScrapedAt' },
        },
      },
      { $sort: { oldestUpdate: 1 } },
    ]);

    res.json({
      citiesToUpdate: cities,
      threshold: `${hoursThreshold} horas`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cidades para atualizar', details: error.message });
  }
});

export default router;
