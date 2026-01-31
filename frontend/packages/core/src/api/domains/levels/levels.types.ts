import {z} from 'zod';
import {LevelPropertiesBaseSchema} from './levels.schemata';

// The inferred base type
export type LevelPropertiesBase = z.infer<typeof LevelPropertiesBaseSchema>;

export type LevelProperties<
  T extends Record<string, unknown> = Record<string, unknown>,
> = LevelPropertiesBase & T;
