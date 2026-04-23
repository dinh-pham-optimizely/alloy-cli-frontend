import { GenerateComponent, GenerateData, GeneratePage, GenerateTemplate, GenerateType } from '../types';
import {
  generatedFiles,
  getTemplatePath,
  replaceComponentTemplatePlaceholder,
  replaceComponentTextVariants,
  replaceTemplateComments,
} from './helpers';
import { getDefaultValue } from './resolver';
import { CompositionResult } from './composer';
import fs from 'node:fs/promises';

const renderComponentContent = async ({
  componentName,
  projectPrefix,
  type,
  isNeedScript,
  isNeedStyle,
}: GenerateComponent, composition?: CompositionResult) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.COMPONENT}.txt`), 'utf-8');

      let extraImports = '';
      if (isNeedScript) extraImports += `import RequireJs from '@helpers/RequireJs';`;
      if (isNeedStyle) extraImports += `\nimport RequireCss from '@helpers/RequireCss';`;
      if (composition && composition.imports.length > 0) {
        extraImports += (extraImports ? '\n' : '') + composition.imports.join('\n');
      }

      result = extraImports.concat(result);

      const data = replaceComponentTextVariants(result, componentName, projectPrefix, type);

      let addedPlaceholderContent = replaceComponentTemplatePlaceholder(data, componentName, isNeedScript, isNeedStyle);

      // Inject composed children JSX before the closing </div>
      if (composition && composition.jsxPlaceholders.length > 0) {
        const jsxBlock = '\n' + composition.jsxPlaceholders.join('\n') + '\n';
        // Insert before the last closing </div>
        const lastDivIndex = addedPlaceholderContent.lastIndexOf('</div>');
        if (lastDivIndex !== -1) {
          addedPlaceholderContent =
            addedPlaceholderContent.slice(0, lastDivIndex) +
            jsxBlock +
            '    ' +
            addedPlaceholderContent.slice(lastDivIndex);
        }
      }

      return replaceTemplateComments(addedPlaceholderContent);
    } catch (error) {
      throw new Error(`Failed to render component "${componentName}": ${(error as Error).message}`);
    }
  };

const renderTemplateComponent = async ({ componentName }: GenerateTemplate) =>
  {

    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.TEMPLATE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName);

      return replaceTemplateComments(data);

    } catch (error) {
      throw new Error(`Failed to render template for "${componentName}": ${(error as Error).message}`);
    }
  };

const renderPageComponent = async ({ componentName, isUsingPageStoryTemplate }: GeneratePage) =>
  {
    try {
      if (isUsingPageStoryTemplate) {
        let result = await fs.readFile(getTemplatePath(`${generatedFiles.PAGE_STORY}.txt`), 'utf-8');
        const data = replaceComponentTextVariants(result, componentName);
        return replaceTemplateComments(data);
      }
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.PAGE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName);
      return replaceTemplateComments(data);

    } catch (error) {
      throw new Error(`Failed to render page for "${componentName}": ${(error as Error).message}`);
    }
  };

const renderComponentData = async ({ componentName }: GenerateData, properties?: Array<{ name: string; type: string }>) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.DATA}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName);
      let rendered = replaceTemplateComments(data);

      if (properties && properties.length > 0) {
        const propLines = properties.map((p) => `  ${p.name}: ${getDefaultValue(p.type)},`).join('\n');
        rendered = rendered.replace(/= \{\};/, `= {\n${propLines}\n};`);
      }

      return rendered;

    } catch (error) {
      throw new Error(`Failed to render data for "${componentName}": ${(error as Error).message}`);
    }
  };

const renderComponentType = async ({ componentName }: GenerateType, properties?: Array<{ name: string; type: string }>) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.TYPE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName);
      let rendered = replaceTemplateComments(data);

      if (properties && properties.length > 0) {
        const propLines = properties.map((p) => `  ${p.name}?: ${p.type};`).join('\n');
        rendered = rendered.replace(/\{\s*\}/, `{\n${propLines}\n}`);
      }

      return rendered;
    } catch (error) {
      throw new Error(`Failed to render type for "${componentName}": ${(error as Error).message}`);
    }
  };

const renderComponentStyle = async (
  { componentName, type, projectPrefix }: GenerateComponent,
) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.STYLE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName, projectPrefix, type);

      return replaceTemplateComments(data);
    } catch (error) {
      throw new Error(`Failed to render style for "${componentName}": ${(error as Error).message}`);
    }
  };

const renderComponentState = async ({ componentName, projectPrefix, type }: GenerateComponent) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.STATE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName, projectPrefix, type);

      return replaceTemplateComments(data);
    } catch (error) {
      throw new Error(`Failed to render state for "${componentName}": ${(error as Error).message}`);
    }
  };

export {
  renderTemplateComponent,
  renderComponentContent,
  renderPageComponent,
  renderComponentData,
  renderComponentType,
  renderComponentStyle,
  renderComponentState,
};
