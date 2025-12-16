import { Lightbulb } from 'lucide-react';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-amber" />
          </div>
          <span className="font-headline text-xl font-bold uppercase tracking-wide text-navy">
            Lumen Clew
          </span>
        </button>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#what-we-check" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            What We Check
          </a>
          <a href="#scope" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Scope
          </a>
        </nav>
      </div>
    </header>
  );
}