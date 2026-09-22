import {z} from 'zod';

import {LevelProperties} from '../lab2/types';

import {pathwaySchema} from './schema';

export type Pathway = z.infer<typeof pathwaySchema>;
export type Checkpoint = Pathway['checkpoints'][number];
export type Step = Checkpoint['steps'][number];
export type LabStep = Extract<Step, {kind: 'lab'}>;
export type Skill = Pathway['skills'][string];
export type Ability = Pathway['abilities'][string];
export type AbilityGrant = NonNullable<Ability['grants']>;

export interface AdaptiveLevelProperties extends LevelProperties {
  adaptiveId?: string;
  /** Adaptive pathway content. */
  pathway?: Pathway;
}
