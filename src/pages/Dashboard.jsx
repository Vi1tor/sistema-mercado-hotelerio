import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Star, 
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { accommodationsAPI, analysisAPI } from '../services/api';
import StatCard from '../components/StatCard';
import DemandChart from '../components/charts/DemandChart';
import PriceComparisonChart from '../components/charts/PriceComparisonChart';
import OccupancyChart from '../components/charts/OccupancyChart';
import CitySelector from '../components/CitySelector';
import AccommodationCard from '../components/AccommodationCard';

export default function Dashboard() {
  const { selectedCity, setSelectedCity } = useApp();
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [topAccommodations, setTopAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCity) {
      loadDashboardData();
    }
  }, [selectedCity]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [cityData, demandData, marketData] = await Promise.all([
        accommodationsAPI.getByCity(selectedCity),
        analysisAPI.getDemand(selectedCity),
        analysisAPI.getMarketAnalysis(selectedCity).catch(() => null),
      ]);

      setStats(cityData.data.stats);
      setAnalysis({ demand: demandData.data, market: marketData?.data });
      
      // Get top 3 accommodations by rating
      const sorted = [...cityData.data.accommodations]
        .filter((acc) => acc.rating?.score)
        .sort((a, b) => b.rating.score - a.rating.score)
        .slice(0, 3);
      setTopAccommodations(sorted);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard de Mercado</h1>
          <p className="text-gray-600 mt-1">Análise completa do mercado hoteleiro</p>
        </div>
        <div className="flex items-center gap-3">
          <CitySelector value={selectedCity} onChange={setSelectedCity} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDashboardData}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Hospedagens"
            value={stats.total}
            icon={Building2}
            color="blue"
            trend={null}
          />
          <StatCard
            title="Preço Médio"
            value={`R$ ${stats.averagePrice?.toFixed(2) || '0.00'}`}
            icon={DollarSign}
            color="green"
            trend={null}
          />
          <StatCard
            title="Avaliação Média"
            value={stats.averageRating?.toFixed(1) || 'N/A'}
            icon={Star}
            color="yellow"
            suffix="/10"
          />
          <StatCard
            title="Taxa de Disponibilidade"
            value={`${stats.availabilityRate?.toFixed(0) || 0}%`}
            icon={Calendar}
            color="purple"
            trend={null}
          />
        </div>
      )}

      {/* Demand Analysis Card */}
      {analysis?.demand && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Análise de Demanda</h2>
              <p className="text-gray-600 mt-1">{selectedCity}</p>
            </div>
            <div className={`badge ${
              analysis.demand.demandLevel === 'muito alta' ? 'badge-danger' :
              analysis.demand.demandLevel === 'alta' ? 'badge-warning' :
              analysis.demand.demandLevel === 'média' ? 'badge-info' :
              'badge-success'
            }`}>
              {analysis.demand.demandLevel.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Score de Demanda</p>
              <p className="text-3xl font-bold text-primary-600">{analysis.demand.score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tendência</p>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${
                  analysis.demand.trend === 'crescente' ? 'text-green-600' :
                  analysis.demand.trend === 'decrescente' ? 'text-red-600' :
                  'text-gray-600'
                }`} />
                <p className="text-lg font-semibold capitalize">{analysis.demand.trend}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Taxa de Ocupação</p>
              <p className="text-3xl font-bold text-accent-600">
                {analysis.demand.metrics?.occupancyRate || '0'}%
              </p>
            </div>
          </div>

          {analysis.demand.factors && analysis.demand.factors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Fatores Identificados:</p>
              <ul className="space-y-2">
                {analysis.demand.factors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceComparisonChart city={selectedCity} />
        <OccupancyChart city={selectedCity} />
      </div>

      {/* Top Accommodations */}
      {topAccommodations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Hospedagens Mais Bem Avaliadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topAccommodations.map((accommodation, index) => (
              <AccommodationCard key={accommodation._id} accommodation={accommodation} rank={index + 1} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
