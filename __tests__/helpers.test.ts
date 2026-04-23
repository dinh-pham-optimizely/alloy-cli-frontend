import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  turnPascalCaseToKebabCase,
  turnPascalCaseToCamelCase,
  turnPascalCaseToCapCaseWithSpacing,
  getComponentModelName,
  getComponentAsKebabCase,
  getComponentTemplateName,
  getComponentAsCamelCase,
  getComponentDataName,
  getComponentPageName,
  getComponentAsCapCaseWithSpacing,
  getTypeFullText,
  replaceComponentTextVariants,
  replaceTemplateComments,
  replaceComponentTemplatePlaceholder,
  createFolder,
  createFile,
  appendContentToFile,
  getTemplatePath,
} from '../lib/helpers';

// ─── Name Transformation Functions ───────────────────────────────────────────

describe('turnPascalCaseToKebabCase', () => {
  it('converts simple PascalCase', () => {
    expect(turnPascalCaseToKebabCase('ProductCard')).toBe('product-card');
  });

  it('converts single word', () => {
    expect(turnPascalCaseToKebabCase('Button')).toBe('button');
  });

  it('converts multi-word PascalCase', () => {
    expect(turnPascalCaseToKebabCase('MySearchBar')).toBe('my-search-bar');
  });

  it('handles acronym followed by lowercase (HTTPRequest → http-request)', () => {
    // Per copilot-instructions.md: HTTPRequest → http-request
    expect(turnPascalCaseToKebabCase('HTTPRequest')).toBe('http-request');
  });

  it('handles acronym in middle (MyHTTPClient → my-http-client)', () => {
    expect(turnPascalCaseToKebabCase('MyHTTPClient')).toBe('my-http-client');
  });

  it('handles all uppercase single word', () => {
    expect(turnPascalCaseToKebabCase('HTTP')).toBe('http');
  });
});

describe('turnPascalCaseToCamelCase', () => {
  it('converts simple PascalCase', () => {
    expect(turnPascalCaseToCamelCase('ProductCard')).toBe('productCard');
  });

  it('converts single word', () => {
    expect(turnPascalCaseToCamelCase('Button')).toBe('button');
  });

  it('handles multi-word', () => {
    expect(turnPascalCaseToCamelCase('MySearchBar')).toBe('mySearchBar');
  });
});

describe('turnPascalCaseToCapCaseWithSpacing', () => {
  it('converts simple PascalCase', () => {
    expect(turnPascalCaseToCapCaseWithSpacing('ProductCard')).toBe('Product Card');
  });

  it('converts single word (no change)', () => {
    expect(turnPascalCaseToCapCaseWithSpacing('Button')).toBe('Button');
  });

  it('converts multi-word', () => {
    expect(turnPascalCaseToCapCaseWithSpacing('MySearchBar')).toBe('My Search Bar');
  });
});

// ─── Component Name Derivation Functions ─────────────────────────────────────

describe('getComponentModelName', () => {
  it('appends "Model" to component name', () => {
    expect(getComponentModelName('ProductCard')).toBe('ProductCardModel');
  });

  it('works with single word', () => {
    expect(getComponentModelName('Button')).toBe('ButtonModel');
  });
});

describe('getComponentAsKebabCase', () => {
  it('delegates to turnPascalCaseToKebabCase', () => {
    expect(getComponentAsKebabCase('ProductCard')).toBe('product-card');
  });
});

describe('getComponentTemplateName', () => {
  it('appends "Template" to component name', () => {
    expect(getComponentTemplateName('ProductCard')).toBe('ProductCardTemplate');
  });
});

describe('getComponentAsCamelCase', () => {
  it('delegates to turnPascalCaseToCamelCase', () => {
    expect(getComponentAsCamelCase('ProductCard')).toBe('productCard');
  });
});

describe('getComponentDataName', () => {
  it('returns camelCase + "Data"', () => {
    expect(getComponentDataName('ProductCard')).toBe('productCardData');
  });

  it('works with single word', () => {
    expect(getComponentDataName('Button')).toBe('buttonData');
  });
});

describe('getComponentPageName', () => {
  it('appends "Page" to component name', () => {
    expect(getComponentPageName('ProductCard')).toBe('ProductCardPage');
  });
});

describe('getComponentAsCapCaseWithSpacing', () => {
  it('delegates to turnPascalCaseToCapCaseWithSpacing', () => {
    expect(getComponentAsCapCaseWithSpacing('ProductCard')).toBe('Product Card');
  });
});

// ─── getTypeFullText ─────────────────────────────────────────────────────────

describe('getTypeFullText', () => {
  it('returns plural atom', () => {
    expect(getTypeFullText('a')).toBe('atoms');
  });

  it('returns singular atom', () => {
    expect(getTypeFullText('a', false)).toBe('atom');
  });

  it('returns plural molecule', () => {
    expect(getTypeFullText('m')).toBe('molecules');
  });

  it('returns singular molecule', () => {
    expect(getTypeFullText('m', false)).toBe('molecule');
  });

  it('returns plural organism', () => {
    expect(getTypeFullText('o')).toBe('organisms');
  });

  it('returns singular organism', () => {
    expect(getTypeFullText('o', false)).toBe('organism');
  });
});

// ─── replaceComponentTextVariants ────────────────────────────────────────────

describe('replaceComponentTextVariants', () => {
  const template = [
    '${componentName}',
    '${componentModelName}',
    '${componentNameKebabCase}',
    '${componentTemplateName}',
    '${componentDataName}',
    '${componentPageName}',
    '${componentNameCamelCase}',
    '${componentAsCapCaseWithSpacing}',
    '${projectPrefix}',
    '${type}',
  ].join('|');

  it('replaces all placeholders for a full component', () => {
    const result = replaceComponentTextVariants(template, 'ProductCard', 'xx', 'o');
    expect(result).toBe([
      'ProductCard',
      'ProductCardModel',
      'product-card',
      'ProductCardTemplate',
      'productCardData',
      'ProductCardPage',
      'productCard',
      'Product Card',
      'xx',
      'o',
    ].join('|'));
  });

  it('replaces component placeholders without projectPrefix and type', () => {
    const partialTemplate = '${componentName} ${componentModelName}';
    const result = replaceComponentTextVariants(partialTemplate, 'SearchBar');
    expect(result).toBe('SearchBar SearchBarModel');
  });

  it('leaves ${projectPrefix} and ${type} unreplaced when not provided', () => {
    const result = replaceComponentTextVariants('${projectPrefix}-${type}', 'X');
    expect(result).toBe('${projectPrefix}-${type}');
  });

  it('handles multiple occurrences of same placeholder', () => {
    const result = replaceComponentTextVariants(
      '${componentName} and ${componentName}',
      'Button',
    );
    expect(result).toBe('Button and Button');
  });
});

// ─── replaceTemplateComments ─────────────────────────────────────────────────

describe('replaceTemplateComments', () => {
  it('removes a single comment', () => {
    expect(replaceTemplateComments('<-- some comment -->')).toBe('');
  });

  it('removes comment and preserves surrounding content', () => {
    expect(replaceTemplateComments('before<-- comment -->after')).toBe('beforeafter');
  });

  it('removes multiple comments', () => {
    expect(replaceTemplateComments('<-- a -->text<-- b -->')).toBe('text');
  });

  it('returns content unchanged when no comments', () => {
    expect(replaceTemplateComments('no comments here')).toBe('no comments here');
  });
});

// ─── replaceComponentTemplatePlaceholder ─────────────────────────────────────

describe('replaceComponentTemplatePlaceholder', () => {
  const contentWithPlaceholder = `<div>
    <-- CLI placeholder - please don't make any changes -->
    </div>`;

  it('returns content unchanged when both flags are false', () => {
    const result = replaceComponentTemplatePlaceholder(contentWithPlaceholder, 'ProductCard', false, false);
    expect(result).toBe(contentWithPlaceholder);
  });

  it('inserts RequireJs when isNeedScript is true', () => {
    const result = replaceComponentTemplatePlaceholder(contentWithPlaceholder, 'ProductCard', true, false);
    expect(result).toContain("<RequireJs path={'product-card'} defer />");
    expect(result).not.toContain('RequireCss');
  });

  it('inserts RequireCss when isNeedStyle is true', () => {
    const result = replaceComponentTemplatePlaceholder(contentWithPlaceholder, 'ProductCard', false, true);
    expect(result).toContain("<RequireCss path={'b-product-card'} />");
    expect(result).not.toContain('RequireJs');
  });

  it('inserts both RequireJs and RequireCss when both flags are true', () => {
    const result = replaceComponentTemplatePlaceholder(contentWithPlaceholder, 'ProductCard', true, true);
    expect(result).toContain("<RequireJs path={'product-card'} defer />");
    expect(result).toContain("<RequireCss path={'b-product-card'} />");
  });

  it('uses kebab-case component name in paths', () => {
    const result = replaceComponentTemplatePlaceholder(contentWithPlaceholder, 'MySearchBar', true, true);
    expect(result).toContain("'my-search-bar'");
    expect(result).toContain("'b-my-search-bar'");
  });
});

// ─── File System Helpers (mocked) ────────────────────────────────────────────

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
      appendFileSync: vi.fn(),
    },
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    appendFileSync: vi.fn(),
  };
});

import fs from 'node:fs';

describe('createFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('creates folder with recursive option when it does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    createFolder('/some/path');
    expect(fs.mkdirSync).toHaveBeenCalledWith('/some/path', { recursive: true });
  });

  it('skips creation when folder already exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    createFolder('/some/path');
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
});

describe('createFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('writes file when it does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    createFile('/some/file.ts', 'content');
    expect(fs.writeFileSync).toHaveBeenCalledWith('/some/file.ts', 'content', 'utf8');
  });

  it('skips writing when file already exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    createFile('/some/file.ts', 'content');
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});

describe('appendContentToFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('appends content to file when filePath is provided', () => {
    appendContentToFile('/some/file.ts', 'new content');
    expect(fs.appendFileSync).toHaveBeenCalledWith('/some/file.ts', 'new content', 'utf8');
  });

  it('does nothing when filePath is empty', () => {
    appendContentToFile('', 'content');
    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });
});

describe('getTemplatePath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lib/templates path when it exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const result = getTemplatePath('component.txt');
    expect(result).toContain('templates');
    expect(result).toContain('component.txt');
  });

  it('falls back to public/templates when lib path does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = getTemplatePath('component.txt');
    // Use path.sep-aware check for Windows/Unix compatibility
    expect(result).toContain('component.txt');
    expect(result).toMatch(/public[/\\]templates[/\\]component\.txt$/);
  });
});
