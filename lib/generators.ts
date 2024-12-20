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

const generateComponent = ({
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

    const content = renderComponentContent({
      componentName,
      projectPrefix,
      type,
      isNeedScript,
      isNeedStyle,
    });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generateTemplateComponent = ({ componentName, templateDirectory }: { templateDirectory: string } & GenerateTemplate) =>
  {
    const folderPath = path.join(srcPath, `${templateDirectory}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}Template.tsx`);

    const content = renderTemplateComponent({
      componentName,
    });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generatePageComponent = ({ componentName, isUsingPageStoryTemplate, pageDirectory }: { pageDirectory: string } & GeneratePage) =>
  {
    const folderPath = path.join(srcPath, `${pageDirectory}`);
    const filePath = path.join(folderPath, `${componentName}Page.tsx`);

    const content = renderPageComponent({
      componentName,
      isUsingPageStoryTemplate,
    });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generateComponentData = ({ componentName, dataDirectory }: { dataDirectory: string } & GenerateData) =>
  {
    const folderPath = path.join(srcPath, `${dataDirectory}`);
    const filePath = path.join(folderPath, `${getComponentAsCamelCase(componentName)}.ts`);

    const content = renderComponentData({ componentName });

    createFolder(folderPath);

    createFile(filePath, content);
  };

const generateComponentType = (
  { type, componentName, typeDirectory }: { typeDirectory: string } & GenerateType,
) =>
  {
    const folderPath = path.join(srcPath, `${typeDirectory}`);
    let filePath = '';
    const content = renderComponentType({ componentName, type });
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

const generateComponentStyle = ({ componentName, projectPrefix, type }: GenerateComponent) =>
  {
    const folderPath = path.join(srcPath, `${getTypeFullText(type)}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.scss`);

    const content = renderComponentStyle({
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

const generateComponentState = (
  { componentName, projectPrefix, type }: GenerateComponent,
) =>
  {
    const folderPath = path.join(srcPath, `${getTypeFullText(type)}/${getComponentAsKebabCase(componentName)}`);
    const filePath = path.join(folderPath, `${componentName}.states.json`);

    const content = renderComponentState({
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