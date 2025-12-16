import { useState } from 'react';
import { validateGithubUrl } from '@/lib/validateGithubUrl';
import { RateLimitState } from '@/lib/types';

interface ScanFormProps {
  onSubmit: (repoUrl: string, scanMode: 'fast' | 'full') => void;
  isLoading?: boolean;
  rateLimit?: RateLimitState | null;
}

export function ScanForm({ onSubmit, isLoading, rateLimit }: ScanFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateGithubUrl(repoUrl);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid GitHub URL');
      return;
    }
    
    if (rateLimit && !rateLimit.canScan) {
      setError(`Rate limit reached. Resets at ${new Date(rateLimit.resetTime).toLocaleTimeString()}`);
      return;
    }
    
    onSubmit(repoUrl, 'fast');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/your-username/repo-name"
          className="flex-1 px-4 py-3 bg-cream/5 border-2 border-cream/30 text-cream font-mono placeholder:text-cream/40 focus:outline-none focus:border-amber transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || (rateLimit && !rateLimit.canScan)}
          className="px-8 py-3 bg-amber text-navy font-headline font-bold uppercase tracking-wide hover:bg-amber/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Scanning...' : 'Scan My Code'}
        </button>
      </div>
      
      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}
      
      {rateLimit && (
        <p className="mt-3 text-cream/50 text-sm">
          {rateLimit.remaining} of {rateLimit.remaining + (rateLimit.canScan ? 0 : 1)} scans remaining today
        </p>
      )}
    </form>
  );
}
