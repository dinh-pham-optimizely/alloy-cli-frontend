import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('launch-editor', () => ({
  default: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
  },
  existsSync: vi.fn().mockReturnValue(false),
}));

import launch from 'launch-editor';
import { Editor, editors } from '../lib/editor';

describe('Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores editor identifier in constructor', () => {
    const editor = new Editor(editors.CODE);
    expect(editor.editor).toBe('code');
  });

  it('calls launch-editor with correct template path and editor', async () => {
    const editor = new Editor(editors.CODE);
    await editor.openFileWithEditor('component');

    expect(launch).toHaveBeenCalledWith(
      expect.stringContaining('component.txt'),
      'code',
      expect.any(Function),
    );
  });

  it('uses correct editor identifier for all editors', () => {
    expect(editors.CODE).toBe('code');
    expect(editors.CODE_INSIDERS).toBe('code-insiders');
    expect(editors.IDEA).toBe('idea');
    expect(editors.NOTEPAD).toBe('notepad++');
    expect(editors.SUBLIME).toBe('sublime');
    expect(editors.WEBSTORM).toBe('webstorm');
  });
});
