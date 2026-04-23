import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';

// Mock node:fs
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

import fs from 'node:fs';
import { validateProject } from '../lib/validator';

// Helper to create a mock Dirent
const mockDirent = (name: string, isDir: boolean) => ({
  name,
  isDirectory: () => isDir,
  isFile: () => !isDir,
  isBlockDevice: () => false,
  isCharacterDevice: () => false,
  isFIFO: () => false,
  isSocket: () => false,
  isSymbolicLink: () => false,
  parentPath: '',
  path: '',
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('validateProject', () => {
  it('returns error when src/ does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = validateProject('/project');

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].rule).toBe('project-structure');
    expect(result.issues[0].severity).toBe('error');
    expect(result.summary.errors).toBe(1);
  });

  it('returns no issues for empty src/', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      return s.endsWith('src');
    });
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const result = validateProject('/project');

    expect(result.issues).toHaveLength(0);
    expect(result.summary.errors).toBe(0);
    expect(result.summary.warnings).toBe(0);
  });
});

describe('validateProject — component checks', () => {
  it('reports error for non-kebab-case folder', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      return s.endsWith('src') || s.endsWith('organisms');
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('organisms')) {
        return [mockDirent('ProductCard', true)] as any;
      }
      return [];
    });

    const result = validateProject('/project');

    const namingIssues = result.issues.filter((i) => i.rule === 'naming-convention');
    expect(namingIssues).toHaveLength(1);
    expect(namingIssues[0].severity).toBe('error');
    expect(namingIssues[0].message).toContain('ProductCard');
  });

  it('reports error for missing component .tsx file', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('organisms')) return true;
      // Component .tsx does NOT exist
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('organisms')) {
        return [mockDirent('product-card', true)] as any;
      }
      return [];
    });

    const result = validateProject('/project');

    const missing = result.issues.filter((i) => i.rule === 'missing-component');
    expect(missing).toHaveLength(1);
    expect(missing[0].message).toContain('ProductCard.tsx');
  });

  it('reports warnings for missing style and state files', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('atoms')) return true;
      if (s.endsWith('Button.tsx')) return true;
      // .scss and .states.json do NOT exist
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('atoms')) {
        return [mockDirent('button', true)] as any;
      }
      return [];
    });

    const result = validateProject('/project');

    const styleIssues = result.issues.filter((i) => i.rule === 'missing-style');
    const stateIssues = result.issues.filter((i) => i.rule === 'missing-state');
    expect(styleIssues).toHaveLength(1);
    expect(stateIssues).toHaveLength(1);
    expect(styleIssues[0].severity).toBe('warning');
    expect(stateIssues[0].severity).toBe('warning');
  });

  it('reports no issues for a complete component', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('atoms')) return true;
      if (s.endsWith('Button.tsx') || s.endsWith('Button.scss') || s.endsWith('Button.states.json')) return true;
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('atoms')) {
        return [mockDirent('button', true)] as any;
      }
      return [];
    });

    const result = validateProject('/project');

    expect(result.issues).toHaveLength(0);
  });
});

describe('validateProject — orphan checks', () => {
  it('reports orphaned template with no matching component', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('templates')) return true;
      // No matching component directories
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('templates')) {
        return [mockDirent('hero-banner', true)] as any;
      }
      return [];
    });

    const result = validateProject('/project');

    const orphans = result.issues.filter((i) => i.rule === 'orphaned-template');
    expect(orphans).toHaveLength(1);
    expect(orphans[0].message).toContain('hero-banner');
  });

  it('reports orphaned page with no matching template', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('pages')) return true;
      // No matching template directory
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('pages')) {
        return ['ProductCardPage.tsx'] as any;
      }
      return [];
    });

    const result = validateProject('/project');

    const orphans = result.issues.filter((i) => i.rule === 'orphaned-page');
    expect(orphans).toHaveLength(1);
    expect(orphans[0].message).toContain('ProductCardPage.tsx');
  });

  it('does not report page orphan when template exists', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('pages')) return true;
      if (s.includes(path.join('templates', 'product-card'))) return true;
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('pages')) {
        return ['ProductCardPage.tsx'] as any;
      }
      return [];
    });

    const result = validateProject('/project');

    const orphans = result.issues.filter((i) => i.rule === 'orphaned-page');
    expect(orphans).toHaveLength(0);
  });
});

describe('validateProject — registry drift', () => {
  it('warns when registry is missing but types exist', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('_types')) return true;
      // No .alloy-models.json
      return false;
    });
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const result = validateProject('/project');

    const missing = result.issues.filter((i) => i.rule === 'registry-missing');
    expect(missing).toHaveLength(1);
  });

  it('detects model in .d.ts but not in registry', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('_types') || s.endsWith('.alloy-models.json')) return true;
      if (s.endsWith('atoms.d.ts')) return true;
      return false;
    });
    // Registry has no models
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('.alloy-models.json')) {
        return JSON.stringify({ atoms: [], molecules: [], organisms: [] });
      }
      if (s.endsWith('atoms.d.ts')) {
        return 'interface ButtonModel extends BasedAtomicModel {}';
      }
      return '';
    });
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const result = validateProject('/project');

    const drift = result.issues.filter((i) => i.rule === 'registry-drift');
    expect(drift).toHaveLength(1);
    expect(drift[0].message).toContain('ButtonModel');
    expect(drift[0].message).toContain('missing from');
  });

  it('detects model in registry but not in .d.ts', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('_types') || s.endsWith('.alloy-models.json')) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('.alloy-models.json')) {
        return JSON.stringify({ atoms: ['ButtonModel'], molecules: [], organisms: [] });
      }
      return '';
    });
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const result = validateProject('/project');

    const drift = result.issues.filter((i) => i.rule === 'registry-drift');
    expect(drift).toHaveLength(1);
    expect(drift[0].message).toContain('ButtonModel');
    expect(drift[0].message).toContain('not found in type definitions');
  });

  it('reports no drift when registry matches type files', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('_types') || s.endsWith('.alloy-models.json')) return true;
      if (s.endsWith('atoms.d.ts')) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('.alloy-models.json')) {
        return JSON.stringify({ atoms: ['ButtonModel'], molecules: [], organisms: [] });
      }
      if (s.endsWith('atoms.d.ts')) {
        return 'interface ButtonModel extends BasedAtomicModel {}';
      }
      return '';
    });
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const result = validateProject('/project');

    const drift = result.issues.filter((i) => i.rule === 'registry-drift');
    expect(drift).toHaveLength(0);
  });
});

describe('validateProject — summary', () => {
  it('correctly counts errors and warnings', () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('src') || s.endsWith('organisms')) return true;
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.endsWith('organisms')) {
        return [mockDirent('ProductCard', true)] as any; // non-kebab = 1 error
      }
      return [];
    });

    const result = validateProject('/project');

    // naming-convention error + missing-component error + missing-style warning + missing-state warning
    expect(result.summary.errors).toBeGreaterThanOrEqual(1);
    expect(result.summary.warnings).toBeGreaterThanOrEqual(0);
    expect(result.summary.errors + result.summary.warnings).toBe(result.issues.length);
  });
});
