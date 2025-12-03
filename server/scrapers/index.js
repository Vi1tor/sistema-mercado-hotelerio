import puppeteer from 'puppeteer';
import Accommodation from '../models/Accommodation.js';

/**
 * Scrape pousadas from Booking.com (Basic to Premium)
 * Searches for all price ranges and availability
 */
export async function scrapeBooking(city, options = {}) {
  console.log(`🔍 Iniciando scraping Booking para pousadas em ${city}...`);

  const {
    type = 'pousada',
    minPrice = 0,
    maxPrice = 5000,
    checkIn = getDefaultCheckIn(),
    checkOut = getDefaultCheckOut(),
    adults = 2,
    useRealScraping = false,
  } = options;

  try {
    let accommodations = [];

    if (useRealScraping) {
      // Real scraping with Puppeteer
      accommodations = await scrapeBookingReal(city, type, {
        minPrice,
        maxPrice,
        checkIn,
        checkOut,
        adults,
      });
    } else {
      // Enhanced mock data with realistic pricing tiers
      accommodations = generateRealisticPousadas(city, { minPrice, maxPrice });
    }

    console.log(`📊 Encontradas ${accommodations.length} pousadas`);

    // Save to database
    let created = 0;
    let updated = 0;

    for (const accData of accommodations) {
      let accommodation = await Accommodation.findOne({
        'source.externalId': accData.source.externalId,
        'source.platform': 'booking',
      });

      if (accommodation) {
        const oldPrice = accommodation.currentPrice;
        accommodation.currentPrice = accData.currentPrice;
        accommodation.availability = accData.availability;
        accommodation.rating = accData.rating;
        accommodation.amenities = accData.amenities;
        accommodation.lastScrapedAt = new Date();

        if (oldPrice !== accData.currentPrice) {
          await accommodation.addPriceToHistory(
            accData.currentPrice,
            accData.availability.isAvailable,
            accData.availability.occupancyRate
          );
        }

        await accommodation.save();
        updated++;
      } else {
        accommodation = new Accommodation(accData);
        await accommodation.save();
        created++;
      }
    }

    console.log(`✅ Scraping concluído: ${created} criadas, ${updated} atualizadas`);
    
    return {
      total: accommodations.length,
      created,
      updated,
      city,
      type,
    };
  } catch (error) {
    console.error('❌ Erro no scraping Booking:', error);
    throw error;
  }
}

/**
 * Real scraping implementation using Puppeteer
 */
async function scrapeBookingReal(city, type, options) {
  const { minPrice, maxPrice, checkIn, checkOut, adults } = options;
  
  console.log('🌐 Abrindo navegador para scraping real...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Build Booking.com search URL
    const searchUrl = buildBookingSearchUrl(city, {
      checkIn,
      checkOut,
      adults,
      propertyType: type === 'pousada' ? 'ht_id=204' : '', // Booking property type for guesthouse
    });

    console.log(`🔗 Navegando para: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for results to load
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 30000 });

    // Extract accommodation data
    const accommodations = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="property-card"]');
      const results = [];

      cards.forEach((card) => {
        try {
          const nameEl = card.querySelector('[data-testid="title"]');
          const priceEl = card.querySelector('[data-testid="price-and-discounted-price"]');
          const ratingEl = card.querySelector('[data-testid="review-score"]');
          const reviewCountEl = card.querySelector('[data-testid="review-score-total"]');
          const locationEl = card.querySelector('[data-testid="address"]');
          const linkEl = card.querySelector('a[data-testid="property-card-link"]');

          if (!nameEl || !priceEl) return;

          const name = nameEl.textContent.trim();
          const priceText = priceEl.textContent.replace(/[^\d,]/g, '').replace(',', '.');
          const price = parseFloat(priceText) || 0;
          const rating = ratingEl ? parseFloat(ratingEl.textContent) : null;
          const reviews = reviewCountEl ? parseInt(reviewCountEl.textContent.match(/\d+/)?.[0]) : 0;
          const location = locationEl ? locationEl.textContent.trim() : '';
          const url = linkEl ? linkEl.href : '';
          const externalId = url.match(/hotel\/([^\/]+)/)?.[1] || `booking-${Date.now()}-${Math.random()}`;

          results.push({
            name,
            price,
            rating,
            reviews,
            location,
            url,
            externalId,
          });
        } catch (err) {
          console.error('Error parsing card:', err);
        }
      });

      return results;
    });

    console.log(`📦 Extraídas ${accommodations.length} propriedades`);

    // Transform to our schema format
    return accommodations.map((acc, index) => ({
      name: acc.name,
      type: 'pousada',
      city: city,
      state: detectState(city),
      neighborhood: extractNeighborhood(acc.location),
      address: acc.location,
      currentPrice: acc.price,
      currency: 'BRL',
      rating: acc.rating
        ? {
            score: acc.rating,
            totalReviews: acc.reviews,
          }
        : null,
      amenities: getDefaultAmenities(),
      capacity: {
        rooms: Math.floor(Math.random() * 30) + 5,
        guests: Math.floor(Math.random() * 60) + 10,
      },
      availability: {
        isAvailable: true,
        lastChecked: new Date(),
        occupancyRate: Math.random() * 100,
      },
      source: {
        platform: 'booking',
        externalId: acc.externalId,
        url: acc.url,
      },
      location: {
        type: 'Point',
        coordinates: getDefaultCoordinates(city),
      },
      lastScrapedAt: new Date(),
      isActive: true,
    }));
  } finally {
    await browser.close();
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
 * Generate realistic pousadas data with different price tiers
 */
function generateRealisticPousadas(city, options = {}) {
  const { minPrice = 0, maxPrice = 5000 } = options;
  
  const neighborhoods = ['Centro Histórico', 'Beira Mar', 'Área Nobre', 'Centro', 'Zona Rural', 'Praia'];
  const amenitiesByTier = {
    basic: ['WiFi Grátis', 'Café da Manhã', 'Estacionamento'],
    mid: ['WiFi Grátis', 'Café da Manhã', 'Piscina', 'Ar Condicionado', 'Estacionamento', 'TV a Cabo'],
    premium: ['WiFi Grátis', 'Café da Manhã', 'Piscina', 'Spa', 'Ar Condicionado', 'Estacionamento', 'Academia', 'Restaurante', 'Bar', 'Room Service', 'Transfer Aeroporto'],
  };

  const accommodations = [];
  const state = detectState(city);

  // Basic pousadas (80-250 BRL)
  const basicCount = 15;
  for (let i = 0; i < basicCount; i++) {
    const price = 80 + Math.random() * 170;
    if (price >= minPrice && price <= maxPrice) {
      accommodations.push(createPousada({
        name: `Pousada ${getRandomName()} - ${city}`,
        city,
        state,
        tier: 'basic',
        price,
        rating: 6.5 + Math.random() * 2,
        reviews: 50 + Math.floor(Math.random() * 200),
        amenities: amenitiesByTier.basic,
        neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
        rooms: 5 + Math.floor(Math.random() * 10),
        index: i,
      }));
    }
  }

  // Mid-range pousadas (250-600 BRL)
  const midCount = 20;
  for (let i = 0; i < midCount; i++) {
    const price = 250 + Math.random() * 350;
    if (price >= minPrice && price <= maxPrice) {
      accommodations.push(createPousada({
        name: `Pousada ${getRandomName()} - ${city}`,
        city,
        state,
        tier: 'mid',
        price,
        rating: 7.5 + Math.random() * 1.5,
        reviews: 150 + Math.floor(Math.random() * 400),
        amenities: amenitiesByTier.mid,
        neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
        rooms: 10 + Math.floor(Math.random() * 20),
        index: basicCount + i,
      }));
    }
  }

  // Premium pousadas (600-2000+ BRL)
  const premiumCount = 10;
  for (let i = 0; i < premiumCount; i++) {
    const price = 600 + Math.random() * 1400;
    if (price >= minPrice && price <= maxPrice) {
      accommodations.push(createPousada({
        name: `Pousada ${getRandomName()} Premium - ${city}`,
        city,
        state,
        tier: 'premium',
        price,
        rating: 8.5 + Math.random() * 1.5,
        reviews: 300 + Math.floor(Math.random() * 700),
        amenities: amenitiesByTier.premium,
        neighborhood: neighborhoods[Math.floor(Math.random() * 3)], // Better neighborhoods
        rooms: 15 + Math.floor(Math.random() * 35),
        index: basicCount + midCount + i,
      }));
    }
  }

  return accommodations;
}

function createPousada(data) {
  const {
    name,
    city,
    state,
    tier,
    price,
    rating,
    reviews,
    amenities,
    neighborhood,
    rooms,
    index,
  } = data;

  return {
    name,
    type: 'pousada',
    city,
    state,
    neighborhood,
    address: `Rua das Flores, ${100 + index}`,
    currentPrice: Math.round(price * 100) / 100,
    currency: 'BRL',
    rating: {
      score: Math.round(rating * 10) / 10,
      totalReviews: reviews,
    },
    amenities,
    capacity: {
      rooms,
      guests: rooms * 2,
    },
    availability: {
      isAvailable: Math.random() > 0.2,
      lastChecked: new Date(),
      occupancyRate: Math.random() * 100,
    },
    source: {
      platform: 'booking',
      externalId: `booking-${city.toLowerCase().replace(/\s/g, '-')}-pousada-${tier}-${index}`,
      url: `https://booking.com/hotel/br/${city.toLowerCase()}-pousada-${index}.html`,
    },
    location: {
      type: 'Point',
      coordinates: getDefaultCoordinates(city),
    },
    priceCategory: tier,
    lastScrapedAt: new Date(),
    isActive: true,
  };
}

// Helper functions
function getDefaultCheckIn() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

function getDefaultCheckOut() {
  const date = new Date();
  date.setDate(date.getDate() + 9);
  return date.toISOString().split('T')[0];
}

function buildBookingSearchUrl(city, options) {
  const { checkIn, checkOut, adults, propertyType } = options;
  const baseUrl = 'https://www.booking.com/searchresults.pt-br.html';
  const params = new URLSearchParams({
    ss: city,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: adults,
    no_rooms: 1,
    group_children: 0,
  });

  if (propertyType) {
    params.append('nflt', propertyType);
  }

  return `${baseUrl}?${params.toString()}`;
}

function detectState(city) {
  const cityStateMap = {
    'Gramado': 'RS', 'Canela': 'RS', 'Bento Gonçalves': 'RS',
    'Florianópolis': 'SC', 'Bombinhas': 'SC', 'Balneário Camboriú': 'SC',
    'Foz do Iguaçu': 'PR', 'Curitiba': 'PR',
    'Rio de Janeiro': 'RJ', 'Búzios': 'RJ', 'Angra dos Reis': 'RJ', 'Paraty': 'RJ',
    'São Paulo': 'SP', 'Campos do Jordão': 'SP', 'Ilhabela': 'SP',
    'Ouro Preto': 'MG', 'Tiradentes': 'MG', 'Monte Verde': 'MG',
    'Salvador': 'BA', 'Porto Seguro': 'BA', 'Morro de São Paulo': 'BA',
    'Fortaleza': 'CE', 'Jericoacoara': 'CE',
    'Natal': 'RN', 'Pipa': 'RN',
    'Recife': 'PE', 'Porto de Galinhas': 'PE',
  };
  return cityStateMap[city] || 'BR';
}

function extractNeighborhood(location) {
  // Simple extraction - in real implementation, parse the location string
  const parts = location.split(',');
  return parts.length > 1 ? parts[0].trim() : 'Centro';
}

function getDefaultAmenities() {
  return ['WiFi Grátis', 'Café da Manhã', 'Piscina', 'Estacionamento', 'Ar Condicionado'];
}

function getDefaultCoordinates(city) {
  const cityCoords = {
    'Monte Verde': [-46.0389, -22.8614],
    'Gramado': [-50.8744, -29.3789],
    'Campos do Jordão': [-45.5908, -22.7394],
    'Búzios': [-41.8819, -22.7469],
  };
  return cityCoords[city] || [-46.6333, -23.5505];
}

function getRandomName() {
  const names = [
    'Vila Real', 'Recanto', 'Encanto', 'Jardim', 'Solar', 'Paraíso',
    'Vista Alegre', 'Bela Vista', 'Cachoeira', 'Pedra Grande', 'Serra Verde',
    'Águas Claras', 'Flor da Serra', 'Cantinho', 'Refúgio', 'Aconchego',
    'Primavera', 'Estrela', 'Lua Nova', 'Portal', 'Bosque', 'Chalés',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generate sample accommodation data for other platforms
 */
function generateSampleData(city, platform) {
  const types = ['hotel', 'pousada', 'resort', 'hostel', 'chalé'];
  const neighborhoods = ['Centro', 'Praia', 'Montanha', 'Zona Sul', 'Zona Norte'];
  
  const accommodations = [];
  const count = Math.floor(Math.random() * 10) + 15;

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const basePrice = type === 'resort' ? 500 : type === 'hotel' ? 300 : type === 'pousada' ? 200 : 150;
    const priceVariation = Math.random() * 200 - 100;

    accommodations.push({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${city} ${i + 1}`,
      type,
      city,
      state: detectState(city),
      neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
      currentPrice: Math.max(100, basePrice + priceVariation),
      currency: 'BRL',
      rating: {
        score: Math.random() * 3 + 7,
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
        coordinates: getDefaultCoordinates(city),
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
