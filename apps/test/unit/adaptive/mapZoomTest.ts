import {Pathway} from '@cdo/apps/adaptive/types';
import {
  boardTransform,
  nextUpCheckpointId,
  stepZoom,
} from '@cdo/apps/adaptive/views/mapZoom';

const board = {width: 800, height: 1000};
const viewport = {width: 400, height: 400};

describe('stepZoom', () => {
  it('steps through the levels and stops at either end', () => {
    expect(stepZoom('overview', 1)).toBe('detail');
    expect(stepZoom('detail', 1)).toBe('focus');
    expect(stepZoom('focus', 1)).toBe('focus');
    expect(stepZoom('focus', -1)).toBe('detail');
    expect(stepZoom('overview', -1)).toBe('overview');
  });
});

describe('boardTransform', () => {
  it('fits the whole board in the overview, centered, never enlarged', () => {
    expect(boardTransform('overview', board, viewport, undefined)).toEqual({
      scale: 0.4,
      x: (400 - 320) / 2,
      y: 0,
    });
    const small = boardTransform(
      'overview',
      {width: 100, height: 100},
      viewport,
      undefined
    );
    expect(small.scale).toBe(1);
    expect(small).toMatchObject({x: 150, y: 150});
  });

  it('centers the anchor at full size, clamped to the board edges', () => {
    const mid = boardTransform('detail', board, viewport, {x: 400, y: 500});
    expect(mid).toEqual({scale: 1, x: -200, y: -300});
    const corner = boardTransform('detail', board, viewport, {x: 10, y: 990});
    expect(corner).toEqual({scale: 1, x: 0, y: -600});
  });

  it('enlarges around the anchor when focused', () => {
    const t = boardTransform('focus', board, viewport, {x: 400, y: 500});
    expect(t.scale).toBe(1.5);
    expect(t).toMatchObject({x: 200 - 600, y: 200 - 750});
  });
});

describe('nextUpCheckpointId', () => {
  const pathway = {
    checkpoints: [{id: 'a'}, {id: 'b'}, {id: 'c'}],
  } as unknown as Pathway;

  it('prefers in progress, then available, then the first checkpoint', () => {
    expect(
      nextUpCheckpointId(pathway, {
        a: 'complete',
        b: 'available',
        c: 'inProgress',
      })
    ).toBe('c');
    expect(
      nextUpCheckpointId(pathway, {a: 'complete', b: 'available', c: 'locked'})
    ).toBe('b');
    expect(
      nextUpCheckpointId(pathway, {a: 'complete', b: 'complete', c: 'complete'})
    ).toBe('a');
  });
});
