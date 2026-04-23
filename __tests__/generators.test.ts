import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';

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
    createFile: vi.fn(),
    appendContentToFile: vi.fn(),
  };
});

import {
  generateComponent,
  generateTemplateComponent,
  generatePageComponent,
  generateComponentData,
  generateComponentType,
  generateComponentStyle,
  generateComponentScript,
  generateComponentState,
} from '../lib/generators';
import { createFolder, createFile, appendContentToFile } from '../lib/helpers';
import { renderComponentContent, renderTemplateComponent, renderPageComponent, renderComponentData, renderComponentType, renderComponentStyle, renderComponentState } from '../lib/renderers';
import { updateModelRegistry } from '../lib/scanner';

describe('generateComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{componentDirectory}/{kebab-name}/', async () => {
    await generateComponent({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
      isNeedStyle: false,
      isNeedScript: false,
      componentDirectory: 'organisms',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringContaining(path.join('organisms', 'product-card')),
    );
  });

  it('creates file named {ComponentName}.tsx', async () => {
    await generateComponent({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
      isNeedStyle: false,
      isNeedScript: false,
      componentDirectory: 'organisms',
    });

    expect(createFile).toHaveBeenCalledWith(
      expect.stringMatching(/ProductCard\.tsx$/),
      'rendered-component',
    );
  });

  it('passes correct params to renderComponentContent', async () => {
    await generateComponent({
      componentName: 'Button',
      projectPrefix: 'ab',
      type: 'a',
      isNeedStyle: true,
      isNeedScript: true,
      componentDirectory: 'atoms',
    });

    expect(renderComponentContent).toHaveBeenCalledWith({
      componentName: 'Button',
      projectPrefix: 'ab',
      type: 'a',
      isNeedScript: true,
      isNeedStyle: true,
    });
  });

  it('does not create file when render returns empty', async () => {
    vi.mocked(renderComponentContent).mockResolvedValueOnce('');

    await generateComponent({
      componentName: 'X',
      projectPrefix: 'xx',
      type: 'o',
      componentDirectory: 'organisms',
    });

    expect(createFile).not.toHaveBeenCalled();
  });
});

describe('generateTemplateComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{templateDirectory}/{kebab-name}/', async () => {
    await generateTemplateComponent({
      componentName: 'ProductCard',
      templateDirectory: 'templates',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringContaining(path.join('templates', 'product-card')),
    );
  });

  it('creates file named {ComponentName}Template.tsx', async () => {
    await generateTemplateComponent({
      componentName: 'ProductCard',
      templateDirectory: 'templates',
    });

    expect(createFile).toHaveBeenCalledWith(
      expect.stringMatching(/ProductCardTemplate\.tsx$/),
      'rendered-template',
    );
  });
});

describe('generatePageComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{pageDirectory}/', async () => {
    await generatePageComponent({
      componentName: 'ProductCard',
      isUsingPageStoryTemplate: false,
      pageDirectory: 'pages',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringContaining('pages'),
    );
  });

  it('creates file named {ComponentName}Page.tsx', async () => {
    await generatePageComponent({
      componentName: 'ProductCard',
      isUsingPageStoryTemplate: false,
      pageDirectory: 'pages',
    });

    expect(createFile).toHaveBeenCalledWith(
      expect.stringMatching(/ProductCardPage\.tsx$/),
      'rendered-page',
    );
  });

  it('passes isUsingPageStoryTemplate to renderer', async () => {
    await generatePageComponent({
      componentName: 'ProductCard',
      isUsingPageStoryTemplate: true,
      pageDirectory: 'pages',
    });

    expect(renderPageComponent).toHaveBeenCalledWith({
      componentName: 'ProductCard',
      isUsingPageStoryTemplate: true,
    });
  });
});

describe('generateComponentData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{dataDirectory}/', async () => {
    await generateComponentData({
      componentName: 'ProductCard',
      dataDirectory: '_data',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringContaining('_data'),
    );
  });

  it('creates file named {camelCaseName}.ts', async () => {
    await generateComponentData({
      componentName: 'ProductCard',
      dataDirectory: '_data',
    });

    expect(createFile).toHaveBeenCalledWith(
      expect.stringMatching(/productCard\.ts$/),
      'rendered-data',
    );
  });
});

describe('generateComponentType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{typeDirectory}/', async () => {
    await generateComponentType({
      componentName: 'ProductCard',
      type: 'o',
      typeDirectory: '_types',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringContaining('_types'),
    );
  });

  it('appends to organisms.d.ts for organism type', async () => {
    await generateComponentType({
      componentName: 'ProductCard',
      type: 'o',
      typeDirectory: '_types',
    });

    expect(appendContentToFile).toHaveBeenCalledWith(
      expect.stringMatching(/organisms\.d\.ts$/),
      'rendered-type',
    );
  });

  it('appends to atoms.d.ts for atom type', async () => {
    await generateComponentType({
      componentName: 'Button',
      type: 'a',
      typeDirectory: '_types',
    });

    expect(appendContentToFile).toHaveBeenCalledWith(
      expect.stringMatching(/atoms\.d\.ts$/),
      'rendered-type',
    );
  });

  it('appends to molecules.d.ts for molecule type', async () => {
    await generateComponentType({
      componentName: 'SearchBar',
      type: 'm',
      typeDirectory: '_types',
    });

    expect(appendContentToFile).toHaveBeenCalledWith(
      expect.stringMatching(/molecules\.d\.ts$/),
      'rendered-type',
    );
  });

  it('calls updateModelRegistry after appending', async () => {
    await generateComponentType({
      componentName: 'ProductCard',
      type: 'o',
      typeDirectory: '_types',
    });

    expect(updateModelRegistry).toHaveBeenCalledWith(
      expect.any(String),
      'ProductCard',
      'o',
    );
  });
});

describe('generateComponentStyle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{typeFullText}/{kebab-name}/', async () => {
    await generateComponentStyle({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringContaining(path.join('organisms', 'product-card')),
    );
  });

  it('creates file named {ComponentName}.scss', async () => {
    await generateComponentStyle({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
    });

    expect(createFile).toHaveBeenCalledWith(
      expect.stringMatching(/ProductCard\.scss$/),
      'rendered-style',
    );
  });
});

describe('generateComponentScript', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{scriptDirectory}/', () => {
    generateComponentScript({
      componentName: 'ProductCard',
      scriptDirectory: 'assets/scripts',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringMatching(/assets[/\\]scripts$/),
    );
  });

  it('creates file named {kebab-name}.entry.ts with empty content', () => {
    generateComponentScript({
      componentName: 'ProductCard',
      scriptDirectory: 'assets/scripts',
    });

    expect(createFile).toHaveBeenCalledWith(
      expect.stringMatching(/product-card\.entry\.ts$/),
      '',
    );
  });
});

describe('generateComponentState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates folder at src/{typeFullText}/{kebab-name}/', async () => {
    await generateComponentState({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
    });

    expect(createFolder).toHaveBeenCalledWith(
      expect.stringContaining(path.join('organisms', 'product-card')),
    );
  });

  it('creates file named {ComponentName}.states.json', async () => {
    await generateComponentState({
      componentName: 'ProductCard',
      projectPrefix: 'xx',
      type: 'o',
    });

    expect(createFile).toHaveBeenCalledWith(
      expect.stringMatching(/ProductCard\.states\.json$/),
      'rendered-state',
    );
  });
});
