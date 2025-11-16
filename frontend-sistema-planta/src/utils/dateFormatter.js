import { 
  format, 
  formatDistanceToNow, 
  parseISO, 
  isToday, 
  isYesterday,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  startOfDay,
  endOfDay
} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Formatar data completa
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

// Formatar data e hora
export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

// Formatar apenas hora
export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm', { locale: ptBR });
};

// Formatar data relativa (há 2 horas, ontem, etc)
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `hoje às ${format(dateObj, 'HH:mm', { locale: ptBR })}`;
  }
  
  if (isYesterday(dateObj)) {
    return `ontem às ${format(dateObj, 'HH:mm', { locale: ptBR })}`;
  }
  
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: ptBR 
  });
};

// Calcular tempo desde última irrigação
export const getTimeSinceWatering = (date) => {
  if (!date) return 'Nunca';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  const minutes = differenceInMinutes(now, dateObj);
  const hours = differenceInHours(now, dateObj);
  const days = differenceInDays(now, dateObj);
  
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
  }
  
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  }
  
  return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
};

// Formatar para gráficos
export const formatChartDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm');
  }
  
  return format(dateObj, 'dd/MM HH:mm');
};

// Obter range de datas para filtros
export const getDateRange = (type) => {
  const now = new Date();
  let start, end;
  
  switch (type) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'week':
      start = new Date(now.setDate(now.getDate() - 7));
      end = new Date();
      break;
    case 'month':
      start = new Date(now.setMonth(now.getMonth() - 1));
      end = new Date();
      break;
    case 'year':
      start = new Date(now.setFullYear(now.getFullYear() - 1));
      end = new Date();
      break;
    default:
      start = startOfDay(now);
      end = endOfDay(now);
  }
  
  return { start, end };
};

// Formatar duração em segundos
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  
  return `${secs}s`;
};

// Verificar se precisa irrigação baseado no tempo
export const needsWatering = (lastWatering, intervalMinutes) => {
  if (!lastWatering) return true;
  
  const dateObj = typeof lastWatering === 'string' ? parseISO(lastWatering) : lastWatering;
  const now = new Date();
  const minutesSinceWatering = differenceInMinutes(now, dateObj);
  
  return minutesSinceWatering >= intervalMinutes;
};