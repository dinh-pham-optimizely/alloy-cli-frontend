import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all renderer functions
vi.mock('../lib/renderers', () => ({
  renderComponentContent: vi.fn().mockResolvedValue('rendered-component'),
  renderTemplateComponent: vi.fn().mockResolvedValue('rendered-template'),
  renderPageComponent: vi.fn().mockResolvedValue('rendered-page'),
  renderComponentData: vi.fn().mockResolvedValue('rendered-data'),
  renderComponentType: vi.fn().mockResolvedValue('rendered-type'),
  renderComponentStyle: vi.fn().mockResolvedValue('rendered-style'),
  renderComponentState: vi.fn().mockResolvedValue('rendered-state'),
}));

// Mock scanner
vi.mock('../lib/scanner', () => ({
  updateModelRegistry: vi.fn(),
}));

// Mock helpers — keep real implementations for name transforms, mock fs operations
vi.mock('../lib/helpers', async () => {
  const actual = await vi.importActual<typeof import('../lib/helpers')>('../lib/helpers');
  return {
    ...actual,
    srcPath: '/mock/src',
    createFolder: vi.fn(),
    createFile: vi.fn().mockReturnValue('created'),
    appendContentToFile: vi.fn().mockReturnValue('appended'),
  };
});

import { executeGeneration, validateComponentName } from '../lib/orchestrator';
import { createFile, appendContentToFile } from '../lib/helpers';
import { GenerationConfig } from '../types';

const baseConfig: GenerationConfig = {
  componentName: 'ProductCard',
  type: 'o',
  projectPrefix: 'xx',
};

describe('validateComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts valid PascalCase names', () => {
    expect(() => validateComponentName('Button')).not.toThrow();
    expect(() => validateComponentName('ProductCard')).not.toThrow();
    expect(() => validateComponentName('IconArrow')).not.toThrow();
    expect(() => validateComponentName('A')).not.toThrow();
  });

  it('rejects kebab-case', () => {
    expect(() => validateComponentName('product-card')).toThrow('PascalCase');
  });

  it('rejects camelCase', () => {
    expect(() => validateComponentName('productCard')).toThrow('PascalCase');
  });

  it('rejects snake_case', () => {
    expect(() => validateComponentName('product_card')).toThrow('PascalCase');
  });

  it('rejects lowercase', () => {
    expect(() => validateComponentName('button')).toThrow('PascalCase');
  });
});

describe('executeGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('generates minimal component (type + component only)', async () => {
    const result = await executeGeneration(baseConfig);

    expect(result.componentName).toBe('ProductCard');
    expect(result.type).toBe('o');
    expect(result.files).toHaveLength(2); // type + component
    expect(result.files[0].action).toBe('appended'); // type definition
    expect(result.files[1].action).toBe('created'); // component
  });

  it('generates all files for organism with all options', async () => {
    const result = await executeGeneration({
      ...baseConfig,
      style: true,
      script: true,
      state: true,
      page: true,
      story: true,
      data: true,
    });

    // type + state + style + script + page + template + data + component = 8
    expect(result.files).toHaveLength(8);
  });

  it('auto-creates template when page is requested', async () => {
    const result = await executeGeneration({
      ...baseConfig,
      page: true,
    });

    // type + page + template + component = 4
    expect(result.files).toHaveLength(4);

    const templateFile = result.files.find(f => f.path.includes('Template'));
    expect(templateFile).toBeDefined();
    expect(templateFile!.action).toBe('created');
  });

  it('does not create template without page', async () => {
    const result = await executeGeneration(baseConfig);

    const templateFile = result.files.find(f => f.path.includes('Template'));
    expect(templateFile).toBeUndefined();
  });

  it('uses default directory values', async () => {
    const result = await executeGeneration(baseConfig);

    const typePath = result.files[0].path;
    expect(typePath).toContain('_types');

    const componentPath = result.files[1].path;
    expect(componentPath).toContain('organisms');
  });

  it('uses custom directory overrides', async () => {
    const result = await executeGeneration({
      ...baseConfig,
      componentDirectory: 'custom-organisms',
      typeDirectory: 'custom-types',
    });

    const typePath = result.files[0].path;
    expect(typePath).toContain('custom-types');

    const componentPath = result.files[1].path;
    expect(componentPath).toContain('custom-organisms');
  });

  it('throws on invalid component name', async () => {
    await expect(
      executeGeneration({ ...baseConfig, componentName: 'product-card' }),
    ).rejects.toThrow('PascalCase');
  });

  it('generates atom with correct directory', async () => {
    const result = await executeGeneration({
      componentName: 'Button',
      type: 'a',
      projectPrefix: 'xx',
    });

    const componentPath = result.files.find(f => f.path.includes('.tsx'));
    expect(componentPath!.path).toContain('atoms');
  });

  it('generates molecule with correct directory', async () => {
    const result = await executeGeneration({
      componentName: 'SearchBar',
      type: 'm',
      projectPrefix: 'xx',
    });

    const componentPath = result.files.find(f => f.path.includes('.tsx'));
    expect(componentPath!.path).toContain('molecules');
  });

  it('generates style and state in correct order', async () => {
    const result = await executeGeneration({
      ...baseConfig,
      style: true,
      state: true,
    });

    // Order: type, state, style, component
    expect(result.files).toHaveLength(4);
    expect(result.files[0].path).toContain('.d.ts');       // type
    expect(result.files[1].path).toContain('.states.json'); // state
    expect(result.files[2].path).toContain('.scss');        // style
    expect(result.files[3].path).toContain('.tsx');         // component
  });

  it('tracks appended files correctly for type definitions', async () => {
    const result = await executeGeneration(baseConfig);

    const typeFile = result.files.find(f => f.path.includes('.d.ts'));
    expect(typeFile).toBeDefined();
    expect(typeFile!.action).toBe('appended');
  });

  it('tracks created files correctly', async () => {
    const result = await executeGeneration({
      ...baseConfig,
      style: true,
    });

    const styleFile = result.files.find(f => f.path.includes('.scss'));
    expect(styleFile).toBeDefined();
    expect(styleFile!.action).toBe('created');
  });

  it('generates data file independently', async () => {
    const result = await executeGeneration({
      ...baseConfig,
      data: true,
    });

    // type + data + component = 3
    expect(result.files).toHaveLength(3);
    const dataFile = result.files.find(f => f.path.includes('_data'));
    expect(dataFile).toBeDefined();
  });

  it('passes story flag to page generation', async () => {
    const result = await executeGeneration({
      ...baseConfig,
      page: true,
      story: true,
    });

    const pageFile = result.files.find(f => f.path.includes('Page.tsx'));
    expect(pageFile).toBeDefined();
  });
});
