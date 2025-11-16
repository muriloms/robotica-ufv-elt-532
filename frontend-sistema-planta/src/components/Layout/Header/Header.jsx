import React from 'react';
import { FaLeaf, FaBell, FaUser } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <FaLeaf className={styles.logoIcon} />
          <div className={styles.titles}>
            <h1>Smart Plant System</h1>
            <p>Universidade Federal de Viçosa - Especialização em Robótica</p>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.iconButton}>
            <FaBell />
            <span className={styles.badge}>3</span>
          </button>
          <button className={styles.iconButton}>
            <FaUser />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;