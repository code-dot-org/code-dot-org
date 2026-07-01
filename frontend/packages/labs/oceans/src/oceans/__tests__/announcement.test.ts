import {describe, expect, test} from 'vitest';

import {
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
  test('plural', () => {
    expect(buildClassificationAnnouncement(2)).toBe('2 items classified.');
  });

  test('singular at 1', () => {
    expect(buildClassificationAnnouncement(1)).toBe('1 item classified.');
  });

  test('zero', () => {
    expect(buildClassificationAnnouncement(0)).toBe('0 items classified.');
  });
});
