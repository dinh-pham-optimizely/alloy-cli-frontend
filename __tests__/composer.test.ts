import { describe, it, expect } from 'vitest';

import { resolveComposition } from '../lib/composer';
import { DetailedModelRegistry } from '../lib/scanner';

const makeRegistry = (): DetailedModelRegistry => ({
  index: {
    atoms: ['ButtonModel', 'ImageModel', 'IconModel'],
    molecules: ['SearchBarModel'],
    organisms: ['HeaderModel', 'ProductCardModel'],
  },
  details: {
    ButtonModel: { label: 'string', onClick: '() => void' },
    ImageModel: { src: 'string', alt: 'string' },
    IconModel: { name: 'string' },
    SearchBarModel: { placeholder: 'string' },
    HeaderModel: {},
    ProductCardModel: { title: 'string' },
  },
});

describe('resolveComposition', () => {
  it('resolves component name to child', () => {
    const result = resolveComposition(['Button'], makeRegistry());

    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toEqual({
      componentName: 'Button',
      modelName: 'ButtonModel',
      category: 'atoms',
      type: 'a',
      kebabName: 'button',
      importAlias: '@atoms',
    });
  });

  it('resolves model name to child', () => {
    const result = resolveComposition(['ImageModel'], makeRegistry());

    expect(result.children).toHaveLength(1);
    expect(result.children[0].componentName).toBe('Image');
    expect(result.children[0].modelName).toBe('ImageModel');
    expect(result.children[0].category).toBe('atoms');
  });

  it('resolves kebab-case name to child', () => {
    const result = resolveComposition(['search-bar'], makeRegistry());

    expect(result.children).toHaveLength(1);
    expect(result.children[0].componentName).toBe('SearchBar');
    expect(result.children[0].category).toBe('molecules');
    expect(result.children[0].importAlias).toBe('@molecules');
  });

  it('resolves multiple children', () => {
    const result = resolveComposition(['Button', 'Image', 'SearchBar'], makeRegistry());

    expect(result.children).toHaveLength(3);
    expect(result.children[0].componentName).toBe('Button');
    expect(result.children[1].componentName).toBe('Image');
    expect(result.children[2].componentName).toBe('SearchBar');
  });

  it('skips unrecognized hints', () => {
    const result = resolveComposition(['Button', 'NonExistent', 'Image'], makeRegistry());

    expect(result.children).toHaveLength(2);
    expect(result.children[0].componentName).toBe('Button');
    expect(result.children[1].componentName).toBe('Image');
  });

  it('generates correct import statements', () => {
    const result = resolveComposition(['Button', 'SearchBar'], makeRegistry());

    expect(result.imports).toHaveLength(2);
    expect(result.imports[0]).toBe("import Button from '@atoms/button/Button';");
    expect(result.imports[1]).toBe("import SearchBar from '@molecules/search-bar/SearchBar';");
  });

  it('generates correct JSX placeholders', () => {
    const result = resolveComposition(['Button', 'Image'], makeRegistry());

    expect(result.jsxPlaceholders).toHaveLength(2);
    expect(result.jsxPlaceholders[0]).toBe('      <Button {...({} as ButtonModel)} />');
    expect(result.jsxPlaceholders[1]).toBe('      <Image {...({} as ImageModel)} />');
  });

  it('returns empty arrays for no hints', () => {
    const result = resolveComposition([], makeRegistry());

    expect(result.children).toEqual([]);
    expect(result.imports).toEqual([]);
    expect(result.jsxPlaceholders).toEqual([]);
  });

  it('returns empty arrays when no hints match', () => {
    const result = resolveComposition(['Foo', 'Bar'], makeRegistry());

    expect(result.children).toEqual([]);
    expect(result.imports).toEqual([]);
    expect(result.jsxPlaceholders).toEqual([]);
  });

  it('resolves organism by PascalCase name', () => {
    const result = resolveComposition(['Header'], makeRegistry());

    expect(result.children).toHaveLength(1);
    expect(result.children[0].category).toBe('organisms');
    expect(result.children[0].importAlias).toBe('@organisms');
  });

  it('resolves multi-word kebab name', () => {
    const result = resolveComposition(['product-card'], makeRegistry());

    expect(result.children).toHaveLength(1);
    expect(result.children[0].componentName).toBe('ProductCard');
    expect(result.children[0].kebabName).toBe('product-card');
  });
});
