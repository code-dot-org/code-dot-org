import {LAB2_INSTRUCTIONS} from '../../src/lab2Instructions';
import {INSTRUCTIONS_KEYS} from '../../src/types';

describe('LAB2_INSTRUCTIONS', () => {
  test('lists the dataset and results screens in order', () => {
    expect(LAB2_INSTRUCTIONS.map(screen => screen.key)).toEqual([
      'datasetView',
      'results',
    ]);
  });

  test('gives every screen a known key, a label and default text', () => {
    LAB2_INSTRUCTIONS.forEach(({key, label, defaultText}) => {
      expect(INSTRUCTIONS_KEYS).toContain(key);
      expect(label).toBeTruthy();
      expect(defaultText).toBeTruthy();
    });
  });
});
