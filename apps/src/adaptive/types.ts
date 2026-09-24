import {z} from 'zod';

import {LevelProperties} from '../lab2/types';

import {pathwaySchema} from './schema';

export type Pathway = z.infer<typeof pathwaySchema>;

export interface AdaptiveLevelProperties extends LevelProperties {
  adaptiveId?: string;
  /** Adaptive pathway content. */
  pathway?: Pathway;
}
