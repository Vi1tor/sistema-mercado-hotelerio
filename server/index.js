import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Import routes
import accommodationRoutes from './routes/accommodations.js';
import analysisRoutes from './routes/analysis.js';
import reportRoutes from './routes/reports.js';
import scrapingRoutes from './routes/scraping.js';

// Import services
import { runDailyAnalysis } from './services/analysisService.js';
import { scheduledScraping } from './services/scrapingScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
global.mongoConnected = false;

if (process.env.USE_MOCK_DATA !== 'true') {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-market-analysis')
    .then(() => {
      console.log('✅ MongoDB conectado com sucesso');
      global.mongoConnected = true;
    })
    .catch((err) => {
      console.error('❌ Erro ao conectar MongoDB:', err);
      console.log('ℹ️  Usando dados MOCK - configure MongoDB para dados reais');
      global.mongoConnected = false;
    });
} else {
  console.log('ℹ️  Modo MOCK DATA ativado - usando dados de exemplo');
  console.log('ℹ️  70+ cidades turísticas brasileiras disponíveis');
  console.log('ℹ️  Para usar dados reais, configure MongoDB e remova USE_MOCK_DATA do .env');
}

// Routes
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/scraping', scrapingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Scheduled Tasks
// Executar scraping a cada 6 horas
cron.schedule('0 */6 * * *', async () => {
  console.log('🕐 Iniciando scraping agendado...');
  await scheduledScraping();
});

// Executar análise diária às 2h da manhã
cron.schedule('0 2 * * *', async () => {
  console.log('📊 Iniciando análise diária...');
  await runDailyAnalysis();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
