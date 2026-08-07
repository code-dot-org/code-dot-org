import {
  isSupported,
  resolvePlatformPhysics,
  PhysicsBox,
  PhysicsSprite,
  TERMINAL_FALL_SPEED,
  PLATFORM_GRAVITY,
} from '@cdo/apps/p5lab/spritelab/lab2/platformPhysics';

// One test per feel rule, on the lab's real geometry (400x400 view, 50px
// grid).
const VIEW = {width: 400, height: 400};

// Default art box 25x50 at scale 1: body 20x40, feet-anchored (drop 5).
const makeSprite = (x: number, y: number, w = 25, h = 50): PhysicsSprite => ({
  position: {x, y},
  velocity: {x: 0, y: 0},
  width: w,
  height: h,
  scale: 1,
});

const wallAt = (col: number, row: number): PhysicsBox => ({
  position: {x: col * 50 + 25, y: row * 50 + 25},
  width: 50,
  height: 50,
  scale: 1,
});

const feet = (sprite: PhysicsSprite) =>
  sprite.position.y + (sprite.height * sprite.scale) / 2;

// One frame: p5's pre-phase velocity integration, held-key movement (the
// interpreted blocks move sprites imperatively), then the resolver.
const step = (sprite: PhysicsSprite, walls: PhysicsBox[], vx = 0) => {
  sprite.position.y += sprite.velocity.y;
  sprite.position.x += vx;
  resolvePlatformPhysics(
    [{sprite, x: sprite.position.x, y: sprite.position.y}],
    walls,
    VIEW
  );
};

const run = (
  sprite: PhysicsSprite,
  walls: PhysicsBox[],
  frames: number,
  vx = 0,
  onFrame?: (sprite: PhysicsSprite, frame: number) => void
) => {
  for (let i = 0; i < frames; i++) {
    step(sprite, walls, vx);
    if (onFrame) {
      onFrame(sprite, i);
    }
  }
};

describe('platformPhysics', () => {
  it('lands a fall with the feet exactly on the block top, never deeper', () => {
    const walls = [wallAt(0, 6), wallAt(1, 6), wallAt(2, 6)];
    const player = makeSprite(75, 100);
    let deepest = 0;
    run(player, walls, 40, 0, s => (deepest = Math.max(deepest, feet(s))));
    expect(feet(player)).toBe(300);
    expect(deepest).toBe(300);
  });

  it('accrues gravity and caps the fall speed', () => {
    const player = makeSprite(200, 0);
    run(player, [], 30);
    expect(player.velocity.y).toBe(TERMINAL_FALL_SPEED + PLATFORM_GRAVITY);
  });

  it('stops a walker at a wall face', () => {
    const walls = [wallAt(4, 7)];
    const player = makeSprite(100, 375);
    run(player, walls, 30, 6);
    expect(player.position.x).toBe(190);
    expect(feet(player)).toBe(400);
  });

  it('does not teleport a two-row-tall walker onto a head-height block', () => {
    const walls = [wallAt(4, 6)];
    const player = makeSprite(100, 350, 25, 100);
    const feetSeen = new Set<number>();
    run(player, walls, 30, 6, s => feetSeen.add(feet(s)));
    expect(player.position.x).toBe(190);
    expect([...feetSeen]).toEqual([400]);
  });

  it('slides a same-frame lateral graze off the corner instead of landing', () => {
    // One frame of a diagonal fall clipping the block's near corner by 4px:
    // prev is clear of the column, so this is a graze, not an arrival.
    const walls = [wallAt(3, 6)];
    const player = makeSprite(144, 280.75);
    player.velocity.y = 10.75;
    player.__slab2Prev = {x: 138, y: 270};
    resolvePlatformPhysics([{sprite: player, x: 144, y: 280.75}], walls, VIEW);
    expect(player.position.x).toBe(140);
    expect(feet(player)).toBeGreaterThan(300);
  });

  it('lands a body that was already over the column, even off-center', () => {
    const walls = [wallAt(3, 6)];
    const player = makeSprite(148, 280.75);
    player.velocity.y = 10.75;
    player.__slab2Prev = {x: 142, y: 270};
    resolvePlatformPhysics([{sprite: player, x: 148, y: 280.75}], walls, VIEW);
    expect(player.position.x).toBe(148);
    expect(feet(player)).toBe(300);
  });

  it('enters an opening in a face from a pinned slide, at every fall phase', () => {
    // A doorway: blocks above and below an open row in one column. The
    // start positions put the body beside the upper block, so the held
    // right key pins the slide at x=140; entry means feet on the lower
    // block's top, body past the face line.
    const walls = [wallAt(3, 4), wallAt(3, 6)];
    for (const startY of [215, 220, 225, 230]) {
      const player = makeSprite(140, startY);
      let entered = false;
      run(player, walls, 60, 6, s => {
        if (feet(s) === 300 && s.position.x > 150) {
          entered = true;
        }
      });
      expect(entered).toBe(true);
    }
  });

  it('perches a straight-down fall on a corner it is directly over', () => {
    const walls = [wallAt(3, 6)];
    const player = makeSprite(141, 100);
    run(player, walls, 40);
    expect(player.position.x).toBe(141);
    expect(feet(player)).toBe(300);
  });

  it('returns a straight-up jump to its takeoff footing', () => {
    const walls = [wallAt(3, 6)];
    const player = makeSprite(141, 275);
    player.__slab2Prev = {x: 141, y: 275};
    player.velocity.y = -13.5;
    const xs = new Set<number>();
    run(player, walls, 60, 0, s => xs.add(s.position.x));
    expect([...xs]).toEqual([141]);
    expect(feet(player)).toBe(300);
  });

  it('stops a head bonk without any sideways shift', () => {
    // Ceiling corner directly above, center past its edge: the bonk must
    // still resolve in place (vertical motion is stable).
    const walls = [wallAt(3, 4)];
    const player = makeSprite(141, 375);
    player.__slab2Prev = {x: 141, y: 375};
    player.velocity.y = -13.5;
    const xs = new Set<number>();
    run(player, walls, 60, 0, s => xs.add(s.position.x));
    expect([...xs]).toEqual([141]);
    expect(feet(player)).toBe(400);
  });

  it('keeps footing until the body has fully left an edge', () => {
    const walls = [wallAt(0, 6), wallAt(1, 6), wallAt(2, 6)];
    const player = makeSprite(75, 275);
    player.__slab2Prev = {x: 75, y: 275};
    let lastStandingX = 0;
    run(player, walls, 30, 6, s => {
      if (feet(s) === 300) {
        lastStandingX = s.position.x;
      }
    });
    // Right edge at 150, body halfW 10: footing holds past the center-over
    // point and ends only when the body leaves (quantized by the 6px step).
    expect(lastStandingX).toBeGreaterThanOrEqual(150);
    expect(lastStandingX).toBeLessThan(160);
    expect(feet(player)).toBeGreaterThan(300);
  });

  it('falls promptly off an edge — walking never carries across a one-block gap', () => {
    const walls = [
      wallAt(0, 6),
      wallAt(1, 6),
      wallAt(3, 6),
      wallAt(3, 7),
      wallAt(4, 6),
    ];
    // Every default-size costume shape drops in, including the widest
    // possible body (50px art), at every walk-off phase.
    for (const [w, h] of [
      [25, 50],
      [50, 50],
      [50, 32],
    ]) {
      for (const startX of [15, 19, 23, 27, 31, 35]) {
        const player = makeSprite(startX, 300 - h / 2, w, h);
        player.__slab2Prev = {x: startX, y: 300 - h / 2};
        run(player, walls, 60, 6);
        expect(feet(player)).toBe(400);
        expect(player.position.x).toBe(150 - (w * 0.8) / 2);
      }
    }
  });

  it('contains the sides and floor but leaves the top open', () => {
    const player = makeSprite(30, 375);
    run(player, [], 20, -6);
    expect(player.position.x).toBe(12.5);
    expect(feet(player)).toBe(400);
    const flyer = makeSprite(200, 20);
    flyer.velocity.y = -14;
    step(flyer, []);
    step(flyer, []);
    expect(flyer.position.y).toBeLessThan(0);
  });
});

// The set-gravity block's resolver seam: a custom magnitude, and a negative
// value flipping the world vertically.
describe('platformPhysics with custom gravity', () => {
  const stepWith = (
    sprite: PhysicsSprite,
    walls: PhysicsBox[],
    gravity: number,
    vx = 0
  ) => {
    sprite.position.y += sprite.velocity.y;
    sprite.position.x += vx;
    resolvePlatformPhysics(
      [{sprite, x: sprite.position.x, y: sprite.position.y}],
      walls,
      VIEW,
      gravity
    );
  };

  it('accrues the given magnitude instead of the default', () => {
    const player = makeSprite(200, 100);
    stepWith(player, [], 2);
    expect(player.velocity.y).toBe(2);
  });

  it('negative gravity falls up and rests the art on the view top', () => {
    const player = makeSprite(200, 300);
    for (let i = 0; i < 60; i++) {
      stepWith(player, [], -PLATFORM_GRAVITY);
    }
    // Image top at 0 — the flipped analogue of feet on the floor line.
    expect(player.position.y - 25).toBe(0);
  });

  it('negative gravity lands on a block underside and stays', () => {
    // Wall cell (col 1, row 1): center (75, 75), underside at y=100.
    const walls = [wallAt(1, 1)];
    const player = makeSprite(75, 300);
    for (let i = 0; i < 60; i++) {
      stepWith(player, walls, -PLATFORM_GRAVITY);
    }
    // Body top (feet-anchor flipped to a head anchor) on the underside:
    // body center 120, image center 5 below it.
    expect(player.position.y).toBe(125);
  });

  it('isSupported sees floor, block tops, and flipped undersides', () => {
    const walls = [wallAt(1, 6)];
    const onFloor = makeSprite(300, 375);
    expect(isSupported(onFloor, walls, VIEW)).toBe(true);
    const onBlock = makeSprite(75, 275);
    expect(isSupported(onBlock, walls, VIEW)).toBe(true);
    const hovering = makeSprite(75, 200);
    expect(isSupported(hovering, walls, VIEW)).toBe(false);
    // Under flipped gravity the head-anchored body rests against block
    // undersides: image top on the underside (cell row 6: y=350) counts,
    // a gap below it doesn't.
    const underBlock = makeSprite(75, 375);
    expect(isSupported(underBlock, walls, VIEW, -PLATFORM_GRAVITY)).toBe(true);
    const nearBlock = makeSprite(75, 360);
    expect(isSupported(nearBlock, walls, VIEW, -PLATFORM_GRAVITY)).toBe(false);
  });
});

// Generated block art rarely crops perfectly square (a real example: a
// 455x450 block image, so a 50 x 49.45 sprite in its 50px cell). Collision
// treats such walls as full cells.
describe('platformPhysics with undersized block art', () => {
  const shortWall = (col: number): PhysicsBox => ({
    position: {x: col * 50 + 25, y: 5 * 50 + 25},
    width: 50,
    height: (450 / 455) * 50,
    scale: 1,
  });

  it('lands on the cell top, not the art top, and walks flush', () => {
    const walls = [shortWall(2), shortWall(3), shortWall(4), shortWall(5)];
    // The reporting scene's player: 520x512 art at cell size.
    const player = makeSprite(175, 75, 50, (512 / 520) * 50);
    run(player, walls, 30);
    // Feet on the cell top (y=250), centered landing without drift.
    expect(feet(player)).toBeCloseTo(250, 6);
    expect(player.position.x).toBe(175);
    // Walking right across all three seams stays flush and monotonic.
    const positions: number[] = [];
    run(player, walls, 30, 3, s => positions.push(s.position.x));
    positions.reduce((a, b) => {
      expect(b).toBeGreaterThanOrEqual(a);
      return b;
    });
    expect(feet(player)).toBeCloseTo(250, 6);
  });
});

// The production warp: real sprites carry trimmed art dimensions and
// fractional scales (a 288x376 costume at scale 50/376, 455x450 blocks at
// 50/455), whose flush-contact arithmetic leaves ±1e-14 residues. The
// push-out's zero test read those as overlap and corner-pushed a centered
// landing sideways (175 -> 184.68 via a two-wall ping-pong).
describe('platformPhysics with trimmed-art dimensions', () => {
  it('lands a centered drop without sideways displacement', () => {
    const walls: PhysicsBox[] = [2, 3, 4, 5].map(col => ({
      position: {x: col * 50 + 25, y: 275},
      width: 455,
      height: 450,
      scale: 0.5 * (100 / 455),
    }));
    const player: PhysicsSprite = {
      position: {x: 175, y: 75},
      velocity: {x: 0, y: 0},
      width: 288,
      height: 376,
      scale: 0.5 * (100 / 376),
    };
    const xs = new Set<number>();
    run(player, walls, 40, 0, s => xs.add(s.position.x));
    expect([...xs]).toEqual([175]);
  });
});
