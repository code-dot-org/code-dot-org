import {
  freeStackEnd,
  isAttachShadow,
  makeRoomBelow,
  matchesEntry,
  missingBlocks,
  placeBelow,
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

// A block in the workspace as the matcher reads it.
const present = (
  type: string,
  values: {
    data?: string;
    fields?: Record<string, unknown>;
    inputs?: Record<string, Record<string, unknown>>;
  } = {}
) => ({
  type,
  data: values.data,
  fieldValue: (name: string) => values.fields?.[name],
  inputFieldValue: (input: string, name: string) =>
    values.inputs?.[input]?.[name],
});

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

  it('tells two entries of one type apart by their data', () => {
    const treasure = [present('gamelab_checkTouching', {data: 'treasure'})];
    expect(missingBlocks(treasure, [TOUCH_TREASURE, TOUCH_PATROL])).toEqual([
      TOUCH_PATROL,
    ]);
    // An untagged block stands for an entry that pins no values.
    expect(
      missingBlocks([present('gamelab_checkTouching')], [TOUCH_PATROL])
    ).toEqual([]);
  });

  describe('matchesEntry', () => {
    const AT_6 = {
      type: 'gamelab_atTime',
      data: 'at-6',
      fields: {UNIT: '"seconds"'},
      inputs: {N: {shadow: {type: 'math_number', fields: {NUM: 6}}}},
    };
    const atSeconds = (n: number, data?: string) =>
      present('gamelab_atTime', {
        data,
        fields: {UNIT: '"seconds"'},
        inputs: {N: {NUM: n}},
      });

    it('an untagged block stands for the entry whose values it has, not another', () => {
      expect(matchesEntry(atSeconds(6), AT_6)).toBe(true);
      expect(matchesEntry(atSeconds(3), AT_6)).toBe(false);
      expect(matchesEntry(present('gamelab_spriteClicked'), AT_6)).toBe(false);
    });

    it('a tagged block keeps standing for its entry when the student edits it', () => {
      expect(matchesEntry(atSeconds(7, 'at-6'), AT_6)).toBe(true);
      expect(matchesEntry(atSeconds(6, 'at-3'), AT_6)).toBe(false);
    });

    it('reads values live, so a number typed as text still counts', () => {
      const typed = present('gamelab_atTime', {
        fields: {UNIT: '"seconds"'},
        inputs: {N: {NUM: '6'}},
      });
      expect(matchesEntry(typed, AT_6)).toBe(true);
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

  it('moves the stacks below a grown stack down, each clearing the last', () => {
    const moves: [string, number][] = [];
    const stack = (name: string, y: number, height: number, x = 20) => ({
      x,
      y,
      width: 200,
      height,
      moveBy: (dx: number, dy: number) => moves.push([name, dy]),
    });
    // when run grew to 300 tall; the event at 200 and the one at 300
    // both shift, the second by what the first's shift needs.
    makeRoomBelow(stack('run', 20, 300), [
      stack('later', 300, 60),
      stack('event', 200, 80),
      stack('aside', 200, 80, 400),
      stack('above', 0, 10),
    ]);
    expect(moves).toEqual([
      ['event', 144],
      ['later', 148],
    ]);
  });

  it('leaves stacks that already clear the grown one alone', () => {
    const moves: number[] = [];
    makeRoomBelow({x: 20, y: 20, width: 200, height: 100, moveBy: () => {}}, [
      {
        x: 20,
        y: 200,
        width: 200,
        height: 60,
        moveBy: (_, dy) => moves.push(dy),
      },
    ]);
    expect(moves).toEqual([]);
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
});
