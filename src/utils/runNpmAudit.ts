// @ts-nocheck
// BACKEND: copy to Render repo/server.js
// This file runs npm audit on repository files and normalizes output
// Receives tempDir from Prompt 3 (fetchGitHubRepo)

import { execSync } from 'child_process';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { CONFIG } from '../lib/config';
import { logger } from '../lib/logger';
import { RawFinding } from '../lib/types';

// BACKEND: NpmAuditResult interface
export interface NpmAuditResult {
  success: boolean;
  findings: RawFinding[];
  vulnerabilityCount?: number;
  error?: string;
}

// Internal: Generate deterministic finding ID
function generateFindingId(packageName: string, severity: string, via: string): string {
  const input = `dependencies:npm_audit:${packageName}:${severity}:${via}`;
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}

// Internal: Map npm severity to Lumen severity
function mapSeverity(npmSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (npmSeverity.toLowerCase()) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'moderate':
      return 'medium';
    case 'low':
    case 'info':
    default:
      return 'low';
  }
}

// BACKEND: Main npm audit runner function
export function runNpmAudit(tempDir: string, timeoutMs?: number): NpmAuditResult {
  const timeout = timeoutMs ?? CONFIG.FAST_SCAN.npmAuditTimeoutMs;
  const startTime = Date.now();

  // Check if package.json exists - graceful skip if missing
  const packageJsonPath = path.join(tempDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logger.info('runNpmAudit: No package.json found, skipping');
    return {
      success: true,
      findings: [],
      vulnerabilityCount: 0,
    };
  }

  try {
    let stdout: string;

    try {
      // npm audit exits with code 1 when vulnerabilities found
      // We need to capture stdout even on non-zero exit
      stdout = execSync(`cd "${tempDir}" && npm audit --json`, {
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (execError: any) {
      // npm audit returns exit code 1 when vulnerabilities exist
      // stdout still contains valid JSON
      if (execError.stdout) {
        stdout = execError.stdout;
      } else if (execError.killed || execError.signal === 'SIGTERM') {
        logger.error('runNpmAudit: Timeout exceeded');
        return {
          success: true,
          findings: [],
          error: 'npm audit timeout exceeded',
        };
      } else {
        logger.error('runNpmAudit: Execution error', execError.message);
        return {
          success: true,
          findings: [],
          error: `npm audit failed: ${execError.message}`,
        };
      }
    }

    // Parse JSON output
    let auditData: any;
    try {
      auditData = JSON.parse(stdout);
    } catch (parseError) {
      logger.error('runNpmAudit: Failed to parse npm audit JSON');
      return {
        success: true,
        findings: [],
        error: 'Failed to parse npm audit output',
      };
    }

    // Extract vulnerabilities from npm audit output
    const vulnerabilities = auditData.vulnerabilities || {};
    const findings: RawFinding[] = [];
    let totalCount = 0;

    for (const [packageName, vuln] of Object.entries(vulnerabilities)) {
      const vulnData = vuln as any;
      totalCount++;

      // Skip if we've hit the cap
      if (findings.length >= CONFIG.MAX_FINDINGS_PER_PANEL) {
        continue;
      }

      // Get via info (what vulnerability affects this package)
      const viaInfo = Array.isArray(vulnData.via)
        ? vulnData.via.map((v: any) => (typeof v === 'string' ? v : v.title || v.name || 'unknown')).join(', ')
        : String(vulnData.via || 'unknown');

      const severity = mapSeverity(vulnData.severity || 'low');

      const finding: RawFinding = {
        id: generateFindingId(packageName, vulnData.severity || 'low', viaInfo),
        panel: 'dependencies',
        tool: 'npm_audit',
        severity,
        message: `${packageName}: ${viaInfo}`,
        file: 'package.json',
        line: 1,
        column: 0,
        metadata: {
          packageName,
          vulnerability: viaInfo,
          npmSeverity: vulnData.severity || 'unknown',
          range: vulnData.range || '*',
          fixAvailable: vulnData.fixAvailable || false,
        },
      };

      findings.push(finding);
    }

    const duration = Date.now() - startTime;
    logger.info(`runNpmAudit: Completed in ${duration}ms, found ${totalCount} vulnerabilities (returning ${findings.length})`);

    return {
      success: true,
      findings,
      vulnerabilityCount: totalCount,
    };
  } catch (error: any) {
    logger.error('runNpmAudit: Unexpected error', error.message);
    return {
      success: true,
      findings: [],
      error: `Unexpected error: ${error.message}`,
    };
  }
}
