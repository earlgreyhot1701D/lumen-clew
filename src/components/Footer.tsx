import { Lightbulb } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 border-t border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber" />
            </div>
            <span className="font-headline text-sm font-bold uppercase tracking-wide text-navy">
              Lumen Clew
            </span>
          </div>
          
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Built for the Anthropic Hackathon 2024
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by Claude for intelligent finding translation
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {currentYear} Lumen Clew
          </div>
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-6">
          We don't store your code. Repositories are cloned temporarily and deleted after scanning.
        </p>
      </div>
    </footer>
  );
}