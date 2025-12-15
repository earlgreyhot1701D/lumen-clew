// Lumen Clew - Configuration Constants
// Shared configuration used by both frontend and backend

// ─────────────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────────────

export const API_BASE_URL = 'https://lumen-clew-backend.onrender.com';
export const API_SCAN_ENDPOINT = `${API_BASE_URL}/api/scan`;

// ─────────────────────────────────────────────────────────────
// Claude Configuration
// ─────────────────────────────────────────────────────────────

export const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';
export const CLAUDE_MAX_TOKENS = 4096;

// ─────────────────────────────────────────────────────────────
// GitHub Configuration
// ─────────────────────────────────────────────────────────────

export const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;

// ─────────────────────────────────────────────────────────────
// Supported Languages for Translation
// ─────────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// ─────────────────────────────────────────────────────────────
// Tool Configuration
// ─────────────────────────────────────────────────────────────

export const TOOL_NAMES = ['clone', 'eslint', 'npmAudit', 'secrets', 'a11y', 'translation'] as const;

export const TOOL_DISPLAY_NAMES: Record<typeof TOOL_NAMES[number], string> = {
  clone: 'Clone Repository',
  eslint: 'ESLint Analysis',
  npmAudit: 'npm Audit',
  secrets: 'Secrets Scanner',
  a11y: 'Accessibility Check',
  translation: 'Translation',
};

// ─────────────────────────────────────────────────────────────
// Timeouts (in milliseconds)
// ─────────────────────────────────────────────────────────────

export const CLONE_TIMEOUT_MS = 60000; // 1 minute
export const TOOL_TIMEOUT_MS = 120000; // 2 minutes per tool
export const TOTAL_SCAN_TIMEOUT_MS = 600000; // 10 minutes total
