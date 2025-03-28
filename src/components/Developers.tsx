import React from 'react';
import styles from '../styles/Developers.module.css';

export function Developers() {
  const developers = [
    {
      name: 'Aravind G',
      role: 'Product Manager',
      whatsapp: 'https://wa.me/message/PKSZ7LCMUH43B1',
      email: 'aravindgdeeptech@gmail.com',
      github: 'https://github.com/G-IntelligentEarthian',
      avatar: '👨‍💼'
    },
    {
      name: 'Ashwath',
      role: 'Embedded Engineer',
      description: 'Visionary behind the app',
      avatar: '👨‍💻'
    }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Meet Our Team</h2>
      <div className={styles.teamGrid}>
        {developers.map((dev, index) => (
          <div key={index} className={styles.developerCard}>
            <div className={styles.avatar}>{dev.avatar}</div>
            <h3 className={styles.name}>{dev.name}</h3>
            <div className={styles.role}>{dev.role}</div>
            {dev.description && (
              <div className={styles.description}>{dev.description}</div>
            )}
            <div className={styles.links}>
              {dev.whatsapp && (
                <a
                  href={dev.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                  title="WhatsApp"
                >
                  📱
                </a>
              )}
              {dev.email && (
                <a
                  href={`mailto:${dev.email}`}
                  className={styles.link}
                  title="Email"
                >
                  ✉️
                </a>
              )}
              {dev.github && (
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                  title="GitHub"
                >
                  <svg height="24" width="24" viewBox="0 0 16 16" className={styles.githubIcon}>
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 