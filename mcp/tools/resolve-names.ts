import { z } from 'zod';
import {
  getComponentAsCapCaseWithSpacing,
  getComponentAsKebabCase,
  getComponentDataName,
  getComponentModelName,
  getComponentPageName,
  getComponentTemplateName,
  getCssClassName, getPaths,
  getTypeFullText,
  turnPascalCaseToCamelCase,
} from '../../lib/helpers';
import server from '../server';

server.registerTool(
  'resolve_names',
  {
    title: 'Resolve names',
    description: 'Compute ALL derived names and file paths in one call',
    inputSchema: z.object({
      componentName: z.string().describe('Name of the component to scaffold (e.g., "HeroBanner")'),
      type: z.enum(['a', 'm', 'o']).describe('Component type e.g., "a" for atoms, "m" for molecules, "o" for organisms'),
      directories: z.optional(
        z.object({
          component: z.string().describe('default: `{typeFullText}` (e.g., "organisms")'),
          type: z.string().default('_types').describe('default: `"_types"`'),
          page: z.string().default('pages').describe('default: `"pages"`'),
          template: z.string().default('templates').describe('default: `"templates"`'),
          data: z.string().default('_data').describe('default: `"_data"`'),
          script: z.string().default('scripts').describe('default: `"scripts"`'),
        })
      ),
    }),
  },
  ({ componentName, type, directories }) => {
    const typeFullText = getTypeFullText(type);

    const paths = getPaths({
      typeFullText,
      componentName,
      directories,
    });

    const response = JSON.stringify({
      paths,
    });

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
