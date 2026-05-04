import path from 'node:path';
import { ComponentType, Directories, Path, TemplatePaths } from '../types';
import { confirm, input } from '@inquirer/prompts';
import fs from 'node:fs';

const getComponentModelName = (componentName: string) => `${componentName}Model`;
const getComponentAsKebabCase = (componentName: string) => turnPascalCaseToKebabCase(componentName);
const getComponentTemplateName = (componentName: string) => `${componentName}Template`;
const getComponentAsCamelCase = (componentName: string) => turnPascalCaseToCamelCase(componentName);
const getComponentDataName = (componentName: string) => `${getComponentAsCamelCase(componentName)}Data`;
const getComponentPageName = (componentName: string) => `${componentName}Page`;
const getComponentAsCapCaseWithSpacing = (componentName: string) => turnPascalCaseToCapCaseWithSpacing(componentName);
const getCssClassName = (componentName: string, projectPrefix: string, type: string) =>
  `${projectPrefix}-${type}-${getComponentAsKebabCase(componentName)}`;

const getComponentPathName = ({
  componentName,
  typeFullText,
  kebabCase,
  directory,
}: {
  componentName: string;
  typeFullText: string;
  kebabCase: string;
  directory?: string;
}): Path => {
  const directoryPath = path.join(srcPath, `${directory || typeFullText}/${kebabCase}`);
  const filePath = path.join(directoryPath, `${componentName}.tsx`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getTypePathName = ({ typeFullText, directory }: { typeFullText: string; directory?: string }): Path => {
  const directoryPath = path.join(srcPath, `${directory || '_types'}`);
  const filePath = path.join(directoryPath, `${typeFullText}s.d.ts`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getStylePathName = ({ componentName, typeFullText, kebabCase }: { typeFullText: string; kebabCase: string; componentName: string }): Path => {
  const directoryPath = path.join(srcPath, `${typeFullText}/${kebabCase}`);
  const filePath = path.join(directoryPath, `${componentName}.scss`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getStatePathName = ({ componentName, typeFullText, kebabCase }: { typeFullText: string; kebabCase: string; componentName: string }): Path => {
  const directoryPath = path.join(srcPath, `${typeFullText}/${kebabCase}`);
  const filePath = path.join(directoryPath, `${componentName}.states.json`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getScriptPathName = ({ kebabCase, directory }: { kebabCase: string; directory?: string }): Path => {
  const directoryPath = path.join(srcPath, `${directory || 'assets/scripts'}`);
  const filePath = path.join(directoryPath, `${kebabCase}.entry.ts`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getPagePathName = ({ pageName, directory }: { pageName: string; directory?: string }): Path => {
  const directoryPath = path.join(srcPath, `${directory || 'pages'}`);
  const filePath = path.join(directoryPath, `${pageName}.tsx`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getTemplatePathName = ({ templateName, kebabCase, directory }: { kebabCase: string; templateName: string; directory?: string }): Path => {
  const directoryPath = path.join(srcPath, `${directory || 'templates'}/${kebabCase}`);
  const filePath = path.join(directoryPath, `${templateName}.tsx`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getDataPathName = ({ camelCase, directory }: { camelCase: string; directory?: string }): Path => {
  const directoryPath = path.join(srcPath, `${directory || '_data'}`);
  const filePath = path.join(directoryPath, `${camelCase}.ts`);
  const fileExists = fs.existsSync(filePath);

  return { directoryPath, filePath, fileExists };
};

const getPaths = ({
  componentName,
  typeFullText,
  directories,
}: {
  componentName: string;
  typeFullText: string;
  directories?: Directories;
}): TemplatePaths => {
  const kebabCase = getComponentAsKebabCase(componentName);
  const pageName = getComponentPageName(componentName);
  const templateName = getComponentTemplateName(componentName);

  return {
    component: getComponentPathName({
      componentName,
      typeFullText,
      kebabCase,
      directory: directories?.component?.trim(),
    }),
    type: getTypePathName({ typeFullText, directory: directories?.type?.trim() }),
    style: getStylePathName({ typeFullText, kebabCase, componentName }),
    state: getStatePathName({ typeFullText, kebabCase, componentName }),
    script: getScriptPathName({ kebabCase, directory: directories?.script?.trim() }),
    page: getPagePathName({ pageName, directory: directories?.page?.trim() }),
    template: getTemplatePathName({ kebabCase, templateName, directory: directories?.template?.trim() }),
    data: getDataPathName({ camelCase: getComponentAsCamelCase(componentName), directory: directories?.data?.trim() }),
  };
};

const resolvePathForFileType = ({
  fileType,
  componentName,
  directories,
  type,
}: {
  fileType: string;
  componentName: string;
  directories?: Directories;
  type: 'a' | 'm' | 'o';
}) => {
  const kebabCase = getComponentAsKebabCase(componentName);
  const typeFullText = getTypeFullText(type);
  const pageName = getComponentPageName(componentName);
  const templateName = getComponentTemplateName(componentName);

  switch (fileType) {
    case 'component':
      return getComponentPathName({
        componentName,
        typeFullText,
        kebabCase,
        directory: directories?.component?.trim(),
      });

    case 'template':
      return getTemplatePathName({ kebabCase, templateName, directory: directories?.template?.trim() });
    case 'page':
      return getPagePathName({ pageName, directory: directories?.page?.trim() });

    case 'type':
      return getTypePathName({ typeFullText, directory: directories?.type?.trim() });

    case 'data':
      return getDataPathName({
        camelCase: getComponentAsCamelCase(componentName),
        directory: directories?.data?.trim(),
      });

    case 'state':
      return getStatePathName({ typeFullText, kebabCase, componentName });

    case 'style':
      return getStylePathName({ typeFullText, kebabCase, componentName });

    case 'script':
      return getScriptPathName({ kebabCase, directory: directories?.script?.trim() });

    default:
      return '';
  }
};

const turnPascalCaseToKebabCase = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const turnPascalCaseToCamelCase = (text: string) =>
  text
    .replace(/^([A-Z])/, (match) => match.toLowerCase()) // Lowercase the first letter
    .replace(
      /([A-Z]+)([A-Z][a-z])/g,
      (_, group1, group2) => group1.toLowerCase() + group2 // Lowercase the full group1 and preserve group2
    );

const turnPascalCaseToCapCaseWithSpacing = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim(); // Remove leading/trailing spaces if any

const srcPath = path.join(process.cwd(), 'src');

const getTypeFullText = (type: ComponentType, isPlural = true) => {
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

const commonActions = async (type: string) => {
  const projectPrefix = await input({
    message: "What's your project prefix (For css class prefix use e.g. xx in xx-o-yy)?",
    required: true,
  });

  const componentName = await input({
    message: `What's ${type} name? (Using PascalCase)`,
    required: true,
    validate: (value: string) => {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return 'Component name must be PascalCase (e.g., ProductCard, Button). Start with an uppercase letter, no spaces, hyphens, or underscores.';
      }
      return true;
    },
  });

  const isNeedScript = await confirm({
    message: `Do you want to create a script file for this ${type}?`,
  });

  const isNeedStyle = await confirm({
    message: `Do you want to create a style file for this ${type}?`,
  });

  const isNeedState = await confirm({
    message: `Do you want to create a state file for this ${type}?`,
  });

  return { projectPrefix, componentName, isNeedScript, isNeedStyle, isNeedState };
};

const createFolder = (folderPath: string) => {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`Folder created: ${folderPath}`);
};

const createFile = (filePath: string, content: string) => {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`File created with content at: ${filePath}`);
};

const appendContentToFile = (filePath: string, content: string) => {
  if (filePath) {
    // Write the file with the multi-line text content
    fs.appendFileSync(filePath, content, 'utf8');
    console.log(`Content was appended to file at: ${filePath}`);
  }
};

const getTemplatePath = (fileName: string) => {
  let localDirectory = path.resolve(__dirname, `templates/${fileName}`);

  if (!fs.existsSync(localDirectory)) {
    return path.resolve(__dirname, `../public/templates/${fileName}`);
  }

  return localDirectory;
};

const replaceComponentTextVariants = (content: string, componentName: string, projectPrefix?: string, type?: string): string => {
  const componentModelName = getComponentModelName(componentName);
  const componentNameKebabCase = getComponentAsKebabCase(componentName);
  const componentTemplateName = getComponentTemplateName(componentName);
  const componentDataName = getComponentDataName(componentName);
  const componentPageName = getComponentPageName(componentName);
  const componentNameCamelCase = getComponentAsCamelCase(componentName);
  const componentAsCapCaseWithSpacing = getComponentAsCapCaseWithSpacing(componentName);

  if (projectPrefix) {
    content = content.replace(/\${projectPrefix}/g, `${projectPrefix}`);
  }

  if (type) {
    content = content.replace(/\${type}/g, `${type}`);
  }

  return content
    .replace(/\${componentModelName}/g, `${componentModelName}`)
    .replace(/\${componentNameKebabCase}/g, `${componentNameKebabCase}`)
    .replace(/\${componentTemplateName}/g, `${componentTemplateName}`)
    .replace(/\${componentDataName}/g, `${componentDataName}`)
    .replace(/\${componentPageName}/g, `${componentPageName}`)
    .replace(/\${componentNameCamelCase}/g, `${componentNameCamelCase}`)
    .replace(/\${componentAsCapCaseWithSpacing}/g, `${componentAsCapCaseWithSpacing}`)
    .replace(/\${componentName}/g, `${componentName}`);
};

const replaceTemplateComments = (content: string) => content.replace(/<--.*?-->/g, '');

const replaceComponentTemplatePlaceholder = (content: string, componentName: string, isNeedScript: boolean, isNeedStyle: boolean) => {
  if (!isNeedScript && !isNeedStyle) return content;

  const componentNameKebabCase = getComponentAsKebabCase(componentName);

  return content.replace(
    /<-- CLI placeholder - please don't make any changes -->/g,
    `    ${isNeedScript ? `\n      <RequireJs path={'${componentNameKebabCase}'} defer />` : ''}${
      isNeedStyle ? `\n      <RequireCss path={'b-${componentNameKebabCase}'} />` : ''
    }`
  );
};

const generatedFiles = {
  PAGE: 'page',
  PAGE_STORY: 'page-story',
  TEMPLATE: 'template',
  COMPONENT: 'component',
  STATE: 'state',
  STYLE: 'style',
  TYPE: 'type',
  DATA: 'data',
};

const shouldWrite = (filePath: string, force?: boolean): boolean => {
  if (force) return true;
  return !fs.existsSync(filePath);
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
  getTemplatePath,
  replaceComponentTextVariants,
  replaceTemplateComments,
  replaceComponentTemplatePlaceholder,
  generatedFiles,
  getCssClassName,
  getPaths,
  getTemplatePathName,
  getStylePathName,
  getTypePathName,
  getPagePathName,
  getScriptPathName,
  getDataPathName,
  getComponentPathName,
  getStatePathName,
  shouldWrite,
  resolvePathForFileType,
};
