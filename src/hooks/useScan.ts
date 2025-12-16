import { useState, useCallback } from 'react';
import { ENDPOINTS } from '@/lib/config';
import { ApiScanResponse, ScanReport, RateLimitState } from '@/lib/types';

export type ScanState = 'idle' | 'scanning' | 'success' | 'error';

export interface UseScanResult {
  scanState: ScanState;
  result: ScanReport | null;
  error: string | null;
  rateLimit: RateLimitState | null;
  startScan: (repoUrl: string, scanMode: 'fast' | 'full') => Promise<void>;
  resetScan: () => void;
}

export function useScan(): UseScanResult {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitState | null>(null);

  const startScan = useCallback(async (repoUrl: string, scanMode: 'fast' | 'full') => {
    setScanState('scanning');
    setError(null);
    setResult(null);

    try {
      const response = await fetch(ENDPOINTS.scan, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, scanMode }),
      });

      const data: ApiScanResponse = await response.json();

      // Update rate limit state
      if (data.rateLimit) {
        setRateLimit(data.rateLimit);
      }

      if (data.status === 'error') {
        setScanState('error');
        setError(data.error?.message || 'An unknown error occurred');
        return;
      }

      if (data.report) {
        setResult(data.report);
        setScanState('success');
      } else {
        setScanState('error');
        setError('No report returned from scan');
      }
    } catch (err) {
      setScanState('error');
      setError(err instanceof Error ? err.message : 'Failed to connect to scan service');
    }
  }, []);

  const resetScan = useCallback(() => {
    setScanState('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    scanState,
    result,
    error,
    rateLimit,
    startScan,
    resetScan,
  };
}