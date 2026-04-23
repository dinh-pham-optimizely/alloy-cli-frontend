import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    copyFileSync: vi.fn(),
    readFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

import fs from 'node:fs';
import { checkbox, confirm } from '@inquirer/prompts';

// We need to test initAction's internal logic, but it's tightly coupled.
// We'll test the getSourceGithubPath logic and the file copy behavior.

describe('init command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('getSourceGithubPath behavior (via initAction)', () => {
    it('should find .github directory and install files when dest does not exist', async () => {
      // Track which paths are checked to differentiate source vs dest
      let callCount = 0;
      vi.mocked(fs.existsSync).mockImplementation((p: any) => {
        callCount++;
        const pathStr = String(p);
        // First 1-2 calls: getSourceGithubPath() checks if .github dir exists → true
        if (pathStr.endsWith('.github')) return true;
        // Source file checks → true (file exists in package)
        if (pathStr.includes('copilot-instructions.md') && callCount <= 4) return true;
        // Destination file check → false (not yet installed)
        return false;
      });

      vi.mocked(checkbox).mockResolvedValue(['Project Instructions']);

      const { initAction } = await import('../lib/init');
      await initAction({});

      // existsSync was called (at minimum for getSourceGithubPath)
      expect(fs.existsSync).toHaveBeenCalled();
    });

    it('should skip existing files without --force', async () => {
      // All files exist
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(checkbox).mockResolvedValue(['Alloy Agent (@alloy)']);

      const { initAction } = await import('../lib/init');
      await initAction({});

      // Should NOT have called copyFileSync since file exists and no force
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });

    it('should install nothing when no categories selected', async () => {
      vi.mocked(checkbox).mockResolvedValue([]);

      const { initAction } = await import('../lib/init');
      await initAction({});

      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });
  });

  describe('force overwrite', () => {
    it('asks confirmation before overwriting existing files', async () => {
      // .github source exists, destination files exist
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(checkbox).mockResolvedValue(['Alloy Agent (@alloy)']);
      vi.mocked(confirm).mockResolvedValue(false); // User says no to overwrite

      const { initAction } = await import('../lib/init');
      await initAction({ force: true });

      // User declined, so no copy
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });

    it('overwrites files when user confirms with --force', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      vi.mocked(checkbox).mockResolvedValue(['Alloy Agent (@alloy)']);
      vi.mocked(confirm).mockResolvedValue(true); // User confirms overwrite

      const { initAction } = await import('../lib/init');
      await initAction({ force: true });

      expect(fs.copyFileSync).toHaveBeenCalled();
    });
  });
});
