// @ts-nocheck
// BACKEND: copy to Render repo/__tests__/claudeTranslator.test.js

/**
 * Claude Translator Tests
 * 
 * These tests document the expected behavior of the Claude translation layer.
 * Run with: npm test -- claudeTranslator.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mapSeverityToImportance, translatePanel, translateAllPanels } from '../claudeTranslator';
import type { RawFinding } from '../../lib/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment
const originalEnv = process.env;

beforeEach(() => {
  vi.resetAllMocks();
  process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-api-key' };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('claudeTranslator', () => {
  describe('severity mapping', () => {
    it('maps critical → important', () => {
      expect(mapSeverityToImportance('critical')).toBe('important');
    });

    it('maps high → explore', () => {
      expect(mapSeverityToImportance('high')).toBe('explore');
    });

    it('maps medium → note', () => {
      expect(mapSeverityToImportance('medium')).toBe('note');
    });

    it('maps low → fyi', () => {
      expect(mapSeverityToImportance('low')).toBe('fyi');
    });
  });

  describe('successful translation', () => {
    const mockRawFinding: RawFinding = {
      id: 'test-1',
      panel: 'code_quality',
      tool: 'eslint',
      severity: 'medium',
      message: 'Unexpected console statement',
      file: 'src/App.tsx',
      line: 10,
    };

    it('translates code_quality findings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{
            text: JSON.stringify([{
              plainLanguage: 'Console statements were found in your code.',
              context: 'Console statements are typically used for debugging.',
              importance: 'note',
              reflection: 'Is this console statement needed in production?',
              commonApproaches: ['Remove before deploying', 'Use a logging library'],
            }]),
          }],
        }),
      });

      const result = await translatePanel('code_quality', [mockRawFinding]);

      expect(result.status).toBe('success');
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].plainLanguage).toContain('Console');
      expect(result.translatedCount).toBe(1);
    });

    it('handles empty findings array', async () => {
      const result = await translatePanel('code_quality', []);

      expect(result.status).toBe('success');
      expect(result.findings).toHaveLength(0);
      expect(result.originalCount).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('caps findings by severity', async () => {
      // Create 30 findings (exceeds 25 cap)
      const findings: RawFinding[] = Array.from({ length: 30 }, (_, i) => ({
        id: `finding-${i}`,
        panel: 'code_quality' as const,
        tool: 'eslint' as const,
        severity: i < 5 ? 'critical' : i < 15 ? 'high' : 'low',
        message: `Finding ${i}`,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{
            text: JSON.stringify(Array.from({ length: 25 }, (_, i) => ({
              plainLanguage: `Translated finding ${i}`,
              context: 'Context',
              importance: 'note',
              reflection: 'Reflection',
            }))),
          }],
        }),
      });

      const result = await translatePanel('code_quality', findings);

      expect(result.truncated).toBe(true);
      expect(result.originalCount).toBe(30);
      expect(result.findings).toHaveLength(25);
    });
  });

  describe('error handling', () => {
    const mockFinding: RawFinding = {
      id: 'test-1',
      panel: 'dependencies',
      tool: 'npm_audit',
      severity: 'high',
      message: 'Vulnerable package detected',
    };

    it('handles Claude API timeout', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 100);
        })
      );

      const result = await translatePanel('dependencies', [mockFinding]);

      expect(result.status).toBe('failed');
      expect(result.statusReason).toBe('CLAUDE_TIMEOUT');
      expect(result.findings[0].staticAnalysisNote).toContain('CLAUDE_TIMEOUT');
    });

    it('handles invalid JSON from Claude', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'This is not valid JSON at all!' }],
        }),
      });

      const result = await translatePanel('dependencies', [mockFinding]);

      // Should return partial/failed with fallback
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].staticAnalysisNote).toBeDefined();
    });

    it('handles missing API key', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const result = await translatePanel('dependencies', [mockFinding]);

      expect(result.status).toBe('failed');
      expect(result.statusReason).toBe('MISSING_API_KEY');
      expect(result.findings[0].staticAnalysisNote).toContain('MISSING_API_KEY');
    });

    it('handles partial Claude response', async () => {
      const findings: RawFinding[] = [
        { id: '1', panel: 'code_quality', tool: 'eslint', severity: 'medium', message: 'Finding 1' },
        { id: '2', panel: 'code_quality', tool: 'eslint', severity: 'low', message: 'Finding 2' },
      ];

      // Only return translation for first finding
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{
            text: JSON.stringify([{
              plainLanguage: 'Translated finding 1',
              context: 'Context 1',
              importance: 'note',
              reflection: 'Reflection 1',
            }]),
          }],
        }),
      });

      const result = await translatePanel('code_quality', findings);

      expect(result.status).toBe('partial');
      expect(result.findings).toHaveLength(2);
      expect(result.findings[1].staticAnalysisNote).toContain('Partial translation');
    });
  });

  describe('API integration', () => {
    const mockFinding: RawFinding = {
      id: 'test-1',
      panel: 'secrets',
      tool: 'secrets_regex',
      severity: 'critical',
      message: 'Potential API key detected',
    };

    it('uses correct Anthropic API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '[]' }],
        }),
      });

      await translatePanel('secrets', [mockFinding]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.any(Object)
      );
    });

    it('includes correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '[]' }],
        }),
      });

      await translatePanel('secrets', [mockFinding]);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['x-api-key']).toBe('test-api-key');
      expect(options.headers['anthropic-version']).toBe('2023-06-01');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('uses CONFIG.CLAUDE_MODEL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '[]' }],
        }),
      });

      await translatePanel('secrets', [mockFinding]);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.model).toBe('claude-sonnet-4-5-20250929');
    });

    it('respects CONFIG.CLAUDE_MAX_TOKENS', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '[]' }],
        }),
      });

      await translatePanel('secrets', [mockFinding]);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.max_tokens).toBe(1000);
    });
  });

  describe('schema validation', () => {
    const mockFinding: RawFinding = {
      id: 'validate-1',
      panel: 'accessibility',
      tool: 'a11y_analyzer',
      severity: 'medium',
      message: 'Missing alt text',
      file: 'src/components/Image.tsx',
    };

    it('validates required fields', async () => {
      // Response missing required fields
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{
            text: JSON.stringify([{
              plainLanguage: 'Valid language',
              // Missing context and reflection
            }]),
          }],
        }),
      });

      const result = await translatePanel('accessibility', [mockFinding]);

      // Should fall back due to invalid response
      expect(result.findings[0].staticAnalysisNote).toBeDefined();
    });

    it('trims long strings', async () => {
      const longString = 'A'.repeat(600);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{
            text: JSON.stringify([{
              plainLanguage: longString,
              context: 'Normal context',
              importance: 'note',
              reflection: 'Normal reflection',
            }]),
          }],
        }),
      });

      const result = await translatePanel('accessibility', [mockFinding]);

      expect(result.findings[0].plainLanguage.length).toBeLessThanOrEqual(503); // 500 + '...'
    });

    it('preserves original finding IDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{
            text: JSON.stringify([{
              plainLanguage: 'Translated',
              context: 'Context',
              importance: 'note',
              reflection: 'Reflection',
            }]),
          }],
        }),
      });

      const result = await translatePanel('accessibility', [mockFinding]);

      expect(result.findings[0].id).toBe('validate-1');
    });
  });

  describe('fallback behavior', () => {
    const mockFinding: RawFinding = {
      id: 'fallback-1',
      panel: 'code_quality',
      tool: 'eslint',
      severity: 'high',
      message: 'Original eslint message',
      file: 'src/utils.ts',
    };

    it('returns sensible fallback on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const result = await translatePanel('code_quality', [mockFinding]);

      expect(result.status).toBe('failed');
      expect(result.findings[0].plainLanguage).toBe('Original eslint message');
      expect(result.findings[0].context).toContain('src/utils.ts');
    });

    it('marks fallback with staticAnalysisNote', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limited'),
      });

      const result = await translatePanel('code_quality', [mockFinding]);

      expect(result.findings[0].staticAnalysisNote).toContain('CLAUDE_API_ERROR');
      expect(result.findings[0].staticAnalysisNote).toContain('Showing original finding');
    });
  });

  describe('panel-specific prompts', () => {
    // These tests verify the prompt content indirectly through the API call

    it('code_quality prompt includes maintainability context', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [{ text: '[]' }] }),
      });

      await translatePanel('code_quality', [{
        id: '1', panel: 'code_quality', tool: 'eslint', severity: 'low', message: 'Test'
      }]);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.system).toContain('maintainability');
    });

    it('dependencies prompt normalizes vulnerability handling', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [{ text: '[]' }] }),
      });

      await translatePanel('dependencies', [{
        id: '1', panel: 'dependencies', tool: 'npm_audit', severity: 'high', message: 'Test'
      }]);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.system).toContain('vulnerabilities');
      expect(body.system).toContain('prioritization');
    });

    it('secrets prompt removes shame', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [{ text: '[]' }] }),
      });

      await translatePanel('secrets', [{
        id: '1', panel: 'secrets', tool: 'secrets_regex', severity: 'critical', message: 'Test'
      }]);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.system).toContain('Remove any shame');
      expect(body.system).toContain('false positives');
    });

    it('accessibility prompt adds Lighthouse note', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [{ text: '[]' }] }),
      });

      await translatePanel('accessibility', [{
        id: '1', panel: 'accessibility', tool: 'a11y_analyzer', severity: 'medium', message: 'Test'
      }]);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.system).toContain('automated tools catch ~30%');
      expect(body.system).toContain('manual testing');
    });
  });

  describe('translateAllPanels', () => {
    it('translates all 4 panels in parallel', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '[]' }],
        }),
      });

      const panelsMap = new Map([
        ['code_quality', [{ id: '1', panel: 'code_quality', tool: 'eslint', severity: 'low', message: 'Test' }]],
        ['dependencies', []],
        ['secrets', []],
        ['accessibility', []],
      ] as const);

      const results = await translateAllPanels(panelsMap as Map<any, any>);

      expect(results.size).toBe(4);
      expect(results.has('code_quality')).toBe(true);
      expect(results.has('dependencies')).toBe(true);
      expect(results.has('secrets')).toBe(true);
      expect(results.has('accessibility')).toBe(true);
    });
  });
});
