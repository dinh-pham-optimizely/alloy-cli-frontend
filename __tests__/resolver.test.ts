import { describe, it, expect, vi, beforeEach } from 'vitest';

import { resolveProperties, getDefaultValue, toCamelCase, inferType } from '../lib/resolver';
import { DetailedModelRegistry } from '../lib/scanner';

const makeRegistry = (models: string[] = []): DetailedModelRegistry => ({
  index: {
    atoms: models.filter((m) => ['ButtonModel', 'IconModel', 'ImageModel', 'LinkModel'].includes(m)),
    molecules: models.filter((m) => ['SearchBarModel'].includes(m)),
    organisms: models.filter((m) => ['HeaderModel', 'ProductCardModel'].includes(m)),
  },
  details: {},
});

describe('toCamelCase', () => {
  it('converts single word', () => {
    expect(toCamelCase('title')).toBe('title');
  });

  it('converts multi-word hint', () => {
    expect(toCamelCase('cta button')).toBe('ctaButton');
  });

  it('converts three-word hint', () => {
    expect(toCamelCase('hero background image')).toBe('heroBackgroundImage');
  });

  it('handles leading/trailing spaces', () => {
    expect(toCamelCase('  hero image  ')).toBe('heroImage');
  });
});

describe('inferType', () => {
  it('infers string for title', () => {
    expect(inferType('title')).toBe('string');
  });

  it('infers string for description', () => {
    expect(inferType('description')).toBe('string');
  });

  it('infers boolean for isVisible', () => {
    expect(inferType('isVisible')).toBe('boolean');
  });

  it('infers boolean for hasIcon', () => {
    expect(inferType('hasIcon')).toBe('boolean');
  });

  it('infers () => void for onClick', () => {
    expect(inferType('onClick')).toBe('() => void');
  });

  it('infers () => void for handleChange', () => {
    expect(inferType('handleChange')).toBe('() => void');
  });

  it('infers number for count', () => {
    expect(inferType('count')).toBe('number');
  });

  it('infers string[] for items', () => {
    expect(inferType('items')).toBe('string[]');
  });

  it('infers string for url', () => {
    expect(inferType('url')).toBe('string');
  });

  it('infers Record for config', () => {
    expect(inferType('config')).toBe('Record<string, unknown>');
  });

  it('defaults to string for unknown hints', () => {
    expect(inferType('somethingRandom')).toBe('string');
  });
});

describe('resolveProperties', () => {
  it('resolves exact model match from registry', () => {
    const registry = makeRegistry(['ButtonModel', 'ImageModel']);
    const result = resolveProperties(['button'], registry);

    expect(result).toEqual([
      { name: 'button', type: 'ButtonModel', source: 'registry', optional: true },
    ]);
  });

  it('resolves keyword match from multi-word hint', () => {
    const registry = makeRegistry(['ButtonModel', 'ImageModel']);
    const result = resolveProperties(['cta button'], registry);

    expect(result).toEqual([
      { name: 'ctaButton', type: 'ButtonModel', source: 'registry', optional: true },
    ]);
  });

  it('resolves hero image to ImageModel', () => {
    const registry = makeRegistry(['ImageModel']);
    const result = resolveProperties(['hero image'], registry);

    expect(result).toEqual([
      { name: 'heroImage', type: 'ImageModel', source: 'registry', optional: true },
    ]);
  });

  it('falls back to inference when no registry match', () => {
    const registry = makeRegistry([]);
    const result = resolveProperties(['title', 'isVisible', 'onClick'], registry);

    expect(result).toEqual([
      { name: 'title', type: 'string', source: 'inferred', optional: true },
      { name: 'isVisible', type: 'boolean', source: 'inferred', optional: true },
      { name: 'onClick', type: '() => void', source: 'inferred', optional: true },
    ]);
  });

  it('mixes registry and inferred sources', () => {
    const registry = makeRegistry(['ImageModel']);
    const result = resolveProperties(['title', 'hero image', 'onClick'], registry);

    expect(result).toEqual([
      { name: 'title', type: 'string', source: 'inferred', optional: true },
      { name: 'heroImage', type: 'ImageModel', source: 'registry', optional: true },
      { name: 'onClick', type: '() => void', source: 'inferred', optional: true },
    ]);
  });

  it('handles empty hints array', () => {
    const registry = makeRegistry(['ButtonModel']);
    expect(resolveProperties([], registry)).toEqual([]);
  });
});

describe('getDefaultValue', () => {
  it('returns empty string for string type', () => {
    expect(getDefaultValue('string')).toBe("''");
  });

  it('returns 0 for number type', () => {
    expect(getDefaultValue('number')).toBe('0');
  });

  it('returns false for boolean type', () => {
    expect(getDefaultValue('boolean')).toBe('false');
  });

  it('returns () => {} for function type', () => {
    expect(getDefaultValue('() => void')).toBe('() => {}');
  });

  it('returns [] for array type', () => {
    expect(getDefaultValue('string[]')).toBe('[]');
    expect(getDefaultValue('ButtonModel[]')).toBe('[]');
  });

  it('returns {} for Model type', () => {
    expect(getDefaultValue('ButtonModel')).toBe('{}');
    expect(getDefaultValue('ImageModel')).toBe('{}');
  });

  it('returns {} for Record type', () => {
    expect(getDefaultValue('Record<string, unknown>')).toBe('{}');
  });
});
