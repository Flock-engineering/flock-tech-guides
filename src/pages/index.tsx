import React, {useEffect, useLayoutEffect, useRef, useState, type ReactNode} from 'react';
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
      <rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" />
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
  {title: 'IA', tag: 'Destacado', featured: true, href: '/ia/handbook/manifiesto', desc: 'El Handbook IA, el catálogo de skills de Claude, templates de CLAUDE.md y buenas prácticas para trabajar con inteligencia artificial.', icon: icons.ia},
  {title: 'Backend', href: '/backend/java', desc: 'Estándares y referencias para Java, .NET y los frameworks de backend del equipo.', icon: icons.backend},
  {title: 'Front-end', href: '/front-end/angular', desc: 'Convenciones y setups para Angular, React y el stack de frontend.', icon: icons.frontend},
  {title: 'Development', href: '/development/postman-use-guide', desc: 'Herramientas, style guides y estándares de linteo del día a día.', icon: icons.development},
  {title: 'Infraestructura', href: '/infrastructure/setup-entra-auth', desc: 'Seguridad, autenticación y arquitectura cloud.', icon: icons.infra},
  {title: 'Proyectos', href: '/proyectos/pibot/documento-funcional', desc: 'Documentación técnica de proyectos internos.', icon: icons.proyectos},
  {title: 'Presentaciones', href: '/presentaciones/docusaurus', desc: 'Charlas y material de knowledge sharing del equipo.', icon: icons.presentaciones},
];

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const h = () => setReduced(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  return reduced;
}

/* ── Effect B: headline that "compiles" (decode / scramble) ── */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/=><$@01?';
const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const scrambleAll = (text: string) =>
  text.split('').map((ch) => (ch === ' ' ? ' ' : rnd())).join('');
const mix = (text: string, revealed: number) =>
  text.split('').map((ch, i) => (ch === ' ' ? ' ' : i < revealed ? ch : rnd())).join('');

// Run a layout effect on the client, but fall back to a no-op effect during SSR.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function DecodeText({text, play}: {text: string; play: boolean}) {
  // SSR / no-JS / reduced-motion render the real title (SEO-safe, never blank).
  const [out, setOut] = useState(text);

  // Before the first client paint, swap to a fully-scrambled string so the
  // headline visibly "compiles" instead of finishing before it's on screen.
  useIsoLayoutEffect(() => {
    if (play) setOut(scrambleAll(text));
  }, [play, text]);

  useEffect(() => {
    if (!play) { setOut(text); return; }
    let frame = 0;
    let interval: ReturnType<typeof setInterval>;
    // Hold the scrambled state briefly (so it's noticed after paint), then resolve.
    const start = setTimeout(() => {
      interval = setInterval(() => {
        const revealed = Math.floor(frame / 2);
        setOut(mix(text, revealed));
        frame++;
        if (revealed > text.length) { clearInterval(interval); setOut(text); }
      }, 45);
    }, 480);
    return () => { clearTimeout(start); clearInterval(interval); };
  }, [text, play]);

  return <>{out}</>;
}

/* ── Effect A: cursor-reactive living background ── */
function LivingBg() {
  return (
    <div className={styles.livingBg} aria-hidden>
      <span className={`${styles.blob} ${styles.blobA}`} />
      <span className={`${styles.blob} ${styles.blobB}`} />
      <div className={styles.gridReveal} />
      <div className={styles.spot} />
    </div>
  );
}

function Hero({motion}: {motion: boolean}) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!motion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <header className={styles.hero} ref={ref} onMouseMove={onMove}>
      {motion && <LivingBg />}
      <div className={styles.heroInner}>
        <span className={styles.eyebrow}>Documentación interna · Flock Engineering</span>
        <h1 className={styles.title}>
          <DecodeText text="El conocimiento del equipo, " play={motion} />
          <span className={styles.titleAccent}>
            <DecodeText text="en un solo lugar." play={motion} />
          </span>
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

function SectionCard({sec, index, motion}: {sec: Section; index: number; motion: boolean}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!motion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty('--ry', `${(px - 0.5) * 10}deg`);
    ref.current.style.setProperty('--rx', `${(0.5 - py) * 10}deg`);
    ref.current.style.setProperty('--gx', `${px * 100}%`);
    ref.current.style.setProperty('--gy', `${py * 100}%`);
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty('--rx', '0deg');
    ref.current.style.setProperty('--ry', '0deg');
  };
  return (
    <Link
      ref={ref}
      to={sec.href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${styles.card} ${sec.featured ? styles.cardFeatured : ''} ${motion ? styles.tilt : ''}`}
      style={{animationDelay: `${0.05 * index}s`}}>
      {motion && sec.featured && (
        <span className={styles.beamWrap} aria-hidden><span className={styles.beamMask} /></span>
      )}
      {motion && <span className={styles.glare} aria-hidden />}
      <span className={styles.cardBody}>
        <span className={styles.cardIcon}>{sec.icon}</span>
        <h3 className={styles.cardTitle}>
          {sec.title}
          {sec.tag && <span className={styles.cardTag}>{sec.tag}</span>}
        </h3>
        <p className={styles.cardDesc}>{sec.desc}</p>
        <span className={styles.cardLink}>Entrar {arrow}</span>
      </span>
    </Link>
  );
}

function Sections({motion}: {motion: boolean}) {
  return (
    <section className={styles.sections}>
      <div className={styles.sectionsHead}>
        <span className={styles.sectionsKicker}>Explorá por área</span>
        <h2 className={styles.sectionsTitle}>¿Qué vas a encontrar?</h2>
      </div>
      <div className={styles.grid}>
        {SECTIONS.map((sec, i) => (
          <SectionCard key={sec.title} sec={sec} index={i} motion={motion} />
        ))}
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const reduced = useReducedMotion();
  const motion = !reduced;
  return (
    <Layout
      title={siteConfig.title}
      description="Guías técnicas, estándares y recursos del equipo de ingeniería de Flock.">
      <main>
        <Hero motion={motion} />
        <Sections motion={motion} />
      </main>
    </Layout>
  );
}
