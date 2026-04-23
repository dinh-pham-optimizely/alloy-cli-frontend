import { confirm, input } from '@inquirer/prompts';
import {
  generatePageComponent,
  generateTemplateComponent,
} from './generators';
import { ComponentType } from '../types';
import { commonActions, getTypeFullText } from './helpers';
import { executeGeneration } from './orchestrator';

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

  await executeGeneration({
    componentName,
    type,
    projectPrefix,
    style: isNeedStyle,
    script: isNeedScript,
    state: isNeedState,
    page: isNeedSeparatePageView,
    story: isUsingPageStoryTemplate,
    data: isNeedNewDataFile,
    componentDirectory,
    pageDirectory,
    templateDirectory,
    dataDirectory,
    typeDirectory,
    scriptDirectory,
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

  await executeGeneration({
    componentName,
    type,
    projectPrefix,
    style: isNeedStyle,
    script: isNeedScript,
    state: isNeedState,
    componentDirectory,
    typeDirectory,
    scriptDirectory,
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

  await executeGeneration({
    componentName,
    type,
    projectPrefix,
    style: isNeedStyle,
    script: isNeedScript,
    state: isNeedState,
    componentDirectory,
    typeDirectory,
    scriptDirectory,
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
    isUsingPageStoryTemplate: isUsingPageStoryTemplate,
    pageDirectory: pageDirectory as string,
  });

  if (isNeedNewTemplateComponent || templateDirectory !== 'templates') {
    await generateTemplateComponent({ componentName: pageName, templateDirectory: templateDirectory as string });
  }
};

export { organismAction, atomAction, moleculeAction, pageAction };
