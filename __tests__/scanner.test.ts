import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { scanModels, writeModelRegistry, REGISTRY_FILENAME } from '../lib/scanner';

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

  it('parses v2 type alias syntax', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('atoms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      'type ButtonModel = BasedAtomicModel & {\n  label?: string;\n}\n',
    );

    const registry = scanModels('/types');

    expect(registry.atoms).toEqual(['ButtonModel']);
  });

  it('parses multiple v2 type aliases from one file', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('organisms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      `type ProductCardModel = BasedAtomicModel & {}\n` +
      `type HeaderModel = BasedAtomicModel & {}\n`,
    );

    const registry = scanModels('/types');

    expect(registry.organisms).toEqual(['ProductCardModel', 'HeaderModel']);
  });

  it('handles mixed v1 interfaces and v2 type aliases without duplicates', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) =>
      String(p).endsWith('atoms.d.ts'),
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      'interface ButtonModel extends BasedAtomicModel {}\n' +
      'type IconModel = BasedAtomicModel & {}\n',
    );

    const registry = scanModels('/types');

    expect(registry.atoms).toEqual(['ButtonModel', 'IconModel']);
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
