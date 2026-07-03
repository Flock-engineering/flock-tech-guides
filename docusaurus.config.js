// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import {createRequire} from 'module';

// ESM config: recreate `require` so we can resolve theme packages by path.
const require = createRequire(import.meta.url);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Flock Tech Guides',
  tagline: 'Guías técnicas para el equipo de Flock',
  favicon: 'img/logo-flock.png',

  // Set the production url of your site here
  url: 'https://flock-tech-guides.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served.
  // Single source of truth for the base path — content resolves asset URLs
  // through this value (see src/components/DownloadButton). Served from the
  // domain root on Vercel; override via DOCUSAURUS_BASE_URL if deployed elsewhere.
  baseUrl: process.env.DOCUSAURUS_BASE_URL || '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  // Auto-collapse sidebar categories on first load + expose the navbar button.
  clientModules: ['./src/clientModules/collapseAll.js'],

  themes: [
    '@docusaurus/theme-mermaid',
    // Offline, client-side search. The site is gated behind Entra ID auth, so a
    // crawler-based service (Algolia) can't reach it — this theme builds a
    // static index at build time that ships with the site and runs in-browser.
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['es', 'en'],
        indexDocs: true,
        indexBlog: false,
        // Docs are served at the site root (routeBasePath: '/').
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          routeBasePath: '/',
          editUrl:
            'https://github.com/Mujics/flock-tech-guides/tree/main/flock-tech-guides',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/flock-tech-guides-social-card.png',
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      navbar: {
        title: '',
        logo: {
          alt: 'Flock Tech Guides',
          src: 'img/logo-completo-flock.png',
          srcDark: 'img/logo-completo-flock.png',
        },
        items: [
          {
            type: 'html',
            position: 'left',
            value:
              '<button class="flock-collapse-btn" onclick="window.__flockCollapseAll&&window.__flockCollapseAll()" title="Colapsar todas las categorías"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.4"/><rect x="7" y="1" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="7" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.4"/><rect x="7" y="7" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.4"/></svg>Colapsar todo</button>',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} Flock Engineering. Built with Docusaurus.`,
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
