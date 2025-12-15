// Lumen Clew - Type Definitions
// Matches BACKEND_INTEGRATION_SPEC exactly

// Raw finding from a tool (before LLM translation)
export interface RawFinding {
  id: string;
  panel: 'code_quality' | 'dependencies' | 'secrets' | 'accessibility';
  tool: 'eslint' | 'npm_audit' | 'secrets_regex' | 'a11y_analyzer';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  metadata?: Record<string, unknown>;
}

// Translated finding (after LLM)
export interface TranslatedFinding {
  id: string;
  panel: 'code_quality' | 'dependencies' | 'secrets' | 'accessibility';
  plainLanguage: string;
  context: string;
  commonApproaches?: string[];
  importance: 'fyi' | 'note' | 'explore' | 'important';
  reflection: string;
  staticAnalysisNote?: string;
}

// Panel result
export interface PanelResult {
  panel: 'code_quality' | 'dependencies' | 'secrets' | 'accessibility';
  status: 'success' | 'partial' | 'skipped';
  findingCount: number;
  findings: TranslatedFinding[];
  statusReason?: 'timeout' | 'tool_error' | 'missing_manifest' | 'translation_error' | 'file_cap_hit';
  errorMessage?: string;
}

// Scan scope
export interface ScanScope {
  maxFilesAllowed: number;
  maxFileSizeMb: number;
  ignoredDirectories: string[];
  filesCounted: number;
  filesScanned: number;
  filesSkipped: number;
}

// Complete report
export interface ScanReport {
  id: string;
  repoUrl: string;
  scanMode: 'fast' | 'full';
  status: 'success' | 'partial' | 'error';
  partialReasons?: string[];
  scanScope: ScanScope;
  panels: {
    codeQuality: PanelResult;
    dependencies: PanelResult;
    secrets: PanelResult;
    accessibility: PanelResult;
  };
  orientationNote: string;
  clonedAt: string;
  scanDuration: number;
}

// Rate limit state
export interface RateLimitState {
  scansToday: number;
  maxScansPerDay: number;
  resetTime: string;
  remaining: number;
  canScan: boolean;
}

// API response envelope
export interface ApiScanResponse {
  status: 'success' | 'partial' | 'error';
  report?: ScanReport;
  error?: {
    code: 'INVALID_GITHUB_URL' | 'RATE_LIMIT_EXCEEDED' | 'REPO_NOT_FOUND' | 'CLONE_TIMEOUT' | string;
    message: string;
  };
  rateLimit: RateLimitState;
}
