import path from 'node:path';
import fs from 'node:fs';
import { scanModels, readModelRegistry, REGISTRY_FILENAME } from './scanner';

type Severity = 'error' | 'warning';

interface ValidationIssue {
  rule: string;
  severity: Severity;
  message: string;
  file?: string;
}

interface ValidationResult {
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
  };
}

const COMPONENT_DIRS = ['atoms', 'molecules', 'organisms'] as const;
const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const PASCAL_CASE_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

const kebabToPascal = (kebab: string): string =>
  kebab.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

const validateProject = (projectDir: string, typesDir: string = '_types'): ValidationResult => {
  const srcDir = path.join(projectDir, 'src');
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(srcDir)) {
    issues.push({
      rule: 'project-structure',
      severity: 'error',
      message: 'src/ directory not found',
    });
    return buildResult(issues);
  }

  validateComponents(srcDir, issues);
  validateOrphans(srcDir, issues);
  validateRegistryDrift(projectDir, srcDir, typesDir, issues);

  return buildResult(issues);
};

const validateComponents = (srcDir: string, issues: ValidationIssue[]): void => {
  for (const typeDir of COMPONENT_DIRS) {
    const typePath = path.join(srcDir, typeDir);
    if (!fs.existsSync(typePath)) continue;

    const folders = fs.readdirSync(typePath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const folder of folders) {
      const folderPath = path.join(typePath, folder);

      // Rule: folder name must be kebab-case
      if (!KEBAB_CASE_REGEX.test(folder)) {
        issues.push({
          rule: 'naming-convention',
          severity: 'error',
          message: `Folder name "${folder}" is not kebab-case`,
          file: path.relative(path.dirname(srcDir), folderPath),
        });
      }

      // Rule: component .tsx must exist
      const expectedComponent = kebabToPascal(folder);
      const componentFile = `${expectedComponent}.tsx`;
      const componentPath = path.join(folderPath, componentFile);

      if (!fs.existsSync(componentPath)) {
        issues.push({
          rule: 'missing-component',
          severity: 'error',
          message: `Missing component file "${componentFile}" in ${typeDir}/${folder}/`,
          file: path.relative(path.dirname(srcDir), folderPath),
        });
      }

      // Rule: .scss missing (warning)
      const styleFile = `${expectedComponent}.scss`;
      if (!fs.existsSync(path.join(folderPath, styleFile))) {
        issues.push({
          rule: 'missing-style',
          severity: 'warning',
          message: `Missing style file "${styleFile}" in ${typeDir}/${folder}/`,
          file: path.relative(path.dirname(srcDir), folderPath),
        });
      }

      // Rule: .states.json missing (warning)
      const stateFile = `${expectedComponent}.states.json`;
      if (!fs.existsSync(path.join(folderPath, stateFile))) {
        issues.push({
          rule: 'missing-state',
          severity: 'warning',
          message: `Missing state file "${stateFile}" in ${typeDir}/${folder}/`,
          file: path.relative(path.dirname(srcDir), folderPath),
        });
      }
    }
  }
};

const validateOrphans = (srcDir: string, issues: ValidationIssue[]): void => {
  // Check templates without matching components
  const templatesDir = path.join(srcDir, 'templates');
  if (fs.existsSync(templatesDir)) {
    const templateFolders = fs.readdirSync(templatesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const folder of templateFolders) {
      const hasMatchingComponent = COMPONENT_DIRS.some((typeDir) => {
        const componentPath = path.join(srcDir, typeDir, folder);
        return fs.existsSync(componentPath);
      });

      if (!hasMatchingComponent) {
        issues.push({
          rule: 'orphaned-template',
          severity: 'warning',
          message: `Template folder "${folder}" has no matching component in atoms/, molecules/, or organisms/`,
          file: path.relative(path.dirname(srcDir), path.join(templatesDir, folder)),
        });
      }
    }
  }

  // Check pages without matching templates
  const pagesDir = path.join(srcDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir)
      .filter((f) => f.endsWith('Page.tsx'));

    for (const pageFile of pageFiles) {
      const componentName = pageFile.replace('Page.tsx', '');
      if (!PASCAL_CASE_REGEX.test(componentName)) continue;

      const kebab = componentName
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();

      const templateDir = path.join(srcDir, 'templates', kebab);
      if (!fs.existsSync(templateDir)) {
        issues.push({
          rule: 'orphaned-page',
          severity: 'warning',
          message: `Page "${pageFile}" has no matching template in templates/${kebab}/`,
          file: path.relative(path.dirname(srcDir), path.join(pagesDir, pageFile)),
        });
      }
    }
  }
};

const validateRegistryDrift = (
  projectDir: string,
  srcDir: string,
  typesDir: string,
  issues: ValidationIssue[],
): void => {
  const registryPath = path.join(projectDir, REGISTRY_FILENAME);
  const typesPath = path.join(srcDir, typesDir);

  if (!fs.existsSync(registryPath)) {
    if (fs.existsSync(typesPath)) {
      issues.push({
        rule: 'registry-missing',
        severity: 'warning',
        message: `${REGISTRY_FILENAME} not found. Run "alloy-cli-frontend scan" to generate it.`,
      });
    }
    return;
  }

  if (!fs.existsSync(typesPath)) return;

  const registry = readModelRegistry(projectDir);
  const scanned = scanModels(typesPath);

  const registryModels = new Set([
    ...registry.atoms,
    ...registry.molecules,
    ...registry.organisms,
  ]);

  const scannedModels = new Set([
    ...scanned.atoms,
    ...scanned.molecules,
    ...scanned.organisms,
  ]);

  // Models in .d.ts but not in registry
  for (const model of scannedModels) {
    if (!registryModels.has(model)) {
      issues.push({
        rule: 'registry-drift',
        severity: 'warning',
        message: `Model "${model}" found in type definitions but missing from ${REGISTRY_FILENAME}`,
      });
    }
  }

  // Models in registry but not in .d.ts
  for (const model of registryModels) {
    if (!scannedModels.has(model)) {
      issues.push({
        rule: 'registry-drift',
        severity: 'warning',
        message: `Model "${model}" in ${REGISTRY_FILENAME} but not found in type definitions`,
      });
    }
  }
};

const buildResult = (issues: ValidationIssue[]): ValidationResult => ({
  issues,
  summary: {
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
  },
});

export { validateProject, ValidationResult, ValidationIssue };
