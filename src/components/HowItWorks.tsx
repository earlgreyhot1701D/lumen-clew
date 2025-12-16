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
    <section aria-labelledby="how-it-works-heading" className="py-10 px-8 bg-cream border-b-4 border-navy/10">
      <h2 id="how-it-works-heading" className="text-3xl font-bold text-center mb-8 text-navy">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-center">
        {STEPS.map((step) => (
          <div 
            key={step.title} 
            className="p-5 bg-white border-3 border-navy/10 shadow-craft hover:shadow-craft-lg hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-3 text-navy/40" aria-hidden="true">{step.emoji}</div>
            <h3 className="font-bold text-xl mb-2 text-navy">
              {step.title}
            </h3>
            <p className="text-navy/70 text-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}