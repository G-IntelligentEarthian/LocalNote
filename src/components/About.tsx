import React from 'react';
import styles from '../styles/About.module.css';

export const About: React.FC = () => {
  const developers = [
    {
      name: 'Aravind G',
      role: 'Product Manager',
      avatar: '👨‍💼',
      whatsapp: '+1234567890',
      email: 'aravind@example.com',
      github: 'aravindg'
    },
    {
      name: 'Ashwath',
      role: 'Embedded Engineer',
      avatar: '👨‍💻',
      description: 'Visionary behind the app'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Hero/Splash Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>LocalNote</h1>
        <p className={styles.tagline}>Data in your ownership</p>
      </section>

      {/* How It Works Section */}
      <section className={styles.section}>
        <h2>How It Works</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📝</div>
            <h3>Create & Edit</h3>
            <p>Create and edit notes with a clean, intuitive interface. Changes are automatically saved as you type.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💾</div>
            <h3>Local Storage</h3>
            <p>Your notes are stored securely on your device. Choose between IndexedDB, LocalStorage, or File System storage.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🔄</div>
            <h3>Export & Backup</h3>
            <p>Export your notes for backup or transfer. Automatic backups ensure your data is never lost.</p>
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className={styles.section}>
        <h2>Security Features</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🔒</div>
            <h3>Client-Side Only</h3>
            <p>All data stays on your device. No server communication means complete privacy.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🛡️</div>
            <h3>Multiple Storage Options</h3>
            <p>Choose your preferred storage method based on your security needs and usage patterns.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📦</div>
            <h3>Automatic Backups</h3>
            <p>Regular backups protect against data loss while maintaining security.</p>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div className={styles.diagram}>
          <h3>How Your Data Flows</h3>
          <div className={styles.diagramContent}>
            <div className={styles.diagramNode}>User Input</div>
            <div className={styles.diagramArrow}>→</div>
            <div className={styles.diagramNode}>Client-Side Processing</div>
            <div className={styles.diagramArrow}>→</div>
            <div className={styles.diagramNode}>Local Storage</div>
          </div>
          <p className={styles.diagramCaption}>All operations happen locally on your device, ensuring data privacy and security</p>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section}>
        <h2>Meet Our Team</h2>
        <div className={styles.teamGrid}>
          {developers.map((dev, index) => (
            <div key={index} className={styles.developerCard}>
              <div className={styles.avatar}>{dev.avatar}</div>
              <h3 className={styles.name}>{dev.name}</h3>
              <p className={styles.role}>{dev.role}</p>
              {dev.description && <p className={styles.description}>{dev.description}</p>}
              {!dev.description && (
                <div className={styles.links}>
                  <a href={`https://wa.me/${dev.whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <span className={styles.whatsappIcon}>💬</span>
                  </a>
                  <a href={`mailto:${dev.email}`} className={styles.link}>
                    <span>✉️</span>
                  </a>
                  <a href={`https://github.com/${dev.github}`} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <span className={styles.githubIcon}>⌨️</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}; 