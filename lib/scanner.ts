import path from 'node:path';
import fs from 'node:fs';
import { ComponentType } from '../types';

interface ModelRegistry {
  atoms: string[];
  molecules: string[];
  organisms: string[];
}

const REGISTRY_FILENAME = '.models.json';

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
  return JSON.parse(content) as ModelRegistry;
};

const modelExistsInRegistry = (targetDir: string, componentName: string, type: ComponentType): boolean => {
  const registry = readModelRegistry(targetDir);
  const category = TYPE_TO_CATEGORY[type];
  const modelName = `${componentName}Model`;

  return registry[category].includes(modelName);
};

const updateModelRegistry = (targetDir: string, componentName: string, type: ComponentType) => {
  const registry = readModelRegistry(targetDir);
  const category = TYPE_TO_CATEGORY[type];
  const modelName = `${componentName}Model`;

  if (!modelExistsInRegistry(targetDir, componentName, type)) {
    registry[category].push(modelName);
    writeModelRegistry(targetDir, registry);
  }
};

export { scanModels, writeModelRegistry, updateModelRegistry, ModelRegistry, REGISTRY_FILENAME, readModelRegistry, modelExistsInRegistry };
