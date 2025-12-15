// @ts-nocheck
// BACKEND: ESLint Runner Tests
// Documentation for future use (test runner not yet configured)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runESLint } from '../runESLint';
import { CONFIG } from '../../lib/config';

describe('runESLint', () => {
  describe('successful execution', () => {
    it('parses valid ESLint JSON output and returns RawFinding array', () => {
      // Mock: ESLint returns JSON with violations
      // Expect: findings array with normalized RawFinding objects
      // Verify: panel='code_quality', tool='eslint', file paths stripped
    });

    it('returns empty findings array when no violations found', () => {
      // Mock: ESLint returns empty results array
      // Expect: success=true, findings=[], issueCount=0
    });

    it('strips tempDir prefix from file paths', () => {
      // Mock: ESLint returns filePath with full tempDir path
      // Expect: finding.file contains only relative path
    });
  });

  describe('timeout handling', () => {
    it('respects configured timeout from CONFIG.FAST_SCAN.eslintTimeoutMs', () => {
      // Mock: execSync with timeout check
      // Expect: timeout option matches CONFIG value (20000ms)
    });

    it('accepts custom timeout override parameter', () => {
      // Call: runESLint(tempDir, 5000)
      // Expect: uses 5000ms instead of default
    });

    it('returns error result when timeout exceeded', () => {
      // Mock: execSync throws with killed=true
      // Expect: success=false, error contains 'timeout'
    });
  });

  describe('error handling', () => {
    it('handles ESLint exit code 1 (linting errors found) as success', () => {
      // Mock: execSync throws but has stdout
      // Expect: parses stdout normally, returns findings
    });

    it('returns empty array on invalid JSON output', () => {
      // Mock: execSync returns non-JSON string
      // Expect: success=false, findings=[], error about parsing
    });

    it('handles missing ESLint gracefully', () => {
      // Mock: execSync throws command not found
      // Expect: success=false, findings=[], appropriate error
    });
  });

  describe('severity mapping', () => {
    it('maps ESLint severity 2 (error) to high', () => {
      // Mock: ESLint message with severity: 2
      // Expect: finding.severity = 'high'
    });

    it('maps ESLint severity 1 (warning) to low', () => {
      // Mock: ESLint message with severity: 1
      // Expect: finding.severity = 'low'
    });
  });

  describe('finding cap', () => {
    it('respects CONFIG.MAX_FINDINGS_PER_PANEL limit (25)', () => {
      // Mock: ESLint returns 50 violations
      // Expect: findings.length = 25
      // Expect: issueCount = 50 (total reported)
    });

    it('reports total issueCount even when findings are capped', () => {
      // Mock: 100 violations
      // Expect: issueCount=100, findings.length=25
    });
  });

  describe('deterministic IDs', () => {
    it('generates consistent ID for same input', () => {
      // Same panel, tool, ruleId, file, line
      // Expect: identical 16-char hex ID
    });

    it('generates different IDs for different inputs', () => {
      // Different line numbers
      // Expect: different IDs
    });

    it('ID is 16 characters hex string', () => {
      // Any finding
      // Expect: /^[a-f0-9]{16}$/.test(finding.id)
    });
  });

  describe('RawFinding structure', () => {
    it('includes all required fields per types.ts', () => {
      // Expect each finding has: id, panel, tool, severity, message
    });

    it('includes optional file/line/column when present', () => {
      // Expect: file, line, column populated from ESLint
    });

    it('includes metadata with ruleId', () => {
      // Expect: metadata.ruleId matches ESLint ruleId
    });

    it('handles null ruleId gracefully', () => {
      // Mock: ESLint message with ruleId: null
      // Expect: metadata.ruleId = 'unknown'
    });
  });
});

describe('cleanupDir integration', () => {
  it('runESLint works with tempDir from fetchGitHubRepo', () => {
    // Integration test documentation:
    // 1. fetchGitHubRepo returns { tempDir: '/tmp/lumen-123' }
    // 2. runESLint(tempDir) processes files
    // 3. cleanupDir(tempDir) removes temp files
  });
});
