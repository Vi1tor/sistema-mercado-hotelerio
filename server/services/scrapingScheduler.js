import Accommodation from '../models/Accommodation.js';

/**
 * Scheduler for periodic scraping
 */
export async function scheduledScraping() {
  try {
    console.log('🕐 Iniciando scraping agendado...');

    // Get cities that need updating (not updated in the last 6 hours)
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    const citiesToUpdate = await Accommodation.aggregate([
      { $match: { isActive: true, lastScrapedAt: { $lt: sixHoursAgo } } },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          oldestUpdate: { $min: '$lastScrapedAt' },
        },
      },
      { $sort: { oldestUpdate: 1 } },
      { $limit: 5 }, // Process 5 cities at a time
    ]);

    console.log(`📍 ${citiesToUpdate.length} cidades precisam de atualização`);

    for (const cityGroup of citiesToUpdate) {
      const city = cityGroup._id;
      console.log(`🔄 Atualizando dados de ${city}...`);

      // Here you would call your scraping functions
      // For now, we'll just update the lastScrapedAt field
      await Accommodation.updateMany(
        { city: new RegExp(city, 'i'), isActive: true },
        { $set: { lastScrapedAt: new Date() } }
      );

      console.log(`✅ Dados de ${city} atualizados`);
    }

    console.log('✅ Scraping agendado concluído');
  } catch (error) {
    console.error('❌ Erro no scraping agendado:', error);
  }
}

/**
 * Check price changes and trigger alerts
 */
export async function checkPriceAlerts() {
  try {
    const accommodations = await Accommodation.find({ isActive: true });

    for (const accommodation of accommodations) {
      const trend = accommodation.getPriceTrend(7);

      // Check for significant price changes (>15%)
      if (Math.abs(trend) > 15) {
        console.log(`⚠️ Alerta: ${accommodation.name} teve mudança de ${trend.toFixed(1)}% no preço`);
        
        // Here you would trigger notifications
        // For now, just log it
      }
    }
  } catch (error) {
    console.error('Erro ao verificar alertas de preço:', error);
  }
}
