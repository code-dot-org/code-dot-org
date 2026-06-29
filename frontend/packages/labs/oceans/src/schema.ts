import {z} from 'zod';

import {LevelPropertiesBaseSchema} from '@code-dot-org/core/api';
import type {LevelProperties} from '@code-dot-org/core/api';

import type {AppModeValue} from './oceans/constants';

/**
 * Oceans-specific level properties, on top of the shared base fields.
 *
 * AI for Oceans is not a project-backed lab: it carries no sources, only the
 * activity configuration the curriculum author chose. `appMode` selects which
 * activity runs (see `AppMode`), `guides` selects the on-screen guide sequence,
 * and `textToSpeechLocale` drives narration.
 */
export const OceansLevelPropertiesSchema = z.object({
  // AppMode values are plain strings (the AppMode map is not `as const`), so we
  // validate shape, not the specific enum, here.
  appMode: z.string().optional(),
  guides: z.string().optional(),
  textToSpeechLocale: z.string().optional(),
});

/**
 * The zod schema registered for the `oceans` level kind. A merge (not a union)
 * with the base fields: zod objects drop unknown keys, so a union member would
 * silently strip the oceans-specific properties.
 */
export const LevelKindSchema = LevelPropertiesBaseSchema.extend(
  OceansLevelPropertiesSchema.shape,
);

/** Level properties as seen by the oceans lab. */
export type OceansLevelProperties = LevelProperties<{
  appMode?: AppModeValue;
  guides?: string;
  textToSpeechLocale?: string;
}>;

/**
 * Wire-format (pre-transform) oceans level properties — what a fixture or raw
 * API response provides. `.default()` fields are optional and nullable fields
 * carry `null`, matching `z.input`.
 */
export type OceansLevelPropertiesInput = z.input<typeof LevelKindSchema>;
