// A map's file as the map editor reads and writes it (`mapFileDocument`).

import {describe, expect, it} from 'vitest';

import {mapFileDocument} from '../mapDocument';

describe('mapFileDocument', () => {
  it('names the map’s module', () => {
    expect(mapFileDocument.modulePath('maps/level1.map')).toBe('maps/level1');
  });
});
