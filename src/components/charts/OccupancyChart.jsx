import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { analysisAPI } from '../../services/api';

const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function OccupancyChart({ city }) {
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
      const response = await analysisAPI.getOccupancy(city);
      const chartData = Object.entries(response.data.byType).map(([type, data]) => ({
        name: type,
        value: parseFloat(data.occupancyRate.toFixed(1)),
        count: data.total,
      }));
      setData(chartData);
    } catch (error) {
      console.error('Error loading occupancy:', error);
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
      <h3 className="text-lg font-bold text-gray-900 mb-4">Taxa de Ocupação por Tipo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value) => `${value}%`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
