interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="bg-cream border-b-4 border-navy shadow-craft">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-navy flex items-center justify-center">
            <div className="w-5 h-5 bg-amber" />
          </div>
          <span className="font-headline text-3xl font-black text-amber tracking-tight">
            LUMEN CLEW
          </span>
        </button>
        
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#about" 
            className="text-sm font-medium text-navy/70 hover:text-amber uppercase tracking-widest transition-colors"
          >
            About
          </a>
          <a 
            href="#docs" 
            className="text-sm font-medium text-navy/70 hover:text-amber uppercase tracking-widest transition-colors"
          >
            Docs
          </a>
          <a 
            href="https://github.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-amber hover:text-amber/80 uppercase tracking-widest transition-colors"
          >
            GitHub →
          </a>
        </nav>
      </div>
    </header>
  );
}
