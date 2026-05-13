import type {DatasciRow} from './types';

/**
 * Hardcoded sample dataset for the prototype — eight students, four columns.
 * Small enough to fit on screen, varied enough that count/filter/average all
 * return distinct answers.
 */
export const SAMPLE_DATASET: DatasciRow[] = [
  {id: 1, name: 'Ava', grade: 3, score: 85, hobby: 'art'},
  {id: 2, name: 'Ben', grade: 4, score: 92, hobby: 'sports'},
  {id: 3, name: 'Cleo', grade: 3, score: 78, hobby: 'music'},
  {id: 4, name: 'Diego', grade: 5, score: 88, hobby: 'coding'},
  {id: 5, name: 'Esme', grade: 4, score: 95, hobby: 'art'},
  {id: 6, name: 'Finn', grade: 5, score: 81, hobby: 'sports'},
  {id: 7, name: 'Gia', grade: 3, score: 89, hobby: 'coding'},
  {id: 8, name: 'Hugo', grade: 5, score: 76, hobby: 'music'},
];

/** Columns the student can reason about. */
export const COLUMNS = ['grade', 'score'] as const;
export type DatasciColumn = (typeof COLUMNS)[number];

export const GRADES = ['3', '4', '5'] as const;
