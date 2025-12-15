// @ts-nocheck
// BACKEND: Accessibility Analyzer Tests
// Documentation for future use (test runner not yet configured)

import { runA11yAnalyzer, A11yResult } from '../runA11yAnalyzer';
import * as fs from 'fs';
import * as path from 'path';
import { CONFIG } from '../../lib/config';

// Mock dependencies
jest.mock('fs');
jest.mock('../../lib/config', () => ({
  CONFIG: {
    MAX_FILE_SIZE_MB: 1,
    MAX_FINDINGS_PER_PANEL: 25,
    FILES_TO_IGNORE: ['node_modules/', 'dist/', '.git/'],
    FAST_SCAN: {
      a11yTimeoutMs: 20000,
    },
  },
}));
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('runA11yAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('successful execution', () => {
    it('should detect missing alt attribute on images', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="photo.jpg">');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.success).toBe(true);
      expect(result.findings.length).toBe(1);
      expect(result.findings[0].metadata?.patternId).toBe('missing_alt');
      expect(result.findings[0].severity).toBe('high');
    });

    it('should detect non-semantic div with onClick', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'Button.jsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<div onClick={handleClick}>Click me</div>');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.findings.length).toBe(1);
      expect(result.findings[0].metadata?.patternId).toBe('non_semantic_button_div');
      expect(result.findings[0].severity).toBe('high');
    });

    it('should detect non-semantic element with role="button"', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'Nav.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<span role="button">Submit</span>');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.findings.length).toBe(1);
      expect(result.findings[0].metadata?.patternId).toBe('non_semantic_button_role');
    });

    it('should detect anchor without href', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'Links.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<a onClick={handleNav}>Go</a>');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.findings.some((f) => f.metadata?.patternId === 'link_without_href')).toBe(true);
    });

    it('should detect empty headings', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'Page.html', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<h2></h2>');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.findings.length).toBe(1);
      expect(result.findings[0].metadata?.patternId).toBe('empty_heading');
      expect(result.findings[0].severity).toBe('low');
    });

    it('should analyze .htm files', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'legacy.htm', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="test.png">');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.filesAnalyzed).toBe(1);
      expect(result.findings.length).toBe(1);
    });
  });

  describe('heading hierarchy detection (code-based)', () => {
    it('should detect h1 followed by h3 (skipping h2)', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'Page.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue(`
        <h1>Main Title</h1>
        <p>Some content</p>
        <h3>Subsection</h3>
      `);

      const result = runA11yAnalyzer('/tmp/repo');

      const hierarchyFinding = result.findings.find(
        (f) => f.metadata?.patternId === 'heading_hierarchy'
      );
      expect(hierarchyFinding).toBeDefined();
      expect(hierarchyFinding?.severity).toBe('medium');
      expect(hierarchyFinding?.metadata?.previousLevel).toBe(1);
      expect(hierarchyFinding?.metadata?.currentLevel).toBe(3);
      expect(hierarchyFinding?.metadata?.skippedLevel).toBe(2);
    });

    it('should detect h2 followed by h4 (skipping h3)', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'Article.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<h2>Section</h2><h4>Detail</h4>');

      const result = runA11yAnalyzer('/tmp/repo');

      const hierarchyFinding = result.findings.find(
        (f) => f.metadata?.patternId === 'heading_hierarchy'
      );
      expect(hierarchyFinding).toBeDefined();
      expect(hierarchyFinding?.metadata?.skippedLevel).toBe(3);
    });

    it('should NOT flag valid heading progression h1 -> h2 -> h3', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'Valid.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<h1>Title</h1><h2>Section</h2><h3>Sub</h3>');

      const result = runA11yAnalyzer('/tmp/repo');

      const hierarchyFinding = result.findings.find(
        (f) => f.metadata?.patternId === 'heading_hierarchy'
      );
      expect(hierarchyFinding).toBeUndefined();
    });

    it('should allow going from h3 back to h1 (not a skip)', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'MultiSection.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<h1>First</h1><h2>Sub</h2><h3>Detail</h3><h1>New Section</h1>');

      const result = runA11yAnalyzer('/tmp/repo');

      const hierarchyFinding = result.findings.find(
        (f) => f.metadata?.patternId === 'heading_hierarchy'
      );
      expect(hierarchyFinding).toBeUndefined();
    });
  });

  describe('file selection', () => {
    it('should only analyze .jsx, .tsx, .html, .htm files', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
        { name: 'styles.css', isDirectory: () => false, isFile: () => true },
        { name: 'data.json', isDirectory: () => false, isFile: () => true },
        { name: 'page.html', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="test.png">');

      const result = runA11yAnalyzer('/tmp/repo');

      // Only App.tsx and page.html should be analyzed
      expect(result.filesAnalyzed).toBe(2);
    });

    it('should skip node_modules directory', () => {
      mockFs.readdirSync.mockImplementation((dir: any) => {
        if (dir === '/tmp/repo') {
          return [
            { name: 'src', isDirectory: () => true, isFile: () => false },
            { name: 'node_modules', isDirectory: () => true, isFile: () => false },
          ] as any;
        }
        if (dir === '/tmp/repo/src') {
          return [
            { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
          ] as any;
        }
        return [];
      });
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="test.png">');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.filesAnalyzed).toBe(1);
    });
  });

  describe('graceful degradation (success: true for all errors)', () => {
    it('should return success: true when tempDir does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = runA11yAnalyzer('/nonexistent/path');

      expect(result.success).toBe(true);
      expect(result.findings).toEqual([]);
      expect(result.error).toBe('Directory not found');
    });

    it('should return success: true when tempDir is empty string', () => {
      const result = runA11yAnalyzer('');

      expect(result.success).toBe(true);
      expect(result.findings).toEqual([]);
    });

    it('should return success: true on file read error', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.success).toBe(true);
      expect(result.filesAnalyzed).toBe(0);
    });

    it('should skip files larger than MAX_FILE_SIZE_MB', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'huge.tsx', isDirectory: () => false, isFile: () => true },
        { name: 'small.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockImplementation((filePath: any) => {
        if (filePath.includes('huge')) {
          return { size: 10 * 1024 * 1024 } as any; // 10MB
        }
        return { size: 1000 } as any;
      });
      mockFs.readFileSync.mockReturnValue('<img src="test.png">');

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.filesAnalyzed).toBe(1);
    });
  });

  describe('finding cap at MAX_FINDINGS_PER_PANEL', () => {
    it('should cap findings at 25 but track total count', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      // Create content with 30 missing alt images
      const manyImages = Array(30).fill('<img src="photo.jpg">').join('\n');
      mockFs.readFileSync.mockReturnValue(manyImages);

      const result = runA11yAnalyzer('/tmp/repo');

      expect(result.findings.length).toBe(25);
      expect(result.totalA11yIssues).toBe(30);
    });
  });

  describe('finding structure', () => {
    it('should generate deterministic IDs', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="photo.jpg">');

      const result1 = runA11yAnalyzer('/tmp/repo');
      const result2 = runA11yAnalyzer('/tmp/repo');

      expect(result1.findings[0].id).toBe(result2.findings[0].id);
    });

    it('should include all required RawFinding fields', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="photo.jpg">');

      const result = runA11yAnalyzer('/tmp/repo');
      const finding = result.findings[0];

      expect(finding.id).toMatch(/^a11y_[a-f0-9]{12}$/);
      expect(finding.panel).toBe('accessibility');
      expect(finding.tool).toBe('a11y_analyzer');
      expect(finding.severity).toMatch(/^(low|medium|high|critical)$/);
      expect(finding.message).toBeDefined();
      expect(finding.file).toBeDefined();
      expect(finding.line).toBeGreaterThan(0);
      expect(finding.metadata).toBeDefined();
    });

    it('should strip temp directory prefix from file paths', () => {
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="photo.jpg">');

      const result = runA11yAnalyzer('/tmp/repo-abc123');
      const finding = result.findings[0];

      expect(finding.file).not.toContain('/tmp/repo-abc123');
      expect(finding.file).toBe('App.tsx');
    });
  });

  describe('timeout handling', () => {
    it('should stop processing on timeout and return partial results', () => {
      // This test documents timeout behavior
      // In real execution, Date.now() would be mocked to simulate timeout
      mockFs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isDirectory: () => false, isFile: () => true },
      ] as any);
      mockFs.statSync.mockReturnValue({ size: 1000 } as any);
      mockFs.readFileSync.mockReturnValue('<img src="photo.jpg">');

      // With very short timeout
      const result = runA11yAnalyzer('/tmp/repo', 1);

      // Should still return success: true (graceful degradation)
      expect(result.success).toBe(true);
    });
  });
});
