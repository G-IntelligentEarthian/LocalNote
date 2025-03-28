import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.titleLink}>
          <h1 className={styles.title}>LocalNote</h1>
        </Link>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
} 