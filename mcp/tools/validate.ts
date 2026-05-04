import server from '../server';
import { z } from 'zod';
import {
  getComponentAsCamelCase,
  getComponentAsKebabCase,
  getComponentPageName,
  getComponentPathName,
  getComponentTemplateName,
  getDataPathName,
  getPagePathName,
  getScriptPathName,
  getStatePathName,
  getStylePathName,
  getTemplatePathName,
  getTypeFullText,
  getTypePathName,
} from '../../lib/helpers';
import { modelExistsInRegistry } from '../../lib/scanner';
import { ValidationResult } from '../../types';

server.registerTool(
  'validate',
  {
    title: 'validate',
    description: 'Pre-flight checks before scaffolding',
    inputSchema: z.object({
      componentName: z.string().describe('Name of the component to scaffold (e.g., "HeroBanner")'),
      type: z.enum(['a', 'm', 'o']).describe('Component type e.g., "a" for atoms, "m" for molecules, "o" for organisms'),
      directories: z.optional(
        z.object({
          component: z.string().describe('Component directory'),
          page: z.string().describe('Page directory'),
          template: z.string().describe('Template directory'),
          data: z.string().describe('Data directory'),
          script: z.string().describe('Script directory'),
          style: z.string().describe('Style directory'),
          state: z.string().describe('State directory'),
        })
      ),
    }),
  },
  ({ componentName, type, directories }) => {
    const typeFullText = getTypeFullText(type);
    const kebabCase = getComponentAsKebabCase(componentName);
    const pageName = getComponentPageName(componentName);
    const templateName = getComponentTemplateName(componentName);
    const camelCase = getComponentAsCamelCase(componentName);

    const pascalCase = /^[A-Z][a-zA-Z0-9]+$/.test(componentName)
      ? undefined
      : {
          pass: false,
          message: 'Component name should be in PascalCase (e.g., "HeroBanner")',
        };

    let isValid: boolean | undefined = true;
    let checks: ValidationResult = {};

    try {
      const componentExists = getComponentPathName({
        componentName,
        typeFullText,
        kebabCase,
        directory: directories?.component,
      }).fileExists
        ? {
            pass: false,
            message: 'Component file already exists',
          }
        : undefined;

      const pageExists = getPagePathName({ pageName, directory: directories?.page }).fileExists
        ? {
            pass: false,
            message: 'Page file already exists',
          }
        : undefined;

      const templateExists = getTemplatePathName({
        templateName,
        kebabCase,
        directory: directories?.template,
      }).fileExists
        ? {
            pass: false,
            message: 'Template file already exists',
          }
        : undefined;

      const dataExists = getDataPathName({ camelCase, directory: directories?.data }).fileExists
        ? {
            pass: false,
            message: 'Data file already exists',
          }
        : undefined;

      const scriptExists = getScriptPathName({ kebabCase, directory: directories?.script }).fileExists
        ? {
            pass: false,
            message: 'Script file already exists',
          }
        : undefined;

      const styleExists = getStylePathName({ componentName, kebabCase, typeFullText }).fileExists
        ? {
            pass: false,
            message: 'Style file already exists',
          }
        : undefined;

      const stateExists = getStatePathName({ kebabCase, componentName, typeFullText }).fileExists
        ? {
            pass: false,
            message: 'State file already exists',
          }
        : undefined;

      const typeFileExists = !getTypePathName({ typeFullText }).fileExists
        ? {
            pass: false,
            message: `Type file for ${typeFullText} does not exist in src/_types/${typeFullText}.d.ts`,
          }
        : undefined;

      const registryConflict = modelExistsInRegistry(process.cwd(), componentName, type)
        ? {
            pass: false,
            message: `Component "${componentName}" of type "${typeFullText}" already exists in the model registry`,
          }
        : undefined;

      isValid =
        !pascalCase &&
        !componentExists &&
        !pageExists &&
        !templateExists &&
        !dataExists &&
        !scriptExists &&
        !styleExists &&
        !stateExists &&
        !typeFileExists &&
        !registryConflict;

      checks = {
        pascalCase,
        componentExists,
        pageExists,
        templateExists,
        dataExists,
        scriptExists,
        styleExists,
        stateExists,
        typeFileExists,
        registryConflict,
      };
    } catch (error) {
      isValid = false;
      checks['toolError'] = {
        pass: false,
        message: `An error occurred during validation: ${(error as Error).message}`,
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            valid: !!isValid,
            ...(!isValid ? checks : undefined),
          }),
        },
      ],
    };
  }
);
