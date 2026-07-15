import {expect, it} from 'vitest';

import {normalizeStudentNames} from './normalizeStudentNames';

it('trims names, removes blanks, and preserves duplicates', () => {
  expect(normalizeStudentNames(' Ada \n\nGrace\n Ada ')).toEqual([
    'Ada',
    'Grace',
    'Ada',
  ]);
});

it('caps a batch at 30 names', () => {
  const names = Array.from({length: 31}, (_, index) => `N${index}`).join('\n');

  expect(normalizeStudentNames(names)).toHaveLength(30);
});
