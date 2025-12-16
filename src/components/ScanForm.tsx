import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { validateGithubUrl } from '@/lib/validateGithubUrl';
import { RateLimitState } from '@/lib/types';
import { Search, Zap, Clock } from 'lucide-react';

interface ScanFormProps {
  onSubmit: (repoUrl: string, scanMode: 'fast' | 'full') => void;
  isLoading?: boolean;
  rateLimit?: RateLimitState | null;
}

export function ScanForm({ onSubmit, isLoading = false, rateLimit }: ScanFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [scanMode, setScanMode] = useState<'fast' | 'full'>('fast');
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
      setError(`Rate limit exceeded. Resets at ${new Date(rateLimit.resetTime).toLocaleTimeString()}`);
      return;
    }

    onSubmit(repoUrl, scanMode);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="repo-url" className="text-sm font-medium text-foreground">
          GitHub Repository URL
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="repo-url"
            type="url"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
              setError(null);
            }}
            className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-3">
          {scanMode === 'fast' ? (
            <Zap className="w-5 h-5 text-amber" />
          ) : (
            <Clock className="w-5 h-5 text-sage" />
          )}
          <div>
            <p className="font-medium text-foreground">
              {scanMode === 'fast' ? 'Fast Scan' : 'Full Scan'}
            </p>
            <p className="text-sm text-muted-foreground">
              {scanMode === 'fast' 
                ? 'Quick analysis (300 files max, ~90s)' 
                : 'Complete analysis (unlimited files, ~3min)'}
            </p>
          </div>
        </div>
        <Switch
          checked={scanMode === 'full'}
          onCheckedChange={(checked) => setScanMode(checked ? 'full' : 'fast')}
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !repoUrl.trim()}
        className="w-full h-12 bg-amber text-navy font-headline font-bold uppercase tracking-wide hover:bg-amber/90 transition-colors"
      >
        {isLoading ? 'Scanning...' : 'Start Scan'}
      </Button>

      {rateLimit && (
        <p className="text-center text-sm text-muted-foreground">
          {rateLimit.remaining} of {rateLimit.maxScansPerDay} scans remaining today
        </p>
      )}
    </form>
  );
}