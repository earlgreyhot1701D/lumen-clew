import { Github, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HelpSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-wide text-navy mb-4">
          How Can I Help?
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Lumen Clew is a hackathon project built to explore how we can make code analysis 
          more approachable. Your feedback shapes what comes next.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            className="border-navy text-navy hover:bg-navy hover:text-cream"
            asChild
          >
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              View on GitHub
            </a>
          </Button>
          
          <Button
            variant="outline"
            className="border-amber text-amber hover:bg-amber hover:text-navy"
            asChild
          >
            <a href="mailto:feedback@lumenclew.dev">
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Feedback
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}