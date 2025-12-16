// @ts-nocheck
// BACKEND: copy to Render repo/server.js
// This file fetches repository files from GitHub API
// Runs only on Node.js backend (Render), not in browser

import * as fs from 'fs';
import * as path from 'path';
import { CONFIG } from '../lib/config';

// Inline Node.js-compatible logger (no Vite dependencies)
const logger = {
  debug: (msg: string, data?: unknown) => process.env.DEBUG && console.debug(`[GitHubFetcher] ${msg}`, data ?? ''),
  info: (msg: string, data?: unknown) => console.info(`[GitHubFetcher] ${msg}`, data ?? ''),
  warn: (msg: string, data?: unknown) => console.warn(`[GitHubFetcher] ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[GitHubFetcher] ${msg}`, data ?? ''),
  time: (label: string) => {
    const start = Date.now();
    return () => console.debug(`[GitHubFetcher] ${label}: ${Date.now() - start}ms`);
  },
};

// BACKEND: FetchResult interface - return type for fetchGitHubRepo
export interface FetchResult {
  success: boolean;
  tempDir?: string;
  fileCount?: number;
  filesScanned?: number;
  filesSkipped?: number;
  error?: string;
}

// Internal interface for GitHub API tree response
interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
}

// URL parsing regex
const GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/?$/;

/**
 * BACKEND: Check if a file path is allowed based on CONFIG settings
 */
function isAllowedFile(filePath: string): boolean {
  // Check against ignored directories
  for (const ignored of CONFIG.FILES_TO_IGNORE) {
    if (filePath.startsWith(ignored) || filePath.includes(`/${ignored}`)) {
      return false;
    }
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  return CONFIG.ALLOWED_FILE_TYPES.includes(ext);
}

/**
 * BACKEND: Download a single file from raw.githubusercontent.com
 */
async function downloadFile(
  owner: string,
  repo: string,
  filePath: string,
  targetDir: string
): Promise<boolean> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filePath}`;
  const targetPath = path.join(targetDir, filePath);

  try {
    // Create parent directories
    const parentDir = path.dirname(targetPath);
    fs.mkdirSync(parentDir, { recursive: true });

    // Download file with timeout
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout per file
    });

    if (!response.ok) {
      logger.warn(`Failed to download ${filePath}: ${response.status}`);
      return false;
    }

    const content = await response.text();
    fs.writeFileSync(targetPath, content, 'utf-8');
    return true;
  } catch (error) {
    logger.warn(`Error downloading ${filePath}:`, error);
    return false;
  }
}

/**
 * BACKEND: Clean up temporary directory
 */
export function cleanupDir(tempDir: string): void {
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      logger.debug(`Cleaned up temp directory: ${tempDir}`);
    }
  } catch (error) {
    logger.warn(`Failed to cleanup temp directory ${tempDir}:`, error);
  }
}

/**
 * BACKEND: Main function to fetch repository files from GitHub API
 * @param repoUrl - GitHub repository URL (https://github.com/owner/repo)
 * @param scanMode - 'fast' (max 300 files) or 'full' (unlimited)
 * @returns FetchResult with tempDir path and metrics
 */
export async function fetchGitHubRepo(
  repoUrl: string,
  scanMode: 'fast' | 'full' = 'fast'
): Promise<FetchResult> {
  const endTimer = logger.time('fetchGitHubRepo');

  // 1. Parse GitHub URL to extract owner/repo
  const match = repoUrl.match(GITHUB_URL_REGEX);
  if (!match) {
    return {
      success: false,
      error: 'Invalid GitHub URL format',
    };
  }

  const [, owner, repo] = match;
  logger.info(`Fetching repository: ${owner}/${repo} (mode: ${scanMode})`);

  // 2. Create temp directory
  const tempDir = `/tmp/lumen-${Date.now()}`;
  try {
    fs.mkdirSync(tempDir, { recursive: true });
  } catch (error) {
    return {
      success: false,
      error: `Failed to create temp directory: ${error}`,
    };
  }

  // 3. Fetch file tree from GitHub API
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  let treeData: GitHubTreeResponse;

  try {
    const response = await fetch(treeUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'LumenClew/1.0',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout for tree
    });

    if (response.status === 404) {
      cleanupDir(tempDir);
      return {
        success: false,
        error: 'Repository not found (404)',
      };
    }

    if (!response.ok) {
      cleanupDir(tempDir);
      return {
        success: false,
        error: `GitHub API error: ${response.status} ${response.statusText}`,
      };
    }

    treeData = await response.json();
  } catch (error) {
    cleanupDir(tempDir);
    if (error instanceof Error && error.name === 'TimeoutError') {
      return {
        success: false,
        error: 'GitHub API request timed out',
      };
    }
    return {
      success: false,
      error: `Failed to fetch repository tree: ${error}`,
    };
  }

  // 4. Filter and count files
  const maxFiles = scanMode === 'fast' 
    ? CONFIG.FAST_SCAN.maxFiles 
    : CONFIG.FULL_SCAN.maxFiles;
  const maxFileSizeBytes = CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;

  const allFiles = treeData.tree.filter((item) => item.type === 'blob');
  const allowedFiles = allFiles.filter((item) => isAllowedFile(item.path));
  const sizedFiles = allowedFiles.filter(
    (item) => !item.size || item.size <= maxFileSizeBytes
  );

  // Limit files based on scan mode
  const filesToDownload = sizedFiles.slice(0, maxFiles);

  logger.info(`Files: ${allFiles.length} total, ${allowedFiles.length} allowed, ${filesToDownload.length} to download`);

  // 5. Download files in parallel batches for speed
  let filesScanned = 0;
  let filesSkipped = 0;

  const BATCH_SIZE = CONFIG.DOWNLOAD_BATCH_SIZE || 10;
  const totalBatches = Math.ceil(filesToDownload.length / BATCH_SIZE);

  for (let i = 0; i < filesToDownload.length; i += BATCH_SIZE) {
    const batch = filesToDownload.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.all(
      batch.map(file => downloadFile(owner, repo, file.path, tempDir))
    );
    
    results.forEach(success => {
      if (success) {
        filesScanned++;
      } else {
        filesSkipped++;
      }
    });
    
    logger.debug(`Downloaded batch ${Math.floor(i / BATCH_SIZE) + 1}/${totalBatches}`);
  }

  // Calculate files skipped due to filters
  const totalSkipped = allFiles.length - filesScanned;

  endTimer();

  logger.info(`Fetch complete: ${filesScanned} scanned, ${totalSkipped} skipped`);

  return {
    success: true,
    tempDir,
    fileCount: allFiles.length,
    filesScanned,
    filesSkipped: totalSkipped,
  };
}
