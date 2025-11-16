import plantsData from '../data/mockPlants.json';
import sensorDataInit from '../data/mockSensorData.json';
import alertsData from '../data/mockAlerts.json';

class MockDataService {
  constructor() {
    this.plants = [...plantsData.plants];
    this.sensorData = { ...sensorDataInit };
    this.alerts = [...alertsData.alerts];
    this.subscribers = new Map();
    this.initializeHistory();
    this.startDataSimulation();
  }

  initializeHistory() {
    // Gerar histórico das últimas 24 horas
    Object.keys(this.sensorData).forEach(plantId => {
      const history = [];
      const now = new Date();
      
      for (let i = 24; i >= 0; i--) {
        const timestamp = new Date(now - i * 60 * 60 * 1000);
        history.push({
          timestamp: timestamp.toISOString(),
          temperature: 22 + Math.random() * 6,
          humidity: 55 + Math.random() * 20,
          soilMoisture: 1800 + Math.random() * 1000,
          pressure: 1010 + Math.random() * 10,
          airQuality: 100 + Math.random() * 100,
          dustPM25: 20 + Math.random() * 30
        });
      }
      
      this.sensorData[plantId].history = history;
    });
  }

  startDataSimulation() {
    // DESABILITADO - Atualizações automáticas estavam apagando os dados
    // Atualizar dados a cada 30 segundos
    // setInterval(() => {
    //   this.updateSensorData();
    //   this.checkAlertConditions();
    //   this.notifySubscribers();
    // }, 30000);

    // Simular mudanças rápidas a cada 5 segundos para demonstração
    // setInterval(() => {
    //   this.updateSensorDataQuick();
    //   this.notifySubscribers();
    // }, 5000);
  }

  updateSensorData() {
    Object.keys(this.sensorData).forEach(plantId => {
      const current = this.sensorData[plantId].current;
      const plant = this.plants.find(p => p.id === plantId);
      
      // Simular degradação da umidade do solo
      current.soilMoisture = Math.min(3000, current.soilMoisture + Math.random() * 50);
      
      // Variações realistas dos sensores
      current.temperature += (Math.random() - 0.5) * 0.5;
      current.humidity += (Math.random() - 0.5) * 2;
      current.pressure += (Math.random() - 0.5) * 0.5;
      current.airQuality = Math.max(50, Math.min(300, current.airQuality + (Math.random() - 0.5) * 10));
      current.dustPM25 = Math.max(10, Math.min(100, current.dustPM25 + (Math.random() - 0.5) * 5));
      current.timestamp = new Date().toISOString();

      // Auto irrigação se necessário
      if (plant?.settings.autoMode && current.soilMoisture > plant.settings.moistureThreshold) {
        this.simulateWatering(plantId);
      }

      // Adicionar ao histórico
      this.sensorData[plantId].history.push({
        timestamp: current.timestamp,
        temperature: current.temperature,
        humidity: current.humidity,
        soilMoisture: current.soilMoisture,
        pressure: current.pressure,
        airQuality: current.airQuality,
        dustPM25: current.dustPM25
      });

      // Manter apenas últimas 48 horas
      if (this.sensorData[plantId].history.length > 48) {
        this.sensorData[plantId].history.shift();
      }
    });
  }

  updateSensorDataQuick() {
    // Pequenas variações para dar sensação de tempo real
    Object.keys(this.sensorData).forEach(plantId => {
      const current = this.sensorData[plantId].current;
      if (current) {
        // Apenas ajustar levemente os valores existentes, sem perder nenhum campo
        current.temperature = (current.temperature || 25) + (Math.random() - 0.5) * 0.1;
        current.humidity = (current.humidity || 65) + (Math.random() - 0.5) * 0.5;
        current.soilMoisture = (current.soilMoisture || 2000) + Math.random() * 5;
        // Garantir que todos os campos existam
        current.pressure = current.pressure || 1013;
        current.airQuality = current.airQuality || 150;
        current.dustPM25 = current.dustPM25 || 35;
        current.pumpStatus = current.pumpStatus || false;
        current.timestamp = new Date().toISOString();
      }
    });
  }

  checkAlertConditions() {
    Object.keys(this.sensorData).forEach(plantId => {
      const current = this.sensorData[plantId].current;
      const plant = this.plants.find(p => p.id === plantId);
      
      if (!plant) return;

      // Verificar solo seco
      if (current.soilMoisture > plant.settings.moistureThreshold) {
        const severity = current.soilMoisture > plant.settings.moistureThreshold + 200 ? 'critical' : 'warning';
        this.addAlert({
          plantId,
          type: severity,
          title: severity === 'critical' ? 'Solo Muito Seco' : 'Solo Seco',
          message: `Umidade do solo: ${current.soilMoisture.toFixed(0)} (limite: ${plant.settings.moistureThreshold})`
        });
      }

      // Verificar temperatura
      if (current.temperature > 28) {
        this.addAlert({
          plantId,
          type: 'warning',
          title: 'Temperatura Alta',
          message: `Temperatura: ${current.temperature.toFixed(1)}°C`
        });
      }

      // Verificar qualidade do ar
      if (current.airQuality > 200) {
        this.addAlert({
          plantId,
          type: 'warning',
          title: 'Qualidade do Ar Ruim',
          message: `Índice de qualidade: ${current.airQuality.toFixed(0)}`
        });
      }
    });
  }

  addAlert(alertData) {
    const existingAlert = this.alerts.find(
      a => a.plantId === alertData.plantId && 
      a.title === alertData.title && 
      !a.resolved
    );

    if (!existingAlert) {
      this.alerts.unshift({
        id: `alert_${Date.now()}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        ...alertData
      });

      // Manter apenas últimos 50 alertas
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(0, 50);
      }
    }
  }

  simulateWatering(plantId) {
    const sensorData = this.sensorData[plantId];
    const plant = this.plants.find(p => p.id === plantId);
    
    if (sensorData && plant) {
      // Ativar bomba
      sensorData.current.pumpStatus = true;
      
      // Após 10 segundos, desativar bomba e reduzir umidade
      setTimeout(() => {
        sensorData.current.pumpStatus = false;
        sensorData.current.soilMoisture = 1800 + Math.random() * 200;
        plant.lastWatering = new Date().toISOString();
        
        // Resolver alertas de solo seco
        this.alerts.forEach(alert => {
          if (alert.plantId === plantId && alert.title.includes('Solo')) {
            alert.resolved = true;
          }
        });
        
        this.notifySubscribers();
      }, 10000);
    }
  }

  // Métodos de API
  async getPlants() {
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.plants]), 100);
    });
  }

  async getPlant(id) {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.plants.find(p => p.id === id)), 100);
    });
  }

  async getSensorData(plantId) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ ...this.sensorData[plantId] }), 100);
    });
  }

  async getAllSensorData() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ ...this.sensorData }), 100);
    });
  }

  async getAlerts(plantId = null) {
    return new Promise(resolve => {
      const alerts = plantId 
        ? this.alerts.filter(a => a.plantId === plantId)
        : [...this.alerts];
      setTimeout(() => resolve(alerts), 100);
    });
  }

  async waterPlant(plantId) {
    return new Promise(resolve => {
      this.simulateWatering(plantId);
      setTimeout(() => resolve({ success: true, message: 'Irrigação iniciada' }), 100);
    });
  }

  async updatePlantSettings(plantId, settings) {
    return new Promise(resolve => {
      const plant = this.plants.find(p => p.id === plantId);
      if (plant) {
        plant.settings = { ...plant.settings, ...settings };
        setTimeout(() => resolve(plant), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  }

  async resolveAlert(alertId) {
    return new Promise(resolve => {
      const alert = this.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        setTimeout(() => resolve(alert), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  }

  // Sistema de inscrição para atualizações em tempo real
  subscribe(callback) {
    const id = Date.now().toString();
    this.subscribers.set(id, callback);
    return () => this.subscribers.delete(id);
  }

  subscribeToPlant(plantId, callback) {
    const id = `${plantId}_${Date.now()}`;
    this.subscribers.set(id, data => {
      if (data.plantId === plantId || data.type === 'all') {
        callback(data);
      }
    });
    
    // NÃO enviar dados iniciais vazios - deixar o hook carregar primeiro
    // O hook já está carregando os dados iniciais via getPlant/getSensorData
    
    return {
      unsubscribe: () => this.subscribers.delete(id)
    };
  }

  notifySubscribers() {
    const data = {
      type: 'all',
      plants: this.plants,
      sensorData: this.sensorData,
      alerts: this.alerts.filter(a => !a.resolved)
    };
    
    this.subscribers.forEach(callback => callback(data));
  }

  // Exportar dados para CSV
  exportData(plantId, startDate, endDate) {
    const data = this.sensorData[plantId];
    if (!data) return null;

    const filtered = data.history.filter(h => {
      const date = new Date(h.timestamp);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const csv = [
      'Timestamp,Temperature,Humidity,Soil Moisture,Pressure,Air Quality,PM2.5',
      ...filtered.map(h => 
        `${h.timestamp},${h.temperature},${h.humidity},${h.soilMoisture},${h.pressure},${h.airQuality},${h.dustPM25}`
      )
    ].join('\n');

    return csv;
  }
}

// Singleton
const mockService = new MockDataService();
export default mockService;