import { useState } from 'react';

export function ScopeSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="scope" className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <details 
          className="max-w-3xl mx-auto"
          open={isOpen}
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
        >
          <summary className="flex items-center justify-center gap-2 cursor-pointer list-none text-navy/60 hover:text-navy transition-colors">
            <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>
            <span className="font-medium">Scope and limitations</span>
          </summary>
          
          <div className="mt-6 bg-cream border-3 border-navy/10 p-6 shadow-craft">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-headline font-bold uppercase tracking-wide text-navy mb-4">
                  ✅ Currently In Scope
                </h3>
                <ul className="space-y-2 text-navy/70">
                  <li>• Public GitHub repositories</li>
                  <li>• JavaScript & TypeScript</li>
                  <li>• Static code analysis</li>
                  <li>• Dependency vulnerability checks</li>
                  <li>• Basic secrets detection</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-headline font-bold uppercase tracking-wide text-navy mb-4">
                  🔜 Not In Scope (Yet)
                </h3>
                <ul className="space-y-2 text-navy/70">
                  <li>• Private repositories</li>
                  <li>• Python, Ruby, Go (coming soon)</li>
                  <li>• Runtime analysis</li>
                  <li>• Performance profiling</li>
                  <li>• Custom rule configuration</li>
                </ul>
              </div>
            </div>
            
            <p className="mt-6 text-sm text-navy/50 italic border-t border-navy/10 pt-4">
              This is static analysis only. For runtime checks (contrast, keyboard navigation), we recommend using Lighthouse.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
