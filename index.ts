#! /usr/bin/env node

import { program } from '@commander-js/extra-typings';
import { confirm, input, select } from '@inquirer/prompts';
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
import { commonActions, generatedFiles, getTypeFullText } from './lib/helpers';
import { Editor, editors } from './lib/editor';

program
  .name('Alloy CLI Frontend')
  .version('1.1.3')
  .description('Alloy CLI to generate frontend components and more');

program
  .command('edit-generated-file')
  .action(async () =>
  {
    const selectedGeneratedFile = await select({
      message: 'Select generated file to modify',
      choices: [
        {
          name: 'Page',
          value: generatedFiles.PAGE,
          description: 'Modify page generated file',
        },
        {
          name: 'Page Story',
          value: generatedFiles.PAGE_STORY,
          description: 'Modify page story type generated file',
        },
        {
          name: 'Template',
          value: generatedFiles.TEMPLATE,
          description: 'Modify component\'s template generated file',
        },
        {
          name: 'Component',
          value: generatedFiles.COMPONENT,
          description: 'Modify component generated file',
        },
        {
          name: 'State',
          value: generatedFiles.STATE,
          description: 'Modify component\'s state generated file',
        },
        {
          name: 'Style',
          value: generatedFiles.STYLE,
          description: 'Modify component\'s style generated file',
        },
        {
          name: 'Type',
          value: generatedFiles.TYPE,
          description: 'Modify component\'s type generated file',
        },
        {
          name: 'Data',
          value: generatedFiles.DATA,
          description: 'Modify component\'s data generated file',
        },
      ],
    });

    const selectedEditor = await select({
      message: 'Select your editor to modify generated file',
      choices: [
        {
          name: 'VSCode',
          value: editors.CODE,
          description: 'https://code.visualstudio.com/',
        },
        {
          name: 'VSCode Insiders',
          value: editors.CODE_INSIDERS,
          description: 'https://code.visualstudio.com/insiders/',
        },
        {
          name: 'IntelliJ IDEA',
          value: editors.IDEA,
          description: 'https://www.jetbrains.com/idea/',
        },
        {
          name: 'NOTEPAD++',
          value: editors.NOTEPAD,
          description: 'https://notepad-plus-plus.org/',
        },
        {
          name: 'Sublime',
          value: editors.SUBLIME,
          description: 'https://www.sublimetext.com/',
        },
        {
          name: 'Webstorm',
          value: editors.WEBSTORM,
          description: 'https://www.jetbrains.com/webstorm/',
        },
      ],
    });

    const editor = new Editor(selectedEditor);

    await editor.openFileWithEditor(selectedGeneratedFile);
  });

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
        generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
      }

      await generateComponent({
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
      generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
    }

    await generateComponent({
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
      generateComponentScript({ componentName, scriptDirectory: scriptDirectory as string });
    }

    await generateComponent({
      projectPrefix,
      componentName,
      type,
      isNeedScript,
      componentDirectory: componentDirectory as string,
    });
  });

program
  .command('page')
  .option('-pd, --page-directory <string>', 'Select page directory', `pages`)
  .option('-tpd, --template-directory <string>', 'Select template directory', `templates`)
  .action(async (options) =>
  {
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
  });

program.parse(process.argv);