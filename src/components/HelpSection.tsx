export function HelpSection() {
  return (
    <section className="py-16 bg-navy border-t-4 border-amber">
      <div className="container mx-auto px-6">
        <h2 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-cream text-center mb-12">
          Need Help?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-cream p-6 border-3 border-navy/10 shadow-craft">
            <h3 className="font-headline font-bold uppercase tracking-wide text-navy mb-2">
              Don't Have GitHub?
            </h3>
            <p className="text-navy/70 text-sm">
              You'll need a public GitHub repository to use Lumen Clew. Creating one is free.
            </p>
          </div>
          
          <div className="bg-cream p-6 border-3 border-navy/10 shadow-craft">
            <h3 className="font-headline font-bold uppercase tracking-wide text-navy mb-2">
              Languages
            </h3>
            <p className="text-navy/70 text-sm">
              Optimized for JS & TypeScript. Python coming soon.
            </p>
          </div>
          
          <div className="bg-cream p-6 border-3 border-navy/10 shadow-craft">
            <h3 className="font-headline font-bold uppercase tracking-wide text-navy mb-2">
              Questions?
            </h3>
            <p className="text-navy/70 text-sm mb-3">
              Check FAQ for privacy & data info.
            </p>
            <a 
              href="#faq" 
              className="text-amber hover:text-amber/80 text-sm font-medium uppercase tracking-wider"
            >
              View FAQ →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
