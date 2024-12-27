import { appendContentToFile, createFile, createFolder, getComponentAsCamelCase, getComponentAsKebabCase, getTypeFullText, srcPath } from './helpers';
import { GenerateComponent, GenerateComponentScript, GenerateData, GeneratePage, GenerateTemplate, GenerateType } from '../types';
import path from 'node:path';
import {
  renderComponentContent,
  renderComponentData,
  renderComponentState,
  renderComponentStyle,
  renderComponentType,
  renderPageComponent,
  renderTemplateComponent,
} from './renderers';

const generateComponent = async ({
  componentName,
  projectPrefix,
  type,
  isNeedStyle,
  isNeedScript,
  componentDirectory,
}: { componentDirectory: string } & GenerateComponent) =>
  {
    const folderPath = path.join(srcPath, `${componentDirectory}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.tsx`);

    const content = await renderComponentContent({
      componentName,
      projectPrefix,
      type,
      isNeedScript,
      isNeedStyle,
    });

    if (!content) return;

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generateTemplateComponent = async ({ componentName, templateDirectory }: { templateDirectory: string } & GenerateTemplate) =>
  {
    const folderPath = path.join(srcPath, `${templateDirectory}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}Template.tsx`);

    const content = await renderTemplateComponent({
      componentName,
    });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generatePageComponent = async ({ componentName, isUsingPageStoryTemplate, pageDirectory }: { pageDirectory: string } & GeneratePage) =>
  {
    const folderPath = path.join(srcPath, `${pageDirectory}`);
    const filePath = path.join(folderPath, `${componentName}Page.tsx`);

    const content = await renderPageComponent({
      componentName,
      isUsingPageStoryTemplate,
    });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generateComponentData = async ({ componentName, dataDirectory }: { dataDirectory: string } & GenerateData) =>
  {
    const folderPath = path.join(srcPath, `${dataDirectory}`);
    const filePath = path.join(folderPath, `${getComponentAsCamelCase(componentName)}.ts`);

    const content = await renderComponentData({ componentName });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generateComponentType = async (
  { type, componentName, typeDirectory }: { typeDirectory: string } & GenerateType,
) =>
  {
    const folderPath = path.join(srcPath, `${typeDirectory}`);
    let filePath = '';
    const content = await renderComponentType({ componentName, type });
    const typeFullText = getTypeFullText(type);

    switch (type) {
      case 'a':
        filePath = path.join(folderPath, `${typeFullText}.d.ts`);
        break;
      case 'o':
        filePath = path.join(folderPath, `${typeFullText}.d.ts`);
        break;
      case 'm':
        filePath = path.join(folderPath, `${typeFullText}.d.ts`);
        break;
    }

    createFolder(folderPath);

    appendContentToFile(filePath, content);
  };

const generateComponentStyle = async ({ componentName, projectPrefix, type }: GenerateComponent) =>
  {
    const folderPath = path.join(srcPath, `${getTypeFullText(type)}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.scss`);

    const content = await renderComponentStyle({
      componentName,
      projectPrefix,
      type,
    });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generateComponentScript = ({ componentName, scriptDirectory }: { scriptDirectory: string } & GenerateComponentScript) =>
  {
    const folderPath = path.join(srcPath, `${scriptDirectory}`);
    const filePath = path.join(folderPath, `${getComponentAsKebabCase(componentName)}.entry.ts`);

    createFolder(folderPath);

    createFile(filePath, '');
  };

const generateComponentState = async (
  { componentName, projectPrefix, type }: GenerateComponent,
) =>
  {
    const folderPath = path.join(srcPath, `${getTypeFullText(type)}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.states.json`);

    const content = await renderComponentState({
      componentName,
      projectPrefix,
      type,
    });

    createFolder(folderPath);

    createFile(filePath, content);
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