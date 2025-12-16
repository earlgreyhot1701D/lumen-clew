import { useState } from 'react';

const PANELS = [
  {
    emoji: '🔍',
    title: 'Code Quality',
    description: 'ESLint analysis for maintainability, best practices, and potential bugs.',
  },
  {
    emoji: '📦',
    title: 'Dependency Health',
    description: 'npm audit for known vulnerabilities in your package dependencies.',
  },
  {
    emoji: '🗝️',
    title: 'Secrets & Config',
    description: 'Regex-based scanning for accidentally committed credentials.',
  },
  {
    emoji: '♿',
    title: 'Accessibility',
    description: 'Static A11y analysis for inclusive design patterns.',
  },
];

export function WhatWeCheck() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="what-we-check" className="py-16 bg-cream">
      <div className="container mx-auto px-6">
        <h2 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-navy text-center mb-12">
          What We Check
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {PANELS.map((panel, index) => (
            <details 
              key={panel.title}
              className="group bg-white border-3 border-navy/10 shadow-craft"
              open={openIndex === index}
              onClick={(e) => {
                e.preventDefault();
                setOpenIndex(openIndex === index ? null : index);
              }}
            >
              <summary className="flex items-center gap-4 p-4 cursor-pointer list-none">
                <span className="text-2xl">{panel.emoji}</span>
                <span className="flex-1 font-headline font-bold uppercase tracking-wide text-navy">
                  {panel.title}
                </span>
                <span className="text-navy/40 transition-transform group-open:rotate-90">
                  ▸
                </span>
              </summary>
              <div className="px-4 pb-4 text-navy/70">
                <p>{panel.description}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
