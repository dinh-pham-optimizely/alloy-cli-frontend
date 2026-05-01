import server from '../server';
import { z } from 'zod';
import { getTypeFullText } from '../../lib/helpers';
import { readModelRegistry, scanModels, updateModelRegistry, writeModelRegistry } from '../../lib/scanner';
import path from 'node:path';

server.registerTool(
  'model_register',
  {
    title: 'Scaffold',
    description: 'Full component scaffolding in one call. Creates all requested files, appends type, updates registry',
    inputSchema: z.object({
      componentName: z.string().describe('Name of the component to scaffold (e.g., "HeroBanner")'),
      type: z.enum(['a', 'm', 'o']).describe('Component type e.g., "a" for atoms, "m" for molecules, "o" for organisms'),
      action: z
        .enum(['read', 'update', 'scan'])
        .describe(
          'Action to perform on the model registry: "read" to get current registry, "update" to add/update the component, "scan" to re-scan the entire project and update the registry accordingly'
        ),
      typeDirectory: z.string().default('_types').describe('Directory where type files are stored, default is "_types"'),
    }),
  },
  async ({ componentName, type, typeDirectory, action }) => {
    let response = '';

    switch (action) {
      case 'update':
        updateModelRegistry(process.cwd(), componentName, type);
        const typeFullText = getTypeFullText(type);

        response = JSON.stringify({
          registry: {
            action: 'updated',
            model: `${componentName}Model`,
            category: typeFullText,
          },
        });
        break;

      case 'scan':
        const typesDir = path.join(process.cwd(), 'src', typeDirectory || '_types');
        const registry = scanModels(typesDir);
        writeModelRegistry(process.cwd(), registry);

        response = JSON.stringify({
          registry: {
            action: 'scanned',
          },
        });
        break;

      case 'read':
      default:
        response = JSON.stringify(readModelRegistry(process.cwd()));
        break;
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: response,
        },
      ],
    };
  }
);
