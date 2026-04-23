#! /usr/bin/env node

import { program } from '@commander-js/extra-typings';
import { select } from '@inquirer/prompts';
import { generatedFiles, getTypeFullText } from './lib/helpers';
import { Editor, editors } from './lib/editor';
import { initAction } from './lib/init';
import { scanModels, writeModelRegistry, REGISTRY_FILENAME } from './lib/scanner';
import { organismAction, atomAction, moleculeAction, pageAction } from './lib/commands';
import path from 'node:path';

program
  .name('Alloy CLI Frontend')
  .version('1.1.4')
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
  .action(async (options) => {
    await organismAction(options as Parameters<typeof organismAction>[0]);
  });

program
  .command('atom')
  .option('-cd, --component-directory <string>', 'Select component directory', `${getTypeFullText('a')}`)
  .option('-td, --type-directory <string>', 'Select type directory', `_types`)
  .option('-sd, --script-directory <string>', 'Select script directory', `assets/scripts`)
  .action(async (options) => {
    await atomAction(options as Parameters<typeof atomAction>[0]);
  });

program
  .command('molecule')
  .option('-cd, --component-directory <string>', 'Select component directory', `${getTypeFullText('m')}`)
  .option('-td, --type-directory <string>', 'Select type directory', `_types`)
  .option('-sd, --script-directory <string>', 'Select script directory', `assets/scripts`)
  .action(async (options) => {
    await moleculeAction(options as Parameters<typeof moleculeAction>[0]);
  });

program
  .command('page')
  .option('-pd, --page-directory <string>', 'Select page directory', `pages`)
  .option('-tpd, --template-directory <string>', 'Select template directory', `templates`)
  .action(async (options) => {
    await pageAction(options as Parameters<typeof pageAction>[0]);
  });

program
  .command('init')
  .description('Install Copilot agent and skills into your project')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    await initAction(options);
  });

program
  .command('scan')
  .description('Scan project types and generate the model registry (.alloy-models.json)')
  .option('-td, --type-directory <dir>', 'Type definitions directory', '_types')
  .action((options) => {
    const typesDir = path.join(process.cwd(), 'src', options.typeDirectory);
    const registry = scanModels(typesDir);
    writeModelRegistry(process.cwd(), registry);

    const total = registry.atoms.length + registry.molecules.length + registry.organisms.length;
    console.log(`\nFound ${total} model(s):`);
    if (registry.atoms.length) console.log(`  Atoms:     ${registry.atoms.join(', ')}`);
    if (registry.molecules.length) console.log(`  Molecules: ${registry.molecules.join(', ')}`);
    if (registry.organisms.length) console.log(`  Organisms: ${registry.organisms.join(', ')}`);
    if (total === 0) console.log('  No models found. Create components first, then re-run scan.');
  });

program.parse(process.argv);