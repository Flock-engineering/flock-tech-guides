---
id: docusaurus-skill-raw
title: "SKILL.md — Docusaurus"
sidebar_label: "SKILL.md"
---

# SKILL.md — Docusaurus

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/docusaurus/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/docusaurus/SKILL.md)

---

````md
---
name: docusaurus
description: >
  Construcción de sitios Docusaurus con foco en usabilidad, diseño y buenas prácticas.
  Trigger: crear página docusaurus, agregar doc, configurar docusaurus, mejorar diseño docusaurus, crear componente docusaurus
license: MIT
metadata:
  author: flock-tech-guides
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear página Docusaurus'
    - 'Agregar documentación'
    - 'Configurar Docusaurus'
    - 'Mejorar diseño Docusaurus'
    - 'Crear componente Docusaurus'
    - 'Personalizar tema Docusaurus'
    - 'Agregar sidebar'
    - 'Crear landing page'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Docusaurus Skill

## Reglas Críticas

### ALWAYS

| Regla | Detalle |
|-------|---------|
| Usar CSS custom properties | Todo color, fuente y espaciado va en `:root` y `[data-theme='dark']` |
| Soporte dark mode | Cada estilo custom DEBE tener su contraparte `[data-theme='dark']` |
| CSS Modules para componentes | Archivos `styles.module.css` al lado del componente |
| Frontmatter completo en docs | `id`, `title`, `sidebar_label` como mínimo |
| Estructura de carpetas estándar | `docs/`, `src/pages/`, `src/components/`, `src/css/`, `static/` |
| Tipografía con jerarquía clara | Headings con font-family distinta al body |
| Responsive design | Todo componente custom debe funcionar en mobile (< 768px) |
| Contenido en español (Rioplatense) | Labels, sidebars, footer, admonitions |
| Imágenes en `static/img/` | Referenciar con `/img/nombre.png` (ruta absoluta desde static) |
| Sidebar colapsable | `hideable: true` en `themeConfig.docs.sidebar` |

### NEVER

| Regla | Detalle |
|-------|---------|
| Colores hardcodeados en componentes | Siempre usar `var(--nombre-variable)` |
| Estilos inline en JSX | Usar CSS Modules o clases de Infima |
| `!important` sin justificación | Solo para sobreescribir Infima cuando no hay otra opción |
| Docs sin `id` en frontmatter | Rompe las referencias en `sidebars.js` |
| Imágenes pesadas sin optimizar | Comprimir antes de agregar a `static/` |
| Modificar archivos en `node_modules/` | Usar swizzling: `npx docusaurus swizzle` |
| CSS global para componentes custom | Cada componente tiene su `styles.module.css` |
| Romper la estructura de `sidebars.js` | Respetar el patrón de categorías anidadas |
| Mezclar idiomas en la UI | Si el sitio es en español, TODO en español |
| Deployar sin verificar build | Siempre correr `npm run build` antes de push |

---

## Estructura de Proyecto

```
mi-sitio/
├── docs/                          # Contenido markdown/MDX
│   ├── intro.md                   # Página principal de docs
│   ├── categoria/
│   │   ├── doc-uno.md
│   │   └── doc-dos.md
│   └── otra-categoria/
│       └── subtema/
│           └── detalle.md
├── src/
│   ├── components/                # Componentes React reutilizables
│   │   └── MiComponente/
│   │       ├── index.tsx          # Componente
│   │       └── styles.module.css  # Estilos scoped
│   ├── css/
│   │   └── custom.css             # Design system global
│   └── pages/                     # Páginas custom (landing, about)
│       └── index.tsx              # Landing page
├── static/                        # Assets estáticos (copiados tal cual al build)
│   ├── img/
│   └── skills/
├── docusaurus.config.js           # Configuración principal
├── sidebars.js                    # Estructura de navegación
└── package.json
```

**Regla clave**: los docs van en `docs/`, las páginas custom en `src/pages/`, los componentes en `src/components/`. No mezclar.

---

## Configuración — `docusaurus.config.js`

### Estructura base

```javascript
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Mi Sitio',
  tagline: 'Descripción corta del sitio',
  favicon: 'img/favicon.png',

  url: 'https://mi-org.github.io',
  baseUrl: '/mi-repo/',

  organizationName: 'mi-org',
  projectName: 'mi-repo',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          editUrl: 'https://github.com/mi-org/mi-repo/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig: ({
    image: 'img/social-card.png',
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Mi Sitio',
        src: 'img/logo.png',
        srcDark: 'img/logo-dark.png',
      },
      items: [],
    },
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} Mi Organización.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'sql'],
    },
  }),
};

export default config;
```

### Plugins opcionales

```javascript
// Mermaid para diagramas
themes: ['@docusaurus/theme-mermaid'],
markdown: { mermaid: true },

// Algolia DocSearch
themeConfig: {
  algolia: {
    appId: 'TU_APP_ID',
    apiKey: 'TU_API_KEY_PUBLICA',
    indexName: 'tu-index',
    contextualSearch: true,
  },
},
```

---

## Diseño y Theming

### Sistema de Design Tokens (CSS Custom Properties)

El archivo `src/css/custom.css` es el corazón del design system. TODO pasa por variables CSS.

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
```

### Tokens Light Mode (`:root`)

```css
:root {
  --brand-deep:    #1E0535;
  --brand-dark:    #3C0A5E;
  --brand-mid:     #8B3DB8;
  --brand-soft:    #B06CD8;
  --brand-accent:  #F05023;

  --ifm-color-primary:          #8B3DB8;
  --ifm-color-primary-dark:     #7A34A3;
  --ifm-color-primary-darker:   #6E2E93;
  --ifm-color-primary-darkest:  #3C0A5E;
  --ifm-color-primary-light:    #9C4EC9;
  --ifm-color-primary-lighter:  #B06CD8;
  --ifm-color-primary-lightest: #C990E8;

  --ifm-font-family-base:      'DM Sans', system-ui, sans-serif;
  --ifm-heading-font-family:   'Syne', system-ui, sans-serif;
  --ifm-font-family-monospace: 'JetBrains Mono', monospace;

  --ifm-font-size-base:     15.5px;
  --ifm-line-height-base:   1.7;
  --ifm-heading-font-weight: 700;
  --ifm-global-radius:       6px;

  --shadow-sm:  0 1px 4px rgba(60, 10, 94, 0.08);
  --shadow-md:  0 4px 16px rgba(60, 10, 94, 0.12);
  --shadow-lg:  0 8px 32px rgba(60, 10, 94, 0.18);
}
```

### Tokens Dark Mode

```css
[data-theme='dark'] {
  --ifm-color-primary:           #C07EE8;
  --ifm-color-primary-dark:      #B068DF;
  --ifm-color-primary-darkest:   #8B3DB8;
  --ifm-color-primary-light:     #D09CF0;
  --ifm-color-primary-lightest:  #EDD4FA;

  --ifm-background-color:         #140322;
  --ifm-background-surface-color: #1C0830;
  --ifm-navbar-background-color:  #0F0219;
  --ifm-footer-background-color:  #0A011A;

  --ifm-color-content:           #E8DFF4;
  --ifm-color-content-secondary: #B89FCC;

  --shadow-sm:  0 1px 6px rgba(0, 0, 0, 0.35);
  --shadow-md:  0 4px 20px rgba(0, 0, 0, 0.4);
  --shadow-lg:  0 8px 40px rgba(0, 0, 0, 0.5);
}
```

### Jerarquía Tipográfica

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--ifm-heading-font-family);
  letter-spacing: -0.02em;
}

.markdown h1 {
  font-size: 2.1rem;
  font-weight: 800;
  border-bottom: 2px solid var(--brand-accent);
}

.markdown h2 {
  font-size: 1.45rem;
  margin-top: 2.5rem;
}
```

### Navbar, Sidebar, Code Blocks, Tables, Admonitions, Footer

(Ver secciones detalladas en el SKILL.md completo — cubriendo estilos para navbar con backdrop-filter, sidebar con borde activo, code blocks con sombras, tablas con header púrpura, admonitions por tipo, y footer con borde de acento.)

---

## Contenido y MDX

### Frontmatter estándar

```markdown
---
id: mi-documento
title: "Título del doc"
sidebar_label: "Etiqueta"
description: "Descripción para SEO"
---
```

### Admonitions, Tabs, Code Blocks, Mermaid

(Ver SKILL.md completo para ejemplos de cada uno.)

---

## Sidebars, Landing Pages, Componentes Custom, UX Patterns

(Ver SKILL.md completo para patrones de sidebars.js, HomepageFeatures, Hero Section, Card component, swizzling, navegación, búsqueda y responsive.)

---

## Comandos Útiles

```bash
npm start           # Dev con hot reload
npm run build       # Build de producción
npm run serve       # Servir build local
npm run clear       # Limpiar cache
npm run deploy      # Deploy a GitHub Pages
```

---

## Anti-Patterns

| Anti-Pattern | Solución |
|-------------|----------|
| Colores hardcodeados | `var(--nombre)` |
| Estilos inline | CSS Modules |
| CSS global para componentes | `styles.module.css` |
| Sidebar plano | Categorías anidadas |
| Imágenes > 500KB | Comprimir |
| H1 duplicados | H2 como primer heading |
| Docs sin `id` | Frontmatter completo |
| No verificar dark mode | Testear ambos temas |
````
