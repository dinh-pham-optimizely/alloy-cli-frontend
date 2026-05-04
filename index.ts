#! /usr/bin/env node

import { program } from '@commander-js/extra-typings';
import { initAction } from './lib/init';
import { scanModels, writeModelRegistry } from './lib/scanner';
import path from 'node:path';
import { startMcpServer } from './mcp';

program
  .name('Alloy CLI Frontend')
  .version('1.2.9')
  .description('Alloy CLI to generate frontend components and more');

program
  .command('init')
  .description('Install Copilot agent and skills into your project')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    await initAction(options);
  });

program
  .command('scan')
  .description('Scan project types and generate the model registry (.models.json)')
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

program
  .command('mcp')
  .description('Initialize ReContext as an MCP Server for AI IDE Clients')
  .action(async () => {
      await startMcpServer().catch((error) => {
          console.error('Fatal error in main():', error);
          process.exit(1);
      });
  });

program.parse(process.argv);
