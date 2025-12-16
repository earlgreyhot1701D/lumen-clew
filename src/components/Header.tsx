interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-cream border-b-4 border-navy px-6 py-4 flex justify-between items-center shadow-craft">
      <button 
        onClick={onLogoClick}
        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 border-3 border-amber bg-navy flex items-center justify-center shadow-sm" aria-hidden="true">
          <div className="w-2 h-5 bg-amber"></div>
        </div>
        <span className="text-3xl font-headline font-black text-amber tracking-tight uppercase">Lumen Clew</span>
      </button>
      
      <nav className="space-x-6 font-headline font-bold text-sm uppercase tracking-widest text-navy/80 hidden md:block" aria-label="Main Navigation">
        <a href="#about" className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber">About</a>
        <a href="#docs" className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber">Docs</a>
        <a 
          href="https://github.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber border-b-2 border-amber hover:text-navy hover:border-navy transition"
        >
          GitHub →
        </a>
      </nav>
    </header>
  );
}