import puppeteer from 'puppeteer';
import Accommodation from '../models/Accommodation.js';

/**
 * Scrape accommodations from Booking.com
 * Note: This is a simplified example. Real scraping should respect robots.txt and terms of service
 */
export async function scrapeBooking(city) {
  console.log(`🔍 Iniciando scraping Booking para ${city}...`);

  try {
    // In a real implementation, you would:
    // 1. Launch Puppeteer
    // 2. Navigate to Booking.com search results
    // 3. Extract accommodation data
    // 4. Save to database

    // For demonstration, we'll create sample data
    const sampleAccommodations = generateSampleData(city, 'booking');

    for (const accData of sampleAccommodations) {
      // Check if accommodation already exists
      let accommodation = await Accommodation.findOne({
        'source.externalId': accData.source.externalId,
        'source.platform': 'booking',
      });

      if (accommodation) {
        // Update existing accommodation
        const oldPrice = accommodation.currentPrice;
        accommodation.currentPrice = accData.currentPrice;
        accommodation.availability = accData.availability;
        accommodation.rating = accData.rating;
        accommodation.lastScrapedAt = new Date();

        // Add price to history if changed
        if (oldPrice !== accData.currentPrice) {
          await accommodation.addPriceToHistory(
            accData.currentPrice,
            accData.availability.isAvailable,
            accData.availability.occupancyRate
          );
        }

        await accommodation.save();
      } else {
        // Create new accommodation
        accommodation = new Accommodation(accData);
        await accommodation.save();
      }
    }

    console.log(`✅ Scraping Booking concluído: ${sampleAccommodations.length} hospedagens`);
  } catch (error) {
    console.error('❌ Erro no scraping Booking:', error);
    throw error;
  }
}

/**
 * Scrape accommodations from Expedia
 */
export async function scrapeExpedia(city) {
  console.log(`🔍 Iniciando scraping Expedia para ${city}...`);

  try {
    // Similar implementation as Booking
    const sampleAccommodations = generateSampleData(city, 'expedia');

    for (const accData of sampleAccommodations) {
      let accommodation = await Accommodation.findOne({
        'source.externalId': accData.source.externalId,
        'source.platform': 'expedia',
      });

      if (accommodation) {
        const oldPrice = accommodation.currentPrice;
        accommodation.currentPrice = accData.currentPrice;
        accommodation.availability = accData.availability;
        accommodation.rating = accData.rating;
        accommodation.lastScrapedAt = new Date();

        if (oldPrice !== accData.currentPrice) {
          await accommodation.addPriceToHistory(
            accData.currentPrice,
            accData.availability.isAvailable,
            accData.availability.occupancyRate
          );
        }

        await accommodation.save();
      } else {
        accommodation = new Accommodation(accData);
        await accommodation.save();
      }
    }

    console.log(`✅ Scraping Expedia concluído: ${sampleAccommodations.length} hospedagens`);
  } catch (error) {
    console.error('❌ Erro no scraping Expedia:', error);
    throw error;
  }
}

/**
 * Generate sample accommodation data for demonstration
 */
function generateSampleData(city, platform) {
  const types = ['hotel', 'pousada', 'resort', 'hostel', 'chalé'];
  const neighborhoods = ['Centro', 'Praia', 'Montanha', 'Zona Sul', 'Zona Norte'];
  
  const accommodations = [];
  const count = Math.floor(Math.random() * 10) + 15; // 15-25 accommodations

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const basePrice = type === 'resort' ? 500 : type === 'hotel' ? 300 : type === 'pousada' ? 200 : 150;
    const priceVariation = Math.random() * 200 - 100;

    accommodations.push({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${city} ${i + 1}`,
      type,
      city,
      state: 'SP', // You would detect this from the city
      neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
      currentPrice: Math.max(100, basePrice + priceVariation),
      currency: 'BRL',
      rating: {
        score: Math.random() * 3 + 7, // 7-10
        totalReviews: Math.floor(Math.random() * 500) + 50,
      },
      amenities: ['WiFi', 'Café da manhã', 'Ar condicionado'],
      capacity: {
        rooms: Math.floor(Math.random() * 50) + 10,
        guests: Math.floor(Math.random() * 100) + 20,
      },
      availability: {
        isAvailable: Math.random() > 0.3,
        occupancyRate: Math.random() * 100,
      },
      source: {
        platform,
        externalId: `${platform}-${city.toLowerCase()}-${i + 1}`,
        url: `https://${platform}.com/hotel/${i + 1}`,
      },
      location: {
        type: 'Point',
        coordinates: [-46.6333 + Math.random() * 0.1, -23.5505 + Math.random() * 0.1],
      },
      lastScrapedAt: new Date(),
      isActive: true,
    });
  }

  return accommodations;
}

export default {
  scrapeBooking,
  scrapeExpedia,
};
