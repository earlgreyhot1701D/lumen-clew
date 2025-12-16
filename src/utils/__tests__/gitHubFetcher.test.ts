// @ts-nocheck - Documentation tests only (vitest not configured)
// BACKEND: GitHub Fetcher Tests
// Documentation for future use (test runner not yet configured)

import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import { fetchGitHubRepo, cleanupDir, FetchResult } from '../gitHubFetcher';

describe('fetchGitHubRepo', () => {
  let tempDir: string | undefined;

  afterEach(() => {
    // Cleanup after each test
    if (tempDir) {
      cleanupDir(tempDir);
      tempDir = undefined;
    }
  });

  // Valid repos
  describe('valid repositories', () => {
    it('fetches small public repository', async () => {
      const result = await fetchGitHubRepo('https://github.com/octocat/Hello-World');
      
      expect(result.success).toBe(true);
      expect(result.tempDir).toBeDefined();
      expect(result.fileCount).toBeGreaterThanOrEqual(0);
      expect(result.filesScanned).toBeDefined();
      expect(result.filesSkipped).toBeDefined();
      
      tempDir = result.tempDir;
    });

    it('handles trailing slash in URL', async () => {
      const result = await fetchGitHubRepo('https://github.com/octocat/Hello-World/');
      
      expect(result.success).toBe(true);
      tempDir = result.tempDir;
    });
  });

  // Invalid repos
  describe('invalid repositories', () => {
    it('returns error for 404 repository', async () => {
      const result = await fetchGitHubRepo('https://github.com/nonexistent-user-12345/nonexistent-repo-67890');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('returns error for invalid URL format', async () => {
      const result = await fetchGitHubRepo('https://gitlab.com/owner/repo');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid GitHub URL format');
    });

    it('returns error for malformed URL', async () => {
      const result = await fetchGitHubRepo('not-a-url');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid GitHub URL format');
    });
  });

  // Scan modes
  describe('scan modes', () => {
    it('respects fast scan file limit', async () => {
      // Using a larger repo to test file limiting
      const result = await fetchGitHubRepo('https://github.com/octocat/Spoon-Knife', 'fast');
      
      expect(result.success).toBe(true);
      // Fast scan should limit to 300 files max
      if (result.filesScanned !== undefined) {
        expect(result.filesScanned).toBeLessThanOrEqual(300);
      }
      
      tempDir = result.tempDir;
    });
  });

  // Metrics
  describe('metrics reporting', () => {
    it('reports fileCount, filesScanned, filesSkipped', async () => {
      const result = await fetchGitHubRepo('https://github.com/octocat/Hello-World');
      
      expect(result.success).toBe(true);
      expect(typeof result.fileCount).toBe('number');
      expect(typeof result.filesScanned).toBe('number');
      expect(typeof result.filesSkipped).toBe('number');
      
      // filesSkipped should be >= 0
      expect(result.filesSkipped).toBeGreaterThanOrEqual(0);
      
      // filesScanned + filesSkipped should relate to fileCount
      // (filesScanned <= fileCount because some files are filtered)
      expect(result.filesScanned).toBeLessThanOrEqual(result.fileCount!);
      
      tempDir = result.tempDir;
    });
  });
});

describe('cleanupDir', () => {
  it('removes temp directory', () => {
    const testDir = `/tmp/lumen-test-${Date.now()}`;
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(`${testDir}/test.txt`, 'test content');
    
    expect(fs.existsSync(testDir)).toBe(true);
    
    cleanupDir(testDir);
    
    expect(fs.existsSync(testDir)).toBe(false);
  });

  it('handles non-existent directory gracefully', () => {
    // Should not throw
    expect(() => cleanupDir('/tmp/nonexistent-dir-12345')).not.toThrow();
  });
});
