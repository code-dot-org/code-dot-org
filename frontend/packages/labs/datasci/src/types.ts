import {z} from 'zod';

import type {LevelProperties} from '@code-dot-org/core/api';

import {LevelKindSchema} from './schema';

export type DatasciLevelSubProperties = z.infer<typeof LevelKindSchema>;

export type DatasciLevelProperties = LevelProperties<DatasciLevelSubProperties>;

/** One row of the student survey sample dataset. */
export interface DatasciRow {
  id: number;
  name: string;
  grade: 3 | 4 | 5;
  score: number;
  hobby: 'art' | 'sports' | 'music' | 'coding';
}

/** What an executed Blockly program produces — a list of result lines. */
export interface DatasciResult {
  label: string;
  value: string;
}
