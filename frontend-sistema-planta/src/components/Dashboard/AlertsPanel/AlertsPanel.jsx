import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { formatRelativeTime } from '../../../utils/dateFormatter';
import styles from './AlertsPanel.module.css';

const AlertsPanel = ({ alerts, onResolve }) => {
  const getAlertIcon = (type) => {
    switch(type) {
      case 'critical':
      case 'warning':
        return <FaExclamationTriangle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getAlertClass = (type) => {
    switch(type) {
      case 'critical': return styles.critical;
      case 'warning': return styles.warning;
      default: return styles.info;
    }
  };

  return (
    <div className={styles.panel}>
      <h3>Alertas Ativos</h3>
      
      {alerts.length === 0 ? (
        <p className={styles.noAlerts}>Nenhum alerta ativo</p>
      ) : (
        <div className={styles.alertsList}>
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`${styles.alert} ${getAlertClass(alert.type)}`}
            >
              <div className={styles.alertIcon}>
                {getAlertIcon(alert.type)}
              </div>
              <div className={styles.alertContent}>
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
                <span className={styles.time}>
                  {formatRelativeTime(alert.timestamp)}
                </span>
              </div>
              <button 
                className={styles.resolveBtn}
                onClick={() => onResolve(alert.id)}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;