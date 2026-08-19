import {LevelProperties, MultiFileSource} from '@cdo/apps/lab2/types';
import {Panel, PanelsLevelProperties} from '@cdo/apps/panels/types';

import {AichatGeneration} from '../ai/aichat';
import {AilabGeneration} from '../ai/ailab';
import {MatchGeneration, MultiGeneration} from '../ai/assessments';
import {BubbleChoiceGeneration} from '../ai/bubbleChoice';
import {PythonlabGeneration} from '../ai/pythonlab';
import {SketchlabGeneration} from '../ai/sketchlab';
import {Weblab2Generation} from '../ai/weblab2';
import {LabType} from '../types';

// Keep in sync with SUPPORTED_LAB_TYPES; call sites are typed against
// LabType so a missing row is a compile error.
export interface PriorOutputByLab {
  panels: Panel[];
  weblab2: Weblab2Generation;
  pythonlab: PythonlabGeneration;
  ailab: AilabGeneration;
  aichat: AichatGeneration;
  sketchlab: SketchlabGeneration;
  multi: MultiGeneration;
  match: MatchGeneration;
  bubbleChoice: BubbleChoiceGeneration;
}

// Exactly one lab key is populated per entry (matching the spec's labType).
export type PriorOutput = Partial<PriorOutputByLab>;

export interface PriorEntry {
  position: number;
  name: string;
  labType: string;
  description: string;
  output?: PriorOutput;
}

// Adapts /lessons/:id/level_properties output to the PriorOutput shape,
// so skipped-and-existing levels feed continuity context the same way
// freshly generated ones do.
export function priorOutputFromLevelProperties(
  props: LevelProperties | undefined,
  labType: LabType
): PriorOutput | undefined {
  if (!props) return undefined;
  if (labType === 'panels') {
    const panels = (props as PanelsLevelProperties).panels;
    if (Array.isArray(panels) && panels.length > 0) {
      return {panels};
    }
    return undefined;
  }
  if (labType === 'weblab2' || labType === 'pythonlab') {
    const startSources = props.startSources as MultiFileSource | undefined;
    const longInstructions = props.longInstructions || '';
    const files = startSources?.files
      ? Object.values(startSources.files).map(f => ({
          name: f.name,
          contents: f.contents,
        }))
      : [];
    if (files.length === 0 && !longInstructions) return undefined;
    const generation = {
      startSources: startSources || {folders: {}, files: {}},
      longInstructions,
      files,
    };
    return labType === 'weblab2'
      ? {weblab2: generation}
      : {pythonlab: generation};
  }
  if (labType === 'multi' || labType === 'match') {
    const summary = formatAssessmentSummary(props, labType);
    if (!summary) return undefined;
    if (labType === 'multi') {
      return {
        multi: {
          dslText: '',
          summary,
          longInstructions:
            (props as {longInstructions?: string}).longInstructions || '',
        },
      };
    }
    return {
      match: {
        dslText: '',
        summary,
        longInstructions:
          (props as {longInstructions?: string}).longInstructions || '',
      },
    };
  }
  if (labType === 'aichat') {
    const longInstructions =
      (props as {longInstructions?: string}).longInstructions || '';
    const settings = (props as {aichatSettings?: unknown}).aichatSettings as
      | {
          initialCustomizations?: {systemPrompt?: string};
          hidePresentationPanel?: boolean;
          multimodalEnabled?: boolean;
        }
      | undefined;
    const systemPrompt =
      settings?.initialCustomizations?.systemPrompt?.replace(/\s+/g, ' ') || '';
    if (!longInstructions && !systemPrompt) return undefined;
    return {
      aichat: {
        longInstructions,
        aichatSettings: settings as never, // opaque, only the summary is used downstream
        summary: `system="${systemPrompt.slice(0, 120)}${
          systemPrompt.length > 120 ? '…' : ''
        }"`,
      },
    };
  }
  if (labType === 'sketchlab') {
    const longInstructions =
      (props as {longInstructions?: string}).longInstructions || '';
    if (!longInstructions) return undefined;
    return {sketchlab: {longInstructions}};
  }
  if (labType === 'ailab') {
    // Read mode + dynamic_instructions defensively — both round-trip
    // as JSON strings and may be hand-edited.
    const longInstructions =
      (props as {longInstructions?: string}).longInstructions || '';
    const rawMode = (props as {mode?: unknown}).mode;
    const mode = typeof rawMode === 'string' ? tryParseJson(rawMode) : rawMode;
    const dynamicRaw = (props as {dynamicInstructions?: unknown})
      .dynamicInstructions;
    const dynamic =
      typeof dynamicRaw === 'string' ? tryParseJson(dynamicRaw) : dynamicRaw;
    const datasetId =
      Array.isArray((mode as {datasets?: unknown[]})?.datasets) &&
      typeof (mode as {datasets: unknown[]}).datasets[0] === 'string'
        ? (mode as {datasets: string[]}).datasets[0]
        : '(unknown)';
    const visibleScreens =
      dynamic && typeof dynamic === 'object'
        ? Object.entries(dynamic as Record<string, unknown>)
            .filter(([, v]) => typeof v === 'string' && v.trim() !== '')
            .map(([k]) => k)
        : [];
    if (
      !longInstructions &&
      datasetId === '(unknown)' &&
      visibleScreens.length === 0
    ) {
      return undefined;
    }
    return {
      ailab: {
        longInstructions,
        mode:
          typeof rawMode === 'string' ? rawMode : JSON.stringify(mode ?? {}),
        dynamicInstructions:
          typeof dynamicRaw === 'string'
            ? dynamicRaw
            : JSON.stringify(dynamic ?? {}),
        summary: `dataset=${datasetId}; screens=${
          visibleScreens.join(',') || '(none)'
        }`,
      },
    };
  }
  return undefined;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// One-line summary from the camelCased multi/match properties.
// Multi extends Match; both use `questions`/`answers`/`markdown`, with
// Multi's answers carrying a `correct` flag.
function formatAssessmentSummary(
  props: LevelProperties,
  labType: 'multi' | 'match'
): string | null {
  const p = props as {
    markdown?: string;
    questions?: {text: string}[];
    answers?: {text: string; correct?: boolean}[];
  };
  const body = (p.markdown ?? p.questions?.[0]?.text ?? '').trim();
  if (labType === 'multi') {
    const right = p.answers?.find(a => a.correct)?.text ?? '(unknown)';
    if (!body && !p.answers?.length) return null;
    return `Multi — Q: ${body || '(missing question)'}; A: ${right}`;
  }
  const pairs = (p.questions || []).map((q, i) => ({
    q: q.text,
    a: p.answers?.[i]?.text ?? '',
  }));
  if (!pairs.length) return null;
  return `Match (${pairs.length} pairs): ${pairs
    .slice(0, 3)
    .map(({q, a}) => `${q} → ${a}`)
    .join('; ')}`;
}

// Render the running preceding-levels context as a plain-text block. Image
// URLs and binary data are deliberately left out — only the text content
// matters for continuity, and feeding image bytes to a text model is
// pointless waste. Caller responsibility to skip emitting a heading when
// this returns the empty string.
export function formatPrecedingLevels(entries: PriorEntry[]): string {
  if (entries.length === 0) return '';
  const blocks = entries.map(e => {
    const lines: string[] = [];
    lines.push(`Level ${e.position}: ${e.name} (${e.labType})`);
    if (e.description) {
      lines.push(`  Description: ${e.description}`);
    }
    if (e.output?.panels?.length) {
      lines.push('  Panels:');
      e.output.panels.forEach((p, i) => {
        lines.push(`    ${i + 1}. [${p.layout || 'default'}] ${p.text}`);
      });
    }
    const codebridge = e.output?.weblab2 ?? e.output?.pythonlab;
    if (codebridge) {
      lines.push('  Files:');
      for (const f of codebridge.files) {
        lines.push(`    ${f.name}:`);
        for (const line of f.contents.split('\n')) {
          lines.push(`      ${line}`);
        }
      }
      lines.push('  Instructions:');
      for (const line of codebridge.longInstructions.split('\n')) {
        lines.push(`    ${line}`);
      }
    }
    if (e.output?.ailab) {
      // ailab carries a structured summary string already; the per-screen
      // text is stub material the next level shouldn't try to extend.
      lines.push(`  Setup: ${e.output.ailab.summary}`);
      if (e.output.ailab.longInstructions) {
        lines.push('  Instructions:');
        for (const line of e.output.ailab.longInstructions.split('\n')) {
          lines.push(`    ${line}`);
        }
      }
    }
    if (e.output?.multi || e.output?.match) {
      // Assessment levels: just the summary line. Their content is
      // structured Q/A data — re-feeding the full DSL back into a
      // downstream level's prompt would either confuse the model or
      // tempt it to copy the question.
      const a = e.output.multi || e.output.match;
      if (a) lines.push(`  ${a.summary}`);
    }
    if (e.output?.bubbleChoice) {
      // Bubble choice's own copy is short prose; the sublevels'
      // per-lab content already appears elsewhere in the preceding-
      // levels block (each sublevel is generated as its own level).
      // Surface just the parent's summary so downstream levels know
      // the student was offered a choice here.
      lines.push(`  ${e.output.bubbleChoice.summary}`);
    }
    if (e.output?.sketchlab) {
      // The sketch canvas is intentionally blank; only the instructions
      // are worth propagating.
      lines.push('  Instructions:');
      for (const line of e.output.sketchlab.longInstructions.split('\n')) {
        lines.push(`    ${line}`);
      }
    }
    if (e.output?.aichat) {
      // aichat: a one-line summary of the bot's persona. The full
      // system prompt is the bot's behavior, not a thing for the next
      // level to imitate, so we don't propagate it.
      lines.push(`  Bot: ${e.output.aichat.summary}`);
      if (e.output.aichat.longInstructions) {
        lines.push('  Instructions:');
        for (const line of e.output.aichat.longInstructions.split('\n')) {
          lines.push(`    ${line}`);
        }
      }
    }
    return lines.join('\n');
  });
  return blocks.join('\n\n');
}
