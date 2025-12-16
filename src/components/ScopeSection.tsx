import { CheckCircle2, Circle } from 'lucide-react';

const IN_SCOPE = [
  'Public GitHub repositories',
  'JavaScript/TypeScript files (.js, .jsx, .ts, .tsx)',
  'package.json dependency analysis',
  'Static code analysis (no runtime)',
];

const NOT_YET = [
  'Private repositories',
  'Other languages (Python, Go, etc.)',
  'Runtime/dynamic analysis',
  'Custom ESLint configurations',
];

export function ScopeSection() {
  return (
    <section id="scope" className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-wide text-navy text-center mb-12">
          Scope & Transparency
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div>
            <h3 className="font-headline text-lg font-bold uppercase tracking-wide text-navy mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sage" />
              Currently In Scope
            </h3>
            <ul className="space-y-3">
              {IN_SCOPE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-headline text-lg font-bold uppercase tracking-wide text-navy mb-4 flex items-center gap-2">
              <Circle className="w-5 h-5 text-muted-foreground" />
              Not In Scope (Yet)
            </h3>
            <ul className="space-y-3">
              {NOT_YET.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
          We believe in transparency about what our tools can and cannot do. 
          Static analysis is powerful but has limitations—use it as one input among many.
        </p>
      </div>
    </section>
  );
}