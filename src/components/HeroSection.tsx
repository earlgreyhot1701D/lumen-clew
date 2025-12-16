import { ScanForm } from './ScanForm';
import { RateLimitState } from '@/lib/types';

interface HeroSectionProps {
  onSubmit: (repoUrl: string, scanMode: 'fast' | 'full') => void;
  isLoading?: boolean;
  rateLimit?: RateLimitState | null;
}

export function HeroSection({ onSubmit, isLoading, rateLimit }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-heading" className="bg-navy text-cream py-8 px-6 border-b-4 border-amber relative overflow-hidden">
      {/* Decorative SVG background */}
      <div aria-hidden="true" className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcmaWxsPSIjZTZhNjQxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIi8+PGNpcmNsZSBjeD0iMTMiIGN5PSIxMyIgcj0iMSIvPjwvZz48L3N2Zz4=')]"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="text-left">
          <h1 id="hero-heading" className="text-5xl md:text-6xl mb-2 leading-none text-white tracking-tight font-black uppercase">
            Illuminate your<br />code's health
          </h1>
          <p className="text-xl md:text-2xl text-amber font-headline tracking-wider font-bold">
            Anytime you want clarity
          </p>
        </div>
        <div className="text-left flex flex-col justify-center">
          <p className="text-lg opacity-90 leading-relaxed font-light mb-5 max-w-lg">
            Run industry-standard tools on your AI-generated code. Get plain-language insights. No judgment, no jargon.
          </p>
          
          <ScanForm onSubmit={onSubmit} isLoading={isLoading} rateLimit={rateLimit} />
          
          <p className="mt-4 text-xs font-headline tracking-widest uppercase text-amber/70 flex gap-4">
            <span>⚡ Fast Analysis</span>
            <span>🔒 Private</span>
            <span>✅ JS & TS</span>
          </p>
        </div>
      </div>
    </section>
  );
}