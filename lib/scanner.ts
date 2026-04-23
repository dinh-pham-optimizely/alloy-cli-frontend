import path from 'node:path';
import fs from 'node:fs';
import { ComponentType } from '../types';

interface ModelRegistry {
  atoms: string[];
  molecules: string[];
  organisms: string[];
}

interface DetailedModelRegistry {
  index: ModelRegistry;
  details: Record<string, Record<string, string>>;
}

const REGISTRY_FILENAME = '.alloy-models.json';

const TYPE_FILES: Record<string, keyof ModelRegistry> = {
  'atoms.d.ts': 'atoms',
  'molecules.d.ts': 'molecules',
  'organisms.d.ts': 'organisms',
};

const TYPE_TO_CATEGORY: Record<ComponentType, keyof ModelRegistry> = {
  a: 'atoms',
  m: 'molecules',
  o: 'organisms',
};

const MODEL_REGEX = /interface\s+(\w+Model)\s+extends\s+BasedAtomicModel/g;
const INTERFACE_BODY_REGEX = /interface\s+(\w+Model)\s+extends\s+BasedAtomicModel\s*\{([^}]*)\}/gs;
const PROPERTY_REGEX = /(\w+)\??\s*:\s*([^;]+);/g;

const scanModels = (typesDir: string): ModelRegistry => {
  const registry: ModelRegistry = { atoms: [], molecules: [], organisms: [] };

  for (const [fileName, category] of Object.entries(TYPE_FILES)) {
    const filePath = path.join(typesDir, fileName);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    let match: RegExpExecArray | null;
    while ((match = MODEL_REGEX.exec(content)) !== null) {
      registry[category].push(match[1]);
    }
    MODEL_REGEX.lastIndex = 0;
  }

  return registry;
};

const scanModelsDetailed = (typesDir: string): DetailedModelRegistry => {
  const index: ModelRegistry = { atoms: [], molecules: [], organisms: [] };
  const details: Record<string, Record<string, string>> = {};

  for (const [fileName, category] of Object.entries(TYPE_FILES)) {
    const filePath = path.join(typesDir, fileName);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    let match: RegExpExecArray | null;
    while ((match = INTERFACE_BODY_REGEX.exec(content)) !== null) {
      const modelName = match[1];
      const body = match[2];
      index[category].push(modelName);

      const properties: Record<string, string> = {};
      let propMatch: RegExpExecArray | null;
      while ((propMatch = PROPERTY_REGEX.exec(body)) !== null) {
        properties[propMatch[1]] = propMatch[2].trim();
      }
      PROPERTY_REGEX.lastIndex = 0;

      details[modelName] = properties;
    }
    INTERFACE_BODY_REGEX.lastIndex = 0;
  }

  return { index, details };
};

const writeModelRegistry = (targetDir: string, registry: ModelRegistry) => {
  const filePath = path.join(targetDir, REGISTRY_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log(`Model registry written to: ${filePath}`);
};

const readModelRegistry = (targetDir: string): ModelRegistry => {
  const filePath = path.join(targetDir, REGISTRY_FILENAME);
  if (!fs.existsSync(filePath)) {
    return { atoms: [], molecules: [], organisms: [] };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  // Support both formats: flat (legacy) and two-tier (detailed)
  if (parsed.index) {
    return parsed.index as ModelRegistry;
  }
  return parsed as ModelRegistry;
};

const readDetailedModelRegistry = (targetDir: string): DetailedModelRegistry => {
  const filePath = path.join(targetDir, REGISTRY_FILENAME);
  if (!fs.existsSync(filePath)) {
    return { index: { atoms: [], molecules: [], organisms: [] }, details: {} };
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  // Support legacy flat format
  if (!parsed.index) {
    return { index: parsed as ModelRegistry, details: {} };
  }
  return parsed as DetailedModelRegistry;
};

const writeDetailedModelRegistry = (targetDir: string, registry: DetailedModelRegistry) => {
  const filePath = path.join(targetDir, REGISTRY_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log(`Model registry written to: ${filePath}`);
};

const updateModelRegistry = (targetDir: string, componentName: string, type: ComponentType) => {
  const registry = readModelRegistry(targetDir);
  const category = TYPE_TO_CATEGORY[type];
  const modelName = `${componentName}Model`;

  if (!registry[category].includes(modelName)) {
    registry[category].push(modelName);
    writeModelRegistry(targetDir, registry);
  }
};

export { scanModels, scanModelsDetailed, writeModelRegistry, writeDetailedModelRegistry, readModelRegistry, readDetailedModelRegistry, updateModelRegistry, ModelRegistry, DetailedModelRegistry, REGISTRY_FILENAME };
