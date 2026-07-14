import {z} from 'zod';

import {registerLevelKindSchema} from '@code-dot-org/core/api';

// AI-for-Oceans (`fish`) levels carry a per-level `mode`; standalone-video
// levels carry a `displayName`. The base LevelPropertiesBaseSchema strips
// unknown keys, so without a registered kind schema these fields never reach
// the lab. Register them here and import this module eagerly from the course
// route — the lazily-loaded lab chunk registers too late, after the loader has
// already fetched and parsed level properties.
// `mode` and `guides` are both per-level fields in the legacy lab
// (apps/src/fish/Fish.js: `const {mode, guides} = this.level`), fed to
// @code-dot-org/ml-activities. Register both so they survive the parse.
registerLevelKindSchema(
  'fish',
  z.object({mode: z.string().optional(), guides: z.string().optional()}),
);
registerLevelKindSchema(
  'standalone_video',
  z.object({displayName: z.string().optional()}),
);
