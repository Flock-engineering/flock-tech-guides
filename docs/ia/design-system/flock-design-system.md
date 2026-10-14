---
id: flock-design-system
title: "Flock Design System"
sidebar_label: "Flock Design System"
---

import useBaseUrl from '@docusaurus/useBaseUrl';

export const VIEWER_PATH = 'design-system/flock-design-system.html';

export const OpenViewerLink = ({children}) => (
  <a href={useBaseUrl(VIEWER_PATH)} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export const DesignSystemViewer = () => (
  <iframe
    src={useBaseUrl(VIEWER_PATH)}
    title="Flock Design System"
    loading="lazy"
    style={{
      width: '100%',
      height: '85vh',
      border: '1px solid var(--ifm-color-emphasis-300)',
      borderRadius: '8px',
    }}
  />
);

# Flock Design System

Visor del **Flock Design System**: brand book, design tokens (colores, tipografía, spacing, radios, sombras) y los más de 80 componentes con su preview en vivo, agrupados por categoría. Tiene toggle de tema claro/oscuro.

Es un snapshot exportado del artifact de Design System que mantiene el equipo en claude.ai, empaquetado como un único HTML autocontenido.

**<OpenViewerLink>↗ Abrir en pantalla completa</OpenViewerLink>**

<DesignSystemViewer />

:::note Tené en cuenta
- **Es un snapshot estático.** Si el design system cambia en el artifact original, hay que volver a exportar este HTML.
- **Las fuentes (Zalando Sans) se cargan desde Google Fonts.** Sin conexión, el texto cae a la fuente del sistema; el resto funciona offline.
:::

## ¿Y para que Claude lo use?

Si querés que Claude construya UI con la identidad de Flock, instalá el skill: [Claude Skill: Flock Design System](../claude-skills/flock-design-system-skill.md).
