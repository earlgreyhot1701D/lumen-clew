// Lumen Clew - TypeScript Type Definitions
// Shared types used by both frontend and backend

// ─────────────────────────────────────────────────────────────
// Scan Request & Response
// ─────────────────────────────────────────────────────────────

export interface ScanRequest {
  repoUrl: string;
  targetLanguage: string;
}

export interface ScanResponse {
  success: boolean;
  data?: ScanResult;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// Scan Results
// ─────────────────────────────────────────────────────────────

export interface ScanResult {
  repoUrl: string;
  scannedAt: string;
  tools: ToolResults;
  summary: ScanSummary;
}

export interface ToolResults {
  eslint: ESLintResult;
  npmAudit: NpmAuditResult;
  secrets: SecretsResult;
  a11y: A11yResult;
  translation: TranslationResult;
}

export interface ScanSummary {
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

// ─────────────────────────────────────────────────────────────
// ESLint Tool
// ─────────────────────────────────────────────────────────────

export interface ESLintResult {
  success: boolean;
  issues: ESLintIssue[];
  errorCount: number;
  warningCount: number;
}

export interface ESLintIssue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
  ruleId: string | null;
}

// ─────────────────────────────────────────────────────────────
// npm audit Tool
// ─────────────────────────────────────────────────────────────

export interface NpmAuditResult {
  success: boolean;
  vulnerabilities: NpmVulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}

export interface NpmVulnerability {
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  title: string;
  url: string;
  fixAvailable: boolean;
}

// ─────────────────────────────────────────────────────────────
// Secrets Scanner Tool
// ─────────────────────────────────────────────────────────────

export interface SecretsResult {
  success: boolean;
  findings: SecretFinding[];
  filesScanned: number;
}

export interface SecretFinding {
  file: string;
  line: number;
  type: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
}

// ─────────────────────────────────────────────────────────────
// Accessibility Analyzer Tool
// ─────────────────────────────────────────────────────────────

export interface A11yResult {
  success: boolean;
  issues: A11yIssue[];
  filesAnalyzed: number;
}

export interface A11yIssue {
  file: string;
  line: number;
  element: string;
  issue: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  suggestion: string;
}

// ─────────────────────────────────────────────────────────────
// Claude Translation Tool
// ─────────────────────────────────────────────────────────────

export interface TranslationResult {
  success: boolean;
  targetLanguage: string;
  translations: TranslationEntry[];
  stringsFound: number;
  stringsTranslated: number;
}

export interface TranslationEntry {
  file: string;
  original: string;
  translated: string;
  context?: string;
}

// ─────────────────────────────────────────────────────────────
// Progress Tracking
// ─────────────────────────────────────────────────────────────

export type ToolName = 'clone' | 'eslint' | 'npmAudit' | 'secrets' | 'a11y' | 'translation';

export type ToolStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ToolProgress {
  tool: ToolName;
  status: ToolStatus;
  message?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ScanProgress {
  scanId: string;
  repoUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  tools: ToolProgress[];
  currentTool?: ToolName;
}
