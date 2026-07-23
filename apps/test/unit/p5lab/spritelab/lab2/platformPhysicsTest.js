import {
  resolvePlatformPhysics,
  TERMINAL_FALL_SPEED,
  PLATFORM_GRAVITY,
} from '@cdo/apps/p5lab/spritelab/lab2/platformPhysics';

// One test per feel rule; the scenarios mirror the browser verification the
// rules were tuned against (400x400 view, 50px grid).
const VIEW = {width: 400, height: 400};

// Default art box 25x50 at scale 1: body 20x40, feet-anchored (drop 5).
const makeSprite = (x, y, w = 25, h = 50) => ({
  position: {x, y},
  velocity: {x: 0, y: 0},
  width: w,
  height: h,
  scale: 1,
});

const wallAt = (col, row) => ({
  position: {x: col * 50 + 25, y: row * 50 + 25},
  width: 50,
  height: 50,
  scale: 1,
});

const feet = sprite => sprite.position.y + (sprite.height * sprite.scale) / 2;

// One frame: p5's pre-phase velocity integration, held-key movement (the
// interpreted blocks move sprites imperatively), then the resolver.
const step = (sprite, walls, vx = 0) => {
  sprite.position.y += sprite.velocity.y;
  sprite.position.x += vx;
  resolvePlatformPhysics(
    [{sprite, x: sprite.position.x, y: sprite.position.y}],
    walls,
    VIEW
  );
};

const run = (sprite, walls, frames, vx = 0, onFrame) => {
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
    const feetSeen = new Set();
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
    const xs = new Set();
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
    const xs = new Set();
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
