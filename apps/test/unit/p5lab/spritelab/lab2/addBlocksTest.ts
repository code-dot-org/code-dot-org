import {
  missingBlocks,
  placeBelow,
} from '@cdo/apps/p5lab/spritelab/lab2/addBlocks';

const AT_TIME = {type: 'gamelab_atTime'};
const CLICKED = {type: 'gamelab_spriteClicked'};

describe('addBlocks', () => {
  it('keeps only the blocks whose type the workspace lacks', () => {
    expect(
      missingBlocks(
        ['spritelab2_whenRun', 'gamelab_atTime'],
        [AT_TIME, CLICKED]
      )
    ).toEqual([CLICKED]);
    expect(missingBlocks([], [AT_TIME])).toEqual([AT_TIME]);
  });

  it('places a block under the lowest stack, at the leftmost x, with room', () => {
    const at = placeBelow([
      {x: 20, y: 20, height: 100},
      {x: 300, y: 60, height: 200},
    ]);
    expect(at.x).toBe(20);
    expect(at.y).toBeGreaterThan(260);
  });

  it('starts at the origin in an empty workspace', () => {
    expect(placeBelow([])).toEqual({x: 0, y: 0});
  });
});
