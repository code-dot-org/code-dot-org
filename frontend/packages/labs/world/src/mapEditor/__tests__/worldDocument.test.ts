// A map's file as the map editor reads and writes it (`mapFileDocument`).

import {describe, expect, it} from 'vitest';

import {mapFileDocument} from '../worldDocument';

describe('mapFileDocument', () => {
  it('names the map’s module, and has a map script of its own', () => {
    expect(mapFileDocument.modulePath('maps/level1.map')).toBe('maps/level1');
    expect(mapFileDocument.hasMapScript).toBe(true);
  });
});
