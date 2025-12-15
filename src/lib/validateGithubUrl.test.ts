// @ts-nocheck
// Lumen Clew - GitHub URL Validator Tests
// Documentation for future use (Vitest not yet configured)

import { describe, it, expect } from 'vitest';
import { validateGithubUrl } from './validateGithubUrl';

describe('validateGithubUrl', () => {
  // Valid URLs
  it('accepts valid GitHub repo URL', () => {
    const result = validateGithubUrl('https://github.com/owner/repo');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('https://github.com/owner/repo');
  });

  it('normalizes trailing slash', () => {
    const result = validateGithubUrl('https://github.com/owner/repo/');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('https://github.com/owner/repo');
  });

  it('accepts repo names with dots', () => {
    const result = validateGithubUrl('https://github.com/owner/repo.js');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('https://github.com/owner/repo.js');
  });

  it('accepts repo names with hyphens and underscores', () => {
    const result = validateGithubUrl('https://github.com/my-org/my_repo-name');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('https://github.com/my-org/my_repo-name');
  });

  // Invalid URLs
  it('rejects empty string', () => {
    const result = validateGithubUrl('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a GitHub repository URL');
  });

  it('rejects whitespace-only string', () => {
    const result = validateGithubUrl('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a GitHub repository URL');
  });

  it('rejects non-GitHub URLs', () => {
    const result = validateGithubUrl('https://gitlab.com/owner/repo');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URL must start with https://github.com/');
  });

  it('rejects HTTP (non-HTTPS)', () => {
    const result = validateGithubUrl('http://github.com/owner/repo');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URL must start with https://github.com/');
  });

  it('rejects URLs with extra path segments', () => {
    const result = validateGithubUrl('https://github.com/owner/repo/tree/main');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      'Invalid GitHub repository URL format. Expected: https://github.com/owner/repo'
    );
  });

  it('rejects user profile URLs (no repo)', () => {
    const result = validateGithubUrl('https://github.com/owner');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      'Invalid GitHub repository URL format. Expected: https://github.com/owner/repo'
    );
  });

  it('rejects GitHub home page', () => {
    const result = validateGithubUrl('https://github.com/');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      'Invalid GitHub repository URL format. Expected: https://github.com/owner/repo'
    );
  });
});
