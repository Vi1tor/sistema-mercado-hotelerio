// Utility functions for date formatting and manipulation
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: ptBR });
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const days = differenceInDays(new Date(), dateObj);
  
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
  if (days < 365) return `${Math.floor(days / 30)} meses atrás`;
  return `${Math.floor(days / 365)} anos atrás`;
};

export const getDaysUntil = (date) => {
  if (!date) return 0;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(dateObj, new Date());
};
