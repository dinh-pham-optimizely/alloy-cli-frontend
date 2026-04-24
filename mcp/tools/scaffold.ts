import server from '../server';
import { z } from 'zod';
import fs from 'fs';
import path from 'node:path';
import {
  getComponentAsCamelCase,
  getComponentAsKebabCase,
  getTypeFullText,
  srcPath,
  createFolder,
  createFile,
  appendContentToFile,
} from '../../lib/helpers';
import {
  renderComponentContent,
  renderComponentData,
  renderComponentState,
  renderComponentStyle,
  renderComponentType,
  renderPageComponent,
  renderTemplateComponent,
} from '../../lib/renderers';
import { updateModelRegistry } from '../../lib/scanner';

type FileResult = { path: string; action: 'created' | 'appended'; fileType: string };
type SkipResult = { path: string; reason: string };

server.registerTool(
  'scaffold',
  {
    title: 'Scaffold',
    description: 'Full component scaffolding in one call. Creates all requested files, appends type, updates registry',
    inputSchema: z.object({
      componentName: z.string().describe('Name of the component to scaffold (e.g., "HeroBanner")'),
      type: z.enum(['a', 'm', 'o']).describe('Component type e.g., "a" for atoms, "m" for molecules, "o" for organisms'),
      projectPrefix: z.string().describe('CSS prefix e.g. xx (for BEM class names like "xx-hero-banner")'),
      files: z.object({
        style: z.boolean().describe('Whether to create a style file (e.g., HeroBanner.scss), default is false'),
        script: z.boolean().describe('Whether to create a script file (e.g., HeroBanner.entry.ts), default is false'),
        state: z.boolean().describe('Whether to create a state file (e.g., HeroBanner.states.json), default is false'),
        page: z.boolean().describe('Whether to create a page file (e.g., HeroBannerPage.tsx), default is false'),
        pageStory: z
          .boolean()
          .describe('Whether to create a page as a page story type (e.g., HeroBannerPage.tsx), default is false - only when page=true'),
        data: z.boolean().describe('Whether to create a data file (e.g., heroBanner.ts), default is false'),
      }),
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
      force: z.optional(z.boolean().describe('Whether to overwrite existing files if they exist, default is false')),
    }),
  },
  async ({ componentName, projectPrefix, type, directories, files, force }) => {
    const created: FileResult[] = [];
    const skipped: SkipResult[] = [];

    const typeFullText = getTypeFullText(type);
    const kebabCase = getComponentAsKebabCase(componentName);
    const camelCase = getComponentAsCamelCase(componentName);

    const dirs = {
      component: directories?.component ?? typeFullText,
      type: directories?.type ?? '_types',
      page: directories?.page ?? 'pages',
      template: directories?.template ?? 'templates',
      data: directories?.data ?? '_data',
      script: directories?.script ?? 'assets/scripts',
    };

    const shouldWrite = (filePath: string): boolean => {
      if (force) return true;
      return !fs.existsSync(filePath);
    };

    // 1. Type definition — always appended
    const typeFolderPath = path.join(srcPath, dirs.type);
    const typeFilePath = path.join(typeFolderPath, `${typeFullText}.d.ts`);
    const typeContent = await renderComponentType({ componentName, type });
    createFolder(typeFolderPath);
    appendContentToFile(typeFilePath, typeContent);
    created.push({ path: `src/${dirs.type}/${typeFullText}.d.ts`, action: 'appended', fileType: 'type' });

    // Update model registry
    updateModelRegistry(process.cwd(), componentName, type);

    // 2. State file
    if (files.state) {
      const stateFolderPath = path.join(srcPath, `${dirs.component}/${kebabCase}`);
      const stateFilePath = path.join(stateFolderPath, `${componentName}.states.json`);
      if (shouldWrite(stateFilePath)) {
        const stateContent = await renderComponentState({ componentName, projectPrefix, type });
        createFolder(stateFolderPath);
        createFile(stateFilePath, stateContent);
        created.push({ path: `src/${dirs.component}/${kebabCase}/${componentName}.states.json`, action: 'created', fileType: 'state' });
      } else {
        skipped.push({ path: `src/${dirs.component}/${kebabCase}/${componentName}.states.json`, reason: 'file already exists' });
      }
    }

    // 3. Style file
    if (files.style) {
      const styleFolderPath = path.join(srcPath, `${dirs.component}/${kebabCase}`);
      const styleFilePath = path.join(styleFolderPath, `${componentName}.scss`);
      if (shouldWrite(styleFilePath)) {
        const styleContent = await renderComponentStyle({ componentName, projectPrefix, type });
        createFolder(styleFolderPath);
        createFile(styleFilePath, styleContent);
        created.push({ path: `src/${dirs.component}/${kebabCase}/${componentName}.scss`, action: 'created', fileType: 'style' });
      } else {
        skipped.push({ path: `src/${dirs.component}/${kebabCase}/${componentName}.scss`, reason: 'file already exists' });
      }
    }

    // 4. Script file
    if (files.script) {
      const scriptFolderPath = path.join(srcPath, dirs.script);
      const scriptFilePath = path.join(scriptFolderPath, `${kebabCase}.entry.ts`);
      if (shouldWrite(scriptFilePath)) {
        createFolder(scriptFolderPath);
        createFile(scriptFilePath, '');
        created.push({ path: `src/${dirs.script}/${kebabCase}.entry.ts`, action: 'created', fileType: 'script' });
      } else {
        skipped.push({ path: `src/${dirs.script}/${kebabCase}.entry.ts`, reason: 'file already exists' });
      }
    }

    // 5. Page component
    if (files.page) {
      const pageFolderPath = path.join(srcPath, dirs.page);
      const pageFilePath = path.join(pageFolderPath, `${componentName}Page.tsx`);
      if (shouldWrite(pageFilePath)) {
        const pageContent = await renderPageComponent({
          componentName,
          isUsingPageStoryTemplate: files.pageStory,
        });
        createFolder(pageFolderPath);
        createFile(pageFilePath, pageContent);
        created.push({ path: `src/${dirs.page}/${componentName}Page.tsx`, action: 'created', fileType: 'page' });
      } else {
        skipped.push({ path: `src/${dirs.page}/${componentName}Page.tsx`, reason: 'file already exists' });
      }

      // 6. Template component — auto-created with page
      const templateFolderPath = path.join(srcPath, `${dirs.template}/${kebabCase}`);
      const templateFilePath = path.join(templateFolderPath, `${componentName}Template.tsx`);
      if (shouldWrite(templateFilePath)) {
        const templateContent = await renderTemplateComponent({ componentName });
        createFolder(templateFolderPath);
        createFile(templateFilePath, templateContent);
        created.push({ path: `src/${dirs.template}/${kebabCase}/${componentName}Template.tsx`, action: 'created', fileType: 'template' });
      } else {
        skipped.push({ path: `src/${dirs.template}/${kebabCase}/${componentName}Template.tsx`, reason: 'file already exists' });
      }
    }

    // 7. Data file
    if (files.data) {
      const dataFolderPath = path.join(srcPath, dirs.data);
      const dataFilePath = path.join(dataFolderPath, `${camelCase}.ts`);
      if (shouldWrite(dataFilePath)) {
        const dataContent = await renderComponentData({ componentName });
        createFolder(dataFolderPath);
        createFile(dataFilePath, dataContent);
        created.push({ path: `src/${dirs.data}/${camelCase}.ts`, action: 'created', fileType: 'data' });
      } else {
        skipped.push({ path: `src/${dirs.data}/${camelCase}.ts`, reason: 'file already exists' });
      }
    }

    // 8. Component file — always last
    const componentFolderPath = path.join(srcPath, `${dirs.component}/${kebabCase}`);
    const componentFilePath = path.join(componentFolderPath, `${componentName}.tsx`);
    if (shouldWrite(componentFilePath)) {
      const componentContent = await renderComponentContent({
        componentName,
        projectPrefix,
        type,
        isNeedScript: files.script,
        isNeedStyle: files.style,
      });
      if (componentContent) {
        createFolder(componentFolderPath);
        createFile(componentFilePath, componentContent);
        created.push({ path: `src/${dirs.component}/${kebabCase}/${componentName}.tsx`, action: 'created', fileType: 'component' });
      }
    } else {
      skipped.push({ path: `src/${dirs.component}/${kebabCase}/${componentName}.tsx`, reason: 'file already exists' });
    }

    const response = JSON.stringify({
      created,
      registry: {
        action: 'updated',
        model: `${componentName}Model`,
        category: typeFullText,
      },
      skipped,
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
