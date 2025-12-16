import { useState, forwardRef } from 'react';
import { validateGithubUrl } from '@/lib/validateGithubUrl';
import { RateLimitState } from '@/lib/types';

interface ScanFormProps {
  onSubmit: (repoUrl: string, scanMode: 'fast' | 'full') => void;
  isLoading?: boolean;
  rateLimit?: RateLimitState | null;
}

export const ScanForm = forwardRef<HTMLInputElement, ScanFormProps>(
  function ScanForm({ onSubmit, isLoading, rateLimit }, ref) {
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
        <div className="bg-navy border-3 border-amber p-2 flex flex-col md:flex-row gap-3 items-center shadow-amber-glow w-full hover:-translate-y-1 transition-all duration-300">
          <input
            ref={ref}
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            aria-label="GitHub Repository URL"
            placeholder="https://github.com/your-username/repo-name"
            className="w-full flex-1 bg-cream/5 text-cream text-lg p-3 border-2 border-transparent focus:border-amber focus:bg-navy outline-none font-mono placeholder-cream/30 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (rateLimit && !rateLimit.canScan)}
            className="w-full md:w-auto bg-amber text-navy font-headline font-bold text-xl px-6 py-3 hover:bg-amber/90 transition shadow-md tracking-wider whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy"
          >
            {isLoading ? 'Scanning...' : 'Scan My Code'}
          </button>
        </div>
        
        {error && (
          <div className="mt-3 bg-amber/10 border-2 border-amber/50 px-4 py-2">
            <p className="text-amber text-sm font-medium">{error}</p>
          </div>
        )}
        
        {rateLimit && (
          <p className="mt-3 text-cream/50 text-sm">
            {rateLimit.remaining} of {rateLimit.remaining + (rateLimit.canScan ? 0 : 1)} scans remaining today
          </p>
        )}
      </form>
    );
  }
);