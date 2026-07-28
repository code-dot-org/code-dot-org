import {z} from 'zod';

import type {
  LevelProperties,
  LevelPropertiesInput,
} from '@code-dot-org/core/api';

import {LevelKindSchema} from './schema';

export type MusicLevelPropertiesExtension = z.infer<typeof LevelKindSchema>;
export type MusicLevelProperties =
  LevelProperties<MusicLevelPropertiesExtension>;

// Wire-format counterpart, for typing fixtures / raw API responses. See
// `LevelPropertiesInput` in core for the rationale.
export type MusicLevelPropertiesExtensionInput = z.input<
  typeof LevelKindSchema
>;
export type MusicLevelPropertiesInput =
  LevelPropertiesInput<MusicLevelPropertiesExtensionInput>;
