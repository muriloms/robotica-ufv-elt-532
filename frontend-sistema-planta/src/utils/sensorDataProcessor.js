// Converter valor do sensor de umidade do solo para porcentagem
export const soilMoistureToPercentage = (value, min = 1500, max = 3000) => {
  const percentage = ((max - value) / (max - min)) * 100;
  return Math.max(0, Math.min(100, percentage));
};

// Classificar nível de umidade do solo
export const classifySoilMoisture = (value) => {
  const percentage = soilMoistureToPercentage(value);
  
  if (percentage >= 80) return { level: 'Muito Úmido', color: '#1976D2', status: 'excellent' };
  if (percentage >= 60) return { level: 'Úmido', color: '#4CAF50', status: 'good' };
  if (percentage >= 40) return { level: 'Ideal', color: '#8BC34A', status: 'ideal' };
  if (percentage >= 20) return { level: 'Seco', color: '#FF9800', status: 'warning' };
  return { level: 'Muito Seco', color: '#F44336', status: 'critical' };
};

// Classificar temperatura
export const classifyTemperature = (value) => {
  if (value < 15) return { level: 'Muito Frio', color: '#2196F3', status: 'warning' };
  if (value < 20) return { level: 'Frio', color: '#03A9F4', status: 'caution' };
  if (value <= 28) return { level: 'Ideal', color: '#4CAF50', status: 'ideal' };
  if (value <= 32) return { level: 'Quente', color: '#FF9800', status: 'warning' };
  return { level: 'Muito Quente', color: '#F44336', status: 'critical' };
};

// Classificar umidade do ar
export const classifyHumidity = (value) => {
  if (value < 30) return { level: 'Muito Seco', color: '#F44336', status: 'critical' };
  if (value < 40) return { level: 'Seco', color: '#FF9800', status: 'warning' };
  if (value <= 70) return { level: 'Ideal', color: '#4CAF50', status: 'ideal' };
  if (value <= 80) return { level: 'Úmido', color: '#2196F3', status: 'caution' };
  return { level: 'Muito Úmido', color: '#1976D2', status: 'warning' };
};

// Classificar qualidade do ar (AQI)
export const classifyAirQuality = (value) => {
  if (value <= 50) return { level: 'Boa', color: '#4CAF50', status: 'good' };
  if (value <= 100) return { level: 'Moderada', color: '#FFEB3B', status: 'moderate' };
  if (value <= 150) return { level: 'Ruim para Sensíveis', color: '#FF9800', status: 'unhealthy-sensitive' };
  if (value <= 200) return { level: 'Ruim', color: '#F44336', status: 'unhealthy' };
  if (value <= 300) return { level: 'Muito Ruim', color: '#9C27B0', status: 'very-unhealthy' };
  return { level: 'Perigosa', color: '#4A148C', status: 'hazardous' };
};

// Classificar PM2.5
export const classifyPM25 = (value) => {
  if (value <= 25) return { level: 'Bom', color: '#4CAF50', status: 'good' };
  if (value <= 50) return { level: 'Moderado', color: '#FFEB3B', status: 'moderate' };
  if (value <= 100) return { level: 'Ruim', color: '#FF9800', status: 'unhealthy' };
  return { level: 'Muito Ruim', color: '#F44336', status: 'very-unhealthy' };
};

// Calcular saúde geral da planta
export const calculatePlantHealth = (sensorData) => {
  if (!sensorData) return { score: 0, status: 'unknown', color: '#9E9E9E' };
  
  const { soilMoisture, temperature, humidity, airQuality, dustPM25 } = sensorData;
  
  let score = 100;
  
  // Penalidades por condições não ideais
  const moistureStatus = classifySoilMoisture(soilMoisture);
  if (moistureStatus.status === 'warning') score -= 15;
  if (moistureStatus.status === 'critical') score -= 30;
  
  const tempStatus = classifyTemperature(temperature);
  if (tempStatus.status === 'warning') score -= 10;
  if (tempStatus.status === 'critical') score -= 20;
  
  const humidityStatus = classifyHumidity(humidity);
  if (humidityStatus.status === 'warning') score -= 10;
  if (humidityStatus.status === 'critical') score -= 15;
  
  const airStatus = classifyAirQuality(airQuality);
  if (airStatus.status === 'unhealthy') score -= 10;
  if (airStatus.status === 'very-unhealthy') score -= 20;
  
  const pm25Status = classifyPM25(dustPM25);
  if (pm25Status.status === 'unhealthy') score -= 5;
  if (pm25Status.status === 'very-unhealthy') score -= 10;
  
  score = Math.max(0, score);
  
  let status, color;
  if (score >= 80) {
    status = 'healthy';
    color = '#4CAF50';
  } else if (score >= 60) {
    status = 'caution';
    color = '#FFEB3B';
  } else if (score >= 40) {
    status = 'warning';
    color = '#FF9800';
  } else {
    status = 'critical';
    color = '#F44336';
  }
  
  return { score, status, color };
};

// Processar dados para gráficos
export const processChartData = (history, field, limit = 24) => {
  if (!history || !Array.isArray(history)) return [];
  
  const data = history.slice(-limit).map(item => ({
    time: new Date(item.timestamp).getHours() + 'h',
    value: item[field],
    timestamp: item.timestamp
  }));
  
  return data;
};

// Calcular estatísticas
export const calculateStats = (history, field) => {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0 };
  }
  
  const values = history.map(item => item[field]).filter(v => v !== null && v !== undefined);
  
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0 };
  }
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    current: values[values.length - 1]
  };
};

// Detectar tendências
export const detectTrend = (history, field, periods = 6) => {
  if (!history || history.length < periods) return 'stable';
  
  const recent = history.slice(-periods);
  const values = recent.map(item => item[field]);
  
  let increasing = 0;
  let decreasing = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) increasing++;
    if (values[i] < values[i - 1]) decreasing++;
  }
  
  const threshold = periods * 0.6;
  
  if (increasing > threshold) return 'increasing';
  if (decreasing > threshold) return 'decreasing';
  return 'stable';
};

// Prever próximo valor (simples média móvel)
export const predictNextValue = (history, field, periods = 3) => {
  if (!history || history.length < periods) return null;
  
  const recent = history.slice(-periods);
  const values = recent.map(item => item[field]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  const trend = detectTrend(history, field);
  let adjustment = 0;
  
  if (trend === 'increasing') {
    adjustment = (values[values.length - 1] - values[0]) / periods;
  } else if (trend === 'decreasing') {
    adjustment = -(values[0] - values[values.length - 1]) / periods;
  }
  
  return avg + adjustment;
};

// Calcular consumo de água
export const calculateWaterConsumption = (wateringEvents, mlPerSecond = 50) => {
  if (!wateringEvents || wateringEvents.length === 0) return 0;
  
  const totalSeconds = wateringEvents.reduce((total, event) => {
    return total + (event.duration || 10); // Assume 10 segundos se não especificado
  }, 0);
  
  return (totalSeconds * mlPerSecond) / 1000; // Retorna em litros
};

// Formatar valores para exibição
export const formatSensorValue = (value, type) => {
  if (value === null || value === undefined) return '--';
  
  switch (type) {
    case 'temperature':
      return `${value.toFixed(1)}°C`;
    case 'humidity':
      return `${value.toFixed(1)}%`;
    case 'soilMoisture':
      return `${soilMoistureToPercentage(value).toFixed(0)}%`;
    case 'pressure':
      return `${value.toFixed(0)} hPa`;
    case 'airQuality':
      return value.toFixed(0);
    case 'dustPM25':
      return `${value.toFixed(1)} µg/m³`;
    default:
      return value.toString();
  }
};