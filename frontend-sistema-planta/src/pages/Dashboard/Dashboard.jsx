import React, { useState } from 'react';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import PlantCard from '../../components/Dashboard/PlantCard/PlantCard';
import AlertsPanel from '../../components/Dashboard/AlertsPanel/AlertsPanel';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { plants, sensorData, alerts, loading, waterPlant, resolveAlert } = useRealTimeData();
  const [filter, setFilter] = useState('all');

  const handleWater = async (plantId) => {
    try {
      await waterPlant(plantId);
      alert('Irrigação iniciada com sucesso!');
    } catch (error) {
      alert('Erro ao irrigar planta: ' + error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando dados...</div>;
  }

  const filteredPlants = plants?.filter(plant => {
    if (filter === 'all') return true;
    return plant.status === filter;
  }) || [];

  const activeAlerts = alerts?.filter(a => !a.resolved) || [];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.filters}>
          <button 
            className={filter === 'all' ? styles.active : ''}
            onClick={() => setFilter('all')}
          >
            Todas ({plants?.length || 0})
          </button>
          <button 
            className={filter === 'healthy' ? styles.active : ''}
            onClick={() => setFilter('healthy')}
          >
            Saudáveis ({plants?.filter(p => p.status === 'healthy').length || 0})
          </button>
          <button 
            className={filter === 'warning' ? styles.active : ''}
            onClick={() => setFilter('warning')}
          >
            Atenção ({plants?.filter(p => p.status === 'warning').length || 0})
          </button>
          <button 
            className={filter === 'critical' ? styles.active : ''}
            onClick={() => setFilter('critical')}
          >
            Crítico ({plants?.filter(p => p.status === 'critical').length || 0})
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.plantsSection}>
          <div className={styles.plantsGrid}>
            {filteredPlants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                sensorData={sensorData?.[plant.id]}
                onWater={handleWater}
              />
            ))}
          </div>
          {filteredPlants.length === 0 && (
            <div className={styles.noPlants}>
              Nenhuma planta encontrada com o filtro selecionado.
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <AlertsPanel 
            alerts={activeAlerts}
            onResolve={resolveAlert}
          />
          
          <div className={styles.summary}>
            <h3>Resumo do Sistema</h3>
            <div className={styles.summaryItem}>
              <span>Total de Plantas:</span>
              <strong>{plants?.length || 0}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Alertas Ativos:</span>
              <strong>{activeAlerts.length}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Irrigações Hoje:</span>
              <strong>12</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Consumo de Água:</span>
              <strong>45.2 L</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;