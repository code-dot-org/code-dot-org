// What a mirror shows on the stage: the scene at the end of its chain, as
// the engine resolves it (`World.mirrorTargetOf`).

import {describe, expect, it} from 'vitest';

import type {MapDoc} from '../mapModel';
import {withMirrors} from '../mirrorPreview';

/** A map of Viewports, each with the `showsMap` values given. */
const mapOf = (viewports: Record<string, object>): MapDoc =>
  ({
    actors: Object.entries(viewports).map(([id, showsMap]) => ({
      type: 'actors/viewport',
      id,
      properties: {showsMap},
    })),
  }) as unknown as MapDoc;

const LEVEL = {actors: [{type: 'actors/coin', id: 'c'}]} as unknown as MapDoc;
const ROOT = {actors: [{type: 'actors/hud', id: 'h'}]} as unknown as MapDoc;

describe('a mirror on the stage', () => {
  it('shows what the Viewport it mirrors holds', () => {
    const map = mapOf({Game: {map: 'maps/level'}, Mini: {mirrors: 'Game'}});
    expect(withMirrors(map, {Game: LEVEL}, ROOT)).toEqual({
      Game: LEVEL,
      Mini: LEVEL,
    });
  });

  it('shows the world’s own scene for `mirrors the world`', () => {
    const map = mapOf({Mini: {mirrorsTheWorld: true}});
    expect(withMirrors(map, {}, ROOT).Mini).toBe(ROOT);
  });

  it('prefers `mirrors` to `mirrors the world`, as the engine does', () => {
    const map = mapOf({
      Game: {map: 'maps/level'},
      Mini: {mirrors: ['Game'], mirrorsTheWorld: true},
    });
    expect(withMirrors(map, {Game: LEVEL}, ROOT).Mini).toBe(LEVEL);
  });

  it('shows the end of a chain', () => {
    const map = mapOf({
      Game: {map: 'maps/level'},
      Mid: {mirrors: 'Game'},
      Mini: {mirrors: 'Mid'},
    });
    expect(withMirrors(map, {Game: LEVEL}, ROOT).Mini).toBe(LEVEL);
  });

  it('shows nothing for a chain that comes back to itself', () => {
    const map = mapOf({A: {mirrors: 'B'}, B: {mirrors: 'A'}});
    expect(withMirrors(map, {}, ROOT)).toEqual({});
  });
});
