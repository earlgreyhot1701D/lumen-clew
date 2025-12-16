import { Code2, Package, KeyRound, Accessibility } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PANELS = [
  {
    icon: Code2,
    title: 'Code Quality',
    description: 'ESLint analysis for maintainability, best practices, and potential bugs',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Package,
    title: 'Dependencies',
    description: 'npm audit for known vulnerabilities in your package dependencies',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    icon: KeyRound,
    title: 'Secrets',
    description: 'Regex-based scanning for accidentally committed credentials',
    color: 'bg-red-500/10 text-red-600',
  },
  {
    icon: Accessibility,
    title: 'Accessibility',
    description: 'Static A11y analysis for inclusive design patterns',
    color: 'bg-green-500/10 text-green-600',
  },
];

export function WhatWeCheck() {
  return (
    <section id="what-we-check" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-wide text-navy text-center mb-12">
          What We Check
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {PANELS.map((panel) => {
            const Icon = panel.icon;
            return (
              <Card key={panel.title} className="bg-card border-border shadow-craft hover:shadow-craft-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-lg ${panel.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="font-headline text-base uppercase tracking-wide">
                    {panel.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {panel.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}