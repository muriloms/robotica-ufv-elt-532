import React from 'react';
import { FaThermometerHalf, FaTint, FaLeaf, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getTimeSinceWatering } from '../../../utils/dateFormatter';
import { soilMoistureToPercentage } from '../../../utils/sensorDataProcessor';
import styles from './PlantCard.module.css';

const PlantCard = ({ plant, sensorData, onWater }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return styles.healthy;
      case 'warning': return styles.warning;
      case 'critical': return styles.critical;
      default: return '';
    }
  };

  return (
    <div className={`${styles.card} ${getStatusColor(plant.status)}`}>
      <div className={styles.header}>
        <FaLeaf className={styles.icon} />
        <span className={styles.status}>{plant.status}</span>
      </div>
      
      <h3>{plant.name}</h3>
      <p className={styles.location}>{plant.location}</p>
      
      <div className={styles.sensors}>
        <div className={styles.sensor}>
          <FaThermometerHalf />
          <span>{sensorData?.current?.temperature?.toFixed(1)}°C</span>
        </div>
        <div className={styles.sensor}>
          <FaTint />
          <span>{soilMoistureToPercentage(sensorData?.current?.soilMoisture).toFixed(0)}%</span>
        </div>
        <div className={styles.sensor}>
          <FaClock />
          <span>{getTimeSinceWatering(plant.lastWatering)}</span>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button 
          className={styles.detailsBtn}
          onClick={() => navigate(`/plant/${plant.id}`)}
        >
          Ver Detalhes
        </button>
        <button 
          className={styles.waterBtn}
          onClick={() => onWater(plant.id)}
        >
          Irrigar
        </button>
      </div>
    </div>
  );
};

export default PlantCard;