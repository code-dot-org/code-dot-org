import {
  freeStackEnd,
  isAttachShadow,
  missingBlocks,
  placeBelow,
} from '@cdo/apps/p5lab/spritelab/lab2/addBlocks';

// A stack of block-likes: each knows the next and its own bottom connection.
function stack(
  ...ends: ({target?: boolean; shadow?: boolean; isShadow?: boolean} | null)[]
) {
  const blocks = ends.map(end => ({
    isShadow: () => !!end?.isShadow,
    nextConnection: end && {
      targetBlock: () => (end.target ? {} : null),
      getShadowState: () => (end.shadow ? {type: 'x'} : null),
    },
    getNextBlock: (): unknown => null,
  }));
  blocks.forEach((block, i) => {
    block.getNextBlock = () => blocks[i + 1] ?? null;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return blocks[0] as any;
}

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

  it('tells a shadow to hang from a block to add', () => {
    expect(
      isAttachShadow({attachTo: 'spritelab2_whenRun', shadow: AT_TIME})
    ).toBe(true);
    expect(isAttachShadow(AT_TIME)).toBe(false);
  });

  it("finds the free connection under a stack's last block", () => {
    const top = stack({}, {}, {});
    expect(freeStackEnd(top)).toBe(
      top.getNextBlock().getNextBlock().nextConnection
    );
  });

  it('hangs nothing on an end that has a block, a shadow, or no connection', () => {
    expect(freeStackEnd(stack({}, {target: true}))).toBeNull();
    expect(freeStackEnd(stack({shadow: true}))).toBeNull();
    expect(freeStackEnd(stack(null))).toBeNull();
  });

  it('stops at a placeholder already hanging on the stack', () => {
    // The shadow is the last block the walk sees; nothing hangs under it.
    expect(freeStackEnd(stack({}, {isShadow: true}))).toBeNull();
  });
});
