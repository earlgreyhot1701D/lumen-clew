export function HelpSection() {
  return (
    <section aria-labelledby="help-heading" className="bg-navy text-cream py-12 px-8 border-t-4 border-amber relative z-10">
      <h2 id="help-heading" className="text-3xl font-bold text-center mb-8 text-white">Need Help?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        <div className="bg-cream border-3 border-transparent hover:border-amber text-navy p-6 shadow-craft hover:shadow-craft-lg hover:-translate-y-1 transition-all">
          <h3 className="font-bold text-xl mb-3">Don't have GitHub?</h3>
          <p className="text-navy/80 mb-5 text-sm">Push from Lovable or Replit in seconds.</p>
          <a href="https://docs.lovable.dev/integrations/github" target="_blank" rel="noopener noreferrer" className="text-navy font-headline font-bold uppercase tracking-wider text-sm border-b-2 border-amber pb-1 hover:bg-amber px-1 transition-all focus:ring-2 focus:ring-amber">Learn Lovable →</a>
        </div>
        <div className="bg-cream border-3 border-transparent hover:border-amber text-navy p-6 shadow-craft hover:shadow-craft-lg hover:-translate-y-1 transition-all">
          <h3 className="font-bold text-xl mb-3">Languages</h3>
          <p className="text-navy/80 text-sm mb-2">✅ JS, JSX, TS, TSX</p>
          <p className="text-navy/80 text-sm mb-3">🚀 Python, Go, Ruby coming soon</p>
          <p className="text-navy/60 italic text-xs">Only .js/.jsx/.ts/.tsx repos return findings.</p>
        </div>
        <div className="bg-cream border-3 border-transparent hover:border-amber text-navy p-6 shadow-craft hover:shadow-craft-lg hover:-translate-y-1 transition-all">
          <h3 className="font-bold text-xl mb-3">Questions?</h3>
          <p className="text-navy/80 mb-5 text-sm">Check FAQ for privacy & data info.</p>
          <a href="#scope-heading" className="text-navy font-headline font-bold uppercase tracking-wider text-sm border-b-2 border-amber pb-1 hover:bg-amber px-1 transition-all focus:ring-2 focus:ring-amber">See Scope →</a>
        </div>
      </div>
    </section>
  );
}