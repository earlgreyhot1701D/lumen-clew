import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ScanModalProps {
  isOpen: boolean;
  onCancel: () => void;
  repoUrl: string;
  scanMode: 'fast' | 'full';
}

const SCAN_STEPS = [
  { id: 'clone', emoji: '🚚', label: 'Cloning repository...' },
  { id: 'eslint', emoji: '🔍', label: 'Running code quality scan...' },
  { id: 'deps', emoji: '📦', label: 'Checking dependencies...' },
  { id: 'secrets', emoji: '🗝️', label: 'Scanning for secrets...' },
  { id: 'insights', emoji: '🧠', label: 'Generating insights...' },
];

export function ScanModal({ isOpen, onCancel, repoUrl }: ScanModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Simulate progress
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      const interval = setInterval(() => {
        setCurrentStep(prev => prev < SCAN_STEPS.length ? prev + 1 : prev);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  const getRepoName = () => {
    try {
      const url = new URL(repoUrl);
      return url.pathname.slice(1);
    } catch {
      return repoUrl;
    }
  };

  const getStatusIcon = (index: number) => {
    if (index < currentStep - 1) return '✅';
    if (index === currentStep - 1) return '⏳';
    return '⏺️';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="bg-cream border-4 border-navy shadow-craft-lg p-8 max-w-lg [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="text-center mb-8">
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-navy mb-2">
              Scanning Your Repository
            </h2>
            <p className="text-navy/60 italic">
              Estimated time: 30-60 seconds
            </p>
          </div>

          <div className="space-y-1">
            {SCAN_STEPS.map((step, index) => {
              const isActive = index === currentStep - 1;
              const isComplete = index < currentStep - 1;
              const isPending = index > currentStep - 1;
              
              return (
                <div
                  key={step.id}
                  className={`py-3 px-4 -mx-4 border-b border-navy/10 ${
                    isActive ? 'bg-amber/10 border-b-2 border-amber' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl w-8 flex-shrink-0">
                      {getStatusIcon(index)}
                    </span>
                    <div className="flex-1">
                      <p className={`font-medium ${isPending ? 'text-navy/40' : 'text-navy'}`}>
                        <span className="mr-2">{step.emoji}</span>
                        {step.label}
                      </p>
                      {index === 0 && (isActive || isComplete) && (
                        <p className="text-sm text-navy/50 font-mono mt-1">
                          {getRepoName()}
                        </p>
                      )}
                      {index === 1 && isActive && (
                        <p className="text-sm text-navy/50 font-mono mt-1">
                          ESLint analyzing files
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleCancelClick}
              className="text-navy/60 hover:text-navy uppercase tracking-widest text-sm font-medium transition-colors"
            >
              Cancel Scan
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="bg-cream border-4 border-navy">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline uppercase">Cancel Scan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? You can start a new scan anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-navy/20">
              Continue Scanning
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-navy text-cream hover:bg-navy/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
