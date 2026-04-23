import { DetailedModelRegistry } from './scanner';

interface ResolvedProperty {
  name: string;
  type: string;
  source: 'registry' | 'inferred';
  optional: boolean;
}

const INFERRED_TYPE_PATTERNS: [RegExp, string][] = [
  [/^(on|handle)[A-Z]/, '() => void'],
  [/^(is|has|show|enable|disable|can|should|visible|active|checked|open|loading|selected)/, 'boolean'],
  [/^(count|index|size|width|height|order|max|min|limit|offset|zIndex|columns)$/, 'number'],
  [/^(items|list|options|tags|categories|children|slides|cards|links|features)$/, 'string[]'],
  [/^(url|href|src|path|link|to|redirect)$/, 'string'],
  [/^(style|className|modifier)$/, 'string'],
  [/^(data|config|settings)$/, 'Record<string, unknown>'],
  // Default fallback for text-like properties
  [/^(text|label|name|title|description|content|alt|placeholder|caption|heading|subtitle)$/, 'string'],
];

const toCamelCase = (hint: string): string => {
  const words = hint.trim().split(/\s+/);
  // Single word: preserve existing casing (may already be camelCase)
  if (words.length === 1) {
    return words[0].charAt(0).toLowerCase() + words[0].slice(1);
  }
  return words
    .map((word, i) =>
      i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');
};

const extractKeyword = (hint: string): string => {
  const words = hint.trim().toLowerCase().split(/\s+/);
  return words[words.length - 1];
};

const findModelByKeyword = (keyword: string, registry: DetailedModelRegistry): string | null => {
  const modelName = keyword.charAt(0).toUpperCase() + keyword.slice(1) + 'Model';
  const allModels = [
    ...registry.index.atoms,
    ...registry.index.molecules,
    ...registry.index.organisms,
  ];
  return allModels.find((m) => m === modelName) ?? null;
};

const inferType = (propertyName: string): string => {
  for (const [pattern, type] of INFERRED_TYPE_PATTERNS) {
    if (pattern.test(propertyName)) {
      return type;
    }
  }
  return 'string';
};

const resolveProperties = (
  hints: string[],
  registry: DetailedModelRegistry,
): ResolvedProperty[] => {
  return hints.map((hint) => {
    const propertyName = toCamelCase(hint);
    const keyword = extractKeyword(hint);

    // Priority 1+2: Match against registry models
    const matchedModel = findModelByKeyword(keyword, registry);
    if (matchedModel) {
      return {
        name: propertyName,
        type: matchedModel,
        source: 'registry' as const,
        optional: true,
      };
    }

    // Priority 3: LLM-style inference
    return {
      name: propertyName,
      type: inferType(propertyName),
      source: 'inferred' as const,
      optional: true,
    };
  });
};

const getDefaultValue = (type: string): string => {
  if (type === 'string') return "''";
  if (type === 'number') return '0';
  if (type === 'boolean') return 'false';
  if (type === '() => void') return '() => {}';
  if (type.endsWith('[]')) return '[]';
  if (type === 'Record<string, unknown>') return '{}';
  if (type.endsWith('Model')) return '{}';
  return "''";
};

export { resolveProperties, getDefaultValue, toCamelCase, inferType, ResolvedProperty };
