import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, DollarSign, Award } from 'lucide-react';

export default function AccommodationCard({ accommodation, rank = null }) {
  const getTypeColor = (type) => {
    const colors = {
      hotel: 'bg-blue-100 text-blue-800',
      pousada: 'bg-green-100 text-green-800',
      resort: 'bg-purple-100 text-purple-800',
      hostel: 'bg-yellow-100 text-yellow-800',
      chalé: 'bg-orange-100 text-orange-800',
      apartamento: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className="card card-hover relative"
    >
      {rank && (
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg z-10">
          <Award className="w-5 h-5 text-white" />
          <span className="absolute text-xs font-bold text-white">{rank}</span>
        </div>
      )}

      <Link to={`/hospedagens/${accommodation._id}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{accommodation.name}</h3>
            {accommodation.rating?.score && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg ml-2 flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-sm text-yellow-700">
                  {accommodation.rating.score.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`badge ${getTypeColor(accommodation.type)}`}>
              {accommodation.type}
            </span>
            {accommodation.availability?.isAvailable ? (
              <span className="badge badge-success">Disponível</span>
            ) : (
              <span className="badge badge-danger">Indisponível</span>
            )}
          </div>

          {accommodation.neighborhood && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{accommodation.neighborhood}, {accommodation.city}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Diária a partir de</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {accommodation.currentPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {accommodation.rating?.totalReviews > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Avaliações</p>
                <p className="text-sm font-semibold text-gray-700">
                  {accommodation.rating.totalReviews}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
