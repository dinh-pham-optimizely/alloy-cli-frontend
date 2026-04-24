import { z } from 'zod';
import {
  getComponentAsCapCaseWithSpacing,
  getComponentAsKebabCase,
  getComponentDataName,
  getComponentModelName,
  getComponentPageName,
  getComponentTemplateName,
  getCssClassName,
  getTypeFullText,
  srcPath,
  turnPascalCaseToCamelCase,
} from '../../lib/helpers';
import path from 'node:path';
import server from '../server';

server.registerTool(
  'resolve_names',
  {
    title: 'Resolve names',
    description: 'Compute ALL derived names and file paths in one call',
    inputSchema: z.object({
      componentName: z.string().describe('Name of the component to scaffold (e.g., "HeroBanner")'),
      type: z.enum(['a', 'm', 'o']).describe('Component type e.g., "a" for atoms, "m" for molecules, "o" for organisms'),
      projectPrefix: z.string().describe('CSS prefix e.g. xx (for BEM class names like "xx-hero-banner")'),
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
  ({ componentName, type, projectPrefix, directories }) => {
    const typeFullText = getTypeFullText(type);
    const kebabCase = getComponentAsKebabCase(componentName);
    const pageName = getComponentPageName(componentName);
    const templateName = getComponentTemplateName(componentName);

    const name = {
      componentName,
      modelName: getComponentModelName(componentName),
      kebabCase,
      camelCase: turnPascalCaseToCamelCase(componentName),
      templateName,
      dataName: getComponentDataName(componentName),
      pageName,
      capCase: getComponentAsCapCaseWithSpacing(componentName),
      cssClass: getCssClassName(componentName, projectPrefix, type),
    };

    const paths = {
      component: path.join(srcPath, `${typeFullText}/${kebabCase}/${componentName}.tsx`),
      type: path.join(srcPath, `_types/${typeFullText}.d.ts`),
      style: path.join(srcPath, `${typeFullText}/${kebabCase}/${componentName}.scss`),
      state: path.join(srcPath, `${typeFullText}/${kebabCase}/${componentName}.states.json`),
      scripts: path.join(srcPath, `assets/scripts/${kebabCase}.entry.ts`),
      page: path.join(srcPath, `pages/${pageName}.tsx`),
      template: path.join(srcPath, `templates/${kebabCase}/${templateName}.tsx`),
    };

    const response = JSON.stringify({
      name,
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
