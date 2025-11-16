import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaChartLine, FaTint, FaBell } from 'react-icons/fa';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import PlantCard from '../../components/Dashboard/PlantCard/PlantCard';
import AlertsPanel from '../../components/Dashboard/AlertsPanel/AlertsPanel';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { plants, sensorData, alerts, loading, waterPlant, resolveAlert } = useRealTimeData();

  const handleWater = async (plantId) => {
    try {
      await waterPlant(plantId);
      alert('Irrigação iniciada!');
    } catch (error) {
      alert('Erro ao irrigar planta');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  const stats = {
    totalPlants: plants?.length || 0,
    healthy: plants?.filter(p => p.status === 'healthy').length || 0,
    warnings: plants?.filter(p => p.status === 'warning').length || 0,
    critical: plants?.filter(p => p.status === 'critical').length || 0
  };

  const activeAlerts = alerts?.filter(a => !a.resolved) || [];

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <h1>Bem-vindo ao Smart Plant System</h1>
        <p>Plataforma de Monitoramento Inteligente</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <FaLeaf className={styles.statIcon} />
          <div>
            <h3>{stats.totalPlants}</h3>
            <p>Total de Plantas</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaChartLine className={styles.statIcon} style={{color: 'var(--color-success)'}} />
          <div>
            <h3>{stats.healthy}</h3>
            <p>Saudáveis</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaTint className={styles.statIcon} style={{color: 'var(--color-warning)'}} />
          <div>
            <h3>{stats.warnings}</h3>
            <p>Atenção</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaBell className={styles.statIcon} style={{color: 'var(--color-error)'}} />
          <div>
            <h3>{stats.critical}</h3>
            <p>Crítico</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.plants}>
          <h2>Suas Plantas</h2>
          <div className={styles.plantsGrid}>
            {plants?.slice(0, 3).map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                sensorData={sensorData?.[plant.id]}
                onWater={handleWater}
              />
            ))}
          </div>
          {plants?.length > 3 && (
            <button 
              className={styles.viewAllBtn}
              onClick={() => navigate('/dashboard')}
            >
              Ver Todas as Plantas
            </button>
          )}
        </div>

        <div className={styles.alerts}>
          <AlertsPanel 
            alerts={activeAlerts.slice(0, 5)}
            onResolve={resolveAlert}
          />
          {activeAlerts.length > 5 && (
            <button 
              className={styles.viewAllBtn}
              onClick={() => navigate('/dashboard')}
            >
              Ver Todos os Alertas
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;