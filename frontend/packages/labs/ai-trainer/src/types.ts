import {z} from 'zod';

import type {LevelProperties} from '@code-dot-org/core/api';

import {LevelKindSchema} from './schema';

export type AiTrainerLevelSubProperties = z.infer<typeof LevelKindSchema>;

export type AiTrainerLevelProperties = LevelProperties<AiTrainerLevelSubProperties>;
