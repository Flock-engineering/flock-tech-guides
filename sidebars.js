module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introducción',
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/style-guide',
        'development/postman-use-guide',
        'development/redhat-dependency-analitycs/redhat-dependency-analitycs',
        'development/cursor/cursor-guide',
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      items: [
        {
          type: 'category',
          label: 'Java',
          items: ['backend/java/java'],
        },
        {
          type: 'category',
          label: 'Netcore',
          items: ['backend/net-core/net-core'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Front-end',
      items: [
        {
          type: 'category',
          label: 'Angular',
          items: ['front-end/angular/angular'],
        },
        {
          type: 'category',
          label: 'React',
          items: ['front-end/react/preset'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Presentaciones',
      items: [
        'presentaciones/docusaurus',
        'presentaciones/charlas-flock',
        'presentaciones/codeium',
      ],
    },
    {
      type: 'category',
      label: 'Proyectos',
      items: [
        {
          type: 'category',
          label: 'Pibot',
          items: [
            'proyectos/pibot/capas-de-librerias',
            'proyectos/pibot/lambda-documentacion',
            'proyectos/pibot/documento-funcional',
          ],
        },
        {
          type: 'category',
          label: 'Backend para Training',
          items: ['proyectos/backend-para-training/backend-para-training'],
        },
      ],
    },
    {
      type: 'category',
      label: 'IA',
      items: [
        {
          type: 'category',
          label: 'Artículos',
          items: ['ia/compact-your-context'],
        },
        {
          type: 'category',
          label: 'Claude Skills',
          items: ['ia/claude-skills/word-skill'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Infrastructure',
      items: [
        {
          type: 'category',
          label: 'IBM Cibersecurity Series 2024',
          items: [
            'infrastructure/ibm-cibersecurity-series-2024/ai-in-security',
            'infrastructure/ibm-cibersecurity-series-2024/estrategia-de-ciberseguridad-en-los-negocios',
            'infrastructure/ibm-cibersecurity-series-2024/gestion-de-identidades',
            'infrastructure/ibm-cibersecurity-series-2024/seguridad-de-los-datos',
          ],
        },
      ],
    },
  ],
};
