// The per-lab slice of LevelProperties that lesson content may carry
// (LabStep.levelProperties) and that the content generators may emit.
//
// Two exports per concern, both keyed by lab type so new labs add one
// entry here and every generator picks it up:
// - generatedLevelPropertyFields(): zod fields spliced into a
//   generator's flat step schema (structured-output models handle flat
//   fields better than nested objects).
// - coerceGeneratedLevelProperties(): the allowlist that turns hostile
//   model output into a valid slice — unknown keys and out-of-enum
//   values are dropped, and undefined means "nothing valid".

import z from 'zod/v3';

import {ProjectLabType} from './types';

const WEBLAB2_VIEW_MODES = ['split', 'code', 'preview'] as const;

export function generatedLevelPropertyFields(labType: ProjectLabType): {
  [field: string]: z.ZodTypeAny;
} {
  if (labType === 'weblab2') {
    return {
      initialViewMode: z
        .enum(WEBLAB2_VIEW_MODES)
        .optional()
        .describe(
          'lab steps: which view Web Lab 2 opens in. "preview" (the default choice) for prompt-driven steps judged by the rendered page; "split" only when the step is specifically about reading or editing code (debugging, hand-written JavaScript).'
        ),
    };
  }
  return {};
}

export function coerceGeneratedLevelProperties(
  labType: ProjectLabType,
  raw: {[key: string]: unknown}
): {[key: string]: unknown} | undefined {
  const slice: {[key: string]: unknown} = {};
  if (labType === 'weblab2') {
    if (
      (WEBLAB2_VIEW_MODES as readonly string[]).includes(
        raw.initialViewMode as string
      )
    ) {
      slice.initialViewMode = raw.initialViewMode;
    }
  }
  return Object.keys(slice).length > 0 ? slice : undefined;
}
