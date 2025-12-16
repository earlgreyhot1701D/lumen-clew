// @ts-nocheck
// BACKEND: copy to Render repo/server.js
// This file runs ESLint on repository files and normalizes output
// Receives tempDir from Prompt 3 (fetchGitHubRepo)

import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { CONFIG } from '../lib/config';
import { RawFinding } from '../lib/types';

// Inline Node.js-compatible logger (no Vite dependencies)
const logger = {
  debug: (msg: string, data?: unknown) => process.env.DEBUG && console.debug(`[ESLint] ${msg}`, data ?? ''),
  info: (msg: string, data?: unknown) => console.info(`[ESLint] ${msg}`, data ?? ''),
  warn: (msg: string, data?: unknown) => console.warn(`[ESLint] ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[ESLint] ${msg}`, data ?? ''),
};

// ESLint JSON output structure
interface ESLintMessage {
  ruleId: string | null;
  severity: 1 | 2;
  message: string;
  line: number;
  column: number;
}

interface ESLintFileResult {
  filePath: string;
  messages: ESLintMessage[];
}

// BACKEND: ESLint runner result interface
export interface ESLintResult {
  success: boolean;
  findings: RawFinding[];
  issueCount?: number;
  error?: string;
}

/**
 * Generates a deterministic finding ID using SHA-256 hash
 * @internal
 */
function generateFindingId(
  panel: string,
  tool: string,
  ruleId: string,
  file: string,
  line: number
): string {
  const input = `${panel}:${tool}:${ruleId}:${file}:${line}`;
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}

/**
 * Maps ESLint severity (1 or 2) to Lumen severity levels
 * @internal
 */
function mapSeverity(eslintSeverity: 1 | 2): 'low' | 'high' {
  return eslintSeverity === 2 ? 'high' : 'low';
}

/**
 * BACKEND: Runs ESLint on a temporary directory and returns normalized findings
 * @param tempDir - Directory containing repository files (from fetchGitHubRepo)
 * @param timeoutMs - Optional timeout override (defaults to CONFIG.FAST_SCAN.eslintTimeoutMs)
 * @returns ESLintResult with success status and RawFinding array
 */
export function runESLint(
  tempDir: string,
  timeoutMs: number = CONFIG.FAST_SCAN.eslintTimeoutMs
): ESLintResult {
  const startTime = Date.now();

  try {
    logger.info(`Running ESLint on ${tempDir}`);

    // Run ESLint with JSON output format
    const command = `npx eslint "${tempDir}" --format=json --ignore-path /dev/null`;
    
    let output: string;
    try {
      output = execSync(command, {
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (execError: any) {
      // ESLint exits with code 1 when there are linting errors
      // We still want to parse the output in that case
      if (execError.stdout) {
        output = execError.stdout;
      } else if (execError.killed) {
        logger.error('ESLint timeout exceeded', { timeoutMs });
        return {
          success: true,
          findings: [],
          error: `ESLint timeout after ${timeoutMs}ms`,
        };
      } else {
        logger.error('ESLint execution failed', { error: execError.message });
        return {
          success: true,
          findings: [],
          error: execError.message,
        };
      }
    }

    // Parse ESLint JSON output
    let eslintResults: ESLintFileResult[];
    try {
      eslintResults = JSON.parse(output);
    } catch (parseError) {
      logger.error('Failed to parse ESLint output', { output: output.substring(0, 200) });
      return {
        success: true,
        findings: [],
        error: 'Failed to parse ESLint JSON output',
      };
    }

    // Normalize findings to RawFinding format
    const findings: RawFinding[] = [];
    let totalIssueCount = 0;

    for (const fileResult of eslintResults) {
      // Strip tempDir prefix from file path for cleaner output
      const relativePath = fileResult.filePath.replace(tempDir, '').replace(/^\//, '');

      for (const msg of fileResult.messages) {
        totalIssueCount++;

        // Respect finding cap
        if (findings.length >= CONFIG.MAX_FINDINGS_PER_PANEL) {
          continue;
        }

        const ruleId = msg.ruleId || 'unknown';
        
        const finding: RawFinding = {
          id: generateFindingId('code_quality', 'eslint', ruleId, relativePath, msg.line),
          panel: 'code_quality',
          tool: 'eslint',
          severity: mapSeverity(msg.severity),
          message: msg.message,
          file: relativePath,
          line: msg.line,
          column: msg.column,
          metadata: { ruleId },
        };

        findings.push(finding);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`ESLint completed in ${duration}ms: ${findings.length} findings (${totalIssueCount} total issues, capped at ${CONFIG.MAX_FINDINGS_PER_PANEL})`);

    return {
      success: true,
      findings,
      issueCount: totalIssueCount,
    };
  } catch (error: any) {
    logger.error('Unexpected error in runESLint', { error: error.message });
    return {
      success: true,
      findings: [],
      error: error.message,
    };
  }
}
