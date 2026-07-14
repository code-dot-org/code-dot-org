import {z} from 'zod';

import {registerLevelKindSchema} from '@code-dot-org/core/api';

// Fish levels carry per-level `mode` and `guides`; standalone-video levels
// carry a `displayName`. The base LevelPropertiesBaseSchema strips unknown
// keys, so without a registered kind schema these fields never reach the lab.
// Register them here and import this module eagerly from the course route —
// the lazily-loaded lab chunk registers too late, after the loader has already
// fetched and parsed level properties.
registerLevelKindSchema(
  'fish',
  z.object({mode: z.string().optional(), guides: z.string().optional()}),
);
registerLevelKindSchema(
  'standalone_video',
  z.object({displayName: z.string().optional()}),
);
