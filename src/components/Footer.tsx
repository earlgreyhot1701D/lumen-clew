import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-center py-10 text-cream/60 relative z-10 flex flex-col gap-6 border-t-4 border-amber/30">
      {/* Decorative Candle Icon */}
      <div className="flex justify-center">
        <div className="bg-amber/20 p-3 rounded-full">
          <Flame className="w-6 h-6 text-amber" aria-hidden="true" />
        </div>
      </div>

      {/* Contact Link */}
      <a 
        href="mailto:cordero.lsj@gmail.com?subject=Lumen%20Clew" 
        className="font-headline font-bold uppercase tracking-widest text-sm hover:text-amber transition border-b-2 border-transparent hover:border-amber focus:text-amber mx-auto"
      >
        Contact
      </a>

      {/* Tagline */}
      <p className="italic opacity-80 text-sm">
        Built for SheBuilds on Lovable 2025
      </p>

      {/* Privacy & Terms - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto px-6">
        <div className="bg-navy/50 p-4 text-cream text-sm text-left border-l-2 border-amber/40">
          <h3 className="font-bold mb-2 text-cream/90">Privacy & Data</h3>
          <p className="opacity-80 leading-relaxed">
            We don't store your code. Each scan is temporary. We don't retain findings, history, or personal data.
          </p>
        </div>
        <div className="bg-navy/50 p-4 text-cream text-sm text-left border-l-2 border-amber/40">
          <h3 className="font-bold mb-2 text-cream/90">Terms & Disclaimer</h3>
          <p className="opacity-80 leading-relaxed">
            Lumen Clew is educational. This is not a professional security audit. Use at your own discretion.
          </p>
        </div>
      </div>
    </footer>
  );
}
