import {z} from 'zod';

import type {LevelProperties} from '@code-dot-org/core/api';

import {LevelKindSchema} from './schema';

export type StandaloneVideoLevelSubProperties = z.infer<typeof LevelKindSchema>;

export type StandaloneVideoLevelProperties = LevelProperties<StandaloneVideoLevelSubProperties>;
