import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ScanModalProps {
  isOpen: boolean;
  onCancel: () => void;
  repoUrl: string;
  scanMode: 'fast' | 'full';
}

const SCAN_STEPS = [
  { id: 'clone', label: 'Cloning repository' },
  { id: 'eslint', label: 'Running ESLint analysis' },
  { id: 'npm', label: 'Checking npm dependencies' },
  { id: 'secrets', label: 'Scanning for secrets' },
  { id: 'a11y', label: 'Analyzing accessibility' },
  { id: 'translate', label: 'Translating findings' },
];

export function ScanModal({ isOpen, onCancel, repoUrl, scanMode }: ScanModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Simulate progress - in reality, backend doesn't provide real-time updates
  // We show a generic "scanning" state with all steps pending
  const currentStep = 0; // Backend processes all at once, so we just show loading

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  const getStepStatus = (index: number) => {
    // Since backend doesn't provide real-time progress, show all as in-progress
    if (index === 0) return 'in-progress';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-sage" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-amber animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-warm-gray-400" />;
    }
  };

  // Extract repo name from URL
  const repoName = repoUrl.split('/').slice(-2).join('/');

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="bg-navy text-cream border-none sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl font-bold uppercase tracking-wide text-cream">
              Scanning Repository
            </DialogTitle>
            <DialogDescription className="text-warm-gray-400">
              <span className="font-mono text-sm">{repoName}</span>
              <span className="ml-2 text-xs uppercase">({scanMode} scan)</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-3">
            {SCAN_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    status === 'in-progress' 
                      ? 'bg-amber/10 border border-amber/30' 
                      : 'bg-transparent'
                  }`}
                >
                  {getStepIcon(status)}
                  <span className={`text-sm ${
                    status === 'in-progress' 
                      ? 'text-cream font-medium' 
                      : 'text-warm-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={handleCancelClick}
              className="border-warm-gray-600 text-warm-gray-400 hover:bg-warm-gray-800 hover:text-cream"
            >
              Cancel Scan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline uppercase">Cancel Scan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the current scan. You can start a new scan at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Scanning</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground">
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}