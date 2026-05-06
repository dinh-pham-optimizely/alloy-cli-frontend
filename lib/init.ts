import path from 'node:path';
import fs from 'node:fs';
import { checkbox, confirm } from '@inquirer/prompts';

interface FileCategory {
  name: string;
  description: string;
  files: { src: string; dest: string }[];
}

const getSourceGithubPath = (): string => {
  const fromDist = path.resolve(__dirname, '../.github');
  if (fs.existsSync(fromDist)) {
    return fromDist;
  }

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
    name: 'Alloy Agent (@alloy)',
    description: 'The orchestrator agent that parses requests and delegates to skills',
    files: [
      { src: 'agents/alloy.md', dest: '.github/agents/alloy.md' },
    ],
  },
  {
    name: 'Generation Skills',
    description: 'Skills for generating atoms, molecules, organisms, and pages',
    files: [
      { src: 'skills/generate-atom.prompt.md', dest: '.github/skills/generate-atom.prompt.md' },
      { src: 'skills/generate-molecule.prompt.md', dest: '.github/skills/generate-molecule.prompt.md' },
      { src: 'skills/generate-organism.prompt.md', dest: '.github/skills/generate-organism.prompt.md' },
      { src: 'skills/generate-page.prompt.md', dest: '.github/skills/generate-page.prompt.md' },
    ],
  },
  {
    name: 'Template Skills',
    description: 'Template blueprints for component, wrapper, page, data, state, style, and type files',
    files: [
      { src: 'skills/tpl-component.prompt.md', dest: '.github/skills/tpl-component.prompt.md' },
      { src: 'skills/tpl-template.prompt.md', dest: '.github/skills/tpl-template.prompt.md' },
      { src: 'skills/tpl-page.prompt.md', dest: '.github/skills/tpl-page.prompt.md' },
      { src: 'skills/tpl-page-story.prompt.md', dest: '.github/skills/tpl-page-story.prompt.md' },
      { src: 'skills/tpl-data.prompt.md', dest: '.github/skills/tpl-data.prompt.md' },
      { src: 'skills/tpl-state.prompt.md', dest: '.github/skills/tpl-state.prompt.md' },
      { src: 'skills/tpl-style.prompt.md', dest: '.github/skills/tpl-style.prompt.md' },
      { src: 'skills/tpl-type.prompt.md', dest: '.github/skills/tpl-type.prompt.md' },
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
