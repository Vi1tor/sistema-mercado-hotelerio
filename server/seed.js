// Seed script to populate the database with sample data
// Run with: node server/seed.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Accommodation from './models/Accommodation.js';

dotenv.config();

const cities = [
  { name: 'Gramado', state: 'RS' },
  { name: 'Campos do Jordão', state: 'SP' },
  { name: 'Búzios', state: 'RJ' },
  { name: 'Jericoacoara', state: 'CE' },
  { name: 'Fernando de Noronha', state: 'PE' },
  { name: 'Bonito', state: 'MS' },
  { name: 'Porto de Galinhas', state: 'PE' },
  { name: 'Maragogi', state: 'AL' },
];

const types = ['hotel', 'pousada', 'resort', 'hostel', 'chalé', 'apartamento'];
const neighborhoods = ['Centro', 'Praia', 'Montanha', 'Vila', 'Zona Sul', 'Zona Norte'];

const amenities = [
  'WiFi Grátis',
  'Café da Manhã',
  'Estacionamento',
  'Piscina',
  'Ar Condicionado',
  'TV a Cabo',
  'Frigobar',
  'Cofre',
  'Academia',
  'Spa',
  'Restaurante',
  'Bar',
  'Room Service',
  'Lavanderia',
  'Transfer Aeroporto',
];

function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generatePriceHistory(basePrice, days = 30) {
  const history = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const price = basePrice * (1 + variation);
    const occupancyRate = Math.random() * 100;

    history.push({
      date,
      price: Math.round(price * 100) / 100,
      available: Math.random() > 0.3,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
    });
  }

  return history;
}

function generateAccommodations(cityData, count) {
  const accommodations = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Base price depends on type
    let basePrice;
    switch (type) {
      case 'resort':
        basePrice = 800 + Math.random() * 1200;
        break;
      case 'hotel':
        basePrice = 300 + Math.random() * 500;
        break;
      case 'pousada':
        basePrice = 200 + Math.random() * 300;
        break;
      case 'apartamento':
        basePrice = 250 + Math.random() * 350;
        break;
      case 'chalé':
        basePrice = 350 + Math.random() * 450;
        break;
      case 'hostel':
        basePrice = 80 + Math.random() * 120;
        break;
      default:
        basePrice = 200 + Math.random() * 300;
    }

    const currentPrice = Math.round(basePrice * 100) / 100;
    const rating = 6 + Math.random() * 4; // 6-10
    const totalReviews = Math.floor(Math.random() * 500) + 20;

    accommodations.push({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${cityData.name} ${i + 1}`,
      type,
      city: cityData.name,
      state: cityData.state,
      neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
      address: `Rua Exemplo, ${Math.floor(Math.random() * 1000) + 1}`,
      location: {
        type: 'Point',
        coordinates: [
          -46.6 + Math.random() * 0.2, // longitude
          -23.5 + Math.random() * 0.2, // latitude
        ],
      },
      currentPrice,
      currency: 'BRL',
      rating: {
        score: Math.round(rating * 10) / 10,
        totalReviews,
      },
      amenities: getRandomElements(amenities, Math.floor(Math.random() * 8) + 3),
      images: [
        `https://picsum.photos/seed/${i}/800/600`,
        `https://picsum.photos/seed/${i + 1000}/800/600`,
        `https://picsum.photos/seed/${i + 2000}/800/600`,
      ],
      capacity: {
        rooms: Math.floor(Math.random() * 50) + 10,
        guests: Math.floor(Math.random() * 100) + 20,
      },
      availability: {
        isAvailable: Math.random() > 0.3,
        lastChecked: new Date(),
        occupancyRate: Math.round(Math.random() * 100 * 10) / 10,
      },
      source: {
        platform: ['booking', 'expedia', 'airbnb'][Math.floor(Math.random() * 3)],
        externalId: `external-${cityData.name.toLowerCase()}-${i}`,
        url: `https://booking.com/hotel/${i}`,
      },
      priceHistory: generatePriceHistory(currentPrice, 30),
      demandLevel: ['baixa', 'média', 'alta', 'muito alta'][Math.floor(Math.random() * 4)],
      lastScrapedAt: new Date(),
      isActive: true,
    });
  }

  return accommodations;
}

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-market-analysis'
    );
    console.log('✅ Conectado ao MongoDB');

    // Clear existing data
    console.log('🗑️  Limpando dados existentes...');
    await Accommodation.deleteMany({});

    // Generate and insert accommodations for each city
    for (const city of cities) {
      console.log(`📍 Gerando dados para ${city.name}...`);
      const count = Math.floor(Math.random() * 20) + 30; // 30-50 accommodations per city
      const accommodations = generateAccommodations(city, count);
      
      await Accommodation.insertMany(accommodations);
      console.log(`   ✅ ${count} hospedagens criadas para ${city.name}`);
    }

    const total = await Accommodation.countDocuments();
    console.log(`\n🎉 Seed concluído! Total de ${total} hospedagens criadas.`);
    console.log('\n📊 Distribuição por cidade:');
    
    for (const city of cities) {
      const count = await Accommodation.countDocuments({ city: city.name });
      console.log(`   ${city.name}: ${count} hospedagens`);
    }

    console.log('\n✨ Banco de dados populado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    process.exit(1);
  }
}

// Run seed
seed();
