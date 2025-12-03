import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { MapPin, ChevronDown } from 'lucide-react';

export default function CitySelector({ value, onChange }) {
  const { cities } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
      >
        <MapPin className="w-4 h-4 text-primary-600" />
        <span className="font-semibold text-primary-600">{value || 'Selecionar Cidade'}</span>
        <ChevronDown className={`w-4 h-4 text-primary-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
            {cities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Nenhuma cidade disponível</div>
            ) : (
              cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onChange(city);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors ${
                    value === city ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
