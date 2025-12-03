import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { analysisAPI } from '../services/api';
import CitySelector from '../components/CitySelector';

export default function Comparison() {
  const { selectedCity, setSelectedCity } = useApp();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCity) {
      loadComparison();
    }
  }, [selectedCity]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const response = await analysisAPI.getComparison(selectedCity);
      setComparison(response.data);
    } catch (error) {
      console.error('Error loading comparison:', error);
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
          <h1 className="text-3xl font-bold gradient-text">Comparação de Mercado</h1>
          <p className="text-gray-600 mt-1">Compare preços e avaliações por tipo</p>
        </div>
        <CitySelector value={selectedCity} onChange={setSelectedCity} />
      </div>

      {comparison ? (
        <>
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                <GitCompare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCity}</h2>
                <p className="text-gray-600">Total: {comparison.totalAccommodations} hospedagens</p>
              </div>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-x-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparação Detalhada</h2>
            <div className="min-w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Tipo</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Quantidade</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-900">Preço Médio</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-900">Preço Mediano</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-900">Faixa de Preço</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Avaliação</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.comparison
                    .sort((a, b) => b.averagePrice - a.averagePrice)
                    .map((item, index) => (
                      <motion.tr
                        key={item.type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900 capitalize">{item.type}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="badge badge-info">{item.count}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-primary-600">
                            R$ {item.averagePrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-gray-700">
                            R$ {item.medianPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-600">
                              R$ {item.minPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400">até</span>
                            <span className="text-sm text-gray-600">
                              R$ {item.maxPrice.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.averageRating > 0 ? (
                            <div className="inline-flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                              <span className="font-bold text-yellow-700">
                                {item.averageRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-yellow-600">/10</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Price Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparison.comparison
              .sort((a, b) => b.averagePrice - a.averagePrice)
              .map((item, index) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="card card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{item.type}</h3>
                    <span className="badge badge-info">{item.count}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Preço Médio</span>
                      <span className="text-xl font-bold text-primary-600">
                        R$ {item.averagePrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mediana</span>
                      <span className="text-lg font-semibold text-gray-700">
                        R$ {item.medianPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-500">Mínimo</p>
                          <p className="font-semibold text-green-600">
                            R$ {item.minPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">Máximo</p>
                          <p className="font-semibold text-red-600">
                            R$ {item.maxPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.averageRating > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avaliação Média</span>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                            <span className="font-bold text-yellow-700">
                              {item.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-yellow-600">/10</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum dado disponível para comparação</p>
        </div>
      )}
    </div>
  );
}
