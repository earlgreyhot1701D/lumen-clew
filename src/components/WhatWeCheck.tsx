const PANELS = [
  {
    emoji: '🔍',
    title: 'Code Quality',
    tool: 'ESLint standard config.',
    description: 'Checks for logic errors and confusing patterns.',
  },
  {
    emoji: '📦',
    title: 'Dependency Health',
    tool: 'npm audit.',
    description: 'Checks libraries against vulnerability databases.',
  },
  {
    emoji: '🗝️',
    title: 'Secrets & Config',
    tool: 'Pattern Matching.',
    description: 'Scans for potential API keys or tokens.',
  },
  {
    emoji: '♿',
    title: 'Accessibility',
    tool: 'AI Static Analysis.',
    description: 'Checks for basic HTML semantic issues.',
  },
];

export function WhatWeCheck() {
  return (
    <section aria-labelledby="checks-heading" className="py-10 px-8 bg-white">
      <h2 id="checks-heading" className="text-3xl font-bold text-center mb-8 text-navy">What We Check</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {PANELS.map((panel) => (
          <details 
            key={panel.title}
            className="group bg-cream border-3 border-navy/10 p-4 cursor-pointer transition-all hover:shadow-craft hover:border-amber open:bg-white open:border-navy/30 open:shadow-craft-lg"
          >
            <summary className="font-headline font-bold text-lg flex items-center justify-between text-navy focus:text-amber">
              <span className="flex items-center gap-2">
                <span className="text-xl opacity-70" aria-hidden="true">{panel.emoji}</span> 
                {panel.title}
              </span>
              <span className="text-amber text-xl group-open:rotate-90 transition-transform duration-200 font-sans" aria-hidden="true">▸</span>
            </summary>
            <div className="mt-4 pt-4 border-t-2 border-navy/5 text-navy/80 space-y-2 text-sm leading-relaxed">
              <p><strong>Tool:</strong> {panel.tool}</p>
              <p>{panel.description}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}