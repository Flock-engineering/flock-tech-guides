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
        'development/postman-use-guide',
        'development/redhat-dependency-analitycs/redhat-dependency-analitycs',
        'development/cursor/cursor-guide',
        {
          type: 'category',
          label: 'Estándares y Linteo - Flock Style',
          items: [
            'linteo/java-linteo',
            'linteo/netcore-linteo',
            'linteo/angular-linteo',
            'linteo/react-linteo',
            'linteo/nodejs-linteo',
          ],
        },
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
          items: [
            {
              type: 'category',
              label: 'Word Doc',
              items: [
                'ia/claude-skills/word-skill',
                'ia/claude-skills/word-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'Commit',
              items: [
                'ia/claude-skills/commit-skill',
                'ia/claude-skills/commit-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'Jest',
              items: [
                'ia/claude-skills/jest-skill',
                'ia/claude-skills/jest-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'Jira',
              items: [
                'ia/claude-skills/jira-skill',
                'ia/claude-skills/jira-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'NestJS',
              items: [
                'ia/claude-skills/nestjs-skill',
                'ia/claude-skills/nestjs-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'Prisma',
              items: [
                'ia/claude-skills/prisma-skill',
                'ia/claude-skills/prisma-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'Skill Creator',
              items: [
                'ia/claude-skills/skill-creator-skill',
                'ia/claude-skills/skill-creator-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'Swagger',
              items: [
                'ia/claude-skills/swagger-skill',
                'ia/claude-skills/swagger-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'TypeScript',
              items: [
                'ia/claude-skills/typescript-skill',
                'ia/claude-skills/typescript-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'Java',
              items: [
                'ia/claude-skills/java-skill',
                'ia/claude-skills/java-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'NetCore',
              items: [
                'ia/claude-skills/netcore-skill',
                'ia/claude-skills/netcore-skill-raw',
              ],
            },
            {
              type: 'category',
              label: 'N8N',
              items: [
                {
                  type: 'category',
                  label: 'N8N Workflow',
                  items: [
                    'ia/claude-skills/n8n-workflow-skill',
                    'ia/claude-skills/n8n-workflow-skill-raw',
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: 'Proyectos',
              items: [
                {
                  type: 'category',
                  label: 'Nomadear',
                  items: [
                    {
                      type: 'category',
                      label: 'API',
                      items: [
                        'ia/claude-skills/nomadear-api-skill',
                        'ia/claude-skills/nomadear-api-skill-raw',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Auth',
                      items: [
                        'ia/claude-skills/nomadear-auth-skill',
                        'ia/claude-skills/nomadear-auth-skill-raw',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Bot',
                      items: [
                        'ia/claude-skills/nomadear-bot-skill',
                        'ia/claude-skills/nomadear-bot-skill-raw',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Events',
                      items: [
                        'ia/claude-skills/nomadear-events-skill',
                        'ia/claude-skills/nomadear-events-skill-raw',
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Registrations',
                      items: [
                        'ia/claude-skills/nomadear-registrations-skill',
                        'ia/claude-skills/nomadear-registrations-skill-raw',
                      ],
                    },
                  ],
                },
              ],
            },
          ],
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
