import { confirm, input } from '@inquirer/prompts';
import {
  generateComponent,
  generateComponentData,
  generateComponentScript,
  generateComponentState,
  generateComponentStyle,
  generateComponentType,
  generatePageComponent,
  generateTemplateComponent,
} from './generators';
import { ComponentType } from '../types';
import { commonActions, getTypeFullText } from './helpers';

const organismAction = async (options: {
  componentDirectory: string;
  pageDirectory: string;
  templateDirectory: string;
  dataDirectory: string;
  typeDirectory: string;
  scriptDirectory: string;
}) => {
  const { componentDirectory, pageDirectory, templateDirectory, dataDirectory, typeDirectory, scriptDirectory } = options;

  const type: ComponentType = 'o';

  const { componentName, projectPrefix, isNeedState, isNeedScript, isNeedStyle } = await commonActions(getTypeFullText(type, false));
  let isUsingPageStoryTemplate = false;

  const isNeedSeparatePageView = await confirm(
    {
      message: 'Do you want to create a separate page view for this organism?',
    },
  );

  if (isNeedSeparatePageView) {
    isUsingPageStoryTemplate = await confirm({
      message: 'Do you want to use page\'s story template?',
    });
  }

  const isNeedNewDataFile = await confirm(
    {
      message: 'Do you want to create a new data file for this organism?',
    },
  );

  if (isNeedState) {
    await generateComponentState({
      componentName,
      type,
      projectPrefix,
    });
  }

  if (isNeedSeparatePageView) {
    await generatePageComponent({ componentName, isUsingPageStoryTemplate: isUsingPageStoryTemplate, pageDirectory: pageDirectory as string });
    await generateTemplateComponent({ componentName, templateDirectory: templateDirectory as string });
  }

  if (isNeedNewDataFile) {
    await generateComponentData({ componentName, dataDirectory: dataDirectory as string });
  }

  await generateComponentType({ componentName, type, typeDirectory: typeDirectory as string });

  if (isNeedStyle) {
    await generateComponentStyle({
      projectPrefix,
      componentName,
      type,
    });
  }

  if (isNeedScript) {
    await generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
  }

  await generateComponent({
    projectPrefix,
    componentName,
    type,
    isNeedScript,
    isNeedStyle,
    componentDirectory: componentDirectory as string,
  });
};

const atomAction = async (options: {
  componentDirectory: string;
  typeDirectory: string;
  scriptDirectory: string;
}) => {
  const { typeDirectory, scriptDirectory, componentDirectory } = options;

  const type: ComponentType = 'a';

  const { componentName, projectPrefix, isNeedState, isNeedScript, isNeedStyle } = await commonActions(getTypeFullText(type, false));

  await generateComponentType({ componentName, type, typeDirectory });

  if (isNeedState) {
    await generateComponentState({
      componentName,
      type,
      projectPrefix,
    });
  }

  if (isNeedStyle) {
    await generateComponentStyle({
      projectPrefix,
      componentName,
      type,
    });
  }

  if (isNeedScript) {
    await generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
  }

  await generateComponent({
    projectPrefix,
    componentName,
    type,
    isNeedScript,
    isNeedStyle,
    componentDirectory: componentDirectory as string,
  });
};

const moleculeAction = async (options: {
  componentDirectory: string;
  typeDirectory: string;
  scriptDirectory: string;
}) => {
  const { typeDirectory, scriptDirectory, componentDirectory } = options;

  const type: ComponentType = 'm';

  const { componentName, projectPrefix, isNeedState, isNeedScript, isNeedStyle } = await commonActions(getTypeFullText(type, false));

  await generateComponentType({ componentName, type, typeDirectory: typeDirectory as string });

  if (isNeedState) {
    await generateComponentState({
      componentName,
      type,
      projectPrefix,
    });
  }

  if (isNeedStyle) {
    await generateComponentStyle({
      projectPrefix,
      componentName,
      type,
    });
  }

  if (isNeedScript) {
    await generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
  }

  await generateComponent({
    projectPrefix,
    componentName,
    type,
    isNeedScript,
    isNeedStyle,
    componentDirectory: componentDirectory as string,
  });
};

const pageAction = async (options: {
  pageDirectory: string;
  templateDirectory: string;
}) => {
  const { pageDirectory, templateDirectory } = options;

  const pageName = await input({
    message: `What's page name? (Using PascalCase)`,
    required: true,
  });

  const isUsingPageStoryTemplate = await confirm({
    message: 'Do you want to use page\'s story template?',
  });

  const isNeedNewTemplateComponent = await confirm({
    message: 'Do you want to add a new template component?',
  });

  await generatePageComponent({
    componentName: pageName,
    isUsingPageStoryTemplate,
    pageDirectory,
  });

  if (isNeedNewTemplateComponent) {
    await generateTemplateComponent({ componentName: pageName, templateDirectory });
  }
};

export { organismAction, atomAction, moleculeAction, pageAction };
