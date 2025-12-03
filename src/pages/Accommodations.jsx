import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { accommodationsAPI } from '../services/api';
import AccommodationCard from '../components/AccommodationCard';
import CitySelector from '../components/CitySelector';

export default function Accommodations() {
  const { selectedCity, setSelectedCity, filters, updateFilters, clearFilters } = useApp();
  const [accommodations, setAccommodations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadAccommodations();
    }
  }, [selectedCity, filters, pagination.page]);

  const loadTypes = async () => {
    try {
      const response = await accommodationsAPI.getTypes();
      setTypes(response.data);
    } catch (error) {
      console.error('Error loading types:', error);
    }
  };

  const loadAccommodations = async () => {
    setLoading(true);
    try {
      const response = await accommodationsAPI.getAll({
        city: selectedCity,
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setAccommodations(response.data.data);
      setPagination((prev) => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Error loading accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    clearFilters();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Hospedagens</h1>
          <p className="text-gray-600 mt-1">Explore todas as opções de hospedagem</p>
        </div>
        <CitySelector value={selectedCity} onChange={setSelectedCity} />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpar
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden btn-secondary p-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${showFilters ? '' : 'hidden sm:grid'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço Mínimo</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="R$ 0"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço Máximo</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="R$ 1000"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nota Mínima</label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              <option value="7">7+</option>
              <option value="8">8+</option>
              <option value="9">9+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidade</label>
            <select
              value={filters.available}
              onChange={(e) => handleFilterChange('available', e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              <option value="true">Disponíveis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Mostrando {accommodations.length} de {pagination.total} hospedagens
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-64 skeleton"></div>
            ))}
          </div>
        ) : accommodations.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma hospedagem encontrada</p>
            <button onClick={handleClearFilters} className="btn-primary mt-4">
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accommodations.map((accommodation) => (
                <AccommodationCard key={accommodation._id} accommodation={accommodation} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary px-4 py-2"
                >
                  Anterior
                </button>
                <span className="text-gray-600">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="btn-secondary px-4 py-2"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
