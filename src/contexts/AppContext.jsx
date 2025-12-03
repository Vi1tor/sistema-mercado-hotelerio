import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    available: '',
  });

  // Load cities on mount
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await api.get('/accommodations/meta/cities');
      setCities(response.data);
      if (response.data.length > 0 && !selectedCity) {
        setSelectedCity(response.data[0]);
      }
    } catch (err) {
      console.error('Error loading cities:', err);
      setError('Erro ao carregar cidades');
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      available: '',
    });
  };

  const value = {
    cities,
    selectedCity,
    setSelectedCity,
    loading,
    setLoading,
    error,
    setError,
    filters,
    updateFilters,
    clearFilters,
    refreshCities: loadCities,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
