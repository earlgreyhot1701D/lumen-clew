// @ts-nocheck
// BACKEND: copy to Render repo/server.js

import { RawFinding, TranslatedFinding, PanelTranslationResult } from '../lib/types';
import { CONFIG } from '../lib/config';

// Backend-compatible logger (Node.js, no Vite)
const logger = {
  debug(message: string, data?: unknown): void {
    if (process.env.DEBUG === 'true') {
      console.debug(`[LumenClew] DEBUG ${message}`, data ?? '');
    }
  },
  info(message: string, data?: unknown): void {
    console.info(`[LumenClew] INFO ${message}`, data ?? '');
  },
  warn(message: string, data?: unknown): void {
    console.warn(`[LumenClew] WARN ${message}`, data ?? '');
  },
  error(message: string, data?: unknown): void {
    console.error(`[LumenClew] ERROR ${message}`, data ?? '');
  },
};

type PanelType = 'code_quality' | 'dependencies' | 'secrets' | 'accessibility';
type Severity = 'low' | 'medium' | 'high' | 'critical';
type Importance = 'fyi' | 'note' | 'explore' | 'important';

/**
 * Maps backend severity levels to user-facing importance levels.
 * Deterministic code mapping - no LLM involvement.
 */
export function mapSeverityToImportance(severity: Severity): Importance {
  const mapping: Record<Severity, Importance> = {
    critical: 'important',
    high: 'explore',
    medium: 'note',
    low: 'fyi',
  };
  return mapping[severity] || 'note';
}

/**
 * Caps findings at maxCount, prioritizing by severity.
 * Critical > High > Medium > Low
 */
function capFindingsBySeverity(findings: RawFinding[], maxCount: number = CONFIG.MAX_FINDINGS_PER_PANEL): { capped: RawFinding[]; truncated: boolean; originalCount: number } {
  const originalCount = findings.length;
  if (findings.length <= maxCount) {
    return { capped: findings, truncated: false, originalCount };
  }

  const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low'];
  const sorted = [...findings].sort((a, b) => {
    return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
  });

  return {
    capped: sorted.slice(0, maxCount),
    truncated: true,
    originalCount,
  };
}

/**
 * Returns panel-specific system prompt for Claude.
 * Each prompt emphasizes awareness, not judgment.
 */
function getSystemPromptFor(panel: PanelType): string {
  const basePrompt = `You are a supportive code mentor helping developers understand their codebase. 
Your tone is warm, educational, and encouraging - like a senior developer guiding a colleague.
Never use shame, fear, or urgency. Focus on awareness and reflection, not directives.
Always acknowledge that static analysis has limitations and context matters.`;

  const panelPrompts: Record<PanelType, string> = {
    code_quality: `${basePrompt}

You're translating ESLint findings about code quality and maintainability.
Focus on:
- Why consistent patterns help teams collaborate
- How certain patterns might affect future maintenance
- The trade-offs between different approaches
Acknowledge that style choices are often team decisions, not universal truths.`,

    dependencies: `${basePrompt}

You're translating npm audit findings about dependency vulnerabilities.
Focus on:
- What the vulnerability means in plain language
- Whether it's likely to affect this specific project (many vulnerabilities require specific conditions)
- How dependency updates work and their trade-offs
Normalize that all projects have some vulnerabilities - it's about informed prioritization.`,

    secrets: `${basePrompt}

You're translating findings about potential secrets or credentials in code.
Focus on:
- What was detected and why it might be sensitive
- That false positives are common (test data, example values, etc.)
- General best practices for credential management
Remove any shame - accidental commits happen to everyone. Focus on awareness.`,

    accessibility: `${basePrompt}

You're translating accessibility findings from static analysis.
Focus on:
- Who might be affected and how
- The underlying accessibility principle
- That automated tools catch ~30% of issues - manual testing matters too
Add context that accessibility is a journey, not a checklist.`,
  };

  return panelPrompts[panel];
}

/**
 * Validates and normalizes a translated finding from Claude.
 * Returns null if validation fails.
 */
function validateTranslatedFinding(obj: unknown, originalId: string): TranslatedFinding | null {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  const finding = obj as Record<string, unknown>;

  // Required fields
  if (typeof finding.plainLanguage !== 'string' || !finding.plainLanguage.trim()) {
    return null;
  }
  if (typeof finding.context !== 'string' || !finding.context.trim()) {
    return null;
  }
  if (typeof finding.reflection !== 'string' || !finding.reflection.trim()) {
    return null;
  }

  // Validate importance
  const validImportance: Importance[] = ['fyi', 'note', 'explore', 'important'];
  const importance = validImportance.includes(finding.importance as Importance)
    ? (finding.importance as Importance)
    : 'note';

  // Validate panel
  const validPanels: PanelType[] = ['code_quality', 'dependencies', 'secrets', 'accessibility'];
  const panel = validPanels.includes(finding.panel as PanelType)
    ? (finding.panel as PanelType)
    : 'code_quality';

  // Trim long strings (max 500 chars each)
  const maxLen = 500;
  const trimString = (s: string) => s.length > maxLen ? s.slice(0, maxLen) + '...' : s;

  // Build validated finding
  const validated: TranslatedFinding = {
    id: originalId,
    panel,
    plainLanguage: trimString(finding.plainLanguage.trim()),
    context: trimString(finding.context.trim()),
    importance,
    reflection: trimString(finding.reflection.trim()),
  };

  // Optional fields
  if (Array.isArray(finding.commonApproaches)) {
    validated.commonApproaches = finding.commonApproaches
      .filter((a): a is string => typeof a === 'string')
      .slice(0, 5)
      .map(a => trimString(a.trim()));
  }

  if (typeof finding.staticAnalysisNote === 'string') {
    validated.staticAnalysisNote = trimString(finding.staticAnalysisNote.trim());
  }

  return validated;
}

/**
 * 3-tier JSON extraction from Claude response.
 * Tier 1: Direct JSON.parse
 * Tier 2: Extract array from text
 * Tier 3: Extract individual objects
 */
function parseClaudeResponse(text: string): unknown[] {
  // Tier 1: Direct parse
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object') {
      // Check for wrapped array
      if (Array.isArray(parsed.findings)) return parsed.findings;
      if (Array.isArray(parsed.translations)) return parsed.translations;
      if (Array.isArray(parsed.results)) return parsed.results;
      return [parsed];
    }
  } catch {
    // Continue to tier 2
  }

  // Tier 2: Extract array from text
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue to tier 3
    }
  }

  // Tier 3: Extract individual objects
  const objects: unknown[] = [];
  const objectRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  let match;
  while ((match = objectRegex.exec(text)) !== null) {
    try {
      objects.push(JSON.parse(match[0]));
    } catch {
      // Skip invalid objects
    }
  }

  return objects;
}

/**
 * Builds fallback translations when Claude fails.
 * Uses severity mapping and adds staticAnalysisNote.
 */
function buildFallback(rawFindings: RawFinding[], panel: PanelType, reason: string): TranslatedFinding[] {
  return rawFindings.map((raw) => ({
    id: raw.id,
    panel,
    plainLanguage: raw.message,
    context: `This finding was detected by automated analysis${raw.file ? ` in ${raw.file}` : ''}.`,
    importance: mapSeverityToImportance(raw.severity),
    reflection: 'Consider reviewing this in the context of your specific project needs.',
    staticAnalysisNote: `Translation unavailable (${reason}). Showing original finding.`,
  }));
}

/**
 * Translates a single panel's findings using Claude.
 * Includes timeout handling via AbortController.
 */
export async function translatePanel(
  panel: PanelType,
  rawFindings: RawFinding[]
): Promise<PanelTranslationResult> {
  // Handle empty findings
  if (!rawFindings || rawFindings.length === 0) {
    logger.debug(`No findings to translate for ${panel}`);
    return {
      panel,
      findings: [],
      status: 'success',
      originalCount: 0,
      translatedCount: 0,
    };
  }

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    logger.error(`Missing ANTHROPIC_API_KEY for ${panel} translation`);
    return {
      panel,
      findings: buildFallback(rawFindings, panel, 'MISSING_API_KEY'),
      status: 'failed',
      statusReason: 'MISSING_API_KEY',
      originalCount: rawFindings.length,
      translatedCount: 0,
    };
  }

  // Cap findings
  const { capped, truncated, originalCount } = capFindingsBySeverity(rawFindings);

  // Build prompt
  const systemPrompt = getSystemPromptFor(panel);
  const userPrompt = `Translate these ${panel} findings into warm, educational language.

For each finding, return a JSON object with:
- plainLanguage: A clear, jargon-free explanation (1-2 sentences)
- context: Why this matters and what it might affect
- importance: One of "fyi", "note", "explore", or "important"
- reflection: A thoughtful question or consideration for the developer
- commonApproaches: (optional) Array of 2-3 common ways teams handle this
- staticAnalysisNote: (optional) Limitations of automated detection

Return a JSON array of translated findings.

Findings to translate:
${JSON.stringify(capped, null, 2)}`;

  // Setup timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.FAST_SCAN.claudeTranslationTimeoutMs);

  try {
    logger.info(`Translating ${capped.length} findings for ${panel}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CONFIG.CLAUDE_MODEL,
        max_tokens: CONFIG.CLAUDE_MAX_TOKENS,
        messages: [
          { role: 'user', content: userPrompt },
        ],
        system: systemPrompt,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.error(`Claude API error for ${panel}: ${response.status}`, errorText);
      return {
        panel,
        findings: buildFallback(capped, panel, 'CLAUDE_API_ERROR'),
        status: 'failed',
        statusReason: 'CLAUDE_API_ERROR',
        truncated,
        originalCount,
        translatedCount: 0,
      };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    if (!content) {
      logger.warn(`Empty response from Claude for ${panel}`);
      return {
        panel,
        findings: buildFallback(capped, panel, 'EMPTY_RESPONSE'),
        status: 'failed',
        statusReason: 'EMPTY_RESPONSE',
        truncated,
        originalCount,
        translatedCount: 0,
      };
    }

    // Parse and validate
    const parsed = parseClaudeResponse(content);
    const translated: TranslatedFinding[] = [];

    for (let i = 0; i < capped.length; i++) {
      const rawFinding = capped[i];
      const parsedObj = parsed[i];
      const validated = validateTranslatedFinding(parsedObj, rawFinding.id);

      if (validated) {
        validated.panel = panel; // Ensure panel is correct
        validated.importance = mapSeverityToImportance(rawFinding.severity); // Use code mapping
        translated.push(validated);
      } else {
        // Individual fallback
        translated.push({
          id: rawFinding.id,
          panel,
          plainLanguage: rawFinding.message,
          context: `This finding was detected by automated analysis${rawFinding.file ? ` in ${rawFinding.file}` : ''}.`,
          importance: mapSeverityToImportance(rawFinding.severity),
          reflection: 'Consider reviewing this in the context of your specific project needs.',
          staticAnalysisNote: 'Partial translation - showing original finding.',
        });
      }
    }

    const translatedCount = translated.filter(t => !t.staticAnalysisNote?.includes('Partial translation')).length;
    const status = translatedCount === capped.length ? 'success' : translatedCount > 0 ? 'partial' : 'failed';

    logger.info(`Translated ${translatedCount}/${capped.length} findings for ${panel}`);

    return {
      panel,
      findings: translated,
      status,
      statusReason: status !== 'success' ? 'partial_parse' : undefined,
      truncated,
      originalCount,
      translatedCount,
    };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      logger.error(`Claude API timeout for ${panel}`);
      return {
        panel,
        findings: buildFallback(capped, panel, 'CLAUDE_TIMEOUT'),
        status: 'failed',
        statusReason: 'CLAUDE_TIMEOUT',
        truncated,
        originalCount,
        translatedCount: 0,
      };
    }

    logger.error(`Unexpected error translating ${panel}`, error);
    return {
      panel,
      findings: buildFallback(capped, panel, 'UNEXPECTED_ERROR'),
      status: 'failed',
      statusReason: 'UNEXPECTED_ERROR',
      truncated,
      originalCount,
      translatedCount: 0,
    };
  }
}

/**
 * Translates all panels in parallel using Promise.all.
 */
export async function translateAllPanels(
  panelsMap: Map<PanelType, RawFinding[]>
): Promise<Map<PanelType, PanelTranslationResult>> {
  const panels: PanelType[] = ['code_quality', 'dependencies', 'secrets', 'accessibility'];

  logger.info('Starting parallel translation for all panels');

  const results = await Promise.all(
    panels.map(async (panel) => {
      const findings = panelsMap.get(panel) || [];
      const result = await translatePanel(panel, findings);
      return { panel, result };
    })
  );

  const resultsMap = new Map<PanelType, PanelTranslationResult>();
  for (const { panel, result } of results) {
    resultsMap.set(panel, result);
  }

  logger.info('Completed parallel translation for all panels');

  return resultsMap;
}
