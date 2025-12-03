// Mock data para funcionar sem conexão com MongoDB
export const mockCities = [
  // Sul
  { name: 'Gramado', state: 'RS' },
  { name: 'Canela', state: 'RS' },
  { name: 'Bento Gonçalves', state: 'RS' },
  { name: 'Cambará do Sul', state: 'RS' },
  { name: 'Florianópolis', state: 'SC' },
  { name: 'Bombinhas', state: 'SC' },
  { name: 'Balneário Camboriú', state: 'SC' },
  { name: 'Blumenau', state: 'SC' },
  { name: 'Foz do Iguaçu', state: 'PR' },
  { name: 'Curitiba', state: 'PR' },
  { name: 'Morretes', state: 'PR' },
  
  // Sudeste
  { name: 'Rio de Janeiro', state: 'RJ' },
  { name: 'Búzios', state: 'RJ' },
  { name: 'Angra dos Reis', state: 'RJ' },
  { name: 'Paraty', state: 'RJ' },
  { name: 'Cabo Frio', state: 'RJ' },
  { name: 'Petrópolis', state: 'RJ' },
  { name: 'São Paulo', state: 'SP' },
  { name: 'Campos do Jordão', state: 'SP' },
  { name: 'Ilhabela', state: 'SP' },
  { name: 'Ubatuba', state: 'SP' },
  { name: 'Guarujá', state: 'SP' },
  { name: 'Santos', state: 'SP' },
  { name: 'Brotas', state: 'SP' },
  { name: 'Belo Horizonte', state: 'MG' },
  { name: 'Ouro Preto', state: 'MG' },
  { name: 'Tiradentes', state: 'MG' },
  { name: 'São Lourenço', state: 'MG' },
  { name: 'Capitólio', state: 'MG' },
  { name: 'Monte Verde', state: 'MG' },
  { name: 'Vitória', state: 'ES' },
  { name: 'Guarapari', state: 'ES' },
  
  // Nordeste
  { name: 'Salvador', state: 'BA' },
  { name: 'Porto Seguro', state: 'BA' },
  { name: 'Morro de São Paulo', state: 'BA' },
  { name: 'Trancoso', state: 'BA' },
  { name: 'Arraial d\'Ajuda', state: 'BA' },
  { name: 'Praia do Forte', state: 'BA' },
  { name: 'Fortaleza', state: 'CE' },
  { name: 'Jericoacoara', state: 'CE' },
  { name: 'Canoa Quebrada', state: 'CE' },
  { name: 'Natal', state: 'RN' },
  { name: 'Pipa', state: 'RN' },
  { name: 'São Miguel do Gostoso', state: 'RN' },
  { name: 'Recife', state: 'PE' },
  { name: 'Porto de Galinhas', state: 'PE' },
  { name: 'Fernando de Noronha', state: 'PE' },
  { name: 'Maragogi', state: 'AL' },
  { name: 'Maceió', state: 'AL' },
  { name: 'Aracaju', state: 'SE' },
  { name: 'João Pessoa', state: 'PB' },
  { name: 'Campina Grande', state: 'PB' },
  { name: 'São Luís', state: 'MA' },
  { name: 'Lençóis Maranhenses', state: 'MA' },
  
  // Centro-Oeste
  { name: 'Brasília', state: 'DF' },
  { name: 'Bonito', state: 'MS' },
  { name: 'Caldas Novas', state: 'GO' },
  { name: 'Pirenópolis', state: 'GO' },
  { name: 'Chapada dos Veadeiros', state: 'GO' },
  { name: 'Cuiabá', state: 'MT' },
  { name: 'Chapada dos Guimarães', state: 'MT' },
  
  // Norte
  { name: 'Manaus', state: 'AM' },
  { name: 'Alter do Chão', state: 'PA' },
  { name: 'Belém', state: 'PA' },
  { name: 'Jalapão', state: 'TO' },
  { name: 'Palmas', state: 'TO' },
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

    const variation = (Math.random() - 0.5) * 0.3;
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

export function generateMockAccommodations(cityName, count = 30) {
  const accommodations = [];
  const cityData = mockCities.find(c => c.name === cityName);
  
  if (!cityData) return [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    
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
    const rating = 6 + Math.random() * 4;
    const totalReviews = Math.floor(Math.random() * 500) + 20;

    accommodations.push({
      _id: `mock-${cityName}-${i}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${cityData.name} ${i + 1}`,
      type,
      city: cityData.name,
      state: cityData.state,
      neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
      address: `Rua Exemplo, ${Math.floor(Math.random() * 1000) + 1}`,
      location: {
        type: 'Point',
        coordinates: [
          -46.6 + Math.random() * 0.2,
          -23.5 + Math.random() * 0.2,
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
      getPriceTrend: function(days = 7) {
        const recentHistory = this.priceHistory.slice(-days);
        if (recentHistory.length < 2) return 0;
        
        const firstPrice = recentHistory[0].price;
        const lastPrice = recentHistory[recentHistory.length - 1].price;
        
        return ((lastPrice - firstPrice) / firstPrice) * 100;
      }
    });
  }

  return accommodations;
}

export function generateMockAnalysis(cityName) {
  const mockAccommodations = generateMockAccommodations(cityName, 50);
  
  const avgPrice = mockAccommodations.reduce((sum, acc) => sum + acc.currentPrice, 0) / mockAccommodations.length;
  const avgOccupancy = mockAccommodations.reduce((sum, acc) => sum + acc.availability.occupancyRate, 0) / mockAccommodations.length;
  const avgRating = mockAccommodations.reduce((sum, acc) => sum + acc.rating.score, 0) / mockAccommodations.length;
  
  const demandScore = Math.round(
    (avgOccupancy * 0.3) +
    (Math.random() * 30) +
    (avgRating * 10 * 0.2) +
    (Math.random() * 20)
  );
  
  return {
    _id: `mock-analysis-${cityName}`,
    city: cityName,
    state: mockCities.find(c => c.name === cityName)?.state || 'SP',
    analysisDate: new Date(),
    demandAnalysis: {
      level: demandScore > 75 ? 'muito alta' : demandScore > 50 ? 'alta' : demandScore > 25 ? 'média' : 'baixa',
      score: demandScore,
      trend: ['crescente', 'estável', 'decrescente'][Math.floor(Math.random() * 3)],
      factors: [
        'Alta ocupação média',
        'Crescimento de avaliações positivas',
        'Aumento de preços recente',
      ],
    },
    priceAnalysis: {
      average: Math.round(avgPrice * 100) / 100,
      median: Math.round(avgPrice * 0.95 * 100) / 100,
      min: Math.round(avgPrice * 0.5 * 100) / 100,
      max: Math.round(avgPrice * 2 * 100) / 100,
      byType: types.reduce((acc, type) => {
        const typeAccs = mockAccommodations.filter(a => a.type === type);
        if (typeAccs.length > 0) {
          acc[type] = {
            average: Math.round(typeAccs.reduce((sum, a) => sum + a.currentPrice, 0) / typeAccs.length * 100) / 100,
            count: typeAccs.length,
          };
        }
        return acc;
      }, {}),
    },
    occupancyAnalysis: {
      average: Math.round(avgOccupancy * 10) / 10,
      total: mockAccommodations.length,
      byType: types.reduce((acc, type) => {
        const typeAccs = mockAccommodations.filter(a => a.type === type);
        if (typeAccs.length > 0) {
          acc[type] = {
            average: Math.round(typeAccs.reduce((sum, a) => sum + a.availability.occupancyRate, 0) / typeAccs.length * 10) / 10,
            count: typeAccs.length,
          };
        }
        return acc;
      }, {}),
    },
    ratingAnalysis: {
      average: Math.round(avgRating * 10) / 10,
      distribution: {
        excellent: Math.floor(mockAccommodations.filter(a => a.rating.score >= 9).length),
        good: Math.floor(mockAccommodations.filter(a => a.rating.score >= 7 && a.rating.score < 9).length),
        average: Math.floor(mockAccommodations.filter(a => a.rating.score < 7).length),
      },
    },
    alerts: [
      {
        type: 'oportunidade',
        severity: 'info',
        message: 'Demanda crescente detectada nesta região',
        date: new Date(),
      },
    ],
    recommendations: [
      {
        title: 'Ajuste de Preços',
        description: 'Considere ajustar preços com base na demanda atual',
        priority: 'alta',
        impact: 'médio',
      },
    ],
  };
}
