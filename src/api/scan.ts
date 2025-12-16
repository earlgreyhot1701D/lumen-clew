// @ts-nocheck
// BACKEND: API endpoint for scan requests
// Lumen Clew - Prompt 10: Thin Express handler wrapping orchestrateScan

import type { Request, Response } from 'express';
import { orchestrateScan, OrchestrateScanResult } from '../utils/orchestrateScan';

// ============================================================================
// Types
// ============================================================================

interface ScanRequest {
  repoUrl: string;
  scanMode?: 'fast' | 'full';
}

interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract client IP from request headers (handles proxies)
 * Priority: x-forwarded-for > x-real-ip > req.ip > fallback
 */
function extractClientIp(req: Request): string {
  // x-forwarded-for may contain comma-separated list; take first
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const firstIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0];
    return firstIp.trim();
  }

  // x-real-ip (common with nginx)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Express req.ip (may be undefined)
  if (req.ip) {
    return req.ip;
  }

  // Fallback
  return 'anonymous';
}

/**
 * Validate scan request body
 * Returns array of validation errors (empty if valid)
 */
function validateScanRequest(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check body exists
  if (!body || typeof body !== 'object') {
    errors.push({ field: 'body', message: 'Request body is required' });
    return errors;
  }

  const { repoUrl, scanMode } = body as Record<string, unknown>;

  // Validate repoUrl (required)
  if (!repoUrl) {
    errors.push({ field: 'repoUrl', message: 'repoUrl is required' });
  } else if (typeof repoUrl !== 'string') {
    errors.push({ field: 'repoUrl', message: 'repoUrl must be a string' });
  } else if (!repoUrl.includes('github.com')) {
    errors.push({ field: 'repoUrl', message: 'repoUrl must be a GitHub URL' });
  }

  // Validate scanMode (optional, but if provided must be valid)
  if (scanMode !== undefined) {
    if (scanMode !== 'fast' && scanMode !== 'full') {
      errors.push({
        field: 'scanMode',
        message: "scanMode must be 'fast' or 'full'",
      });
    }
  }

  return errors;
}

/**
 * Map orchestrateScan error codes to HTTP status codes
 */
function getHttpStatus(result: OrchestrateScanResult): number {
  if (result.status === 'success' || result.status === 'partial') {
    return 200;
  }

  // Map error codes to HTTP status
  const errorCode = result.error?.code;
  switch (errorCode) {
    case 'RATE_LIMIT_EXCEEDED':
      return 429;
    case 'INVALID_GITHUB_URL':
      return 400;
    case 'REPO_NOT_FOUND':
      return 404;
    case 'CLONE_TIMEOUT':
      return 504;
    default:
      return 500;
  }
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Express handler for POST /api/scan
 * Validates request, extracts client IP, delegates to orchestrateScan
 */
export async function handleScanRequest(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Step 1: Validate request body
    const validationErrors = validateScanRequest(req.body);
    if (validationErrors.length > 0) {
      res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
          details: validationErrors,
        },
        rateLimit: null, // Can't check rate limit without valid request
      });
      return;
    }

    // Step 2: Extract validated fields
    const { repoUrl, scanMode = 'fast' } = req.body as ScanRequest;

    // Step 3: Extract client IP for rate limiting
    const clientIp = extractClientIp(req);

    // Step 4: Delegate to orchestrateScan
    const result = await orchestrateScan({
      repoUrl,
      scanMode,
      clientIp,
    });

    // Step 5: Return response with appropriate status code
    const httpStatus = getHttpStatus(result);
    res.status(httpStatus).json(result);
  } catch (error) {
    // Unexpected error - log and return 500
    console.error('Unexpected error in handleScanRequest:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      rateLimit: null,
    });
  }
}

export default handleScanRequest;
