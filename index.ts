#! /usr/bin/env node

import { program } from '@commander-js/extra-typings';
import { select } from '@inquirer/prompts';
import { generatedFiles, getTypeFullText } from './lib/helpers';
import { Editor, editors } from './lib/editor';
import { initAction } from './lib/init';
import { scanModels, scanModelsDetailed, writeModelRegistry, writeDetailedModelRegistry, REGISTRY_FILENAME } from './lib/scanner';
import { validateProject } from './lib/validator';
import { organismAction, atomAction, moleculeAction, pageAction } from './lib/commands';
import { executeGeneration } from './lib/orchestrator';
import { ComponentType } from './types';
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
  .option('--json', 'Output result as JSON')
  .action((options) => {
    const typesDir = path.join(process.cwd(), 'src', options.typeDirectory);
    const registry = scanModelsDetailed(typesDir);
    writeDetailedModelRegistry(process.cwd(), registry);

    if (options.json) {
      console.log(JSON.stringify(registry));
      return;
    }

    const total = registry.index.atoms.length + registry.index.molecules.length + registry.index.organisms.length;
    console.log(`\nFound ${total} model(s):`);
    if (registry.index.atoms.length) console.log(`  Atoms:     ${registry.index.atoms.join(', ')}`);
    if (registry.index.molecules.length) console.log(`  Molecules: ${registry.index.molecules.join(', ')}`);
    if (registry.index.organisms.length) console.log(`  Organisms: ${registry.index.organisms.join(', ')}`);
    if (total === 0) console.log('  No models found. Create components first, then re-run scan.');
  });

program
  .command('generate')
  .description('Generate a component with all specified options (non-interactive)')
  .argument('<name>', 'PascalCase component name (e.g., ProductCard)')
  .requiredOption('-t, --type <type>', 'Component type: a (atom), m (molecule), o (organism)')
  .requiredOption('-p, --prefix <prefix>', 'Project CSS prefix (e.g., xx)')
  .option('--style', 'Generate style file (.scss)')
  .option('--script', 'Generate script entry file (.entry.ts)')
  .option('--state', 'Generate state file (.states.json)')
  .option('--page', 'Generate page component')
  .option('--story', 'Use story template for page (requires --page)')
  .option('--data', 'Generate data file')
  .option('--properties <props>', 'Component properties (e.g., "title:string, image:ImageModel")')
  .option('--compose <children>', 'Compose with existing components (e.g., "Button, Image, SearchBar")')
  .option('-cd, --component-directory <dir>', 'Component directory')
  .option('-pd, --page-directory <dir>', 'Page directory', 'pages')
  .option('-tpd, --template-directory <dir>', 'Template directory', 'templates')
  .option('-dd, --data-directory <dir>', 'Data directory', '_data')
  .option('-td, --type-directory <dir>', 'Type directory', '_types')
  .option('-sd, --script-directory <dir>', 'Script directory', 'assets/scripts')
  .option('--json', 'Output result as JSON')
  .action(async (name, options) => {
    const type = options.type as ComponentType;
    if (!['a', 'm', 'o'].includes(type)) {
      console.error(`Invalid type "${type}". Must be one of: a (atom), m (molecule), o (organism)`);
      process.exit(1);
    }

    try {
      const properties = options.properties
        ? options.properties.split(',').map((p: string) => {
            const [name, type] = p.trim().split(':').map((s: string) => s.trim());
            return { name, type: type || 'string' };
          })
        : undefined;

      const compose = options.compose
        ? options.compose.split(',').map((c: string) => c.trim()).filter(Boolean)
        : undefined;

      const result = await executeGeneration({
        componentName: name,
        type,
        projectPrefix: options.prefix,
        style: options.style,
        script: options.script,
        state: options.state,
        page: options.page,
        story: options.story,
        data: options.data,
        properties,
        compose,
        componentDirectory: options.componentDirectory,
        pageDirectory: options.pageDirectory,
        templateDirectory: options.templateDirectory,
        dataDirectory: options.dataDirectory,
        typeDirectory: options.typeDirectory,
        scriptDirectory: options.scriptDirectory,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      if (options.json) {
        console.error(JSON.stringify({ error: (error as Error).message }));
      } else {
        console.error(`Error: ${(error as Error).message}`);
      }
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate project structure, naming conventions, and registry consistency')
  .option('-td, --type-directory <dir>', 'Type definitions directory', '_types')
  .option('--json', 'Output result as JSON')
  .option('--fix', 'Auto-fix issues where possible (e.g., re-scan to fix registry drift)')
  .action((options) => {
    const projectDir = process.cwd();

    if (options.fix) {
      const typesDir = path.join(projectDir, 'src', options.typeDirectory);
      const registry = scanModelsDetailed(typesDir);
      writeDetailedModelRegistry(projectDir, registry);
      console.log('Registry re-scanned.');
    }

    const result = validateProject(projectDir, options.typeDirectory);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (result.issues.length === 0) {
      console.log('\n\u2713 No issues found. Project structure is valid.\n');
      return;
    }

    console.log(`\nFound ${result.issues.length} issue(s):\n`);
    for (const issue of result.issues) {
      const icon = issue.severity === 'error' ? '\u2717' : '\u26A0';
      const fileInfo = issue.file ? ` (${issue.file})` : '';
      console.log(`  ${icon} [${issue.rule}] ${issue.message}${fileInfo}`);
    }
    console.log(`\n  Errors: ${result.summary.errors}  Warnings: ${result.summary.warnings}\n`);

    if (result.summary.errors > 0) {
      process.exit(1);
    }
  });

program.parse(process.argv);