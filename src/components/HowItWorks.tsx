import { GitBranch, Cpu, MessageSquareText } from 'lucide-react';

const STEPS = [
  {
    icon: GitBranch,
    title: 'Paste URL',
    description: 'Drop in any public GitHub repository URL',
  },
  {
    icon: Cpu,
    title: 'We Analyze',
    description: 'Our tools scan for quality, security, and accessibility',
  },
  {
    icon: MessageSquareText,
    title: 'Get Clarity',
    description: 'Findings translated into plain, actionable language',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-wide text-navy text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-navy rounded-xl flex items-center justify-center mb-4 shadow-craft">
                    <Icon className="w-8 h-8 text-amber" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber text-navy text-sm font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold uppercase tracking-wide text-navy mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}