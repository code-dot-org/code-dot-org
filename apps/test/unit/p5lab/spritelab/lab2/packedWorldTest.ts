import {
  isPackedWorld,
  packSources,
  packWorld,
  unpackSources,
  unpackWorld,
} from '@cdo/apps/p5lab/spritelab/lab2/packedWorld';
import {Sources} from '@cdo/apps/p5lab/spritelab/lab2/types';

const legend = {
  B: {image: 'Stone', kind: 'block' as const},
  S: {image: 'Blob', kind: 'sprite' as const},
};

describe('packedWorld', () => {
  it('expands rows into a square grid, padding what is left off', () => {
    const {grid} = unpackWorld({size: 4, rows: ['.S', 'BBB'], legend});
    expect(grid).toHaveLength(4);
    grid.forEach(row => expect(row).toHaveLength(4));
    expect(grid[0]).toEqual([null, legend.S, null, null]);
    expect(grid[1]).toEqual([legend.B, legend.B, legend.B, null]);
    expect(grid[2]).toEqual([null, null, null, null]);
  });

  it('treats a character outside the legend as empty', () => {
    const {grid} = unpackWorld({size: 2, rows: ['?B'], legend});
    expect(grid[0]).toEqual([null, legend.B]);
  });

  it('gives every cell its own object', () => {
    const {grid} = unpackWorld({size: 2, rows: ['BB'], legend});
    expect(grid[0][0]).not.toBe(grid[0][1]);
  });

  it('recognizes only the packed form', () => {
    expect(isPackedWorld({size: 2, rows: [], legend})).toBe(true);
    expect(isPackedWorld({size: 2, rows: []})).toBe(true);
    expect(unpackWorld({size: 1, rows: ['B']}).grid).toEqual([[null]]);
    expect(isPackedWorld({grid: [[null]]})).toBe(false);
    expect(isPackedWorld(undefined)).toBe(false);
  });

  it('packs a grid into trimmed rows and a legend, and back', () => {
    const world = unpackWorld({size: 4, rows: ['.S', 'BBB', '', 'B'], legend});
    const packed = packWorld(world);
    expect(packed).toEqual({
      size: 4,
      rows: ['.A', 'BBB', '', 'B'],
      legend: {A: legend.S, B: legend.B},
    });
    expect(unpackWorld(packed as never)).toEqual(world);
    expect(
      packWorld({
        grid: [
          [null, null],
          [null, null],
        ],
      })
    ).toEqual({
      size: 2,
      rows: [],
      legend: {},
    });
    const oblong = {grid: [[legend.B, null, null]]};
    expect(packWorld(oblong)).toBe(oblong);
  });

  it('packs every scene world for a level file', () => {
    const sources: Sources = {
      source: '',
      scenes: [
        {id: 'a', name: 'A', world: {grid: [[legend.B]]}},
        {id: 'b', name: 'B'},
      ],
    };
    const out = packSources(sources);
    expect(out.scenes?.[0].world).toEqual({
      size: 1,
      rows: ['A'],
      legend: {A: legend.B},
    });
    expect(out.scenes?.[1]).toBe(sources.scenes?.[1]);
    expect(packSources({source: ''})).toEqual({source: ''});
  });

  it('expands packed scenes and leaves the rest alone', () => {
    const dense = {grid: [[legend.B]]};
    const sources: Sources = {
      source: '',
      scenes: [
        {id: 'a', name: 'A', world: dense},
        {id: 'b', name: 'B', world: {size: 1, rows: ['S'], legend} as never},
        {id: 'c', name: 'C'},
      ],
    };
    const out = unpackSources(sources);
    expect(out).not.toBe(sources);
    expect(out.scenes?.[0].world).toBe(dense);
    expect(out.scenes?.[1].world).toEqual({grid: [[legend.S]]});
    expect(out.scenes?.[2]).toBe(sources.scenes?.[2]);
  });

  it('returns the same object when nothing is packed', () => {
    const sources: Sources = {
      source: '',
      scenes: [{id: 'a', name: 'A', world: {grid: [[null]]}}],
    };
    expect(unpackSources(sources)).toBe(sources);
    expect(unpackSources({source: ''})).toEqual({source: ''});
  });
});
