// Lumen Clew - GitHub URL Validator
// Prompt 2: Frontend validation before API calls

import { CONFIG } from './config';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export function validateGithubUrl(url: string): ValidationResult {
  // 1. Trim whitespace
  const trimmed = url.trim();

  // 2. Check if empty
  if (!trimmed) {
    return { isValid: false, error: 'Please enter a GitHub repository URL' };
  }

  // 3. Basic URL structure check
  if (!trimmed.startsWith('https://github.com/')) {
    return { isValid: false, error: 'URL must start with https://github.com/' };
  }

  // 4. Test against CONFIG.GITHUB_URL_PATTERN regex
  if (!CONFIG.GITHUB_URL_PATTERN.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid GitHub repository URL format. Expected: https://github.com/owner/repo',
    };
  }

  // 5. Normalize (remove trailing slash)
  const normalizedUrl = trimmed.replace(/\/$/, '');

  return { isValid: true, normalizedUrl };
}
