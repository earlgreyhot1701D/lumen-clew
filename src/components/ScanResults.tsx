import { useState } from 'react';
import { ScanReport, TranslatedFinding } from '@/lib/types';

interface ScanResultsProps {
  report: ScanReport;
  onNewScan: () => void;
}

const PANEL_CONFIG = {
  code_quality: { 
    emoji: '🔍', 
    title: 'Code Quality', 
    tool: 'ESLint',
    reflection: "What's your maintenance timeline?"
  },
  dependencies: { 
    emoji: '📦', 
    title: 'Dependency Health', 
    tool: 'npm audit',
    reflection: 'Is this project going to production soon?'
  },
  secrets: { 
    emoji: '🗝️', 
    title: 'Secrets & Config', 
    tool: 'Patterns',
    reflection: 'Is this repo public or private?'
  },
  accessibility: { 
    emoji: '♿', 
    title: 'Accessibility', 
    tool: 'AI Scan',
    reflection: 'Who are your users?'
  },
};

const IMPORTANCE_COLORS: Record<string, string> = {
  important: 'bg-red-100 text-red-800 border-red-200',
  explore: 'bg-amber-100 text-amber-800 border-amber-200',
  note: 'bg-blue-100 text-blue-800 border-blue-200',
  fyi: 'bg-gray-100 text-gray-600 border-gray-200',
};

function FindingCard({ finding }: { finding: TranslatedFinding }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <details 
      className="bg-white border-2 border-navy/10"
      open={isOpen}
      onClick={(e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
      }}
    >
      <summary className="flex items-center gap-3 p-3 cursor-pointer list-none">
        <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>
        <span className="flex-1 text-navy">{finding.plainLanguage}</span>
        <span className={`text-xs px-2 py-1 border uppercase tracking-wider ${IMPORTANCE_COLORS[finding.importance] || IMPORTANCE_COLORS.fyi}`}>
          {finding.importance}
        </span>
      </summary>
      <div className="px-3 pb-3 text-sm text-navy/70 space-y-2">
        {finding.context && <p>{finding.context}</p>}
        {finding.commonApproaches && (
          <p><strong>Common approaches:</strong> {finding.commonApproaches}</p>
        )}
      </div>
    </details>
  );
}

function Panel({ 
  panelKey, 
  findings 
}: { 
  panelKey: string;
  findings: TranslatedFinding[];
}) {
  const config = PANEL_CONFIG[panelKey as keyof typeof PANEL_CONFIG];
  if (!config) return null;
  const hasFindings = findings.length > 0;
  
  return (
    <div className="craftsman-card p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-navy/10">
        <span className="text-2xl">{config.emoji}</span>
        <h3 className="flex-1 font-headline font-bold uppercase tracking-wide text-navy">
          {config.title}
        </h3>
        <span className="text-xs text-navy/40 uppercase tracking-wider">
          {config.tool}
        </span>
      </div>
      
      {hasFindings ? (
        <>
          <p className="text-sm text-navy/60 mb-4">
            Issues found: {findings.length}
          </p>
          <div className="space-y-2 mb-4">
            {findings.map((finding, idx) => (
              <FindingCard key={idx} finding={finding} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-green-700 font-medium">No issues found</p>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t-2 border-dashed border-navy/10">
        <p className="text-sm text-navy/50 italic">
          Reflection: {config.reflection}
        </p>
      </div>
    </div>
  );
}

export function ScanResults({ report, onNewScan }: ScanResultsProps) {
  const getRepoName = () => {
    try {
      const url = new URL(report.repoUrl);
      return url.pathname.slice(1);
    } catch {
      return report.repoUrl;
    }
  };

  return (
    <div>
      {/* Navy Banner */}
      <div className="bg-navy py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-amber/30 flex-1 max-w-24" />
            <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tight text-amber text-center">
              Your Scan Results
            </h1>
            <div className="h-px bg-amber/30 flex-1 max-w-24" />
          </div>
        </div>
      </div>
      
      {/* Info Callout */}
      <div className="bg-cream py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white border-l-4 border-amber p-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h2 className="font-headline font-bold uppercase tracking-wide text-navy mb-2">
                  Understanding Your Results
                </h2>
                <p className="text-navy/70">
                  We translate findings from standard tools. <strong>This is awareness, not direction.</strong> Use your context to make decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Grid */}
      <div className="bg-cream py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <Panel panelKey="code_quality" findings={report.panels.codeQuality.findings} />
            <Panel panelKey="dependencies" findings={report.panels.dependencies.findings} />
            <Panel panelKey="secrets" findings={report.panels.secrets.findings} />
            <Panel panelKey="accessibility" findings={report.panels.accessibility.findings} />
          </div>
          
          {/* Roadmap */}
          <div className="max-w-5xl mx-auto mt-12">
            <h3 className="font-headline font-bold uppercase tracking-wide text-navy/40 text-center mb-6">
              Roadmap: Coming Soon
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-navy/30">
              <div className="p-4 border-2 border-dashed border-navy/10">
                🐍 Python Support
              </div>
              <div className="p-4 border-2 border-dashed border-navy/10">
                📊 Trend Analysis
              </div>
              <div className="p-4 border-2 border-dashed border-navy/10">
                🔗 CI Integration
              </div>
              <div className="p-4 border-2 border-dashed border-navy/10">
                📁 Private Repos
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="max-w-5xl mx-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNewScan}
              className="px-8 py-4 bg-amber text-navy font-headline font-bold uppercase tracking-wide hover:bg-amber/90 transition-colors shadow-craft"
            >
              🚀 Run Another Scan
            </button>
            <button
              className="px-8 py-4 border-3 border-navy/20 text-navy/60 font-headline font-bold uppercase tracking-wide hover:border-navy/40 transition-colors"
            >
              ⬇ Download Report (Markdown)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
