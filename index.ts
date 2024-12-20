#! /usr/bin/env node

import { program } from '@commander-js/extra-typings';
import { confirm } from '@inquirer/prompts';
import {
  generateComponent,
  generateComponentData,
  generateComponentScript,
  generateComponentState,
  generateComponentStyle,
  generateComponentType,
  generatePageComponent,
  generateTemplateComponent,
} from './lib/generators';
import { ComponentType } from './types';
import { commonActions, getTypeFullText } from './lib/helpers';

program
  .name('Alloy CLI Frontend')
  .version('1.0.0')
  .description('Alloy CLI to generate frontend components and more');

program
  .command('organism')
  .option('-cd, --component-directory <string>', 'Select component directory', `${getTypeFullText('o')}`)
  .option('-pd, --page-directory <string>', 'Select page directory', `pages`)
  .option('-tpd, --template-directory <string>', 'Select template directory', `templates`)
  .option('-dd, --data-directory <string>', 'Select data directory', `_data`)
  .option('-td, --type-directory <string>', 'Select type directory', `_types`)
  .option('-sd, --script-directory <string>', 'Select script directory', `assets/scripts`)
  .action(async (options) =>
    {
      const { componentDirectory, pageDirectory, templateDirectory, dataDirectory, typeDirectory, scriptDirectory } = options;

      const type: ComponentType = 'o';

      const { componentName, projectPrefix, isNeedState, isNeedScript, isNeedStyle } = await commonActions(getTypeFullText(type, false));

      const isNeedSeparatePageView = await confirm(
        {
          message: 'Do you want to create a separate page view for this organism?',
        },
      );

      const isUsingPageStoryTemplate = await confirm({
        message: 'Do you want to use page\'s story template?',
      });

      const isNeedNewDataFile = await confirm(
        {
          message: 'Do you want to create a new data file for this organism?',
        },
      );

      if (isNeedState) {
        generateComponentState({
          componentName,
          type,
          projectPrefix,
        });
      }

      if (isNeedSeparatePageView) {
        generatePageComponent({ componentName, isUsingPageStoryTemplate: isUsingPageStoryTemplate, pageDirectory: pageDirectory as string });
        generateTemplateComponent({ componentName, templateDirectory: templateDirectory as string });
      }

      if (isNeedNewDataFile) {
        generateComponentData({ componentName, dataDirectory: dataDirectory as string });
      }

      generateComponentType({ componentName, type, typeDirectory: typeDirectory as string });

      if (isNeedStyle) {
        generateComponentStyle({
          projectPrefix,
          componentName,
          type,
        });
      }

      if (isNeedScript) {
        generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
      }

      generateComponent({
        projectPrefix,
        componentName,
        type,
        isNeedScript,
        isNeedStyle,
        componentDirectory: componentDirectory as string,
      });
    },
  );

program
  .command('atom')
  .option('-cd, --component-directory <string>', 'Select component directory', `${getTypeFullText('a')}`)
  .option('-td, --type-directory <string>', 'Select type directory', `_types`)
  .option('-sd, --script-directory <string>', 'Select script directory', `assets/scripts`)
  .action(async (options) =>
  {
    const { typeDirectory, scriptDirectory, componentDirectory } = options;

    const type: ComponentType = 'a';

    const { componentName, projectPrefix, isNeedState, isNeedScript, isNeedStyle } = await commonActions(getTypeFullText(type, false));

    generateComponentType({ componentName, type, typeDirectory: typeDirectory as string });

    if (isNeedState) {
      generateComponentState({
        componentName,
        type,
        projectPrefix,
      });
    }

    if (isNeedStyle) {
      generateComponentStyle({
        projectPrefix,
        componentName,
        type,
      });
    }

    if (isNeedScript) {
      generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
    }

    generateComponent({
      projectPrefix,
      componentName,
      type,
      isNeedScript,
      componentDirectory: componentDirectory as string,
    });
  });

program
  .command('molecule')
  .option('-cd, --component-directory <string>', 'Select component directory', `${getTypeFullText('m')}`)
  .option('-td, --type-directory <string>', 'Select type directory', `_types`)
  .option('-sd, --script-directory <string>', 'Select script directory', `assets/scripts`)
  .action(async (options) =>
  {
    const { typeDirectory, scriptDirectory, componentDirectory } = options;

    const type: ComponentType = 'a';

    const { componentName, projectPrefix, isNeedState, isNeedScript, isNeedStyle } = await commonActions(getTypeFullText(type, false));

    generateComponentType({ componentName, type, typeDirectory: typeDirectory as string });

    if (isNeedState) {
      generateComponentState({
        componentName,
        type,
        projectPrefix,
      });
    }

    if (isNeedStyle) {
      generateComponentStyle({
        projectPrefix,
        componentName,
        type,
      });
    }

    if (isNeedScript) {
      generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
    }

    generateComponent({
      projectPrefix,
      componentName,
      type,
      isNeedScript,
      componentDirectory: componentDirectory as string,
    });
  });

program.parse(process.argv);