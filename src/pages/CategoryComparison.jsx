import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { analysisAPI, accommodationsAPI } from '../services/api';
import CitySelector from '../components/CitySelector';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Award,
  BarChart3,
  PieChart,
  Target,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function CategoryComparison() {
  const { selectedCity, setSelectedCity } = useApp();
  const [selectedType, setSelectedType] = useState('pousada');
  const [types, setTypes] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    if (selectedCity && selectedType) {
      loadData();
    }
  }, [selectedCity, selectedType]);

  const loadTypes = async () => {
    try {
      const response = await accommodationsAPI.getTypes();
      setTypes(response.data);
      if (response.data.length > 0 && !selectedType) {
        setSelectedType(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading types:', error);
      // Fallback types
      setTypes(['hotel', 'pousada', 'resort', 'hostel', 'chalé', 'apartamento']);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryData, comparisonData] = await Promise.all([
        analysisAPI.getCategoryAnalysis(selectedCity, selectedType),
        analysisAPI.getComparison(selectedCity),
      ]);
      setAnalysis(categoryData.data);
      setComparison(comparisonData.data);
    } catch (error) {
      console.error('Error loading category analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner w-16 h-16"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">
          Nenhum dado encontrado para {selectedType}s em {selectedCity}
        </p>
      </div>
    );
  }

  const priceDistributionData = [
    { name: 'Econômico', value: analysis.priceAnalysis.distribution.budget, fill: COLORS[0] },
    { name: 'Intermediário', value: analysis.priceAnalysis.distribution.midRange, fill: COLORS[1] },
    { name: 'Premium', value: analysis.priceAnalysis.distribution.premium, fill: COLORS[2] },
  ];

  const ratingDistributionData = analysis.ratingAnalysis ? [
    { name: 'Excelente (9+)', value: analysis.ratingAnalysis.excellentCount, fill: COLORS[3] },
    { name: 'Bom (7-9)', value: analysis.ratingAnalysis.goodCount, fill: COLORS[4] },
    { name: 'Regular (<7)', value: analysis.ratingAnalysis.fairCount, fill: COLORS[5] },
  ] : [];

  const comparisonChartData = comparison?.comparison.map(item => ({
    type: item.type,
    avgPrice: Math.round(item.averagePrice),
    avgRating: item.averageRating,
    count: item.count,
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Comparação por Categoria</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada de {selectedType}s em {selectedCity}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CitySelector value={selectedCity} onChange={setSelectedCity} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </motion.button>
        </div>
      </div>

      {/* Type Selector */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Selecione a Categoria</h3>
        <div className="flex flex-wrap gap-3">
          {types.map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedType === type
                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{analysis.summary.total}</p>
          <p className="text-sm text-gray-500 mt-1">
            {analysis.summary.available} disponíveis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Preço Médio</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            R$ {analysis.priceAnalysis.average.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Mediana: R$ {analysis.priceAnalysis.median.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avaliação Média</span>
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {analysis.ratingAnalysis?.average.toFixed(1) || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {analysis.summary.withRatings} avaliadas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Faixa de Preço</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            R$ {analysis.priceAnalysis.min} - {analysis.priceAnalysis.max}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Amplitude total
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Distribuição de Preços
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={priceDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priceDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-sm text-gray-600">Econômico</p>
              <p className="text-lg font-bold text-primary-600">
                {analysis.priceAnalysis.distribution.budget}
              </p>
              <p className="text-xs text-gray-500">
                até R$ {analysis.priceAnalysis.quartiles.q1.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Intermediário</p>
              <p className="text-lg font-bold text-accent-600">
                {analysis.priceAnalysis.distribution.midRange}
              </p>
              <p className="text-xs text-gray-500">
                R$ {analysis.priceAnalysis.quartiles.q1.toFixed(2)} - {analysis.priceAnalysis.quartiles.q3.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Premium</p>
              <p className="text-lg font-bold text-green-600">
                {analysis.priceAnalysis.distribution.premium}
              </p>
              <p className="text-xs text-gray-500">
                acima de R$ {analysis.priceAnalysis.quartiles.q3.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Comparação entre Categorias
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" orientation="left" stroke="#0ea5e9" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="avgPrice" fill="#0ea5e9" name="Preço Médio (R$)" />
              <Bar yAxisId="right" dataKey="avgRating" fill="#10b981" name="Nota Média" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Rated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-gray-900">Mais Bem Avaliadas</h3>
          </div>
          <div className="space-y-3">
            {analysis.topPerformers.bestRated.map((acc, index) => (
              <div key={acc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-yellow-700">{acc.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">• R$ {acc.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Best Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Melhor Custo-Benefício</h3>
          </div>
          <div className="space-y-3">
            {analysis.topPerformers.bestValue.map((acc, index) => (
              <div key={acc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-green-600">
                      Score: {acc.valueScore}
                    </span>
                    <span className="text-xs text-gray-500">• R$ {acc.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Price Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Tendências de Preço</h3>
          </div>
          <div className="space-y-3">
            {analysis.priceTrends.slice(0, 5).map((trend) => (
              <div key={trend.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{trend.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${
                      trend.trend > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {trend.trend > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                      {' '}{Math.abs(trend.trend).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">• {trend.pricePosition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recomendações por Perfil
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget */}
          <div className="border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Econômico</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Boas opções com preço acessível e boas avaliações
            </p>
            <div className="space-y-2">
              {analysis.recommendations.budget.map((acc) => (
                <div key={acc._id} className="text-sm">
                  <p className="font-semibold text-gray-900 truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>R$ {acc.currentPrice.toFixed(2)}</span>
                    {acc.rating?.score && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {acc.rating.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-yellow-900">Alta Qualidade</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              As melhores avaliações da categoria
            </p>
            <div className="space-y-2">
              {analysis.recommendations.quality.map((acc) => (
                <div key={acc._id} className="text-sm">
                  <p className="font-semibold text-gray-900 truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>R$ {acc.currentPrice.toFixed(2)}</span>
                    {acc.rating?.score && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {acc.rating.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Balanced */}
          <div className="border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-green-900">Equilibrado</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Melhor relação custo-benefício
            </p>
            <div className="space-y-2">
              {analysis.recommendations.balanced.map((acc) => (
                <div key={acc._id} className="text-sm">
                  <p className="font-semibold text-gray-900 truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>R$ {acc.currentPrice.toFixed(2)}</span>
                    {acc.rating?.score && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {acc.rating.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
