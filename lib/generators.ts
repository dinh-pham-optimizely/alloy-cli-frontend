import { appendContentToFile, createFile, createFolder, getComponentAsCamelCase, getComponentAsKebabCase, getTypeFullText, srcPath } from './helpers';
import { GenerateComponent, GenerateComponentScript, GenerateData, GeneratePage, GenerateTemplate, GenerateType, FileResult } from '../types';
import path from 'node:path';
import { updateModelRegistry } from './scanner';
import {
  renderComponentContent,
  renderComponentData,
  renderComponentState,
  renderComponentStyle,
  renderComponentType,
  renderPageComponent,
  renderTemplateComponent,
} from './renderers';
import { CompositionResult } from './composer';

const generateComponent = async ({
  componentName,
  projectPrefix,
  type,
  isNeedStyle,
  isNeedScript,
  componentDirectory,
  composition,
}: { componentDirectory: string; composition?: CompositionResult } & GenerateComponent): Promise<FileResult | null> =>
  {
    const folderPath = path.join(srcPath, `${componentDirectory}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.tsx`);

    const content = await renderComponentContent({
      componentName,
      projectPrefix,
      type,
      isNeedScript,
      isNeedStyle,
    }, composition);

    if (!content) return null;

    createFolder(folderPath);

    const action = createFile(filePath, content);
    return { path: filePath, action };
  };

const generateTemplateComponent = async ({ componentName, templateDirectory }: { templateDirectory: string } & GenerateTemplate): Promise<FileResult> =>
  {
    const folderPath = path.join(srcPath, `${templateDirectory}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}Template.tsx`);

    const content = await renderTemplateComponent({
      componentName,
    });

    createFolder(folderPath);

    const action = createFile(filePath, content);
    return { path: filePath, action };
  };

const generatePageComponent = async ({ componentName, isUsingPageStoryTemplate, pageDirectory }: { pageDirectory: string } & GeneratePage): Promise<FileResult> =>
  {
    const folderPath = path.join(srcPath, `${pageDirectory}`);
    const filePath = path.join(folderPath, `${componentName}Page.tsx`);

    const content = await renderPageComponent({
      componentName,
      isUsingPageStoryTemplate,
    });

    createFolder(folderPath);

    const action = createFile(filePath, content);
    return { path: filePath, action };
  };

const generateComponentData = async ({ componentName, dataDirectory, properties }: { dataDirectory: string; properties?: Array<{ name: string; type: string }> } & GenerateData): Promise<FileResult> =>
  {
    const folderPath = path.join(srcPath, `${dataDirectory}`);
    const filePath = path.join(folderPath, `${getComponentAsCamelCase(componentName)}.ts`);

    const content = await renderComponentData({ componentName }, properties);

    createFolder(folderPath);

    const action = createFile(filePath, content);
    return { path: filePath, action };
  };

const generateComponentType = async (
  { type, componentName, typeDirectory, properties }: { typeDirectory: string; properties?: Array<{ name: string; type: string }> } & GenerateType,
): Promise<FileResult> =>
  {
    const folderPath = path.join(srcPath, `${typeDirectory}`);
    const content = await renderComponentType({ componentName, type }, properties);
    const typeFullText = getTypeFullText(type);
    const filePath = path.join(folderPath, `${typeFullText}.d.ts`);

    createFolder(folderPath);

    const action = appendContentToFile(filePath, content);

    updateModelRegistry(process.cwd(), componentName, type);

    return { path: filePath, action };
  };

const generateComponentStyle = async ({ componentName, projectPrefix, type }: GenerateComponent): Promise<FileResult> =>
  {
    const folderPath = path.join(srcPath, `${getTypeFullText(type)}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.scss`);

    const content = await renderComponentStyle({
      componentName,
      projectPrefix,
      type,
    });

    createFolder(folderPath);

    const action = createFile(filePath, content);
    return { path: filePath, action };
  };

const generateComponentScript = ({ componentName, scriptDirectory }: { scriptDirectory: string } & GenerateComponentScript): FileResult =>
  {
    const folderPath = path.join(srcPath, `${scriptDirectory}`);
    const filePath = path.join(folderPath, `${getComponentAsKebabCase(componentName)}.entry.ts`);

    createFolder(folderPath);

    const action = createFile(filePath, '');
    return { path: filePath, action };
  };

const generateComponentState = async (
  { componentName, projectPrefix, type }: GenerateComponent,
): Promise<FileResult> =>
  {
    const folderPath = path.join(srcPath, `${getTypeFullText(type)}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.states.json`);

    const content = await renderComponentState({
      componentName,
      projectPrefix,
      type,
    });

    createFolder(folderPath);

    const action = createFile(filePath, content);
    return { path: filePath, action };
  };

export {
  generateComponent,
  generateTemplateComponent,
  generatePageComponent,
  generateComponentData,
  generateComponentType,
  generateComponentStyle,
  generateComponentScript,
  generateComponentState,
};