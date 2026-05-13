/**
 * Toy dataset for the AI Trainer lab. Twelve creatures, two features each:
 *   - `eyes`: 1 or 3
 *   - `size`: 'small' or 'large'
 *
 * The ground-truth rule (which the student is meant to discover): 3 eyes →
 * `foe`, 1 eye → `friend`. Size is a distractor — irrelevant to the label.
 *
 * Split: 6 training rows (labels shown), 6 test rows (labels hidden until
 * the classifier predicts).
 */

export type Eyes = 1 | 3;
export type Size = 'small' | 'large';
export type Label = 'friend' | 'foe';

export interface Creature {
  id: number;
  eyes: Eyes;
  size: Size;
  label: Label;
}

export const TRAINING_SET: Creature[] = [
  {id: 1, eyes: 1, size: 'small', label: 'friend'},
  {id: 2, eyes: 3, size: 'small', label: 'foe'},
  {id: 3, eyes: 1, size: 'large', label: 'friend'},
  {id: 4, eyes: 3, size: 'large', label: 'foe'},
  {id: 5, eyes: 1, size: 'small', label: 'friend'},
  {id: 6, eyes: 3, size: 'large', label: 'foe'},
];

export const TEST_SET: Creature[] = [
  {id: 7, eyes: 3, size: 'small', label: 'foe'},
  {id: 8, eyes: 1, size: 'large', label: 'friend'},
  {id: 9, eyes: 3, size: 'large', label: 'foe'},
  {id: 10, eyes: 1, size: 'small', label: 'friend'},
  {id: 11, eyes: 3, size: 'small', label: 'foe'},
  {id: 12, eyes: 1, size: 'large', label: 'friend'},
];

export type AlgorithmId =
  | 'majority'
  | 'nearest-neighbor'
  | 'eyes-rule'
  | 'size-rule';

export const ALGORITHM_LABELS: Record<AlgorithmId, string> = {
  majority: 'majority class (always predict most common)',
  'nearest-neighbor': 'nearest neighbor (closest training example)',
  'eyes-rule': 'rule: 3 eyes → foe, else friend',
  'size-rule': 'rule: large → foe, else friend (a bad guess)',
};
