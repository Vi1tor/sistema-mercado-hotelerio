import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { scrapingAPI } from '../services/api';
import CitySelector from '../components/CitySelector';
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  Zap,
} from 'lucide-react';

export default function Scraping() {
  const { selectedCity, setSelectedCity } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [config, setConfig] = useState({
    type: 'pousada',
    minPrice: 0,
    maxPrice: 5000,
    useRealScraping: false,
  });

  const handleScrape = async () => {
    if (!selectedCity) {
      setError('Selecione uma cidade');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await scrapingAPI.trigger(selectedCity, 'booking', config);
      setResult(response.data);
    } catch (err) {
      console.error('Erro ao executar scraping:', err);
      setError(err.response?.data?.error || 'Erro ao executar scraping');
    } finally {
      setLoading(false);
    }
  };

  const priceRanges = [
    { label: 'Todas', min: 0, max: 5000 },
    { label: 'Econômico (até R$ 250)', min: 0, max: 250 },
    { label: 'Intermediário (R$ 250-600)', min: 250, max: 600 },
    { label: 'Premium (R$ 600+)', min: 600, max: 5000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Coleta de Dados (Scraping)</h1>
        <p className="text-gray-600 mt-1">
          Busque pousadas do Booking.com por faixa de preço
        </p>
      </div>

      {/* Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Configuração da Coleta</h2>

        <div className="space-y-6">
          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <CitySelector value={selectedCity} onChange={setSelectedCity} />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Hospedagem
            </label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value })}
              className="input-field"
            >
              <option value="pousada">Pousada</option>
              <option value="hotel">Hotel</option>
              <option value="resort">Resort</option>
              <option value="hostel">Hostel</option>
              <option value="chalé">Chalé</option>
              <option value="apartamento">Apartamento</option>
            </select>
          </div>

          {/* Price Range Quick Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Faixa de Preço (por diária)
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {priceRanges.map((range) => (
                <motion.button
                  key={range.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setConfig({ ...config, minPrice: range.min, maxPrice: range.max })
                  }
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    config.minPrice === range.min && config.maxPrice === range.max
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {range.label}
                </motion.button>
              ))}
            </div>

            {/* Custom Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Preço Mínimo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={config.minPrice}
                    onChange={(e) =>
                      setConfig({ ...config, minPrice: Number(e.target.value) })
                    }
                    className="input-field pl-9"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Preço Máximo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={config.maxPrice}
                    onChange={(e) =>
                      setConfig({ ...config, maxPrice: Number(e.target.value) })
                    }
                    className="input-field pl-9"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scraping Mode */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="useRealScraping"
                checked={config.useRealScraping}
                onChange={(e) =>
                  setConfig({ ...config, useRealScraping: e.target.checked })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="useRealScraping" className="font-medium text-yellow-900 cursor-pointer">
                  Usar Scraping Real (Puppeteer)
                </label>
                <p className="text-sm text-yellow-700 mt-1">
                  {config.useRealScraping
                    ? '⚠️ Modo real ativado: Vai buscar dados reais do Booking.com (mais lento, ~30-60s)'
                    : '✓ Modo mock: Usa dados simulados realistas (instantâneo, recomendado para testes)'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleScrape}
            disabled={loading || !selectedCity}
            className={`w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Coletando dados...
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                Buscar {config.type === 'pousada' ? 'Pousadas' : config.type.charAt(0).toUpperCase() + config.type.slice(1) + 's'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Coletando dados de {config.type === 'pousada' ? 'pousadas' : config.type + 's'}...
          </h3>
          <p className="text-gray-600">
            {config.useRealScraping
              ? 'Acessando Booking.com e extraindo informações reais (isso pode levar até 1 minuto)'
              : 'Gerando dados simulados realistas com diferentes faixas de preço'}
          </p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-2 border-red-200 bg-red-50"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Erro na Coleta</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Card */}
          <div className="card border-2 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  Coleta Concluída com Sucesso!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Encontrado</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.result?.total || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Novas</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {result.result?.created || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-600">Atualizadas</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {result.result?.updated || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes da Coleta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Cidade</span>
                <span className="font-semibold text-gray-900">{result.city}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Tipo</span>
                <span className="font-semibold text-gray-900 capitalize">{result.type}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Faixa de Preço</span>
                <span className="font-semibold text-gray-900">
                  R$ {result.priceRange?.min} - R$ {result.priceRange?.max}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Plataforma</span>
                <span className="font-semibold text-gray-900">Booking.com</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  {result.status}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card bg-blue-50 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">Próximos Passos</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></span>
                <span>
                  Acesse <strong>Hospedagens</strong> para visualizar as {config.type === 'pousada' ? 'pousadas' : config.type + 's'} coletadas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></span>
                <span>
                  Use <strong>Por Categoria</strong> para comparar preços apenas entre {config.type === 'pousada' ? 'pousadas' : config.type + 's'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></span>
                <span>
                  Gere <strong>Relatórios</strong> em PDF ou Excel com os dados coletados
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
