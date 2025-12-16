const STEPS = [
  {
    emoji: '📋',
    title: '1. Paste URL',
    description: 'Paste your GitHub repo URL above.',
  },
  {
    emoji: '🔧',
    title: '2. We Scan',
    description: 'We run standard tools like ESLint.',
  },
  {
    emoji: '💬',
    title: '3. AI Translates',
    description: 'Findings explained in plain English.',
  },
  {
    emoji: '✨',
    title: '4. Get Clarity',
    description: "See what's inside your code.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-navy text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {STEPS.map((step) => (
            <div 
              key={step.title} 
              className="craftsman-card p-6 text-center"
            >
              <div className="text-4xl mb-4">{step.emoji}</div>
              <h3 className="font-headline text-lg font-bold uppercase tracking-wide text-navy mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-navy/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
