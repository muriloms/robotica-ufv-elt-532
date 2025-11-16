import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './SensorChart.module.css';

const SensorChart = ({ data, type, title, unit, color = '#2E7D32' }) => {
  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)} ${unit}`, title]}
          />
          <DataComponent 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            fill={color}
            fillOpacity={type === 'area' ? 0.3 : 0}
            strokeWidth={2}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;