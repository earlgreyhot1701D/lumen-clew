import { useState } from 'react';
import { ScanReport, TranslatedFinding, PanelResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Code2, Package, KeyRound, Accessibility, ChevronLeft, Clock, FileCode } from 'lucide-react';

interface ScanResultsProps {
  report: ScanReport;
  onNewScan: () => void;
}

const PANEL_CONFIG = {
  codeQuality: {
    title: 'Code Quality',
    icon: Code2,
    description: 'ESLint analysis results',
  },
  dependencies: {
    title: 'Dependencies',
    icon: Package,
    description: 'npm audit findings',
  },
  secrets: {
    title: 'Secrets',
    icon: KeyRound,
    description: 'Potential exposed credentials',
  },
  accessibility: {
    title: 'Accessibility',
    icon: Accessibility,
    description: 'A11y best practices',
  },
};

const IMPORTANCE_STYLES = {
  fyi: 'bg-warm-gray-200 text-warm-gray-700',
  note: 'bg-sage/20 text-sage',
  explore: 'bg-amber/20 text-amber',
  important: 'bg-destructive/20 text-destructive',
};

function FindingCard({ finding }: { finding: TranslatedFinding }) {
  return (
    <AccordionItem value={finding.id} className="border-b border-border last:border-0">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-start gap-3 text-left">
          <Badge className={IMPORTANCE_STYLES[finding.importance]}>
            {finding.importance}
          </Badge>
          <span className="text-sm text-foreground">{finding.plainLanguage}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-4 pl-4 border-l-2 border-amber/30">
          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">Context</h4>
            <p className="text-sm text-foreground">{finding.context}</p>
          </div>
          
          {finding.commonApproaches && finding.commonApproaches.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">Common Approaches</h4>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {finding.commonApproaches.map((approach, i) => (
                  <li key={i}>{approach}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">Reflection</h4>
            <p className="text-sm text-muted-foreground italic">{finding.reflection}</p>
          </div>

          {finding.staticAnalysisNote && (
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {finding.staticAnalysisNote}
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Panel({ panelKey, panelResult }: { panelKey: keyof typeof PANEL_CONFIG; panelResult: PanelResult }) {
  const config = PANEL_CONFIG[panelKey];
  const Icon = config.icon;
  const hasFindings = panelResult.findings.length > 0;

  return (
    <Card className="bg-card border-border shadow-craft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy/10 rounded flex items-center justify-center">
              <Icon className="w-4 h-4 text-navy" />
            </div>
            <CardTitle className="font-headline text-lg uppercase tracking-wide">
              {config.title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono">
            {panelResult.findingCount}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </CardHeader>
      <CardContent>
        {hasFindings ? (
          <Accordion type="single" collapsible className="w-full">
            {panelResult.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </Accordion>
        ) : (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-sage/10 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-sage" />
            </div>
            <p className="text-sm text-muted-foreground">No findings in this category</p>
            <p className="text-xs text-muted-foreground mt-1">Looking good!</p>
          </div>
        )}
        
        {panelResult.status === 'partial' && panelResult.statusReason && (
          <p className="mt-4 text-xs text-muted-foreground bg-muted p-2 rounded">
            Note: {panelResult.statusReason}
            {panelResult.errorMessage && ` - ${panelResult.errorMessage}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ScanResults({ report, onNewScan }: ScanResultsProps) {
  // Extract repo name from URL
  const repoName = report.repoUrl.split('/').slice(-2).join('/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={onNewScan}
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            New Scan
          </Button>
          <h1 className="font-headline text-3xl font-bold uppercase tracking-wide text-navy">
            Scan Results
          </h1>
          <p className="font-mono text-sm text-muted-foreground">{repoName}</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.round(report.scanDuration / 1000)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <FileCode className="w-4 h-4" />
            <span>{report.scanScope.filesScanned} files</span>
          </div>
          <Badge variant={report.status === 'success' ? 'default' : 'secondary'}>
            {report.scanMode} scan
          </Badge>
        </div>
      </div>

      {/* Orientation Note */}
      {report.orientationNote && (
        <Card className="bg-amber/10 border-amber/30">
          <CardContent className="py-4">
            <p className="text-sm text-foreground">{report.orientationNote}</p>
          </CardContent>
        </Card>
      )}

      {/* 4-Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel panelKey="codeQuality" panelResult={report.panels.codeQuality} />
        <Panel panelKey="dependencies" panelResult={report.panels.dependencies} />
        <Panel panelKey="secrets" panelResult={report.panels.secrets} />
        <Panel panelKey="accessibility" panelResult={report.panels.accessibility} />
      </div>

      {/* Partial Status Warning */}
      {report.status === 'partial' && report.partialReasons && (
        <Card className="border-amber/50 bg-amber/5">
          <CardContent className="py-4">
            <h3 className="font-medium text-foreground mb-2">Some results may be incomplete</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {report.partialReasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}