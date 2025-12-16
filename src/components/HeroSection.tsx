import { ScanForm } from './ScanForm';
import { RateLimitState } from '@/lib/types';

interface HeroSectionProps {
  onSubmit: (repoUrl: string, scanMode: 'fast' | 'full') => void;
  isLoading?: boolean;
  rateLimit?: RateLimitState | null;
}

export function HeroSection({ onSubmit, isLoading, rateLimit }: HeroSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-wide text-navy mb-6">
          Clarity for Your{' '}
          <span className="relative">
            Codebase
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-amber rounded-full" />
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-4">
          Static analysis scans translated into plain language.
        </p>
        <p className="max-w-xl mx-auto text-base text-muted-foreground mb-12">
          Awareness without judgment. Reflection, not direction.
        </p>

        <div className="max-w-2xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-craft-lg border border-border">
          <ScanForm onSubmit={onSubmit} isLoading={isLoading} rateLimit={rateLimit} />
        </div>
      </div>
    </section>
  );
}