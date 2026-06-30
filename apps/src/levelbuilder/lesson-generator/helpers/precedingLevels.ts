import {LevelProperties, MultiFileSource} from '@cdo/apps/lab2/types';
import {Panel, PanelsLevelProperties} from '@cdo/apps/panels/types';

import {AilabGeneration} from '../ai/ailab';
import {Weblab2Generation} from '../ai/weblab2';
import {LabType} from '../types';

// Per-LabType payload shapes captured during a single Generate run.
// One entry per supported lab; PriorOutput then narrows to "at most
// one" of these via Partial. Keep this in sync with SUPPORTED_LAB_TYPES
// — the call sites that build a PriorOutput are typed against
// LabType, so adding a lab fails to compile until you add the row.
export interface PriorOutputByLab {
  panels: Panel[];
  weblab2: Weblab2Generation;
  ailab: AilabGeneration;
}

// Per-spec content captured during a single Generate run, so each level we
// process can be told what came before it. Exactly one lab key is
// populated per entry (the one matching the spec's labType).
export type PriorOutput = Partial<PriorOutputByLab>;

export interface PriorEntry {
  position: number;
  name: string;
  labType: string;
  description: string;
  output?: PriorOutput;
}

// Adapt the camelCased level properties returned by /lessons/:id/level_properties
// to the same PriorOutput shape we use for content we just generated. This
// lets the continuity context for skipped levels match what we'd send for
// regenerated ones, so the AI sees a uniform record.
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
  if (labType === 'weblab2') {
    // Weblab2 stores starter sources as MultiFileSource (per the
    // ProjectSources | MultiFileSource union on LevelProperties).
    const startSources = props.startSources as MultiFileSource | undefined;
    const longInstructions = props.longInstructions || '';
    const files = startSources?.files
      ? Object.values(startSources.files).map(f => ({
          name: f.name,
          contents: f.contents,
        }))
      : [];
    if (files.length === 0 && !longInstructions) return undefined;
    return {
      weblab2: {
        startSources: startSources || {folders: {}, files: {}},
        longInstructions,
        files,
      },
    };
  }
  if (labType === 'ailab') {
    // The ailab editor stores mode and dynamic_instructions as JSON
    // strings (or untouched when read back through summarize_for_lab2_properties).
    // Read the dataset id and visible-screen list defensively so a hand-
    // edited level still produces a usable summary.
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
    if (e.output?.weblab2) {
      lines.push('  Files:');
      for (const f of e.output.weblab2.files) {
        lines.push(`    ${f.name}:`);
        for (const line of f.contents.split('\n')) {
          lines.push(`      ${line}`);
        }
      }
      lines.push('  Instructions:');
      for (const line of e.output.weblab2.longInstructions.split('\n')) {
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
    return lines.join('\n');
  });
  return blocks.join('\n\n');
}
