import path from 'node:path';
import fs from 'node:fs';
import { checkbox, confirm } from '@inquirer/prompts';

interface FileCategory {
  name: string;
  description: string;
  files: { src: string; dest: string }[];
}

const getSourceGithubPath = (): string => {
  // When running from dist/index.cjs, __dirname is dist/
  // The .github/ folder is shipped alongside dist/ in the npm package
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
    name: 'Alloy Agent (@alloy)',
    description: 'The orchestrator agent that parses requests and delegates to skills',
    files: [
      { src: 'agents/alloy.agent.md', dest: '.github/agents/alloy.agent.md' },
    ],
  },
  {
    name: 'Generate Component Skill',
    description: 'Skill for generating atoms, molecules, and organisms via CLI',
    files: [
      { src: 'skills/generate-component/SKILL.md', dest: '.github/skills/generate-component/SKILL.md' },
      { src: 'skills/generate-component/scripts/generate.js', dest: '.github/skills/generate-component/scripts/generate.js' },
      { src: 'skills/generate-component/references/naming-conventions.md', dest: '.github/skills/generate-component/references/naming-conventions.md' },
      { src: 'skills/generate-component/references/file-structure.md', dest: '.github/skills/generate-component/references/file-structure.md' },
    ],
  },
  {
    name: 'Scan Models Skill',
    description: 'Skill for scanning type definitions and updating the model registry',
    files: [
      { src: 'skills/scan-models/SKILL.md', dest: '.github/skills/scan-models/SKILL.md' },
      { src: 'skills/scan-models/scripts/scan.js', dest: '.github/skills/scan-models/scripts/scan.js' },
    ],
  },
  {
    name: 'Validate Skill',
    description: 'Skill for validating project structure, naming, and registry consistency',
    files: [
      { src: 'skills/validate/SKILL.md', dest: '.github/skills/validate/SKILL.md' },
    ],
  },
  {
    name: 'Utility Skills',
    description: 'Dependency management and model property resolution skills',
    files: [
      { src: 'skills/manage-dependencies.prompt.md', dest: '.github/skills/manage-dependencies.prompt.md' },
      { src: 'skills/resolve-model-properties/SKILL.md', dest: '.github/skills/resolve-model-properties/SKILL.md' },
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

  console.log('\n🧩 Alloy CLI — Install Copilot Agent & Skills\n');

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
