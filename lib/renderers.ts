import { GenerateComponent, GenerateData, GeneratePage, GenerateTemplate, GenerateType } from '../types';
import {
  generatedFiles,
  getTemplatePath,
  replaceComponentTemplatePlaceholder,
  replaceComponentTextVariants,
  replaceTemplateComments,
} from './helpers';
import fs from 'node:fs/promises';

const renderComponentContent = async ({
  componentName,
  projectPrefix,
  type,
  isNeedScript,
  isNeedStyle,
}: GenerateComponent) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.COMPONENT}.txt`), 'utf-8');

      result = `${isNeedScript ? `import RequireJs from '@helpers/RequireJs';` : ''}${isNeedStyle
        ? `\nimport RequireCss from '@helpers/RequireCss';`
        : ''}`.concat(result);

      const data = replaceComponentTextVariants(result, componentName, projectPrefix, type);

      const addedPlaceholderContent = replaceComponentTemplatePlaceholder(data, componentName, isNeedScript, isNeedStyle);

      return replaceTemplateComments(addedPlaceholderContent);
    } catch (error) {
      throw error;
    }
  };

const renderTemplateComponent = async ({ componentName }: GenerateTemplate) =>
  {

    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.TEMPLATE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName);

      return replaceTemplateComments(data);

    } catch (error) {
      throw error;
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
      throw error;
    }
  };

const renderComponentData = async ({ componentName }: GenerateData) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.DATA}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName);
      return replaceTemplateComments(data);

    } catch (error) {
      throw error;
    }
  };

const renderComponentType = async ({ componentName }: GenerateType) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.TYPE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName);
      return replaceTemplateComments(data);
    } catch (error) {
      throw error;
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
      throw error;
    }
  };

const renderComponentState = async ({ componentName, projectPrefix, type }: GenerateComponent) =>
  {
    try {
      let result = await fs.readFile(getTemplatePath(`${generatedFiles.STATE}.txt`), 'utf-8');
      const data = replaceComponentTextVariants(result, componentName, projectPrefix, type);

      return replaceTemplateComments(data);
    } catch (error) {
      throw error;
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
