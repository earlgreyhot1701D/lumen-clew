export function Footer() {
  return (
    <footer className="py-6 bg-navy border-t-4 border-amber/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="#privacy" 
              className="text-cream/60 hover:text-cream uppercase tracking-wider transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#terms" 
              className="text-cream/60 hover:text-cream uppercase tracking-wider transition-colors"
            >
              Terms
            </a>
            <a 
              href="#contact" 
              className="text-cream/60 hover:text-cream uppercase tracking-wider transition-colors"
            >
              Contact
            </a>
          </div>
          
          <p className="text-cream/40 text-sm">
            Built for the Anthropic Hackathon 2024
          </p>
        </div>
      </div>
    </footer>
  );
}
