import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Wifi,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { accommodationsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AccommodationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accommodation, setAccommodation] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accResponse, historyResponse] = await Promise.all([
        accommodationsAPI.getById(id),
        accommodationsAPI.getPriceHistory(id, 30),
      ]);
      setAccommodation(accResponse.data);
      setPriceHistory(historyResponse.data);
    } catch (error) {
      console.error('Error loading accommodation:', error);
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

  if (!accommodation) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">Hospedagem não encontrada</p>
        <button onClick={() => navigate('/hospedagens')} className="btn-primary mt-4">
          Voltar para Hospedagens
        </button>
      </div>
    );
  }

  const chartData = priceHistory?.history.map((item) => ({
    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
    price: item.price,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/hospedagens')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {accommodation.name.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{accommodation.name}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`badge ${
                    accommodation.type === 'hotel' ? 'badge-info' :
                    accommodation.type === 'pousada' ? 'badge-success' :
                    accommodation.type === 'resort' ? 'bg-purple-100 text-purple-800' :
                    'badge-warning'
                  }`}>
                    {accommodation.type}
                  </span>
                  {accommodation.availability?.isAvailable ? (
                    <span className="badge badge-success">Disponível</span>
                  ) : (
                    <span className="badge badge-danger">Indisponível</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {accommodation.neighborhood && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{accommodation.neighborhood}, {accommodation.city} - {accommodation.state}</span>
                </div>
              )}

              {accommodation.capacity && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>
                    {accommodation.capacity.rooms} quartos • {accommodation.capacity.guests} hóspedes
                  </span>
                </div>
              )}

              {accommodation.source?.url && (
                <a
                  href={accommodation.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="w-5 h-5" />
                  Ver no {accommodation.source.platform}
                </a>
              )}
            </div>
          </div>

          <div className="lg:text-right">
            <p className="text-sm text-gray-500 mb-2">Diária a partir de</p>
            <p className="text-4xl font-bold text-green-600 mb-4">
              R$ {accommodation.currentPrice.toFixed(2)}
            </p>
            {accommodation.rating?.score && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <div className="text-left">
                  <p className="text-2xl font-bold text-yellow-700">
                    {accommodation.rating.score.toFixed(1)}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {accommodation.rating.totalReviews} avaliações
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Price History Chart */}
      {priceHistory && chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Histórico de Preços (30 dias)</h2>
              <p className="text-gray-600 mt-1">Acompanhe a variação de preços</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tendência</p>
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`w-5 h-5 ${
                    priceHistory.trend > 5 ? 'text-red-600' :
                    priceHistory.trend < -5 ? 'text-green-600' :
                    'text-gray-600'
                  }`}
                />
                <span className={`text-xl font-bold ${
                  priceHistory.trend > 5 ? 'text-red-600' :
                  priceHistory.trend < -5 ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {priceHistory.trend > 0 ? '+' : ''}{priceHistory.trend.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                formatter={(value) => `R$ ${value.toFixed(2)}`}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Preço Mínimo</p>
              <p className="text-xl font-bold text-green-600">
                R$ {priceHistory.stats.min.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Preço Médio</p>
              <p className="text-xl font-bold text-primary-600">
                R$ {priceHistory.stats.average.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Preço Máximo</p>
              <p className="text-xl font-bold text-red-600">
                R$ {priceHistory.stats.max.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Amenities */}
      {accommodation.amenities && accommodation.amenities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comodidades</h2>
          <div className="flex flex-wrap gap-3">
            {accommodation.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
              >
                <Wifi className="w-4 h-4" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
