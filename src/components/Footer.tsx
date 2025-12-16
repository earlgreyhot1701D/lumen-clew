export function Footer() {
  return (
    <footer className="bg-navy text-center py-10 text-cream/60 relative z-10 flex flex-col gap-5 border-t-4 border-amber/30">
      {/* Main Navigation Links */}
      <div className="flex justify-center gap-8 font-headline font-bold uppercase tracking-widest text-sm flex-wrap">
        <a 
          href="mailto:cordero.lsj@gmail.com?subject=Lumen%20Clew" 
          className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber"
        >
          Contact
        </a>
        <a 
          href="#privacy-statement" 
          className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber"
        >
          Privacy
        </a>
        <a 
          href="#terms" 
          className="hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber"
        >
          Terms
        </a>
      </div>

      {/* Tagline */}
      <p className="italic opacity-80">
        Built for SheBuilds on Lovable 2025
      </p>

      {/* Privacy Statement Section */}
      <section id="privacy-statement" className="mt-8 p-6 bg-navy/50 text-cream text-sm max-w-3xl mx-auto text-left">
        <h3 className="font-bold mb-2">Privacy & Data</h3>
        <p className="opacity-90">
          We don't store your code. Each scan is temporary. We don't retain findings, history, or personal data. 
          Your GitHub repo link is only used during the scan—we delete everything after.
        </p>
      </section>

      {/* Terms & Disclaimer Section */}
      <section id="terms" className="mt-6 p-6 bg-navy/50 text-cream text-sm max-w-3xl mx-auto text-left">
        <h3 className="font-bold mb-2">Terms & Disclaimer</h3>
        <p className="opacity-90">
          Lumen Clew is educational. We run industry-standard static analysis tools (ESLint, npm audit, etc.). 
          This is not a professional security audit. We don't catch all issues. Use at your own discretion.
        </p>
      </section>
    </footer>
  );
}
