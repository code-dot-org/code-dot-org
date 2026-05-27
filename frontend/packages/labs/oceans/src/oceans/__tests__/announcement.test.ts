/** L1 unit tests for the train-scene SR announcement helper. Component integration in training.test.tsx. */

import {describe, expect, test} from 'vitest';

import {
  TRAINING_MILESTONES,
  buildClassificationAnnouncement,
  formatItemsClassified,
} from '@/oceans/components/scenes/train/announcement';

describe('formatItemsClassified', () => {
  test('singular for 1', () => {
    expect(formatItemsClassified(1)).toBe('1 item classified');
  });

  test('plural for 0', () => {
    expect(formatItemsClassified(0)).toBe('0 items classified');
  });

  test('plural for >1', () => {
    expect(formatItemsClassified(2)).toBe('2 items classified');
    expect(formatItemsClassified(42)).toBe('42 items classified');
  });
});

describe('buildClassificationAnnouncement', () => {
  test('non-milestone count, plural', () => {
    expect(buildClassificationAnnouncement(2)).toBe('2 items classified.');
  });

  test('singular at count 1', () => {
    expect(buildClassificationAnnouncement(1)).toBe('1 item classified.');
  });

  test('count 0 contract holds', () => {
    expect(buildClassificationAnnouncement(0)).toBe('0 items classified.');
  });

  test.each(Object.entries(TRAINING_MILESTONES))(
    'milestone %s appends suffix "%s"',
    (count, suffix) => {
      expect(buildClassificationAnnouncement(Number(count))).toBe(
        `${count} items classified. ${suffix}`,
      );
    },
  );

  test('count one past a milestone gets no suffix', () => {
    expect(buildClassificationAnnouncement(11)).toBe('11 items classified.');
  });

  test('count one before a milestone gets no suffix', () => {
    expect(buildClassificationAnnouncement(9)).toBe('9 items classified.');
  });

  test('milestones are exact-match only — not >=', () => {
    for (let n = 11; n < 25; n++) {
      expect(buildClassificationAnnouncement(n)).not.toMatch(
        /Good start|Keep going|Great work/,
      );
    }
  });
});

describe('TRAINING_MILESTONES table', () => {
  test('milestones are in ascending order (sanity)', () => {
    const counts = Object.keys(TRAINING_MILESTONES).map(Number);
    const sorted = [...counts].sort((a, b) => a - b);
    expect(counts).toEqual(sorted);
  });

  test('every milestone has non-empty suffix text', () => {
    for (const [count, suffix] of Object.entries(TRAINING_MILESTONES)) {
      expect(suffix).not.toBe('');
      expect(Number(count)).toBeGreaterThan(0);
    }
  });
});
