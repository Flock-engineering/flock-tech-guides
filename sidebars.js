module.exports = {
  docs: 
  {
    'Introduction': ['intro'],
    'Development': [
      'development/style-guide',
      'development/postman-use-guide',
      'development/redhat-dependency-analitycs/redhat-dependency-analitycs',
      'development/cursor/cursor-guide'
    ],
    'Backend': [ 
      {
        type: 'category',
        label: 'Java',
        items: 
        [
          'backend/java/java'
        ],
      },
      {
        type: 'category',
        label: 'Netcore',
        items: 
        [
          'backend/net-core/net-core'
        ],
      }, 
    ],
    'Front-end': [ 
      {
        type: 'category',
        label: 'Angular',
        items: 
        [
          'front-end/angular/angular'
        ],
      },
      {
        type: 'category',
        label: 'React',
        items: 
        [
          'front-end/react/preset'
        ],
      }, 
    ],
    'Presentaciones': [
      'presentaciones/docusaurus',
      'presentaciones/codeium'
    ],
    'Proyectos': [
      {
        type: 'category',
        label: 'Pibot',
        items: 
        [
          'proyectos/pibot/capas-de-librerias',
          'proyectos/pibot/lambda-documentacion',
          'proyectos/pibot/documento-funcional'
        ],
      },
      {
        type: 'category',
        label: 'Backend para Training',
        items: 
        [
          'proyectos/backend-para-training/backend-para-training'
        ],
      }
    ],
    'infrastructure': [
      {
        type: 'category',
        label: 'IBM Cibersecurity Series 2024',
        items: 
        [
          'infrastructure/ibm-cibersecurity-series-2024/ai-in-security',
          'infrastructure/ibm-cibersecurity-series-2024/estrategia-de-ciberseguridad-en-los-negocios',
          'infrastructure/ibm-cibersecurity-series-2024/gestion-de-identidades',
          'infrastructure/ibm-cibersecurity-series-2024/seguridad-de-los-datos'
        ],
      }
    ]
  },
};



