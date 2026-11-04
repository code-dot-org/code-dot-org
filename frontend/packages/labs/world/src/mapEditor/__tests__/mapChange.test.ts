// What an undo or a redo says it changed (mapEditor/mapChange).

import {describe, expect, it} from 'vitest';

import {mapChange} from '../mapChange';
import type {MapDoc, Placement} from '../mapModel';

const coin = (id: string, x = 48): Placement => ({
  type: 'actors/coin',
  id,
  properties: {positional: {position: {x, y: 48}}},
});

const map = (...actors: Placement[]): MapDoc => ({
  type: 'map',
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  actors,
});

describe('what a map change was', () => {
  it('names a placement added, removed or moved', () => {
    expect(mapChange(map(coin('a')), map(coin('a'), coin('b')))).toBe(
      'added b',
    );
    expect(mapChange(map(coin('a'), coin('b')), map(coin('a')))).toBe(
      'removed b',
    );
    expect(mapChange(map(coin('a')), map(coin('a', 96)))).toBe('moved a');
  });

  it('tells a move from another change to the same placement', () => {
    const scaled = {
      ...coin('a'),
      properties: {positional: {position: {x: 48, y: 48}, scale: 2}},
    };
    expect(mapChange(map(coin('a')), map(scaled))).toBe('changed a');
  });

  it('calls an id gone and one come, of the same kind, a rename', () => {
    expect(mapChange(map(coin('a')), map(coin('gold')))).toBe(
      'renamed a to gold',
    );
  });

  it('counts past three', () => {
    const four = ['a', 'b', 'c', 'd'].map(id => coin(id));
    expect(mapChange(map(), map(...four))).toBe('added 4 actors');
    expect(mapChange(map(), map(...four.slice(0, 3)))).toBe('added a, b and c');
  });

  it('names what is the map’s own', () => {
    expect(mapChange(map(), {...map(), size: {width: 12, height: 10}})).toBe(
      'changed the size',
    );
    expect(mapChange(map(), {...map(), backgroundColor: '#000000'})).toBe(
      'changed the look',
    );
    expect(mapChange(map(), map())).toBe('a change');
  });
});
