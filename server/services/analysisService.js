import Accommodation from '../models/Accommodation.js';
import MarketAnalysis from '../models/MarketAnalysis.js';

/**
 * Analyze demand for a specific city
 */
export async function analyzeCityDemand(city) {
  try {
    const accommodations = await Accommodation.find({
      city: new RegExp(city, 'i'),
      isActive: true,
    });

    if (accommodations.length === 0) {
      return {
        city,
        demandLevel: 'baixa',
        score: 0,
        message: 'Nenhuma hospedagem encontrada para análise',
      };
    }

    let score = 0;
    const factors = [];

    // Factor 1: Occupancy rate (0-30 points)
    const availableCount = accommodations.filter((acc) => acc.availability.isAvailable).length;
    const occupancyRate = ((accommodations.length - availableCount) / accommodations.length) * 100;
    const occupancyScore = Math.min(30, (occupancyRate / 100) * 30);
    score += occupancyScore;
    factors.push(`Taxa de ocupação: ${occupancyRate.toFixed(1)}%`);

    // Factor 2: Price trends (0-30 points)
    const priceIncreases = accommodations.filter((acc) => {
      const trend = acc.getPriceTrend(30);
      return trend > 10; // More than 10% increase
    }).length;
    const priceIncreaseRate = (priceIncreases / accommodations.length) * 100;
    const priceScore = Math.min(30, (priceIncreaseRate / 50) * 30);
    score += priceScore;
    if (priceIncreaseRate > 20) {
      factors.push(`${priceIncreaseRate.toFixed(0)}% das hospedagens aumentaram preços`);
    }

    // Factor 3: Rating and reviews (0-20 points)
    const highlyRated = accommodations.filter((acc) => acc.rating?.score >= 8 && acc.rating?.totalReviews >= 50).length;
    const highRatingRate = (highlyRated / accommodations.length) * 100;
    const ratingScore = Math.min(20, (highRatingRate / 50) * 20);
    score += ratingScore;
    if (highRatingRate > 30) {
      factors.push(`${highRatingRate.toFixed(0)}% das hospedagens bem avaliadas`);
    }

    // Factor 4: Recent activity (0-20 points)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentlyUpdated = accommodations.filter((acc) => acc.lastScrapedAt >= oneDayAgo).length;
    const activityRate = (recentlyUpdated / accommodations.length) * 100;
    const activityScore = Math.min(20, (activityRate / 100) * 20);
    score += activityScore;

    // Determine demand level
    let demandLevel;
    if (score >= 75) demandLevel = 'muito alta';
    else if (score >= 50) demandLevel = 'alta';
    else if (score >= 25) demandLevel = 'média';
    else demandLevel = 'baixa';

    // Determine trend
    let trend;
    if (priceScore > 15 && occupancyScore > 15) trend = 'crescente';
    else if (priceScore < 5 && occupancyScore < 15) trend = 'decrescente';
    else trend = 'estável';

    return {
      city,
      level: demandLevel,
      demandLevel, // Keep for backwards compatibility
      score: Math.round(score),
      trend,
      factors,
      metrics: {
        occupancyRate: parseFloat(occupancyRate.toFixed(1)),
        priceIncreaseRate: parseFloat(priceIncreaseRate.toFixed(1)),
        highRatingRate: parseFloat(highRatingRate.toFixed(1)),
        activityRate: parseFloat(activityRate.toFixed(1)),
      },
    };
  } catch (error) {
    console.error('Erro ao analisar demanda:', error);
    throw error;
  }
}

/**
 * Generate comprehensive market analysis for a city
 */
export async function generateMarketAnalysis(city) {
  try {
    const accommodations = await Accommodation.find({
      city: new RegExp(city, 'i'),
      isActive: true,
    });

    if (accommodations.length === 0) {
      throw new Error('Nenhuma hospedagem encontrada para análise');
    }

    // Demand Analysis
    const demandData = await analyzeCityDemand(city);

    // Price Analysis
    const prices = accommodations.map((acc) => acc.currentPrice);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const priceAnalysis = {
      averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      medianPrice: sortedPrices[Math.floor(sortedPrices.length / 2)],
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      priceVariation: ((Math.max(...prices) - Math.min(...prices)) / Math.min(...prices)) * 100,
      byType: [],
    };

    // Group by type
    const typeGroups = {};
    accommodations.forEach((acc) => {
      if (!typeGroups[acc.type]) {
        typeGroups[acc.type] = [];
      }
      typeGroups[acc.type].push(acc.currentPrice);
    });

    Object.entries(typeGroups).forEach(([type, prices]) => {
      priceAnalysis.byType.push({
        type,
        averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        count: prices.length,
      });
    });

    // Occupancy Analysis
    const availableCount = accommodations.filter((acc) => acc.availability.isAvailable).length;
    const occupancyAnalysis = {
      averageOccupancy: ((accommodations.length - availableCount) / accommodations.length) * 100,
      totalAccommodations: accommodations.length,
      availableAccommodations: availableCount,
      occupancyRate: ((accommodations.length - availableCount) / accommodations.length) * 100,
      byType: [],
    };

    Object.keys(typeGroups).forEach((type) => {
      const typeAccs = accommodations.filter((acc) => acc.type === type);
      const typeAvailable = typeAccs.filter((acc) => acc.availability.isAvailable).length;
      occupancyAnalysis.byType.push({
        type,
        occupancyRate: ((typeAccs.length - typeAvailable) / typeAccs.length) * 100,
        count: typeAccs.length,
      });
    });

    // Rating Analysis
    const ratedAccommodations = accommodations.filter((acc) => acc.rating?.score);
    const ratingAnalysis = {
      averageRating: ratedAccommodations.length > 0
        ? ratedAccommodations.reduce((sum, acc) => sum + acc.rating.score, 0) / ratedAccommodations.length
        : 0,
      totalReviews: accommodations.reduce((sum, acc) => sum + (acc.rating?.totalReviews || 0), 0),
      distributionByScore: [
        {
          scoreRange: '0-5',
          count: ratedAccommodations.filter((acc) => acc.rating.score < 5).length,
          percentage: 0,
        },
        {
          scoreRange: '5-7',
          count: ratedAccommodations.filter((acc) => acc.rating.score >= 5 && acc.rating.score < 7).length,
          percentage: 0,
        },
        {
          scoreRange: '7-8.5',
          count: ratedAccommodations.filter((acc) => acc.rating.score >= 7 && acc.rating.score < 8.5).length,
          percentage: 0,
        },
        {
          scoreRange: '8.5-10',
          count: ratedAccommodations.filter((acc) => acc.rating.score >= 8.5).length,
          percentage: 0,
        },
      ],
    };

    ratingAnalysis.distributionByScore.forEach((dist) => {
      dist.percentage = (dist.count / ratedAccommodations.length) * 100;
    });

    // Competitive Analysis
    const topPerformers = accommodations
      .filter((acc) => acc.rating?.score && acc.rating.totalReviews >= 20)
      .sort((a, b) => b.rating.score - a.rating.score)
      .slice(0, 5)
      .map((acc) => ({
        accommodationId: acc._id,
        name: acc.name,
        score: acc.rating.score,
      }));

    const priceLeaders = [...accommodations]
      .sort((a, b) => b.currentPrice - a.currentPrice)
      .slice(0, 5)
      .map((acc) => ({
        accommodationId: acc._id,
        name: acc.name,
        price: acc.currentPrice,
      }));

    // Generate alerts
    const alerts = [];

    // Price surge alert
    const highPriceCount = accommodations.filter((acc) => {
      const trend = acc.getPriceTrend(7);
      return trend > 20;
    }).length;

    if (highPriceCount > accommodations.length * 0.3) {
      alerts.push({
        type: 'price_surge',
        severity: 'high',
        message: `${highPriceCount} hospedagens com aumento significativo de preço (>20%) na última semana`,
        affectedAccommodations: highPriceCount,
      });
    }

    // Low availability alert
    if (occupancyAnalysis.occupancyRate > 80) {
      alerts.push({
        type: 'low_availability',
        severity: 'high',
        message: `Alta taxa de ocupação: ${occupancyAnalysis.occupancyRate.toFixed(1)}%`,
        affectedAccommodations: accommodations.length - availableCount,
      });
    }

    // Generate recommendations
    const recommendations = [];

    if (demandData.demandLevel === 'alta' || demandData.demandLevel === 'muito alta') {
      recommendations.push({
        category: 'Demanda',
        title: 'Alta demanda detectada',
        description: 'Considere ajustar preços ou expandir capacidade devido à alta demanda',
        priority: 'high',
      });
    }

    if (priceAnalysis.priceVariation > 100) {
      recommendations.push({
        category: 'Preços',
        title: 'Grande variação de preços',
        description: 'Há uma variação significativa entre os preços. Analise oportunidades de reposicionamento',
        priority: 'medium',
      });
    }

    // Create and save analysis
    const analysis = new MarketAnalysis({
      city,
      state: accommodations[0].state,
      demandAnalysis: {
        level: demandData.demandLevel,
        score: demandData.score,
        trend: demandData.trend,
        factors: demandData.factors,
      },
      priceAnalysis,
      occupancyAnalysis,
      ratingAnalysis,
      competitiveAnalysis: {
        topPerformers,
        priceLeaders,
      },
      alerts,
      recommendations,
    });

    await analysis.save();
    return analysis;
  } catch (error) {
    console.error('Erro ao gerar análise de mercado:', error);
    throw error;
  }
}

/**
 * Run daily analysis for all cities
 */
export async function runDailyAnalysis() {
  try {
    const cities = await Accommodation.distinct('city', { isActive: true });

    console.log(`📊 Executando análise diária para ${cities.length} cidades...`);

    for (const city of cities) {
      try {
        await generateMarketAnalysis(city);
        console.log(`✅ Análise concluída para ${city}`);
      } catch (error) {
        console.error(`❌ Erro ao analisar ${city}:`, error.message);
      }
    }

    console.log('✅ Análise diária concluída');
  } catch (error) {
    console.error('Erro na análise diária:', error);
  }
}
