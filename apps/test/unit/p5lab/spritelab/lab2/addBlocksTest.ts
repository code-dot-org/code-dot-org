import {
  fillingTypes,
  forgetCoveredOutlines,
  isAttachRoom,
  isAttachShadow,
  ownsTop,
  matchesEntry,
  missingBlocks,
  placeBelow,
  stackHolds,
  syncOutlines,
  syncStackOutline,
  trailingShadow,
  dropStalePlaceholders,
  unfilledOutlines,
} from '@cdo/apps/p5lab/spritelab/lab2/addBlocks';

const placeholder = (like: string, fields?: Record<string, string>) => ({
  type: 'spritelab2_placeholder',
  extraState: {like: {type: like, ...(fields && {fields})}},
});
const SAY = placeholder('gamelab_spriteSay');
const GO_TO_SCENE = placeholder('spritelab2_goToScene');

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

  // A stack of real blocks, by type, top first, that behaves like Blockly's
  // where the outline code touches it: each block's bottom connection
  // remembers a shadow, and the shadow shows as a block only while no real
  // block hangs there. `showing` puts a shadow at the end of the stack;
  // `covered` records one under the real block at that index, out of sight.
  type Outline = {type: string; extraState?: unknown} | null;
  const liveStack = (
    types: string[],
    {
      showing,
      covered = {},
      data,
      noBottom = false,
    }: {
      showing?: Outline;
      covered?: Record<number, Outline>;
      data?: string;
      noBottom?: boolean;
    } = {}
  ) => {
    const sets: string[] = [];
    const recorded: Outline[] = types.map((_, i) =>
      i === types.length - 1 ? showing ?? null : covered[i] ?? null
    );
    const shadowBlock = {type: 'shadow', isShadow: () => true};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks: any[] = types.map((type, i) => ({
      type,
      data: i === 0 ? data : undefined,
      isShadow: () => false,
      nextConnection:
        noBottom && i === types.length - 1
          ? null
          : {
              targetBlock: () =>
                blocks[i + 1] ?? (recorded[i] ? shadowBlock : null),
              getShadowState: () => recorded[i],
              setShadowState: (state: Outline) => {
                recorded[i] = state;
                sets.push(`${type}:${state ? 'set' : 'cleared'}`);
              },
            },
    }));
    blocks[0].getDescendants = () => [
      ...blocks,
      ...(recorded[types.length - 1] && !noBottom ? [shadowBlock] : []),
    ];
    return {top: blocks[0], blocks, sets, recorded};
  };
  const liveWorkspace = (...stacks: ReturnType<typeof liveStack>[]) =>
    ({
      getTopBlocks: () => stacks.map(st => st.top),
      getAllBlocks: () => stacks.flatMap(st => st.blocks),
    } as unknown as Parameters<typeof syncOutlines>[0]);

  describe('what fills an outline', () => {
    const outline = {attachTo: 'gamelab_checkTouching', shadow: SAY};

    it('is filled by the block it is drawn to look like', () => {
      expect(fillingTypes(outline, [])).toEqual(['gamelab_spriteSay']);
    });

    it('is also filled by any block the checklist accepts under the same top block', () => {
      expect(
        fillingTypes(outline, [
          {
            kind: 'block',
            type: ['spritelab2_burst', 'spritelab2_playSound'],
            under: 'gamelab_checkTouching',
          },
          // A check under another top block is about another stack.
          {
            kind: 'block',
            type: 'spritelab2_goToScene',
            under: 'spritelab2_whenRun',
          },
        ])
      ).toEqual([
        'gamelab_spriteSay',
        'spritelab2_burst',
        'spritelab2_playSound',
      ]);
    });

    it('takes a check that names a tag only for the stack with that tag', () => {
      const check = {
        kind: 'block' as const,
        type: 'spritelab2_burst',
        under: 'gamelab_checkTouching',
        data: 'treasure',
      };
      expect(fillingTypes({...outline, data: 'treasure'}, [check])).toContain(
        'spritelab2_burst'
      );
      expect(fillingTypes({...outline, data: 'patrol'}, [check])).not.toContain(
        'spritelab2_burst'
      );
    });

    it('takes a check that names the stack by its tag alone', () => {
      // As the touch event level writes it: no top block type, only the tag.
      const types = fillingTypes({...outline, data: 'treasure-touch'}, [
        {
          kind: 'block',
          type: ['spritelab2_burst', 'spritelab2_playSound'],
          data: 'treasure-touch',
        },
      ]);
      expect(types).toContain('spritelab2_burst');
      expect(types).toContain('spritelab2_playSound');
    });

    it('ignores a check that names no stack', () => {
      expect(
        fillingTypes(outline, [{kind: 'block', type: 'spritelab2_goToScene'}])
      ).toEqual(['gamelab_spriteSay']);
    });

    it('has nothing to fill for a room, which draws no outline', () => {
      expect(
        fillingTypes(
          {attachTo: 'spritelab2_whenRun', room: {type: 'gamelab_spriteSay'}},
          []
        )
      ).toEqual([]);
    });

    it('finds a real block of the type under the top block, not the top block or an outline', () => {
      const withSay = liveStack(['spritelab2_whenRun', 'gamelab_spriteSay']);
      expect(stackHolds(withSay.top, ['gamelab_spriteSay'])).toBe(true);
      expect(stackHolds(withSay.top, ['spritelab2_whenRun'])).toBe(false);
      const waiting = liveStack(['spritelab2_whenRun'], {showing: SAY});
      expect(stackHolds(waiting.top, ['shadow'])).toBe(false);
    });
  });

  describe('one stack and its outline', () => {
    const SAY_TYPES = ['gamelab_spriteSay'];

    it('draws the outline at the end of a stack that lacks the block', () => {
      const run = liveStack(['spritelab2_whenRun', 'spritelab2_burst']);
      expect(syncStackOutline(run.top, SAY, SAY_TYPES)).toBe(true);
      expect(run.sets).toEqual(['spritelab2_burst:set']);
    });

    it('leaves an outline that is already showing', () => {
      const run = liveStack(['spritelab2_whenRun'], {showing: SAY});
      expect(syncStackOutline(run.top, SAY, SAY_TYPES)).toBe(true);
      expect(run.sets).toEqual([]);
    });

    it('draws nothing once the stack holds the block, and nothing is kept hidden', () => {
      const run = liveStack(['spritelab2_whenRun', 'gamelab_spriteSay']);
      expect(syncStackOutline(run.top, SAY, SAY_TYPES)).toBe(false);
      expect(run.sets).toEqual([]);
    });

    it('removes a showing outline when the block is elsewhere in the stack', () => {
      // The student put the say block above the outline, not on it.
      const run = liveStack(['spritelab2_whenRun', 'gamelab_spriteSay'], {
        showing: SAY,
      });
      expect(syncStackOutline(run.top, SAY, SAY_TYPES)).toBe(false);
      expect(run.sets).toEqual(['gamelab_spriteSay:cleared']);
    });

    it('counts any block the level accepts as filling the outline', () => {
      const run = liveStack(['gamelab_checkTouching', 'spritelab2_playSound']);
      expect(
        syncStackOutline(run.top, SAY, [
          'gamelab_spriteSay',
          'spritelab2_playSound',
        ])
      ).toBe(false);
      expect(run.sets).toEqual([]);
    });

    it('draws nothing under a stack whose last block has no bottom connection', () => {
      const run = liveStack(['spritelab2_whenRun'], {noBottom: true});
      expect(syncStackOutline(run.top, SAY, SAY_TYPES)).toBe(false);
    });

    it('draws nothing where another shadow already sits', () => {
      const run = liveStack(['spritelab2_whenRun'], {showing: GO_TO_SCENE});
      expect(syncStackOutline(run.top, SAY, SAY_TYPES)).toBe(false);
      expect(run.sets).toEqual([]);
    });

    it('draws a showing outline again when the level now wants it blank, or not', () => {
      const BLANK_SAY = {
        ...SAY,
        extraState: {...SAY.extraState, blank: true},
      };
      const run = liveStack(['spritelab2_whenRun'], {showing: BLANK_SAY});
      expect(syncStackOutline(run.top, SAY, SAY_TYPES)).toBe(true);
      expect(run.sets).toEqual(['spritelab2_whenRun:set']);
    });
  });

  describe('the whole workspace', () => {
    it('forgets an outline hidden under a real block, and only that', () => {
      // say sits on the outline the level drew under when run.
      const filled = liveStack(['spritelab2_whenRun', 'gamelab_spriteSay'], {
        covered: {0: SAY},
      });
      const waiting = liveStack(['gamelab_atTime'], {showing: SAY});
      expect(forgetCoveredOutlines(liveWorkspace(filled, waiting))).toBe(1);
      expect(filled.sets).toEqual(['spritelab2_whenRun:cleared']);
      expect(waiting.sets).toEqual([]);
    });

    it('leaves a level with no outlines of its own with none, shown or hidden', () => {
      // Free play: an old outline is hidden under one block and another
      // still shows on a second stack.
      const filled = liveStack(['spritelab2_whenRun', 'gamelab_spriteSay'], {
        covered: {0: SAY},
      });
      const waiting = liveStack(['gamelab_atTime'], {showing: SAY});
      expect(syncOutlines(liveWorkspace(filled, waiting), [], [])).toEqual([]);
      expect(filled.recorded).toEqual([null, null]);
      expect(waiting.recorded).toEqual([null]);
    });

    it("shows the level's outline where its block is missing, and a second pass changes nothing", () => {
      const run = liveStack(['spritelab2_whenRun', 'spritelab2_burst']);
      const touch = liveStack(['gamelab_checkTouching', 'gamelab_spriteSay']);
      const entries = [
        {attachTo: 'spritelab2_whenRun', shadow: GO_TO_SCENE},
        {attachTo: 'gamelab_checkTouching', shadow: SAY},
      ];
      const workspace = liveWorkspace(run, touch);
      expect(syncOutlines(workspace, entries, [])).toEqual([run.top]);
      expect(run.sets).toEqual(['spritelab2_burst:set']);
      expect(touch.sets).toEqual([]);
      expect(syncOutlines(workspace, entries, [])).toEqual([run.top]);
      expect(run.sets).toEqual(['spritelab2_burst:set']);
    });

    it('removes the outline once any stack of the event holds the block', () => {
      // Two touch events. The outline shows on the first, and the student
      // put the say block in the second.
      const first = liveStack(['gamelab_checkTouching'], {showing: SAY});
      const second = liveStack(['gamelab_checkTouching', 'gamelab_spriteSay']);
      const entries = [{attachTo: 'gamelab_checkTouching', shadow: SAY}];
      expect(syncOutlines(liveWorkspace(first, second), entries, [])).toEqual(
        []
      );
      expect(first.recorded).toEqual([null]);
      expect(second.sets).toEqual([]);
    });

    it('does not move the outline to a second stack when the first is filled', () => {
      const first = liveStack(['gamelab_checkTouching', 'gamelab_spriteSay']);
      const second = liveStack(['gamelab_checkTouching']);
      const entries = [{attachTo: 'gamelab_checkTouching', shadow: SAY}];
      expect(syncOutlines(liveWorkspace(first, second), entries, [])).toEqual(
        []
      );
      expect(first.sets).toEqual([]);
      expect(second.sets).toEqual([]);
    });

    it('draws the outline on one stack only when none holds the block', () => {
      const first = liveStack(['gamelab_checkTouching']);
      const second = liveStack(['gamelab_checkTouching']);
      const entries = [{attachTo: 'gamelab_checkTouching', shadow: SAY}];
      expect(syncOutlines(liveWorkspace(first, second), entries, [])).toEqual([
        first.top,
      ]);
      expect(second.sets).toEqual([]);
    });

    it('brings the outline back when the block that filled it is taken out', () => {
      const touch = liveStack(['gamelab_checkTouching']);
      const entries = [{attachTo: 'gamelab_checkTouching', shadow: SAY}];
      // The stack once held a say block; now it holds only its top block.
      expect(syncOutlines(liveWorkspace(touch), entries, [])).toEqual([
        touch.top,
      ]);
      expect(touch.recorded).toEqual([SAY]);
    });
  });

  it('a room entry adds no block, owns no stack, and waits on no outline', () => {
    const room = {
      attachTo: 'spritelab2_whenRun',
      room: {type: 'gamelab_setBackgroundImageAs'},
    };
    expect(isAttachRoom(room)).toBe(true);
    expect(isAttachShadow(room)).toBe(false);
    expect(ownsTop([room], {type: 'spritelab2_whenRun', data: null})).toBe(
      false
    );
  });

  describe('stale placeholders', () => {
    // A stack: each real block's type, then the shadow showing at its end
    // (recorded on the last block's connection), if any.
    const chain = (
      types: string[],
      showing?: {type: string; extraState?: unknown},
      data?: string
    ) => {
      const dropped: string[] = [];
      const shadow = showing && {isShadow: () => true};
      const blocks = types.map((type, i) => ({
        type,
        data: i === 0 ? data : undefined,
        isShadow: () => false,
        nextConnection: {
          targetBlock: (): unknown =>
            blocks[i + 1] ?? (i === types.length - 1 ? shadow ?? null : null),
          getShadowState: () =>
            i === types.length - 1 ? showing ?? null : null,
          setShadowState: (state: null) => dropped.push(`${type}:${state}`),
        },
      }));
      return {top: blocks[0], dropped};
    };
    const workspace = (...tops: unknown[]) =>
      ({getTopBlocks: () => tops} as unknown as Parameters<
        typeof dropStalePlaceholders
      >[0]);

    it('drops a showing placeholder no entry of the level puts there', () => {
      const run = chain(['spritelab2_whenRun'], SAY);
      expect(dropStalePlaceholders(workspace(run.top), [])).toBe(1);
      expect(run.dropped).toEqual(['spritelab2_whenRun:null']);
    });

    it("keeps the level's own, hung or under a block it adds, by tag", () => {
      const run = chain(['spritelab2_whenRun'], SAY);
      const at6 = chain(['gamelab_atTime'], SAY, 'at-6');
      const at9 = chain(['gamelab_atTime'], SAY, 'at-9');
      const entries = [
        {attachTo: 'spritelab2_whenRun', shadow: SAY},
        {type: 'gamelab_atTime', data: 'at-6', next: {shadow: SAY}},
      ];
      expect(
        dropStalePlaceholders(workspace(run.top, at6.top, at9.top), entries)
      ).toBe(1);
      expect(run.dropped).toEqual([]);
      expect(at6.dropped).toEqual([]);
      expect(at9.dropped).toEqual(['gamelab_atTime:null']);
    });

    it('leaves a covered placeholder, a filled stack and other shadows', () => {
      // say covers the when-run placeholder; the stack ends in a plain block.
      const filled = chain(['spritelab2_whenRun', 'gamelab_spriteSay']);
      const other = chain(['spritelab2_whenRun'], {type: 'gamelab_spriteSay'});
      expect(dropStalePlaceholders(workspace(filled.top, other.top), [])).toBe(
        0
      );
      expect(filled.dropped).toEqual([]);
      expect(other.dropped).toEqual([]);
    });
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

    it('a tagged attachment waits only on the stack with its tag', () => {
      const ends: End[] = [{shadow: GO_TO_SCENE, next: true}, {isShadow: true}];
      const treasure = top('gamelab_checkTouching', ends, {data: 'treasure'});
      const patrol = top('gamelab_checkTouching', ends, {data: 'patrol'});
      const onTreasure = {
        attachTo: 'gamelab_checkTouching',
        data: 'treasure',
        shadow: GO_TO_SCENE,
      };
      expect(
        unfilledOutlines(workspace(patrol, treasure), [onTreasure])
      ).toEqual([treasure]);
      expect(
        unfilledOutlines(workspace(patrol, treasure), [
          {attachTo: 'gamelab_checkTouching', shadow: GO_TO_SCENE},
        ])
      ).toEqual([patrol, treasure]);
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
