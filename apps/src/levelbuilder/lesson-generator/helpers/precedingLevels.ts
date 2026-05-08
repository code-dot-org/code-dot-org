import {LevelProperties, MultiFileSource} from '@cdo/apps/lab2/types';
import {Panel, PanelsLevelProperties} from '@cdo/apps/panels/types';

import {Weblab2Generation} from '../ai/weblab2';
import {LabType} from '../types';

// Per-spec content captured during a single Generate run, so each level we
// process can be told what came before it.
export interface PriorOutput {
  panels?: Panel[];
  weblab2?: Weblab2Generation;
}

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
  return undefined;
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
    return lines.join('\n');
  });
  return blocks.join('\n\n');
}
