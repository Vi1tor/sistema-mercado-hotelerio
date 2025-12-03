import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analysisAPI } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DemandChart({ city, days = 30 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (city) {
      loadData();
    }
  }, [city, days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await analysisAPI.getTrends(city, days);
      // This would need historical demand data - for now, show trend data
      const chartData = response.data.accommodationTrends
        .slice(0, 10)
        .map((item) => ({
          name: item.name.substring(0, 15) + '...',
          tendência: item.trend,
        }));
      setData(chartData);
    } catch (error) {
      console.error('Error loading demand data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card h-96 flex items-center justify-center"
      >
        <div className="loading-spinner w-12 h-12"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Tendências de Preços ({days} dias)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value) => `${value.toFixed(1)}%`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="tendência"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
