import path from 'node:path';
import { ComponentType } from '../types';
import { confirm, input } from '@inquirer/prompts';
import fs from 'node:fs';

const getComponentModelName = (componentName: string) => `${componentName}Model`;
const getComponentAsKebabCase = (componentName: string) => turnPascalCaseToKebabCase(componentName);
const getComponentTemplateName = (componentName: string) => `${componentName}Template`;
const getComponentAsCamelCase = (componentName: string) => turnPascalCaseToCamelCase(componentName);
const getComponentDataName = (componentName: string) => `${getComponentAsCamelCase(componentName)}Data`;
const getComponentPageName = (componentName: string) => `${componentName}Page`;
const getComponentAsCapCaseWithSpacing = (componentName: string) => turnPascalCaseToCapCaseWithSpacing(componentName);

const turnPascalCaseToKebabCase = (text: string) => text.replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .toLowerCase();

const turnPascalCaseToCamelCase = (text: string) => text.replace(/^([A-Z])/, (match) => match.toLowerCase()) // Lowercase the first letter
  .replace(/([A-Z]+)([A-Z][a-z])/g, (_, group1, group2) =>
    group1.toLowerCase() + group2, // Lowercase the full group1 and preserve group2
  );

const turnPascalCaseToCapCaseWithSpacing = (text: string) => text.replace(
  /([a-z])([A-Z])/g,
  '$1 $2',
)
  .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
  .trim(); // Remove leading/trailing spaces if any

const srcPath = path.join(process.cwd(), 'src');

const getTypeFullText = (type: ComponentType, isPlural = true) =>
  {
    let text = '';
    switch (type) {
      case 'a':
        text = 'atom';
        break;
      case 'o':
        text = 'organism';
        break;
      case 'm':
        text = 'molecule';
        break;
    }

    if (isPlural) {
      text = `${text}s`;
    }

    return text;
  };

const commonActions = async (type: string) =>
  {
    const projectPrefix = await input({
      message: 'What\'s your project prefix (For css class prefix use e.g. xx in xx-o-yy)?',
      required: true,
    });

    const componentName = await input({
      message: `What's ${type} name? (Using PascalCase)`,
      required: true,
    });


    const isNeedScript = await confirm(
      {
        message: `Do you want to create a script file for this ${type}?`,
      },
    );

    const isNeedStyle = await confirm(
      {
        message: `Do you want to create a style file for this ${type}?`,
      },
    );

    const isNeedState = await confirm({
      message: `Do you want to create a state file for this ${type}?`,
    });

    return { projectPrefix, componentName, isNeedScript, isNeedStyle, isNeedState };
  };

const createFolder = (folderPath: string) =>
  {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Folder created: ${folderPath}`);
    }
  };

const createFile = (filePath: string, content: string) =>
  {
    if (!fs.existsSync(filePath)) {
      // Write the file with the multi-line text content
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`File created with content at: ${filePath}`);
    }
  };

const appendContentToFile = (filePath: string, content: string) =>
  {
    if (filePath) {
      // Write the file with the multi-line text content
      fs.appendFileSync(filePath, content, 'utf8');
      console.log(`Content was appended to file at: ${filePath}`);
    }
  };

export {
  srcPath,
  getComponentAsKebabCase,
  getComponentAsCamelCase,
  getTypeFullText,
  commonActions,
  getComponentModelName,
  getComponentTemplateName,
  getComponentDataName,
  getComponentAsCapCaseWithSpacing,
  getComponentPageName,
  createFolder,
  createFile,
  appendContentToFile,
  turnPascalCaseToKebabCase,
  turnPascalCaseToCamelCase,
  turnPascalCaseToCapCaseWithSpacing,
};