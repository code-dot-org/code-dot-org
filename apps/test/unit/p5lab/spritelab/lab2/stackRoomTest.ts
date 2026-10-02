import * as BlocklyCore from 'blockly/core';

import {
  ensureRoom,
  makeRoom,
  STACK_GAP_PX,
  STACK_ROOM_EVENT_GROUP,
  watchStackRoom,
} from '@cdo/apps/p5lab/spritelab/lab2/stackRoom';

function stacks(...specs: [string, number, number, number?, number?][]) {
  const moves: [string, number][] = [];
  const boxes = specs.map(([name, y, height, x = 0, width = 200]) => ({
    x,
    y,
    width,
    height,
    fixed: name.startsWith('fixed'),
    moveBy: (dx: number, dy: number) => moves.push([name, dy]),
  }));
  return {boxes, moves};
}

describe('stackRoom', () => {
  it('gives every stack the room below it, top to bottom, cascading', () => {
    const {boxes, moves} = stacks(
      ['run', 20, 100],
      ['later', 130, 60],
      ['event', 200, 80]
    );
    makeRoom(boxes, 50);
    // run ends at 120: later moves to 170; later ends at 230: event to 280.
    expect(moves).toEqual([
      ['later', 40],
      ['event', 80],
    ]);
  });

  it('leaves stacks that already have the room, and stacks aside, alone', () => {
    const {boxes, moves} = stacks(
      ['run', 0, 100],
      ['far', 200, 50],
      ['aside', 50, 50, 400]
    );
    makeRoom(boxes, 50);
    expect(moves).toEqual([]);
  });

  it('measures against every stack above in the column, not only the nearest', () => {
    const {boxes, moves} = stacks(
      ['tall', 0, 300],
      ['short', 10, 20, 300],
      ['wide', 100, 50, 100, 300]
    );
    makeRoom(boxes, 50);
    // wide spans both columns; tall's bottom (300) + 50 wins over short's.
    expect(moves).toEqual([['wide', 250]]);
  });

  it('leaves a fixed stack where it is, and still makes room under it', () => {
    const {boxes, moves} = stacks(
      ['run', 0, 100],
      ['fixed', 110, 50],
      ['below', 170, 30]
    );
    makeRoom(boxes, 50);
    // fixed stays at 110 though it lacks room; below clears fixed's 160.
    expect(moves).toEqual([['below', 40]]);
  });

  it('only ever moves a stack down', () => {
    const {boxes, moves} = stacks(['run', 0, 10], ['far', 500, 10]);
    makeRoom(boxes, 50);
    expect(moves).toEqual([]);
  });

  describe('watchStackRoom', () => {
    // A workspace that hands its listener back for the test to fire events at.
    function watched() {
      let listener: (e: unknown) => void = () => {};
      const workspace = {
        addChangeListener: (fn: typeof listener) => (listener = fn),
        removeChangeListener: jest.fn(),
      } as unknown as BlocklyCore.WorkspaceSvg;
      const schedule = jest.fn();
      const stop = watchStackRoom(workspace, schedule);
      return {fire: (e: unknown) => listener(e), schedule, stop, workspace};
    }

    it('schedules a pass for a load, a new block, and a block joining a stack', () => {
      const {fire, schedule, workspace} = watched();
      fire({type: BlocklyCore.Events.FINISHED_LOADING});
      fire({type: BlocklyCore.Events.BLOCK_CREATE});
      fire({
        type: BlocklyCore.Events.BLOCK_MOVE,
        newParentId: 'p',
        blockId: 'b',
      });
      expect(schedule.mock.calls).toEqual([
        [workspace],
        [workspace],
        [workspace],
      ]);
    });

    it('pins the stack a drop just placed, and again when Blockly bumps that same stack', () => {
      const {fire, schedule, workspace} = watched();
      fire({
        type: BlocklyCore.Events.BLOCK_MOVE,
        blockId: 'd',
        reason: ['drag'],
      });
      fire({
        type: BlocklyCore.Events.BLOCK_MOVE,
        blockId: 'd',
        reason: ['bump'],
      });
      expect(schedule.mock.calls).toEqual([
        [workspace, 'd'],
        [workspace, 'd'],
      ]);
    });

    it('puts back a stack Blockly bumped that the student did not drag, and makes room instead', () => {
      jest
        .spyOn(BlocklyCore.Events, 'setRecordUndo')
        .mockImplementation(() => {});
      jest.spyOn(BlocklyCore.Events, 'getRecordUndo').mockReturnValue(true);
      jest.spyOn(BlocklyCore.Events, 'setGroup').mockImplementation(() => {});
      jest.spyOn(BlocklyCore.Events, 'getGroup').mockReturnValue('');
      const {fire, schedule, workspace} = watched();
      const bumped = {moveBy: jest.fn()};
      (workspace as unknown as {getBlockById: unknown}).getBlockById = (
        id: string
      ) => (id === 'n' ? bumped : null);
      fire({
        type: BlocklyCore.Events.BLOCK_MOVE,
        blockId: 'd',
        reason: ['drag'],
      });
      fire({
        type: BlocklyCore.Events.BLOCK_MOVE,
        blockId: 'n',
        reason: ['bump'],
        oldCoordinate: {x: 20, y: 109},
        newCoordinate: {x: 53, y: 141},
      });
      expect(bumped.moveBy).toHaveBeenCalledWith(-33, -32);
      expect(schedule.mock.calls).toEqual([[workspace, 'd'], [workspace]]);
      jest.restoreAllMocks();
    });

    it('ignores other moves, other events, and its own tidying', () => {
      const {fire, schedule, stop, workspace} = watched();
      fire({type: BlocklyCore.Events.BLOCK_MOVE, blockId: 'x'});
      fire({
        type: BlocklyCore.Events.BLOCK_MOVE,
        blockId: 'x',
        reason: ['disconnect'],
      });
      fire({type: BlocklyCore.Events.BLOCK_DELETE});
      fire({
        type: BlocklyCore.Events.BLOCK_CREATE,
        group: STACK_ROOM_EVENT_GROUP,
      });
      expect(schedule).not.toHaveBeenCalled();
      stop();
      expect(workspace.removeChangeListener).toHaveBeenCalled();
    });
  });

  describe('ensureRoom', () => {
    // Blocks as the pass reads them; `y` is live so a move shows in the result.
    function block(id: string, y: number, height: number, movable = true) {
      const b = {
        id,
        y,
        isMovable: () => movable,
        getRelativeToSurfaceXY: () => ({x: 0, y: b.y}),
        getHeightWidth: () => ({width: 100, height}),
        moveBy: (dx: number, dy: number) => (b.y += dy),
      };
      return b;
    }
    const flush = () => new Promise(resolve => setTimeout(resolve, 0));

    beforeEach(() => {
      jest
        .spyOn(BlocklyCore.renderManagement, 'finishQueuedRenders')
        .mockResolvedValue(undefined);
      jest
        .spyOn(BlocklyCore.Events, 'setRecordUndo')
        .mockImplementation(() => {});
      jest.spyOn(BlocklyCore.Events, 'getRecordUndo').mockReturnValue(true);
      jest.spyOn(BlocklyCore.Events, 'setGroup').mockImplementation(() => {});
      jest.spyOn(BlocklyCore.Events, 'getGroup').mockReturnValue('');
    });
    afterEach(() => jest.restoreAllMocks());

    it('folds calls made while a pass waits, pins included, and runs once', async () => {
      const blocks = [
        block('a', 0, 100),
        block('b', 110, 50),
        block('c', 170, 30),
      ];
      const workspace = {
        rendered: true,
        isDragging: () => false,
        getTopBlocks: () => blocks,
      } as unknown as BlocklyCore.WorkspaceSvg;
      ensureRoom(workspace);
      ensureRoom(workspace, 'b');
      await flush();
      await flush();
      // b is pinned at 110; c clears b's bottom (160) by the gap.
      expect(blocks.map(b => b.y)).toEqual([0, 110, 160 + STACK_GAP_PX]);
      expect(
        BlocklyCore.renderManagement.finishQueuedRenders
      ).toHaveBeenCalledTimes(1);
      expect(BlocklyCore.Events.setGroup).toHaveBeenCalledWith(
        STACK_ROOM_EVENT_GROUP
      );
      expect(BlocklyCore.Events.setRecordUndo).toHaveBeenCalledWith(false);
    });

    it('does nothing mid-drag', async () => {
      const blocks = [block('a', 0, 100), block('b', 110, 50)];
      const workspace = {
        rendered: true,
        isDragging: () => true,
        getTopBlocks: () => blocks,
      } as unknown as BlocklyCore.WorkspaceSvg;
      ensureRoom(workspace);
      await flush();
      await flush();
      expect(blocks.map(b => b.y)).toEqual([0, 110]);
    });
  });
});
