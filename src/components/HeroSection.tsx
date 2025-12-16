import { ScanForm } from './ScanForm';
import { RateLimitState } from '@/lib/types';

interface HeroSectionProps {
  onSubmit: (repoUrl: string, scanMode: 'fast' | 'full') => void;
  isLoading?: boolean;
  rateLimit?: RateLimitState | null;
}

export function HeroSection({ onSubmit, isLoading, rateLimit }: HeroSectionProps) {
  return (
    <section className="bg-navy text-cream border-b-4 border-amber py-16 md:py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline text-5xl md:text-6xl font-black uppercase tracking-tight text-cream mb-4">
            ILLUMINATE YOUR<br />CODE'S HEALTH
          </h1>
          
          <p className="text-xl text-amber font-medium mb-6">
            Anytime you want clarity
          </p>
          
          <p className="text-cream/80 text-lg mb-8 max-w-xl">
            Run industry-standard tools on your AI-generated code. Get plain-language insights. No judgment, no jargon.
          </p>

          <div className="bg-cream/5 border-3 border-amber p-6 shadow-amber-glow">
            <ScanForm onSubmit={onSubmit} isLoading={isLoading} rateLimit={rateLimit} />
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-cream/70 uppercase tracking-widest">
            <span>⚡ Fast Analysis</span>
            <span>🔒 Private</span>
            <span>✅ JS & TS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
