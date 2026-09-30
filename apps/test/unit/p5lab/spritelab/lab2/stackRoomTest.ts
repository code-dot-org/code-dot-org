import {makeRoom} from '@cdo/apps/p5lab/spritelab/lab2/stackRoom';

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
});
