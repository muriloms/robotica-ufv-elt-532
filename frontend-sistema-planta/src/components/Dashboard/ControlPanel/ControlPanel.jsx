import React from 'react';
import { FaTint, FaPowerOff, FaClock, FaCog } from 'react-icons/fa';
import { formatDateTime } from '../../../utils/dateFormatter';
import styles from './ControlPanel.module.css';

const ControlPanel = ({ plant, sensorData, onWater, onToggleAuto, onEmergencyStop }) => {
  if (!plant || !sensorData) return null;

  return (
    <div className={styles.panel}>
      <h3>Painel de Controle</h3>
      
      <div className={styles.status}>
        <div className={styles.statusItem}>
          <span>Bomba:</span>
          <span className={sensorData.current?.pumpStatus ? styles.on : styles.off}>
            {sensorData.current?.pumpStatus ? 'LIGADA' : 'DESLIGADA'}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span>Modo:</span>
          <span>{plant.settings?.autoMode ? 'AUTOMÁTICO' : 'MANUAL'}</span>
        </div>
        <div className={styles.statusItem}>
          <span>Última Irrigação:</span>
          <span>{formatDateTime(plant.lastWatering)}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.waterButton}
          onClick={onWater}
        >
          <FaTint />
          Irrigar Agora
        </button>
        
        <button 
          className={styles.autoButton}
          onClick={onToggleAuto}
        >
          <FaCog />
          {plant.settings?.autoMode ? 'Desativar Auto' : 'Ativar Auto'}
        </button>
        
        <button 
          className={styles.stopButton}
          onClick={onEmergencyStop}
        >
          <FaPowerOff />
          Parada de Emergência
        </button>
      </div>

      <div className={styles.settings}>
        <h4>Configurações Rápidas</h4>
        <div className={styles.setting}>
          <label>Limite de Umidade:</label>
          <span>{plant.settings?.moistureThreshold}</span>
        </div>
        <div className={styles.setting}>
          <label>Intervalo:</label>
          <span>{plant.settings?.wateringInterval / 60000} min</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;