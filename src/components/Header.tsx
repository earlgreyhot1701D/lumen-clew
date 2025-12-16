interface HeaderProps {
  onLogoClick?: () => void;
  onNewScan?: () => void;
  showNewScanButton?: boolean;
}

export function Header({ onLogoClick, onNewScan, showNewScanButton }: HeaderProps) {
  return (
    <>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-amber focus:text-navy focus:px-4 focus:py-2 focus:font-headline focus:font-bold"
      >
        Skip to main content
      </a>
      
      <header className="sticky top-0 z-50 bg-cream border-b-4 border-navy px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-craft">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 border-3 border-amber bg-navy flex items-center justify-center shadow-sm" aria-hidden="true">
            <div className="w-1.5 h-4 md:w-2 md:h-5 bg-amber"></div>
          </div>
          <span className="text-xl md:text-3xl font-headline font-black text-amber tracking-tight uppercase">Lumen Clew</span>
        </button>
        
        <nav className="flex items-center gap-3 md:gap-6 font-headline font-bold text-xs md:text-sm uppercase tracking-widest text-navy/80" aria-label="Main Navigation">
          {showNewScanButton && onNewScan && (
            <button
              onClick={onNewScan}
              className="bg-amber text-navy font-headline font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 hover:bg-amber/90 transition uppercase tracking-wider"
            >
              New Scan
            </button>
          )}
          <div className="flex items-center gap-3 md:gap-6">
            <a href="https://www.linkedin.com/in/la-shara-cordero-a0017a11/" target="_blank" rel="noopener noreferrer" className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber hidden sm:inline">About</a>
            <a href="https://github.com/earlgreyhot1701D/lumen-clew/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber hidden sm:inline">Docs</a>
            <a 
              href="https://github.com/earlgreyhot1701D/lumen-clew" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber border-b-2 border-amber hover:text-navy hover:border-navy transition"
            >
              GitHub →
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}