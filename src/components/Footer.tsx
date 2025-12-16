export function Footer() {
  return (
    <footer className="bg-navy text-center py-10 text-cream/60 relative z-10 flex flex-col gap-5 border-t-4 border-amber/30">
      <div className="flex justify-center gap-8 font-headline font-bold uppercase tracking-widest text-sm">
        <a href="#privacy" className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber">Privacy</a>
        <a href="#terms" className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber">Terms</a>
        <a href="#contact" className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber">Contact</a>
      </div>
      <p className="italic opacity-80">
        Built for SheBuilds on Lovable 2025
      </p>
    </footer>
  );
}