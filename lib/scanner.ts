import path from 'node:path';
import fs from 'node:fs';

interface ModelRegistry {
  atoms: string[];
  molecules: string[];
  organisms: string[];
}

const REGISTRY_FILENAME = '.alloy-models.json';

const TYPE_FILES: Record<string, keyof ModelRegistry> = {
  'atoms.d.ts': 'atoms',
  'molecules.d.ts': 'molecules',
  'organisms.d.ts': 'organisms',
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

export { scanModels, writeModelRegistry, ModelRegistry, REGISTRY_FILENAME };
