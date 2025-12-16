import { useState } from 'react';
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

const Index = () => {
  const { scanState, result, error, rateLimit, startScan, resetScan } = useScan();
  const { toast } = useToast();
  const [currentScanUrl, setCurrentScanUrl] = useState('');
  const [currentScanMode, setCurrentScanMode] = useState<'fast' | 'full'>('fast');

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

  const handleNewScan = () => {
    resetScan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show error toast when error state changes
  if (error && scanState === 'error') {
    toast({
      variant: 'destructive',
      title: 'Scan failed',
      description: error,
    });
  }

  // Show results view after successful scan
  if (scanState === 'success' && result) {
    return (
      <div className="p-4 md:p-8">
        <div className="wireframe-container">
          <Header onLogoClick={handleNewScan} />
          <ScanResults report={result} onNewScan={handleNewScan} />
          <Footer />
        </div>
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