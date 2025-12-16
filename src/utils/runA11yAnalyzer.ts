// @ts-nocheck
// BACKEND: copy to Render repo/server.js
// Analyzes JSX/HTML/TSX files for accessibility code patterns
// Receives tempDir from Prompt 3 (fetchGitHubRepo)
// Static analysis only - no runtime code execution, no LLM

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CONFIG } from '../lib/config';
import { RawFinding } from '../lib/types';

// Inline Node.js-compatible logger (no Vite dependencies)
const logger = {
  debug: (msg: string, data?: unknown) => process.env.DEBUG && console.debug(`[A11y] ${msg}`, data ?? ''),
  info: (msg: string, data?: unknown) => console.info(`[A11y] ${msg}`, data ?? ''),
  warn: (msg: string, data?: unknown) => console.warn(`[A11y] ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[A11y] ${msg}`, data ?? ''),
};

export interface A11yResult {
  success: boolean;
  findings: RawFinding[];
  totalA11yIssues: number;
  filesAnalyzed: number;
  error?: string;
}

interface A11yPattern {
  id: string;
  name: string;
  regex: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

// 8 A11y patterns (heading_hierarchy handled separately via code)
const A11Y_PATTERNS: A11yPattern[] = [
  {
    id: 'missing_alt',
    name: 'Missing Alt Text',
    regex: /<img(?![^>]*\balt\s*=)[^>]*>/gi,
    severity: 'high',
    message: 'Image missing alt attribute for screen readers',
  },
  {
    id: 'non_semantic_button_div',
    name: 'Non-semantic Button (div)',
    regex: /<div[^>]*\bonClick\s*=/gi,
    severity: 'high',
    message: 'Div with onClick should be a button element for keyboard accessibility',
  },
  {
    id: 'non_semantic_button_role',
    name: 'Non-semantic Button (role)',
    regex: /<(?!button)[a-z]+[^>]*role\s*=\s*["']button["'][^>]*>/gi,
    severity: 'high',
    message: 'Element with role="button" should be a native button element',
  },
  {
    id: 'missing_aria_label',
    name: 'Missing ARIA Label',
    regex: /<(button|a|input)[^>]*>(\s*<[^>]+>\s*)*<\/(button|a)>/gi,
    severity: 'medium',
    message: 'Interactive element may need aria-label for screen reader context',
  },
  {
    id: 'link_without_href',
    name: 'Link Without Href',
    regex: /<a(?![^>]*\bhref\s*=)[^>]*>/gi,
    severity: 'medium',
    message: 'Anchor tag missing href attribute - not keyboard navigable',
  },
  {
    id: 'input_without_label',
    name: 'Input Without Label',
    regex: /<input(?![^>]*\b(id|aria-label|aria-labelledby)\s*=)[^>]*>/gi,
    severity: 'medium',
    message: 'Input element missing associated label or aria-label',
  },
  {
    id: 'empty_heading',
    name: 'Empty Heading',
    regex: /<h[1-6][^>]*>\s*<\/h[1-6]>/gi,
    severity: 'low',
    message: 'Empty heading element - provides no content for screen readers',
  },
];

// Allowed file extensions for a11y analysis
const ALLOWED_EXTENSIONS = ['.jsx', '.tsx', '.html', '.htm'];

/**
 * Generate deterministic finding ID using SHA-256
 */
function generateFindingId(patternId: string, filePath: string, line: number): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${patternId}:${filePath}:${line}`)
    .digest('hex');
  return `a11y_${hash.substring(0, 12)}`;
}

/**
 * Check if file should be analyzed based on extension
 */
function shouldAnalyzeFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Get line number for a match position in content
 */
function getLineNumber(content: string, matchIndex: number): number {
  const lines = content.substring(0, matchIndex).split('\n');
  return lines.length;
}

/**
 * Strip temp directory prefix from file path for cleaner output
 */
function stripTempPrefix(filePath: string, tempDir: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const normalizedTemp = tempDir.replace(/\\/g, '/');
  if (normalized.startsWith(normalizedTemp)) {
    return normalized.substring(normalizedTemp.length).replace(/^\//, '');
  }
  return normalized;
}

/**
 * Code-based heading hierarchy detection
 * Detects when heading levels are skipped (e.g., h1 -> h3 without h2)
 */
function detectHeadingHierarchyIssues(
  content: string,
  filePath: string,
  tempDir: string
): RawFinding[] {
  const findings: RawFinding[] = [];
  const headingRegex = /<h([1-6])[^>]*>/gi;
  const headings: { level: number; index: number; line: number }[] = [];

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      index: match.index,
      line: getLineNumber(content, match.index),
    });
  }

  // Check for hierarchy violations
  for (let i = 1; i < headings.length; i++) {
    const current = headings[i];
    const previous = headings[i - 1];

    // If current heading is more than 1 level deeper than previous, it's a skip
    if (current.level > previous.level + 1) {
      const relativePath = stripTempPrefix(filePath, tempDir);
      findings.push({
        id: generateFindingId('heading_hierarchy', relativePath, current.line),
        panel: 'accessibility',
        tool: 'a11y_analyzer',
        severity: 'medium',
        message: `Heading hierarchy skip: h${previous.level} followed by h${current.level} (missing h${previous.level + 1})`,
        file: relativePath,
        line: current.line,
        metadata: {
          patternId: 'heading_hierarchy',
          previousLevel: previous.level,
          currentLevel: current.level,
          skippedLevel: previous.level + 1,
        },
      });
    }
  }

  return findings;
}

/**
 * Scan a single file for a11y issues
 */
function scanFileForA11y(
  filePath: string,
  content: string,
  tempDir: string
): RawFinding[] {
  const findings: RawFinding[] = [];
  const relativePath = stripTempPrefix(filePath, tempDir);

  // Check regex-based patterns
  for (const pattern of A11Y_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.regex.lastIndex = 0;

    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const line = getLineNumber(content, match.index);
      findings.push({
        id: generateFindingId(pattern.id, relativePath, line),
        panel: 'accessibility',
        tool: 'a11y_analyzer',
        severity: pattern.severity,
        message: pattern.message,
        file: relativePath,
        line,
        metadata: {
          patternId: pattern.id,
          patternName: pattern.name,
          matchedText: match[0].substring(0, 100), // Truncate for readability
        },
      });
    }
  }

  // Add heading hierarchy findings (code-based)
  const hierarchyFindings = detectHeadingHierarchyIssues(content, filePath, tempDir);
  findings.push(...hierarchyFindings);

  return findings;
}

/**
 * Recursively walk directory and collect files to analyze
 */
function walkDirectory(
  dir: string,
  startTime: number,
  timeoutMs: number,
  files: string[] = []
): string[] {
  // Check timeout
  if (Date.now() - startTime > timeoutMs) {
    return files;
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Check timeout on each iteration
      if (Date.now() - startTime > timeoutMs) {
        break;
      }

      const fullPath = path.join(dir, entry.name);

      // Skip ignored directories
      const shouldIgnore = CONFIG.FILES_TO_IGNORE.some((ignored) => {
        const normalizedIgnored = ignored.replace(/\/$/, '');
        return entry.name === normalizedIgnored || fullPath.includes(`/${normalizedIgnored}/`);
      });

      if (shouldIgnore) {
        continue;
      }

      if (entry.isDirectory()) {
        walkDirectory(fullPath, startTime, timeoutMs, files);
      } else if (entry.isFile() && shouldAnalyzeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Graceful degradation - continue with files found so far
    logger.warn(`Error reading directory ${dir}:`, error);
  }

  return files;
}

/**
 * Main a11y analyzer function
 * Scans .jsx, .tsx, .html, .htm files for accessibility patterns
 */
export function runA11yAnalyzer(
  tempDir: string,
  timeoutMs: number = CONFIG.FAST_SCAN.a11yTimeoutMs
): A11yResult {
  const startTime = Date.now();

  // Graceful degradation: missing directory
  if (!tempDir || !fs.existsSync(tempDir)) {
    logger.warn('A11y analyzer: tempDir does not exist', { tempDir });
    return {
      success: true,
      findings: [],
      totalA11yIssues: 0,
      filesAnalyzed: 0,
      error: 'Directory not found',
    };
  }

  try {
    // Collect files to analyze
    const files = walkDirectory(tempDir, startTime, timeoutMs);
    const allFindings: RawFinding[] = [];
    let filesAnalyzed = 0;
    let totalA11yIssues = 0;

    for (const filePath of files) {
      // Check timeout
      if (Date.now() - startTime > timeoutMs) {
        logger.info('A11y analyzer: timeout reached', {
          elapsed: Date.now() - startTime,
          filesAnalyzed,
        });
        break;
      }

      try {
        // Check file size
        const stats = fs.statSync(filePath);
        const fileSizeMb = stats.size / (1024 * 1024);

        if (fileSizeMb > CONFIG.MAX_FILE_SIZE_MB) {
          logger.debug(`Skipping large file: ${filePath} (${fileSizeMb.toFixed(2)}MB)`);
          continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const fileFindings = scanFileForA11y(filePath, content, tempDir);

        totalA11yIssues += fileFindings.length;
        filesAnalyzed++;

        // Add findings up to cap
        for (const finding of fileFindings) {
          if (allFindings.length < CONFIG.MAX_FINDINGS_PER_PANEL) {
            allFindings.push(finding);
          }
        }
      } catch (fileError) {
        // Graceful degradation - skip unreadable files
        logger.debug(`Error reading file ${filePath}:`, fileError);
        continue;
      }
    }

    return {
      success: true,
      findings: allFindings,
      totalA11yIssues,
      filesAnalyzed,
    };
  } catch (error) {
    // Graceful degradation for any unexpected error
    logger.error('A11y analyzer unexpected error:', error);
    return {
      success: true,
      findings: [],
      totalA11yIssues: 0,
      filesAnalyzed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
