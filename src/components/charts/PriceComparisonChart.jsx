import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analysisAPI } from '../../services/api';

export default function PriceComparisonChart({ city }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (city) {
      loadData();
    }
  }, [city]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await analysisAPI.getComparison(city);
      const chartData = response.data.comparison.map((item) => ({
        type: item.type,
        'Preço Médio': parseFloat(item.averagePrice),
        'Preço Mediano': parseFloat(item.medianPrice),
        count: item.count,
      }));
      setData(chartData);
    } catch (error) {
      console.error('Error loading price comparison:', error);
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
      <h3 className="text-lg font-bold text-gray-900 mb-4">Comparação de Preços por Tipo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="type" tick={{ fontSize: 12 }} />
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
          <Legend />
          <Bar dataKey="Preço Médio" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Preço Mediano" fill="#a855f7" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
