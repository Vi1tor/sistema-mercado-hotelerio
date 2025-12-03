import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Target, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { analysisAPI } from '../services/api';
import CitySelector from '../components/CitySelector';
import DemandChart from '../components/charts/DemandChart';

export default function Analysis() {
  const { selectedCity, setSelectedCity } = useApp();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCity) {
      loadAnalysis();
    }
  }, [selectedCity]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const response = await analysisAPI.getMarketAnalysis(selectedCity);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error loading analysis:', error);
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Análise de Mercado</h1>
          <p className="text-gray-600 mt-1">Insights e previsões detalhadas</p>
        </div>
        <CitySelector value={selectedCity} onChange={setSelectedCity} />
      </div>

      {analysis ? (
        <>
          {/* Demand Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Análise de Demanda</h2>
                <p className="text-gray-600 mt-1">
                  Atualizado em {new Date(analysis.analysisDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className={`badge text-lg px-4 py-2 ${
                analysis.demandAnalysis.level === 'muito alta' ? 'badge-danger' :
                analysis.demandAnalysis.level === 'alta' ? 'badge-warning' :
                analysis.demandAnalysis.level === 'média' ? 'badge-info' :
                'badge-success'
              }`}>
                {analysis.demandAnalysis.level.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                <Target className="w-10 h-10 text-primary-600 mb-3" />
                <p className="text-sm text-primary-700 font-medium mb-1">Score de Demanda</p>
                <p className="text-4xl font-bold text-primary-900">{analysis.demandAnalysis.score}</p>
                <p className="text-xs text-primary-600 mt-2">de 100 pontos</p>
              </div>

              <div className="card bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
                <TrendingUp className="w-10 h-10 text-accent-600 mb-3" />
                <p className="text-sm text-accent-700 font-medium mb-1">Tendência</p>
                <p className="text-3xl font-bold text-accent-900 capitalize">
                  {analysis.demandAnalysis.trend}
                </p>
              </div>

              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <Zap className="w-10 h-10 text-green-600 mb-3" />
                <p className="text-sm text-green-700 font-medium mb-1">Taxa de Ocupação</p>
                <p className="text-4xl font-bold text-green-900">
                  {analysis.occupancyAnalysis.occupancyRate?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>

            {analysis.demandAnalysis.factors && analysis.demandAnalysis.factors.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Fatores Identificados</h3>
                <ul className="space-y-2">
                  {analysis.demandAnalysis.factors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Price Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Análise de Preços</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {analysis.priceAnalysis.averagePrice?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Preço Mediano</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {analysis.priceAnalysis.medianPrice?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Preço Mínimo</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {analysis.priceAnalysis.minPrice?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Preço Máximo</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {analysis.priceAnalysis.maxPrice?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {analysis.priceAnalysis.byType && analysis.priceAnalysis.byType.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Preços por Tipo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.priceAnalysis.byType.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 capitalize">{item.type}</p>
                      <p className="text-xl font-bold text-primary-600">
                        R$ {item.averagePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{item.count} hospedagens</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Alerts */}
          {analysis.alerts && analysis.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                Alertas
              </h2>
              <div className="space-y-4">
                {analysis.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-600' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-600' :
                      'bg-blue-50 border-blue-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold mb-1 ${
                          alert.severity === 'high' ? 'text-red-900' :
                          alert.severity === 'medium' ? 'text-yellow-900' :
                          'text-blue-900'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-sm text-gray-600">
                          {alert.affectedAccommodations} hospedagens afetadas
                        </p>
                      </div>
                      <span className={`badge ${
                        alert.severity === 'high' ? 'badge-danger' :
                        alert.severity === 'medium' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recomendações</h2>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900">{rec.title}</p>
                      <span className={`badge ${
                        rec.priority === 'high' ? 'badge-danger' :
                        rec.priority === 'medium' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-xs text-gray-500 font-medium">Categoria: {rec.category}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Demand Chart */}
          <DemandChart city={selectedCity} />
        </>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma análise disponível para esta cidade</p>
          <button onClick={loadAnalysis} className="btn-primary mt-4">
            Gerar Análise
          </button>
        </div>
      )}
    </div>
  );
}
