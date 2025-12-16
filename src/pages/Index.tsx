import { useState, useEffect, useRef } from 'react';
import { useScan } from '@/hooks/useScan';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorks } from '@/components/HowItWorks';
import { WhatWeCheck } from '@/components/WhatWeCheck';
import { ScopeSection } from '@/components/ScopeSection';
import { HelpSection } from '@/components/HelpSection';
import { Footer } from '@/components/Footer';
import { ScanModal } from '@/components/ScanModal';
import { ScanResults } from '@/components/ScanResults';
import { ConfirmNewScanDialog } from '@/components/ConfirmNewScanDialog';

const Index = () => {
  const { scanState, result, error, rateLimit, startScan, resetScan } = useScan();
  const { toast } = useToast();
  const [currentScanUrl, setCurrentScanUrl] = useState('');
  const [currentScanMode, setCurrentScanMode] = useState<'fast' | 'full'>('fast');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartScan = async (repoUrl: string, scanMode: 'fast' | 'full') => {
    setCurrentScanUrl(repoUrl);
    setCurrentScanMode(scanMode);
    await startScan(repoUrl, scanMode);
  };

  const handleCancelScan = () => {
    resetScan();
    toast({
      title: 'Scan cancelled',
      description: 'You can start a new scan at any time.',
    });
  };

  // Show confirmation dialog before resetting (when on results page)
  const handleNewScan = () => {
    if (scanState === 'success' && result) {
      setShowConfirmDialog(true);
    } else {
      // If not on results page, just reset directly
      resetScan();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Actually perform the reset after confirmation
  const confirmNewScan = () => {
    setShowConfirmDialog(false);
    resetScan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus the input after scroll animation
    setTimeout(() => inputRef.current?.focus(), 500);
  };

  // Show error toast when error state changes
  useEffect(() => {
    if (error && scanState === 'error') {
      toast({
        variant: 'destructive',
        title: 'Scan failed',
        description: error,
      });
    }
  }, [error, scanState, toast]);

  // Show results view after successful scan
  if (scanState === 'success' && result) {
    return (
      <div className="p-4 md:p-8">
        <div className="wireframe-container">
          <Header onLogoClick={handleNewScan} onNewScan={handleNewScan} showNewScanButton />
          <ScanResults report={result} onNewScan={handleNewScan} />
          <Footer />
        </div>
        <ConfirmNewScanDialog
          isOpen={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={confirmNewScan}
        />
      </div>
    );
  }

  // Show landing page with scan form
  return (
    <div className="p-4 md:p-8">
      <div className="wireframe-container">
        <Header />
        <main>
          <HeroSection
            onSubmit={handleStartScan}
            isLoading={scanState === 'scanning'}
            rateLimit={rateLimit}
            inputRef={inputRef}
          />
          <HowItWorks />
          <WhatWeCheck />
          <ScopeSection />
          <ScanResults previewMode onNewScan={handleNewScan} />
          <HelpSection />
        </main>
        <Footer />

        <ScanModal
          isOpen={scanState === 'scanning'}
          onCancel={handleCancelScan}
          repoUrl={currentScanUrl}
          scanMode={currentScanMode}
        />
      </div>
    </div>
  );
};

export default Index;