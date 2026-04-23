import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';

// Mock node:fs (sync API used by scanner)
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import fs from 'node:fs';
import { scanModels, scanModelsDetailed, writeModelRegistry, updateModelRegistry, REGISTRY_FILENAME } from '../lib/scanner';

describe('scanModels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('parses single interface from atoms.d.ts', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      return String(p).endsWith('atoms.d.ts');
    });
    vi.mocked(fs.readFileSync).mockReturnValue(
      'interface ButtonModel extends BasedAtomicModel {\n  label?: string;\n}\n',
    );

    const registry = scanModels('/types');

    expect(registry.atoms).toEqual(['ButtonModel']);
    expect(registry.molecules).toEqual([]);
    expect(registry.organisms).toEqual([]);
  });

  it('parses multiple interfaces from one file', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      return String(p).endsWith('organisms.d.ts');
    });
    vi.mocked(fs.readFileSync).mockReturnValue(
      `interface ProductCardModel extends BasedAtomicModel {}\n` +
      `interface HeaderModel extends BasedAtomicModel {}\n`,
    );

    const registry = scanModels('/types');

    expect(registry.organisms).toEqual(['ProductCardModel', 'HeaderModel']);
  });

  it('parses interfaces across multiple type files', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const filename = String(p);
      if (filename.endsWith('atoms.d.ts')) return 'interface IconModel extends BasedAtomicModel {}';
      if (filename.endsWith('molecules.d.ts')) return 'interface SearchBarModel extends BasedAtomicModel {}';
      if (filename.endsWith('organisms.d.ts')) return 'interface NavModel extends BasedAtomicModel {}';
      return '';
    });

    const registry = scanModels('/types');

    expect(registry.atoms).toEqual(['IconModel']);
    expect(registry.molecules).toEqual(['SearchBarModel']);
    expect(registry.organisms).toEqual(['NavModel']);
  });

  it('returns empty arrays when no type files exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const registry = scanModels('/types');

    expect(registry).toEqual({ atoms: [], molecules: [], organisms: [] });
  });

  it('ignores interfaces that do not extend BasedAtomicModel', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('atoms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      'interface SomeOtherModel extends SomethingElse {}\n' +
      'interface ButtonModel extends BasedAtomicModel {}\n',
    );

    const registry = scanModels('/types');

    expect(registry.atoms).toEqual(['ButtonModel']);
  });
});

describe('scanModelsDetailed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('parses interface with properties', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('atoms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      'interface ButtonModel extends BasedAtomicModel {\n  label?: string;\n  onClick?: () => void;\n}\n',
    );

    const registry = scanModelsDetailed('/types');

    expect(registry.index.atoms).toEqual(['ButtonModel']);
    expect(registry.details['ButtonModel']).toEqual({
      label: 'string',
      onClick: '() => void',
    });
  });

  it('parses interface with no properties', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('organisms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      'interface EmptyModel extends BasedAtomicModel {}\n',
    );

    const registry = scanModelsDetailed('/types');

    expect(registry.index.organisms).toEqual(['EmptyModel']);
    expect(registry.details['EmptyModel']).toEqual({});
  });

  it('parses multiple interfaces with properties', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('atoms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      'interface ButtonModel extends BasedAtomicModel {\n  label?: string;\n}\n\n' +
      'interface ImageModel extends BasedAtomicModel {\n  src?: string;\n  alt?: string;\n}\n',
    );

    const registry = scanModelsDetailed('/types');

    expect(registry.index.atoms).toEqual(['ButtonModel', 'ImageModel']);
    expect(registry.details['ButtonModel']).toEqual({ label: 'string' });
    expect(registry.details['ImageModel']).toEqual({ src: 'string', alt: 'string' });
  });

  it('handles complex property types', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('organisms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      'interface CardModel extends BasedAtomicModel {\n  items?: string[];\n  config?: Record<string, unknown>;\n  isVisible?: boolean;\n}\n',
    );

    const registry = scanModelsDetailed('/types');

    expect(registry.details['CardModel']).toEqual({
      items: 'string[]',
      config: 'Record<string, unknown>',
      isVisible: 'boolean',
    });
  });

  it('returns empty when no type files exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const registry = scanModelsDetailed('/types');

    expect(registry.index).toEqual({ atoms: [], molecules: [], organisms: [] });
    expect(registry.details).toEqual({});
  });
});

describe('writeModelRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('writes registry as JSON with 2-space indent and trailing newline', () => {
    const registry = { atoms: ['ButtonModel'], molecules: [], organisms: [] };

    writeModelRegistry('/project', registry);

    const expectedPath = path.join('/project', REGISTRY_FILENAME);
    const expectedContent = JSON.stringify(registry, null, 2) + '\n';
    expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent, 'utf8');
  });
});

describe('updateModelRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('adds new model to correct category', () => {
    // readModelRegistry: file doesn't exist, returns empty registry
    vi.mocked(fs.existsSync).mockReturnValue(false);

    updateModelRegistry('/project', 'ProductCard', 'o');

    expect(fs.writeFileSync).toHaveBeenCalled();
    const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    const registry = JSON.parse(writtenContent);
    expect(registry.organisms).toContain('ProductCardModel');
  });

  it('adds atom model to atoms category', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    updateModelRegistry('/project', 'Button', 'a');

    const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    const registry = JSON.parse(writtenContent);
    expect(registry.atoms).toContain('ButtonModel');
  });

  it('adds molecule model to molecules category', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    updateModelRegistry('/project', 'SearchBar', 'm');

    const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    const registry = JSON.parse(writtenContent);
    expect(registry.molecules).toContain('SearchBarModel');
  });

  it('does not duplicate existing model', () => {
    const existingRegistry = {
      atoms: [],
      molecules: [],
      organisms: ['ProductCardModel'],
    };
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingRegistry));

    updateModelRegistry('/project', 'ProductCard', 'o');

    // writeFileSync should NOT be called since model already exists
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
