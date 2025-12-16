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

interface ConfirmNewScanDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmNewScanDialog({ isOpen, onCancel, onConfirm }: ConfirmNewScanDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-cream border-3 border-navy">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-navy text-2xl">
            Start a New Scan?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-navy/70">
            Your current results will be cleared. Results are not stored between sessions.
            <span className="block mt-2 text-amber font-medium">
              💡 Use the "Download Report" button to save your results first.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onCancel}
            className="border-2 border-navy text-navy hover:bg-navy/10"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-amber text-navy font-bold hover:bg-amber/90"
          >
            Start New Scan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
