import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaChartLine, FaLeaf, FaCog, FaHistory, FaBars } from 'react-icons/fa';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'Início' },
    { path: '/dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/plants', icon: <FaLeaf />, label: 'Plantas' },
    { path: '/history', icon: <FaHistory />, label: 'Histórico' },
    { path: '/settings', icon: <FaCog />, label: 'Configurações' }
  ];

  return (
    <>
      <button className={styles.mobileToggle} onClick={toggleSidebar}>
        <FaBars />
      </button>
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <nav className={styles.nav}>
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      
      {isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Sidebar;