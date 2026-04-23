import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all generators — capture calls without touching filesystem
vi.mock('../lib/generators', () => ({
  generateComponent: vi.fn().mockResolvedValue(undefined),
  generateTemplateComponent: vi.fn().mockResolvedValue(undefined),
  generatePageComponent: vi.fn().mockResolvedValue(undefined),
  generateComponentData: vi.fn().mockResolvedValue(undefined),
  generateComponentType: vi.fn().mockResolvedValue(undefined),
  generateComponentStyle: vi.fn().mockResolvedValue(undefined),
  generateComponentScript: vi.fn(),
  generateComponentState: vi.fn().mockResolvedValue(undefined),
}));

// Mock inquirer prompts — simulate user input
vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  input: vi.fn(),
  select: vi.fn(),
  checkbox: vi.fn(),
}));

// Mock helpers — keep real name transforms, mock interactive prompts
vi.mock('../lib/helpers', async () => {
  const actual = await vi.importActual<typeof import('../lib/helpers')>('../lib/helpers');
  return {
    ...actual,
    commonActions: vi.fn(),
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
import { confirm, input } from '@inquirer/prompts';
import { commonActions } from '../lib/helpers';

// Import the REAL command handlers — bugs and all
import { organismAction, atomAction, moleculeAction, pageAction } from '../lib/commands';

// ─── Organism Command ────────────────────────────────────────────────────────

describe('organism command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates all optional files when user confirms all options', async () => {
    vi.mocked(commonActions).mockResolvedValue({
      projectPrefix: 'xx',
      componentName: 'ProductCard',
      isNeedScript: true,
      isNeedStyle: true,
      isNeedState: true,
    });

    vi.mocked(confirm)
      .mockResolvedValueOnce(true)   // separate page view
      .mockResolvedValueOnce(true)   // page story template
      .mockResolvedValueOnce(true);  // new data file

    await organismAction({
      componentDirectory: 'organisms',
      pageDirectory: 'pages',
      templateDirectory: 'templates',
      dataDirectory: '_data',
      typeDirectory: '_types',
      scriptDirectory: 'assets/scripts',
    });

    expect(generateComponentState).toHaveBeenCalled();
    expect(generatePageComponent).toHaveBeenCalled();
    expect(generateTemplateComponent).toHaveBeenCalled();
    expect(generateComponentData).toHaveBeenCalled();
    expect(generateComponentType).toHaveBeenCalled();
    expect(generateComponentStyle).toHaveBeenCalled();
    expect(generateComponentScript).toHaveBeenCalled();
    expect(generateComponent).toHaveBeenCalled();
  });

  it('skips optional generators when user declines', async () => {
    vi.mocked(commonActions).mockResolvedValue({
      projectPrefix: 'xx',
      componentName: 'ProductCard',
      isNeedScript: false,
      isNeedStyle: false,
      isNeedState: false,
    });

    vi.mocked(confirm)
      .mockResolvedValueOnce(false)  // no separate page view
      .mockResolvedValueOnce(false); // no new data file

    await organismAction({
      componentDirectory: 'organisms',
      pageDirectory: 'pages',
      templateDirectory: 'templates',
      dataDirectory: '_data',
      typeDirectory: '_types',
      scriptDirectory: 'assets/scripts',
    });

    expect(generateComponentState).not.toHaveBeenCalled();
    expect(generatePageComponent).not.toHaveBeenCalled();
    expect(generateTemplateComponent).not.toHaveBeenCalled();
    expect(generateComponentData).not.toHaveBeenCalled();
    expect(generateComponentType).toHaveBeenCalled();
    expect(generateComponentStyle).not.toHaveBeenCalled();
    expect(generateComponentScript).not.toHaveBeenCalled();
    expect(generateComponent).toHaveBeenCalled();
  });

  it('passes isNeedStyle to generateComponent', async () => {
    vi.mocked(commonActions).mockResolvedValue({
      projectPrefix: 'xx',
      componentName: 'ProductCard',
      isNeedScript: false,
      isNeedStyle: true,
      isNeedState: false,
    });

    vi.mocked(confirm)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    await organismAction({
      componentDirectory: 'organisms',
      pageDirectory: 'pages',
      templateDirectory: 'templates',
      dataDirectory: '_data',
      typeDirectory: '_types',
      scriptDirectory: 'assets/scripts',
    });

    // Organism command correctly passes isNeedStyle — this should pass
    expect(generateComponent).toHaveBeenCalledWith(
      expect.objectContaining({ isNeedStyle: true }),
    );
  });
});

// ─── Atom Command ────────────────────────────────────────────────────────────

describe('atom command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates type first and component last', async () => {
    vi.mocked(commonActions).mockResolvedValue({
      projectPrefix: 'ab',
      componentName: 'Icon',
      isNeedScript: true,
      isNeedStyle: true,
      isNeedState: true,
    });

    const callOrder: string[] = [];
    vi.mocked(generateComponentType).mockImplementation(async () => { callOrder.push('type'); });
    vi.mocked(generateComponentState).mockImplementation(async () => { callOrder.push('state'); });
    vi.mocked(generateComponentStyle).mockImplementation(async () => { callOrder.push('style'); });
    vi.mocked(generateComponentScript).mockImplementation(() => { callOrder.push('script'); });
    vi.mocked(generateComponent).mockImplementation(async () => { callOrder.push('component'); });

    await atomAction({
      componentDirectory: 'atoms',
      typeDirectory: '_types',
      scriptDirectory: 'assets/scripts',
    });

    expect(callOrder[0]).toBe('type');
    expect(callOrder[callOrder.length - 1]).toBe('component');
  });

  // BUG #1: atom command does NOT pass isNeedStyle to generateComponent.
  // Expected correct behavior: isNeedStyle should be passed so RequireCss import is generated.
  // This test asserts the correct behavior and FAILS against the buggy code.
  it.fails('should pass isNeedStyle to generateComponent', async () => {
    vi.mocked(commonActions).mockResolvedValue({
      projectPrefix: 'ab',
      componentName: 'Button',
      isNeedScript: false,
      isNeedStyle: true,
      isNeedState: false,
    });

    await atomAction({
      componentDirectory: 'atoms',
      typeDirectory: '_types',
      scriptDirectory: 'assets/scripts',
    });

    // The real atomAction omits isNeedStyle in the generateComponent call
    expect(generateComponent).toHaveBeenCalledWith(
      expect.objectContaining({ isNeedStyle: true }),
    );
  });
});

// ─── Molecule Command ────────────────────────────────────────────────────────

describe('molecule command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates type first and component last', async () => {
    vi.mocked(commonActions).mockResolvedValue({
      projectPrefix: 'xx',
      componentName: 'SearchBar',
      isNeedScript: true,
      isNeedStyle: true,
      isNeedState: true,
    });

    const callOrder: string[] = [];
    vi.mocked(generateComponentType).mockImplementation(async () => { callOrder.push('type'); });
    vi.mocked(generateComponentState).mockImplementation(async () => { callOrder.push('state'); });
    vi.mocked(generateComponentStyle).mockImplementation(async () => { callOrder.push('style'); });
    vi.mocked(generateComponentScript).mockImplementation(() => { callOrder.push('script'); });
    vi.mocked(generateComponent).mockImplementation(async () => { callOrder.push('component'); });

    await moleculeAction({
      componentDirectory: 'molecules',
      typeDirectory: '_types',
      scriptDirectory: 'assets/scripts',
    });

    expect(callOrder[0]).toBe('type');
    expect(callOrder[callOrder.length - 1]).toBe('component');
  });

  // BUG #1: molecule command does NOT pass isNeedStyle to generateComponent (same as atom).
  it.fails('should pass isNeedStyle to generateComponent', async () => {
    vi.mocked(commonActions).mockResolvedValue({
      projectPrefix: 'xx',
      componentName: 'SearchBar',
      isNeedScript: false,
      isNeedStyle: true,
      isNeedState: false,
    });

    await moleculeAction({
      componentDirectory: 'molecules',
      typeDirectory: '_types',
      scriptDirectory: 'assets/scripts',
    });

    expect(generateComponent).toHaveBeenCalledWith(
      expect.objectContaining({ isNeedStyle: true }),
    );
  });
});

// ─── Page Command ────────────────────────────────────────────────────────────

describe('page command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates page with standard template', async () => {
    vi.mocked(input).mockResolvedValue('ProductCard');
    vi.mocked(confirm)
      .mockResolvedValueOnce(false)   // no story template
      .mockResolvedValueOnce(false);  // no new template component

    await pageAction({ pageDirectory: 'pages', templateDirectory: 'templates' });

    expect(generatePageComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'ProductCard',
        isUsingPageStoryTemplate: false,
      }),
    );
    expect(generateTemplateComponent).not.toHaveBeenCalled();
  });

  it('generates template when user confirms', async () => {
    vi.mocked(input).mockResolvedValue('ProductCard');
    vi.mocked(confirm)
      .mockResolvedValueOnce(true)    // story template
      .mockResolvedValueOnce(true);   // new template component

    await pageAction({ pageDirectory: 'pages', templateDirectory: 'templates' });

    expect(generatePageComponent).toHaveBeenCalledWith(
      expect.objectContaining({ isUsingPageStoryTemplate: true }),
    );
    expect(generateTemplateComponent).toHaveBeenCalledWith({
      componentName: 'ProductCard',
      templateDirectory: 'templates',
    });
  });

  // BUG #3: The real code uses `if (isNeedNewTemplateComponent || templateDirectory !== 'templates')`
  // When user says NO to template but uses a custom directory, the || makes it generate anyway.
  // Expected: template should only be generated when user explicitly requests it.
  it.fails('should NOT generate template when user declines even with non-default directory', async () => {
    vi.mocked(input).mockResolvedValue('ProductCard');
    vi.mocked(confirm)
      .mockResolvedValueOnce(false)   // no story template
      .mockResolvedValueOnce(false);  // user says NO to new template

    // Use non-default directory — the || bug will trigger template generation
    await pageAction({ pageDirectory: 'pages', templateDirectory: 'custom-templates' });

    // Should NOT generate template since user explicitly declined
    expect(generateTemplateComponent).not.toHaveBeenCalled();
  });
});
