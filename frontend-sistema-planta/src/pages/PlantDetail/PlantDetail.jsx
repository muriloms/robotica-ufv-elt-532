import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTint, FaCog } from 'react-icons/fa';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import SensorChart from '../../components/Dashboard/SensorChart/SensorChart';
import ControlPanel from '../../components/Dashboard/ControlPanel/ControlPanel';
import AlertsPanel from '../../components/Dashboard/AlertsPanel/AlertsPanel';
import { processChartData, formatSensorValue } from '../../utils/sensorDataProcessor';
import styles from './PlantDetail.module.css';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plant, sensorData, alerts, loading, waterPlant, updateSettings, resolveAlert } = useRealTimeData(id);
  const [showSettings, setShowSettings] = useState(false);

  const handleWater = async () => {
    try {
      await waterPlant();
      alert('Irrigação iniciada!');
    } catch (error) {
      alert('Erro ao irrigar: ' + error.message);
    }
  };

  const handleToggleAuto = async () => {
    try {
      await updateSettings(id, { autoMode: !plant.settings.autoMode });
      alert('Modo alterado com sucesso!');
    } catch (error) {
      alert('Erro ao alterar modo: ' + error.message);
    }
  };

  const handleEmergencyStop = () => {
    alert('Sistema de irrigação parado!');
  };

  if (loading) {
    return <div className={styles.loading}>Carregando dados da planta...</div>;
  }

  if (!plant || !sensorData) {
    return <div className={styles.error}>Planta não encontrada</div>;
  }

  const tempData = processChartData(sensorData.history, 'temperature', 24);
  const humidityData = processChartData(sensorData.history, 'humidity', 24);
  const moistureData = processChartData(sensorData.history, 'soilMoisture', 24);

  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>
        <div className={styles.plantInfo}>
          <h1>{plant.name}</h1>
          <p>{plant.location} • {plant.type}</p>
        </div>
        <button className={styles.settingsBtn} onClick={() => setShowSettings(!showSettings)}>
          <FaCog /> Configurações
        </button>
      </div>

      <div className={styles.currentValues}>
        <div className={styles.valueCard}>
          <span>Temperatura</span>
          <strong>{formatSensorValue(sensorData.current?.temperature, 'temperature')}</strong>
        </div>
        <div className={styles.valueCard}>
          <span>Umidade do Ar</span>
          <strong>{formatSensorValue(sensorData.current?.humidity, 'humidity')}</strong>
        </div>
        <div className={styles.valueCard}>
          <span>Umidade do Solo</span>
          <strong>{formatSensorValue(sensorData.current?.soilMoisture, 'soilMoisture')}</strong>
        </div>
        <div className={styles.valueCard}>
          <span>Pressão</span>
          <strong>{formatSensorValue(sensorData.current?.pressure, 'pressure')}</strong>
        </div>
        <div className={styles.valueCard}>
          <span>Qualidade do Ar</span>
          <strong>{formatSensorValue(sensorData.current?.airQuality, 'airQuality')}</strong>
        </div>
        <div className={styles.valueCard}>
          <span>PM2.5</span>
          <strong>{formatSensorValue(sensorData.current?.dustPM25, 'dustPM25')}</strong>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.charts}>
          <SensorChart
            data={tempData}
            type="line"
            title="Temperatura (24h)"
            unit="°C"
            color="#FF6B6B"
          />
          <SensorChart
            data={humidityData}
            type="area"
            title="Umidade do Ar (24h)"
            unit="%"
            color="#4ECDC4"
          />
          <SensorChart
            data={moistureData}
            type="area"
            title="Umidade do Solo (24h)"
            unit="valor"
            color="#1976D2"
          />
        </div>

        <div className={styles.sidebar}>
          <ControlPanel
            plant={plant}
            sensorData={sensorData}
            onWater={handleWater}
            onToggleAuto={handleToggleAuto}
            onEmergencyStop={handleEmergencyStop}
          />
          
          <AlertsPanel
            alerts={alerts}
            onResolve={resolveAlert}
          />
        </div>
      </div>

      {showSettings && (
        <div className={styles.settingsModal}>
          <div className={styles.modalContent}>
            <h2>Configurações da Planta</h2>
            <div className={styles.setting}>
              <label>Limite de Umidade do Solo:</label>
              <input type="number" defaultValue={plant.settings.moistureThreshold} />
            </div>
            <div className={styles.setting}>
              <label>Intervalo de Irrigação (minutos):</label>
              <input type="number" defaultValue={plant.settings.wateringInterval / 60000} />
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowSettings(false)}>Cancelar</button>
              <button className={styles.saveBtn}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetail;