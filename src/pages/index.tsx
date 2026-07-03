import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

type Section = {
  title: string;
  href: string;
  desc: string;
  icon: ReactNode;
  tag?: string;
  featured?: boolean;
};

// Line icons (inherit currentColor). Kept inline to avoid an icon dependency.
const icons = {
  ia: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  backend: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
  frontend: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M9.5 6.5h.01" />
    </svg>
  ),
  development: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13.5 7l-3 10" />
    </svg>
  ),
  infra: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9.5 12l1.8 1.8 3.2-3.6" />
    </svg>
  ),
  proyectos: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  presentaciones: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M12 16v4M8 20h8" />
    </svg>
  ),
};

const arrow = (
  <svg className={styles.cardArrow} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const SECTIONS: Section[] = [
  {
    title: 'IA',
    tag: 'Destacado',
    featured: true,
    href: '/ia/handbook/manifiesto',
    desc: 'El Handbook IA, el catálogo de skills de Claude, templates de CLAUDE.md y buenas prácticas para trabajar con inteligencia artificial.',
    icon: icons.ia,
  },
  {
    title: 'Backend',
    href: '/backend/java',
    desc: 'Estándares y referencias para Java, .NET y los frameworks de backend del equipo.',
    icon: icons.backend,
  },
  {
    title: 'Front-end',
    href: '/front-end/angular',
    desc: 'Convenciones y setups para Angular, React y el stack de frontend.',
    icon: icons.frontend,
  },
  {
    title: 'Development',
    href: '/development/postman-use-guide',
    desc: 'Herramientas, style guides y estándares de linteo del día a día.',
    icon: icons.development,
  },
  {
    title: 'Infraestructura',
    href: '/infrastructure/setup-entra-auth',
    desc: 'Seguridad, autenticación y arquitectura cloud.',
    icon: icons.infra,
  },
  {
    title: 'Proyectos',
    href: '/proyectos/pibot/documento-funcional',
    desc: 'Documentación técnica de proyectos internos.',
    icon: icons.proyectos,
  },
  {
    title: 'Presentaciones',
    href: '/presentaciones/docusaurus',
    desc: 'Charlas y material de knowledge sharing del equipo.',
    icon: icons.presentaciones,
  },
];

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <span className={styles.eyebrow}>Documentación interna · Flock Engineering</span>
        <h1 className={styles.title}>
          El conocimiento del equipo,{' '}
          <span className={styles.titleAccent}>en un solo lugar.</span>
        </h1>
        <p className={styles.subtitle}>
          Guías, estándares y recursos para trabajar de forma consistente en todos
          los proyectos — del setup de un repo a cómo sacarle jugo a la IA.
        </p>
        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} to="/ia/handbook/manifiesto">
            Explorar el Handbook IA
            <span className={styles.btnArrow}>{arrow}</span>
          </Link>
          <Link className={styles.btnGhost} to="/search">
            Buscar en las guías
          </Link>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>7</span>
            <span className={styles.statLabel}>Áreas de conocimiento</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>130+</span>
            <span className={styles.statLabel}>Guías técnicas</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>50+</span>
            <span className={styles.statLabel}>Skills de Claude</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sections() {
  return (
    <section className={styles.sections}>
      <div className={styles.sectionsHead}>
        <span className={styles.sectionsKicker}>Explorá por área</span>
        <h2 className={styles.sectionsTitle}>¿Qué vas a encontrar?</h2>
      </div>
      <div className={styles.grid}>
        {SECTIONS.map((s, i) => (
          <Link
            key={s.title}
            to={s.href}
            className={`${styles.card} ${s.featured ? styles.cardFeatured : ''}`}
            style={{animationDelay: `${0.05 * i}s`}}
          >
            <span className={styles.cardIcon}>{s.icon}</span>
            <h3 className={styles.cardTitle}>
              {s.title}
              {s.tag && <span className={styles.cardTag}>{s.tag}</span>}
            </h3>
            <p className={styles.cardDesc}>{s.desc}</p>
            <span className={styles.cardLink}>
              Entrar {arrow}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Guías técnicas, estándares y recursos del equipo de ingeniería de Flock.">
      <main>
        <Hero />
        <Sections />
      </main>
    </Layout>
  );
}
