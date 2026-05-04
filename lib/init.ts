import path from 'node:path';
import fs from 'node:fs';
import { checkbox, confirm } from '@inquirer/prompts';
import { FileCategory } from '../types';

const getSourceGithubPath = (): string => {
  const fromDist = path.resolve(__dirname, '../.github');
  if (fs.existsSync(fromDist)) {
    return fromDist;
  }

  // When running from source (e.g., bun index.ts), __dirname is project root
  const fromRoot = path.resolve(__dirname, '.github');
  if (fs.existsSync(fromRoot)) {
    return fromRoot;
  }

  throw new Error(
    'Could not find .github/ directory in the package. The package may be corrupted — try reinstalling.',
  );
};

const categories: FileCategory[] = [
  {
    name: 'Agent (@alloy)',
    description: 'The orchestrator agent that parses requests and delegates to skills',
    files: [
      { src: 'agents/alloy.md', dest: '.github/agents/alloy.md' },
      { src: 'agents/01-validator.md', dest: '.github/agents/01-validator.md' },
      { src: 'agents/02-path-resolver.md', dest: '.github/agents/02-path-resolver.md' },
      { src: 'agents/03-renderer-scaffolder.md', dest: '.github/agents/03-renderer-scaffolder.md' },
      { src: 'agents/04-model-registrar.md', dest: '.github/agents/04-model-registrar.md' },
      { src: 'agents/05-enricher.md', dest: '.github/agents/05-enricher.md' },
    ],
  },
  {
    name: 'Enrich Skills',
    description: 'Template blueprints for component, state, page, data, state, style, and type files',
    files: [
      { src: 'skills/enrich-component.md', dest: '.github/skills/enrich-component.md' },
      { src: 'skills/enrich-state.md', dest: '.github/skills/enrich-state.md' },
      { src: 'skills/enrich-page.md', dest: '.github/skills/enrich-page.md' },
      { src: 'skills/enrich-page-story.md', dest: '.github/skills/enrich-page-story.md' },
      { src: 'skills/enrich-data.md', dest: '.github/skills/enrich-data.md' },
      { src: 'skills/enrich-style.md', dest: '.github/skills/enrich-style.md' },
      { src: 'skills/enrich-type.md', dest: '.github/skills/enrich-type.md' },
    ],
  },
  {
    name: 'Utility Skills',
    description: 'Dependency management and model property resolution skills',
    files: [
      { src: 'skills/resolve-model-properties.prompt.md', dest: '.github/skills/resolve-model-properties.prompt.md' },
    ],
  },
  {
    name: 'Project Instructions',
    description: 'Copilot project-wide instructions with Atomic Design conventions',
    files: [
      { src: 'copilot-instructions.md', dest: '.github/copilot-instructions.md' },
    ],
  },
];

const initAction = async (options: { force?: boolean }) => {
  const sourceRoot = getSourceGithubPath();
  const targetRoot = process.cwd();
  const isForce = options.force ?? false;

  console.log('\n Alloy CLI — Install Copilot Agent & Skills\n');

  const selectedCategories = await checkbox({
    message: 'What would you like to install?',
    choices: categories.map((cat) => ({
      name: `${cat.name} — ${cat.description}`,
      value: cat.name,
      checked: true,
    })),
  });

  if (selectedCategories.length === 0) {
    console.log('No categories selected. Nothing to install.');
    return;
  }

  const filesToInstall = categories
    .filter((cat) => selectedCategories.includes(cat.name))
    .flatMap((cat) => cat.files);

  // Check which files already exist
  const existing = filesToInstall.filter((f) =>
    fs.existsSync(path.join(targetRoot, f.dest)),
  );

  if (isForce && existing.length > 0) {
    const shouldOverwrite = await confirm({
      message: `This will overwrite ${existing.length} existing file(s). Continue?`,
      default: false,
    });

    if (!shouldOverwrite) {
      console.log('Aborted.');
      return;
    }
  }

  let installed = 0;
  let skipped = 0;

  for (const file of filesToInstall) {
    const sourcePath = path.join(sourceRoot, file.src);
    const destPath = path.join(targetRoot, file.dest);

    if (!fs.existsSync(sourcePath)) {
      console.log(`  ⚠ Source not found: ${file.src} (skipped)`);
      skipped++;
      continue;
    }

    if (fs.existsSync(destPath) && !isForce) {
      console.log(`  ⊘ Already exists: ${file.dest} (skipped)`);
      skipped++;
      continue;
    }

    // Create directory if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(`  ✓ Installed: ${file.dest}`);
    installed++;
  }

  console.log(`\n  Installed: ${installed} file(s)`);
  if (skipped > 0) {
    console.log(`  Skipped:   ${skipped} file(s)${!isForce ? ' (use --force to overwrite)' : ''}`);
  }
  console.log('\nDone! Open VS Code and use @alloy in Copilot Chat.\n');
};

export { initAction };
