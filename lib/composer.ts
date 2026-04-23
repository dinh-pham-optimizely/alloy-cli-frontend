import { ComponentType } from '../types';
import { DetailedModelRegistry } from './scanner';

interface ComposedChild {
  componentName: string;
  modelName: string;
  category: 'atoms' | 'molecules' | 'organisms';
  type: ComponentType;
  kebabName: string;
  importAlias: string;
}

interface CompositionResult {
  children: ComposedChild[];
  imports: string[];
  jsxPlaceholders: string[];
}

const CATEGORY_TO_TYPE: Record<string, ComponentType> = {
  atoms: 'a',
  molecules: 'm',
  organisms: 'o',
};

const CATEGORY_TO_ALIAS: Record<string, string> = {
  atoms: '@atoms',
  molecules: '@molecules',
  organisms: '@organisms',
};

const toKebab = (name: string): string =>
  name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const stripModelSuffix = (modelName: string): string =>
  modelName.endsWith('Model') ? modelName.slice(0, -5) : modelName;

const resolveComposition = (
  hints: string[],
  registry: DetailedModelRegistry,
): CompositionResult => {
  const children: ComposedChild[] = [];

  for (const hint of hints) {
    const child = findComponent(hint.trim(), registry);
    if (child) {
      children.push(child);
    }
  }

  const imports = children.map((c) => {
    const kebab = c.kebabName;
    return `import ${c.componentName} from '${c.importAlias}/${kebab}/${c.componentName}';`;
  });

  const jsxPlaceholders = children.map((c) => {
    return `      <${c.componentName} {...({} as ${c.modelName})} />`;
  });

  return { children, imports, jsxPlaceholders };
};

const findComponent = (
  hint: string,
  registry: DetailedModelRegistry,
): ComposedChild | null => {
  // Try matching as model name (e.g., "ButtonModel")
  for (const [category, models] of Object.entries(registry.index)) {
    const found = models.find((m) => m === hint);
    if (found) {
      const componentName = stripModelSuffix(found);
      return buildChild(componentName, found, category as keyof typeof CATEGORY_TO_TYPE);
    }
  }

  // Try matching as component name (e.g., "Button")
  const modelName = hint.endsWith('Model') ? hint : `${hint}Model`;
  for (const [category, models] of Object.entries(registry.index)) {
    const found = models.find((m) => m === modelName);
    if (found) {
      const componentName = stripModelSuffix(found);
      return buildChild(componentName, found, category as keyof typeof CATEGORY_TO_TYPE);
    }
  }

  // Try matching as kebab-case (e.g., "product-card")
  for (const [category, models] of Object.entries(registry.index)) {
    for (const model of models) {
      const name = stripModelSuffix(model);
      if (toKebab(name) === hint.toLowerCase()) {
        return buildChild(name, model, category as keyof typeof CATEGORY_TO_TYPE);
      }
    }
  }

  return null;
};

const buildChild = (
  componentName: string,
  modelName: string,
  category: string,
): ComposedChild => ({
  componentName,
  modelName,
  category: category as ComposedChild['category'],
  type: CATEGORY_TO_TYPE[category],
  kebabName: toKebab(componentName),
  importAlias: CATEGORY_TO_ALIAS[category],
});

export { resolveComposition, CompositionResult, ComposedChild };
