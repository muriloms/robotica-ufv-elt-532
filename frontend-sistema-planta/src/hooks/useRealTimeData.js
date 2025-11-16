import { useState, useEffect, useCallback } from 'react';
import mockService from '../services/mockService';

export const useRealTimeData = (plantId = null) => {
  const [data, setData] = useState({
    plant: null,
    plants: null,
    sensorData: null,
    alerts: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let unsubscribe;
    let mounted = true;

    const loadData = async () => {
      try {
        if (!mounted) return;
        
        setData(prev => ({ ...prev, loading: true, error: null }));

        if (plantId) {
          // Dados de uma planta específica
          const plant = await mockService.getPlant(plantId);
          const sensorData = await mockService.getSensorData(plantId);
          const alerts = await mockService.getAlerts(plantId);

          if (!mounted) return;

          setData({
            plant,
            plants: null,
            sensorData,
            alerts,
            loading: false,
            error: null
          });

          // Inscrever para atualizações em tempo real - sem sobrescrever inicial
          unsubscribe = mockService.subscribeToPlant(plantId, (update) => {
            if (!mounted) return;
            
            // Ignorar update inicial vazio
            if (update.type === 'initial' && (!update.sensorData || !update.plant)) {
              return;
            }
            
            setData(prev => ({
              ...prev,
              plant: update.plant || prev.plant,
              sensorData: update.sensorData || prev.sensorData,
              alerts: update.alerts !== undefined ? update.alerts : prev.alerts
            }));
          });
        } else {
          // Dados de todas as plantas
          const plants = await mockService.getPlants();
          const sensorData = await mockService.getAllSensorData();
          const alerts = await mockService.getAlerts();

          if (!mounted) return;

          setData({
            plant: null,
            plants,
            sensorData,
            alerts,
            loading: false,
            error: null
          });

          // Inscrever para atualizações gerais
          unsubscribe = mockService.subscribe((update) => {
            if (!mounted) return;
            
            if (update.type === 'all') {
              setData(prev => ({
                ...prev,
                plants: update.plants || prev.plants,
                sensorData: update.sensorData || prev.sensorData,
                alerts: update.alerts || prev.alerts
              }));
            }
          });
        }
      } catch (error) {
        if (!mounted) return;
        
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    loadData();

    return () => {
      mounted = false;
      if (unsubscribe) {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        } else if (unsubscribe.unsubscribe) {
          unsubscribe.unsubscribe();
        }
      }
    };
  }, [plantId]);

  const waterPlant = useCallback(async (id) => {
    try {
      const result = await mockService.waterPlant(id || plantId);
      // Atualizar estado local imediatamente
      if (plantId) {
        const updatedSensorData = await mockService.getSensorData(plantId);
        setData(prev => ({ ...prev, sensorData: updatedSensorData }));
      }
      return result;
    } catch (error) {
      console.error('Erro ao irrigar planta:', error);
      throw error;
    }
  }, [plantId]);

  const updateSettings = useCallback(async (id, settings) => {
    try {
      const result = await mockService.updatePlantSettings(id || plantId, settings);
      if (result && plantId) {
        setData(prev => ({ ...prev, plant: result }));
      }
      return result;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }, [plantId]);

  const resolveAlert = useCallback(async (alertId) => {
    try {
      const result = await mockService.resolveAlert(alertId);
      // Atualizar lista de alertas localmente
      setData(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => 
          a.id === alertId ? { ...a, resolved: true } : a
        ).filter(a => !a.resolved)
      }));
      return result;
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      throw error;
    }
  }, []);

  const exportData = useCallback((startDate, endDate) => {
    if (!plantId) {
      console.warn('PlantId necessário para exportar dados');
      return null;
    }
    return mockService.exportData(plantId, startDate, endDate);
  }, [plantId]);

  return {
    ...data,
    waterPlant,
    updateSettings,
    resolveAlert,
    exportData,
    refetch: () => window.location.reload()
  };
};