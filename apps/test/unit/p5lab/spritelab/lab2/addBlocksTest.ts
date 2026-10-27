import {
  freeStackEnd,
  isAttachShadow,
  matchesEntry,
  missingBlocks,
  placeBelow,
  trailingShadow,
  unfilledOutlines,
} from '@cdo/apps/p5lab/spritelab/lab2/addBlocks';

const placeholder = (like: string, fields?: Record<string, string>) => ({
  type: 'spritelab2_placeholder',
  extraState: {like: {type: like, ...(fields && {fields})}},
});
const SAY = placeholder('gamelab_spriteSay');
const GO_TO_SCENE = placeholder('spritelab2_goToScene');
const SPRITE_LEFT = placeholder('spritelab2_makeSpriteAtPosition', {
  POSITION: 'left',
});
const SPRITE_RIGHT = placeholder('spritelab2_makeSpriteAtPosition', {
  POSITION: 'right',
});

// A stack of block-likes, top first. Each entry is a block's bottom
// connection: `shadow` is the placeholder recorded there, `next` whether a
// block hangs from it (the following entry, a shadow block when `isShadow`).
// null is a block with no bottom connection.
type End = {
  shadow?: ReturnType<typeof placeholder>;
  next?: boolean;
  isShadow?: boolean;
} | null;
function stack(...ends: End[]) {
  const blocks = ends.map((end, i) => ({
    isShadow: () => !!end?.isShadow,
    nextConnection: end && {
      targetBlock: (): unknown =>
        end.next ? blocks[i + 1] ?? {isShadow: () => false} : null,
      getShadowState: () => end.shadow ?? null,
    },
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return blocks[0] as any;
}

const AT_TIME = {type: 'gamelab_atTime'};
const CLICKED = {type: 'gamelab_spriteClicked'};
const TOUCH_TREASURE = {type: 'gamelab_checkTouching', data: 'treasure'};
const TOUCH_PATROL = {type: 'gamelab_checkTouching', data: 'patrol'};

// A block in the workspace as the matcher sees it.
const present = (type: string, data?: string) => ({type, data});

describe('addBlocks', () => {
  it('keeps only the blocks whose type the workspace lacks', () => {
    expect(
      missingBlocks(
        [present('spritelab2_whenRun'), present('gamelab_atTime')],
        [AT_TIME, CLICKED]
      )
    ).toEqual([CLICKED]);
    expect(missingBlocks([], [AT_TIME])).toEqual([AT_TIME]);
  });

  it('tells two entries of one type apart by their tags', () => {
    const treasure = [present('gamelab_checkTouching', 'treasure')];
    expect(missingBlocks(treasure, [TOUCH_TREASURE, TOUCH_PATROL])).toEqual([
      TOUCH_PATROL,
    ]);
  });

  describe('matchesEntry', () => {
    const AT_6 = {type: 'gamelab_atTime', data: 'at-6'};

    it('a tagged entry is satisfied by its tag alone, whatever the block says', () => {
      expect(matchesEntry(present('gamelab_atTime', 'at-6'), AT_6)).toBe(true);
      expect(matchesEntry(present('gamelab_atTime', 'at-3'), AT_6)).toBe(false);
      expect(matchesEntry(present('gamelab_spriteClicked', 'at-6'), AT_6)).toBe(
        false
      );
    });

    it('a block the student built has no tag, so the level still adds its own', () => {
      expect(matchesEntry(present('gamelab_atTime'), AT_6)).toBe(false);
    });

    it('an untagged entry is satisfied by any block of its type', () => {
      expect(matchesEntry(present('gamelab_atTime', 'at-6'), AT_TIME)).toBe(
        true
      );
      expect(matchesEntry(present('gamelab_atTime'), AT_TIME)).toBe(true);
    });
  });

  it('places a block a small gap under the lowest stack, at the leftmost x', () => {
    const at = placeBelow([
      {x: 20, y: 20, height: 100},
      {x: 300, y: 60, height: 200},
    ]);
    expect(at.x).toBe(20);
    expect(at.y).toBeGreaterThan(260);
    expect(at.y).toBeLessThan(300);
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
    const top = stack({next: true}, {next: true}, {});
    const last = top.nextConnection.targetBlock().nextConnection.targetBlock();
    expect(freeStackEnd(top, SAY)).toBe(last.nextConnection);
  });

  it('hangs nothing under a stack with no bottom connection', () => {
    expect(freeStackEnd(stack(null), SAY)).toBeNull();
    expect(freeStackEnd(stack({next: true}, null), SAY)).toBeNull();
  });

  it('hangs nothing under a placeholder still waiting to be filled', () => {
    expect(
      freeStackEnd(stack({shadow: SAY, next: true}, {isShadow: true}), SAY)
    ).toBeNull();
    expect(
      freeStackEnd(
        stack({shadow: SAY, next: true}, {isShadow: true}),
        GO_TO_SCENE
      )
    ).toBeNull();
  });

  it('hangs its placeholder once: a filled one is not hung again below', () => {
    // when run -> say (the student's block over the say placeholder).
    const filled = stack({shadow: SAY, next: true}, {});
    expect(freeStackEnd(filled, SAY)).toBeNull();
  });

  it('tells placeholders of one block type apart by their fields', () => {
    // when run -> make new sprite (left, filled) -> say (filled): the
    // right-hand sprite's placeholder still hangs at the end.
    const filled = stack(
      {shadow: SPRITE_LEFT, next: true},
      {shadow: SAY, next: true},
      {}
    );
    const end = filled.nextConnection
      .targetBlock()
      .nextConnection.targetBlock();
    expect(freeStackEnd(filled, SPRITE_RIGHT)).toBe(end.nextConnection);
    expect(freeStackEnd(filled, SPRITE_LEFT)).toBeNull();
  });

  it('hangs a different placeholder under a filled one', () => {
    // when clicked -> say (filled) gets go to scene under the say.
    const filled = stack({shadow: SAY, next: true}, {});
    expect(freeStackEnd(filled, GO_TO_SCENE)).toBe(
      filled.nextConnection.targetBlock().nextConnection
    );
  });

  describe('unfilled outlines', () => {
    // A top block of `type` over `ends`, read by the matcher like a block.
    const top = (type: string, ends: End[], values: {data?: string} = {}) =>
      Object.assign(stack(...ends), {type, data: values.data});

    const workspace = (...tops: unknown[]) =>
      ({getTopBlocks: () => tops} as unknown as Parameters<
        typeof unfilledOutlines
      >[0]);
    const WHEN_RUN_SAY = {attachTo: 'spritelab2_whenRun', shadow: SAY};
    const AT_6 = {type: 'gamelab_atTime', data: 'at-6', next: {shadow: SAY}};

    it('finds the shadow a stack ends in', () => {
      const waiting = stack({shadow: SAY, next: true}, {isShadow: true});
      expect(trailingShadow(waiting)?.shadow).toBe(
        waiting.nextConnection.targetBlock()
      );
      expect(trailingShadow(stack({shadow: SAY, next: true}, {}))).toBeNull();
      expect(trailingShadow(stack(null))).toBeNull();
    });

    it("a hung placeholder still waiting counts; a filled one doesn't", () => {
      const waiting = top('spritelab2_whenRun', [
        {shadow: SAY, next: true},
        {isShadow: true},
      ]);
      expect(unfilledOutlines(workspace(waiting), [WHEN_RUN_SAY])).toEqual([
        waiting,
      ]);
      const filled = top('spritelab2_whenRun', [{shadow: SAY, next: true}, {}]);
      expect(unfilledOutlines(workspace(filled), [WHEN_RUN_SAY])).toEqual([]);
    });

    it("another level's placeholder on the same stack is not this level's", () => {
      const waiting = top('spritelab2_whenRun', [
        {shadow: GO_TO_SCENE, next: true},
        {isShadow: true},
      ]);
      expect(unfilledOutlines(workspace(waiting), [WHEN_RUN_SAY])).toEqual([]);
    });

    it("an added block's outline counts while it waits, by the block's tag", () => {
      const waiting = top(
        'gamelab_atTime',
        [{shadow: SAY, next: true}, {isShadow: true}],
        {data: 'at-6'}
      );
      const other = top(
        'gamelab_atTime',
        [{shadow: SAY, next: true}, {isShadow: true}],
        {data: 'at-9'}
      );
      expect(unfilledOutlines(workspace(other, waiting), [AT_6])).toEqual([
        waiting,
      ]);
    });

    it('an entry with no placeholder has no outline to wait for', () => {
      const waiting = top(
        'gamelab_atTime',
        [{shadow: SAY, next: true}, {isShadow: true}],
        {data: 'at-6'}
      );
      expect(
        unfilledOutlines(workspace(waiting), [
          {type: 'gamelab_atTime', data: 'at-6'},
        ])
      ).toEqual([]);
    });

    it('lists a stack once when two entries point at it', () => {
      const waiting = top('spritelab2_whenRun', [
        {shadow: SAY, next: true},
        {isShadow: true},
      ]);
      expect(
        unfilledOutlines(workspace(waiting), [WHEN_RUN_SAY, WHEN_RUN_SAY])
      ).toEqual([waiting]);
    });
  });
});
