import type {z} from 'zod';

import type {
  ExternalSceneRefSchema,
  ExternalScenesResponseSchema,
} from './spriteLab.schemata';

export type ExternalSceneRef = z.infer<typeof ExternalSceneRefSchema>;
export type ExternalScenesResponse = z.infer<
  typeof ExternalScenesResponseSchema
>;
