// BACKEND: copy to Render repo/server.js
// This file scans repository files for hardcoded secrets and credentials
// Receives tempDir from Prompt 3 (fetchGitHubRepo)

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { CONFIG } from '../lib/config';
import { RawFinding } from '../lib/types';

// Inline Node.js-compatible logger (no Vite dependencies)
const logger = {
  debug: (msg: string, data?: unknown) => process.env.DEBUG && console.debug(`[Secrets] ${msg}`, data ?? ''),
  info: (msg: string, data?: unknown) => console.info(`[Secrets] ${msg}`, data ?? ''),
  warn: (msg: string, data?: unknown) => console.warn(`[Secrets] ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[Secrets] ${msg}`, data ?? ''),
};

// BACKEND: SecretsResult interface
export interface SecretsResult {
  success: boolean;
  findings: RawFinding[];
  filesScanned?: number;
  secretsFound?: number;
  error?: string;
}

// Secret pattern definitions
interface SecretPattern {
  id: string;
  name: string;
  regex: RegExp;
  baseSeverity: 'low' | 'medium' | 'high' | 'critical';
}

// 8 secret patterns to detect
const SECRET_PATTERNS: SecretPattern[] = [
  {
    id: 'private_key',
    name: 'Private Key',
    regex: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/,
    baseSeverity: 'critical',
  },
  {
    id: 'aws_key',
    name: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/,
    baseSeverity: 'critical',
  },
  {
    id: 'db_connection_mongo',
    name: 'MongoDB Connection String',
    regex: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/,
    baseSeverity: 'high',
  },
  {
    id: 'db_connection_postgres',
    name: 'PostgreSQL Connection String',
    regex: /postgres(ql)?:\/\/[^:]+:[^@]+@/,
    baseSeverity: 'high',
  },
  {
    id: 'db_connection_mysql',
    name: 'MySQL Connection String',
    regex: /mysql:\/\/[^:]+:[^@]+@/,
    baseSeverity: 'high',
  },
  {
    id: 'api_key_generic',
    name: 'Generic API Key',
    regex: /['"]?api[_-]?key['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i,
    baseSeverity: 'high',
  },
  {
    id: 'bearer_token',
    name: 'Bearer Token',
    regex: /['"]?Bearer\s+[a-zA-Z0-9_\-\.]{20,}['"]?/,
    baseSeverity: 'high',
  },
  {
    id: 'token_generic',
    name: 'Generic Token',
    regex: /['"]?token['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i,
    baseSeverity: 'medium',
  },
];

// Internal: Generate deterministic finding ID
function generateFindingId(patternId: string, file: string, line: number): string {
  const input = `secrets:secrets_regex:${patternId}:${file}:${line}`;
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}

// Internal: Determine severity based on context
function determineSeverity(
  pattern: SecretPattern,
  filePath: string
): 'low' | 'medium' | 'high' | 'critical' {
  const fileName = path.basename(filePath).toLowerCase();
  
  // .env.example files get low severity (likely placeholder values)
  if (fileName.includes('.example') || fileName.includes('.sample') || fileName.includes('.template')) {
    return 'low';
  }
  
  // .env files get critical severity (real credentials)
  if (fileName === '.env' || fileName.startsWith('.env.')) {
    return 'critical';
  }
  
  // Test files get medium severity (might be test credentials)
  if (filePath.includes('test') || filePath.includes('spec') || filePath.includes('__tests__')) {
    return 'medium';
  }
  
  return pattern.baseSeverity;
}

// Internal: Check if file should be scanned
function shouldScanFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  // Check against FILES_TO_IGNORE
  for (const ignore of CONFIG.FILES_TO_IGNORE) {
    if (filePath.includes(ignore)) {
      return false;
    }
  }
  
  // Always scan .env files regardless of extension
  if (fileName.startsWith('.env')) {
    return true;
  }
  
  // Check against ALLOWED_FILE_TYPES
  if (ext && !(CONFIG.ALLOWED_FILE_TYPES as readonly string[]).includes(ext)) {
    return false;
  }
  
  return true;
}

// Internal: Scan a single file for secrets
function scanFileForSecrets(
  tempDir: string,
  filePath: string,
  findings: RawFinding[]
): number {
  const relativePath = filePath.replace(tempDir, '').replace(/^\//, '');
  let secretsFound = 0;
  
  try {
    // Check file size
    const stats = fs.statSync(filePath);
    if (stats.size > CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
      logger.debug(`Skipping large file: ${relativePath}`);
      return 0;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          secretsFound++;
          
          // Respect finding cap
          if (findings.length >= CONFIG.MAX_FINDINGS_PER_PANEL) {
            continue;
          }
          
          const severity = determineSeverity(pattern, filePath);
          
          const finding: RawFinding = {
            id: generateFindingId(pattern.id, relativePath, lineNum + 1),
            panel: 'secrets',
            tool: 'secrets_regex',
            severity,
            message: `Possible ${pattern.name} detected`,
            file: relativePath,
            line: lineNum + 1,
            column: 0,
            metadata: {
              patternId: pattern.id,
              patternName: pattern.name,
              baseSeverity: pattern.baseSeverity,
              contextSeverity: severity,
            },
          };
          
          findings.push(finding);
        }
      }
    }
  } catch (readError: any) {
    logger.debug(`Error reading file ${relativePath}: ${readError.message}`);
  }
  
  return secretsFound;
}

// Internal: Recursively walk directory with timeout check
function walkDirectory(
  dir: string,
  tempDir: string,
  findings: RawFinding[],
  startTime: number,
  timeoutMs: number
): { filesScanned: number; secretsFound: number; timedOut: boolean } {
  let filesScanned = 0;
  let secretsFound = 0;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Check timeout before processing each entry
      if (Date.now() - startTime > timeoutMs) {
        return { filesScanned, secretsFound, timedOut: true };
      }
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip ignored directories
        if ((CONFIG.FILES_TO_IGNORE as readonly string[]).includes(entry.name)) {
          continue;
        }
        
        // Recurse into subdirectory
        const subResult = walkDirectory(fullPath, tempDir, findings, startTime, timeoutMs);
        filesScanned += subResult.filesScanned;
        secretsFound += subResult.secretsFound;
        
        if (subResult.timedOut) {
          return { filesScanned, secretsFound, timedOut: true };
        }
      } else if (entry.isFile()) {
        if (shouldScanFile(fullPath)) {
          filesScanned++;
          secretsFound += scanFileForSecrets(tempDir, fullPath, findings);
        }
      }
    }
  } catch (readDirError: any) {
    logger.debug(`Error reading directory ${dir}: ${readDirError.message}`);
  }
  
  return { filesScanned, secretsFound, timedOut: false };
}

// BACKEND: Main secrets scanner function
export function runSecretsScanner(
  tempDir: string,
  timeoutMs: number = CONFIG.FAST_SCAN.secretsScanTimeoutMs
): SecretsResult {
  const startTime = Date.now();
  
  logger.info(`runSecretsScanner: Starting scan of ${tempDir}`);
  
  // Validate tempDir exists
  if (!tempDir || !fs.existsSync(tempDir)) {
    logger.error('runSecretsScanner: tempDir does not exist');
    return {
      success: true,
      findings: [],
      error: 'Scan directory does not exist',
    };
  }
  
  try {
    const findings: RawFinding[] = [];
    
    const result = walkDirectory(tempDir, tempDir, findings, startTime, timeoutMs);
    
    if (result.timedOut) {
      logger.warn(`runSecretsScanner: Timeout after scanning ${result.filesScanned} files`);
      return {
        success: true,
        findings,
        filesScanned: result.filesScanned,
        secretsFound: result.secretsFound,
        error: `Secrets scan timeout after ${timeoutMs}ms`,
      };
    }
    
    const duration = Date.now() - startTime;
    logger.info(`runSecretsScanner: Completed in ${duration}ms, scanned ${result.filesScanned} files, found ${result.secretsFound} secrets (returning ${findings.length})`);
    
    return {
      success: true,
      findings,
      filesScanned: result.filesScanned,
      secretsFound: result.secretsFound,
    };
  } catch (error: any) {
    logger.error('runSecretsScanner: Unexpected error', error.message);
    return {
      success: true,
      findings: [],
      error: `Unexpected error: ${error.message}`,
    };
  }
}
