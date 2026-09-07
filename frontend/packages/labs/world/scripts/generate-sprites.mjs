// Draws World Lab's built-in appearance assets. Two kinds:
//   - static sprites: one `${name}.png` image;
//   - animations: a horizontal spritesheet `${name}.png` of N frames.
// Pure Node: a minimal RGBA PNG encoder over `node:zlib`, no image dependency.
//
// The BYTES reach the lab through `write-stock-assets.mjs`, which bakes them
// into `src/appearance/stockImages.ts` as data URLs — a project owns every image
// it draws, so an import copies one in rather than pointing at a file the
// runtime serves. Nothing loads these over the network.
//
// `generateSprites(dir)` writes the PNGs out as files, which nothing in the lab
// needs. It is kept because it is how you LOOK at a drawing: render to a
// scratch directory and open them, rather than editing arithmetic blind.
//
// SPRITE_NAMES / ANIMATION_SPECS / SPRITE_SIZE are the source of truth the
// library mirrors in src/appearance/stock.ts (a test keeps them in sync).

import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {deflateSync} from 'node:zlib';

export const SPRITE_SIZE = 32;
export const SPRITE_NAMES = [
  'player',
  'ground',
  'coin',
  'box',
  'ball',
  // An asteroids-shaped set: something to fly, something to break, something to
  // break it with. All three point UP unrotated, because `facing` is (0,-1)
  // turned by the actor's rotation — a drawing that pointed right would fly
  // sideways the moment anything used it (rules/drive).
  'ship',
  'asteroid',
  'energyBall',
  // A way out of the room. Fills the tile's height like `ground` does, so a
  // door stands on the floor rather than hovering over it.
  'door',
  // Something to stand somewhere and mean it: a destination, a landmark, a
  // thing in a row. Borrowed sprites read as what they are — a marker drawn as
  // a floor tile is a floor tile hanging in the air.
  'post',
  // …and the end of the level, which is a different thing from a landmark: a
  // post says HERE and a flag says FINISHED.
  'flag',
  // Something that damages. Drawn as a crate until now, in three lessons, in a
  // curriculum where a crate is the thing you push.
  'spike',
  // Scenery, which is a different job from ground: a hill is what a parallax
  // layer is FOR, and it has to read as far away rather than as walkable.
  'hill',
  // …and a segment of pipe, which is what a column of them is made of.
  'pipe',
  // Something that walks its beat and damages what it touches. The one in the
  // starter has been an asteroid since the day Patrol was written, and a rock
  // that paces a corridor reads as a rock somebody forgot to stop.
  'crawler',
  // A wall, which is not a floor stood on its end. Every room in the library
  // was built out of `ground`, and a stack of grass-topped floor tiles reads
  // as a ladder of stripes rather than as something you cannot walk through.
  'wall',
  // The player with a jetpack on, which is a different actor from the one in
  // every other level: `player` is shared by the whole library and growing a
  // pack would put one on the platformer's hero too.
  'pilot',
  // The enemy that thinks (rules/prowling): a box on a tank track, which is
  // the shape that says "goes along the floor and takes its time" rather than
  // "flies at you".
  'robot',
  // Two enemies out of one rule and one number (rules/turning): a ball that
  // rolls back and forth along the floor, and a rocket that takes the next
  // turning. Both are drawn to be read as HAZARD before they are read as
  // anything — hard edges, cold metal, nothing friendly.
  'pinball',
  'rocket',
  // The way out, once it is open: the same frame with the slab gone. Two
  // sprites rather than one drawn two ways, because a locked door and an open
  // one are the same object in two states and `set sprite` is how a project
  // says which — the alternative is a drawing with a condition in it.
  'doorOpen',
  // What a level is FOR: the thing you have to have all of. Told apart from a
  // coin by shape and color both, because "collect these and not those" only
  // works if the two cannot be confused at a glance.
  'gem',
  // Three floors that do something to you (rules/surfaces). Each fills the
  // cell the way `ground` does, so a row of them lies flat and what you can
  // see is what acts on you — and each is told apart by COLOR before shape,
  // because a player reads a floor at a glance and from across the room.
  'conveyor',
  'ice',
  'sludge',
  // Fuel, in two sizes. The Jetpack rule has a tank, and a tank wants
  // something to fill it with — a big can and a small one, because "how much
  // is this worth" has to be readable from across the room and a number
  // painted on a 32-pixel sprite is not.
  'fuelCan',
  'fuelCanSmall',
  // A way up that is not a jump. Tiles VERTICALLY — a ladder is a column of
  // these — so the rails run the full height of the cell and the rungs are
  // spaced so that a stacked pair keeps the same gap across the joint.
  'ladder',
  // The enemy that flies (JETPACK.md, phase 3). Wings SPREAD and seen head-on,
  // rather than in profile, because it is the only thing in the room that can
  // be anywhere: a profile drawing has a side it is facing, and this one turns
  // round every time it flaps.
  'bat',
  // The last four (JETPACK.md, phase seven), and between them they are two
  // dials and no new rule — which is the point of drawing them as four very
  // different things. A player should never have to work out that the spring
  // and the shuriken are the same rule.
  'spring',
  'shuriken',
  'eyeball',
  'blob',
];
export const ANIMATION_SPECS = {
  coinSpin: {frames: 6, frameRate: 12},
  // Fast, because a flame that flickers slowly reads as a flag.
  pilotFly: {frames: 4, frameRate: 16},
  // …and slow, because a climb is deliberate. Two rungs a second.
  pilotClimb: {frames: 4, frameRate: 8},
  playerWalk: {frames: 4, frameRate: 8},
  switch: {frames: 6, frameRate: 12},
  shipThrust: {frames: 4, frameRate: 12},
  asteroidSpin: {frames: 8, frameRate: 10},
};

// ── A tiny RGBA canvas (w × h, h defaults to w) ──────────────────────────────
function canvas(w, h = w) {
  const data = new Uint8Array(w * h * 4); // transparent
  const put = (x, y, [r, g, b, a = 255]) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };
  const ellipse = (cx, cy, rx, ry, color) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        if (nx * nx + ny * ny <= 1) put(x, y, color);
      }
    }
  };
  const disc = (cx, cy, radius, color) =>
    ellipse(cx, cy, radius, radius, color);
  const roundRect = (x0, y0, rw, rh, radius, color) => {
    for (let y = y0; y < y0 + rh; y++) {
      for (let x = x0; x < x0 + rw; x++) {
        const dx = Math.max(x0 + radius - x, x - (x0 + rw - 1 - radius), 0);
        const dy = Math.max(y0 + radius - y, y - (y0 + rh - 1 - radius), 0);
        if (dx * dx + dy * dy <= radius * radius) put(x, y, color);
      }
    }
  };
  const rect = (x0, y0, rw, rh, color) => roundRect(x0, y0, rw, rh, 0, color);
  /**
   * Fill a polygon, even-odd, so a concave outline works.
   *
   * The ship needs it: its tail is a notch, which is the one thing discs and
   * rectangles cannot say. Tested at pixel CENTRES, matching how `ellipse`
   * decides, so a shape drawn both ways lines up.
   */
  const polygon = (points, color) => {
    let minY = h;
    let maxY = 0;
    for (const [, py] of points) {
      minY = Math.min(minY, Math.floor(py));
      maxY = Math.max(maxY, Math.ceil(py));
    }
    for (let y = Math.max(0, minY); y <= Math.min(h - 1, maxY); y++) {
      for (let x = 0; x < w; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const [xi, yi] = points[i];
          const [xj, yj] = points[j];
          if (
            yi > py !== yj > py &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
          ) {
            inside = !inside;
          }
        }
        if (inside) put(x, y, color);
      }
    }
  };
  return {data, w, h, put, disc, ellipse, roundRect, rect, polygon};
}

/** Copy a frame canvas into a sheet canvas at column `dx`. */
function blit(sheet, frame, dx) {
  for (let y = 0; y < frame.h; y++) {
    for (let x = 0; x < frame.w; x++) {
      const s = (y * frame.w + x) * 4;
      const d = (y * sheet.w + (dx + x)) * 4;
      for (let k = 0; k < 4; k++) sheet.data[d + k] = frame.data[s + k];
    }
  }
}

// ── Drawing ──────────────────────────────────────────────────────────────────
function playerBody(c) {
  c.roundRect(3, 3, 26, 24, 7, [58, 123, 213]); // blue body
  c.disc(12, 13, 2.6, [255, 255, 255]); // eyes
  c.disc(20, 13, 2.6, [255, 255, 255]);
  c.disc(12, 13, 1.2, [20, 30, 50]);
  c.disc(20, 13, 1.2, [20, 30, 50]);
}

/**
 * The jetpack itself: a tank either side, behind the body.
 *
 * Either side rather than on the back, because this actor faces the viewer —
 * a pack drawn behind it would be a pack nobody ever sees. The red band is
 * what makes two gray rectangles read as fuel rather than as arms.
 */
function pilotPack(c) {
  for (const x of [1, 27]) {
    c.roundRect(x, 8, 4, 15, 2, [92, 96, 108]);
    c.rect(x, 10, 4, 3, [214, 72, 62]);
  }
}

/** The pack, then the body over its inner edge — one silhouette, not three. */
function pilotBody(c) {
  pilotPack(c);
  playerBody(c);
}

/**
 * Two plumes, out of the bottom of the tanks.
 *
 * Drawn BEFORE the body so the tanks sit over the top of them, which is what
 * makes the flame read as coming out of something rather than as hanging
 * beneath it. `length` is what flickers.
 */
function pilotFlame(c, length) {
  for (const x of [1, 27]) {
    c.polygon(
      [
        [x, 20],
        [x + 4, 20],
        [x + 2, 22 + length],
      ],
      [255, 154, 48],
    );
    c.polygon(
      [
        [x + 1, 20],
        [x + 3, 20],
        [x + 2, 21 + length * 0.55],
      ],
      [255, 238, 160],
    );
  }
}

// ── The asteroids set ────────────────────────────────────────────────────────
// Shared so the still and its animation cannot drift: `ship` and `shipThrust`
// draw the same hull, `asteroid` and `asteroidSpin` the same rock.

const HULL = [
  [16, 3],
  [26, 26],
  [16, 20],
  [6, 26],
];
const HULL_EDGE = [64, 74, 96];
const HULL_FILL = [214, 222, 235];

/** Shrink a ring of points toward a center — an outline is the shape, twice. */
const shrink = (points, cx, cy, by) =>
  points.map(([x, y]) => [cx + (x - cx) * by, cy + (y - cy) * by]);

function shipHull(c) {
  c.polygon(HULL, HULL_EDGE);
  c.polygon(shrink(HULL, 16, 18, 0.62), HULL_FILL);
  c.disc(16, 13, 2.2, [70, 130, 200]); // the cockpit, so the nose is readable
}

/**
 * The flame, pointing back out of the notch.
 *
 * Drawn from the tail rather than from the center so it reads as coming OUT of
 * the ship; `length` is what flickers.
 */
function shipFlame(c, length) {
  c.polygon(
    [
      [11, 20],
      [21, 20],
      [16, 20 + length],
    ],
    [244, 132, 42],
  );
  c.polygon(
    [
      [13, 20],
      [19, 20],
      [16, 20 + length * 0.62],
    ],
    [255, 214, 120],
  );
}

// NINE radii turned by eighths of a circle: nine never maps onto itself at 45
// degrees, so every frame is a real rotation rather than the same silhouette
// relabelled, and eight of them come back round to the start.
//
// Nine rather than seven, and 12–15 rather than 11–15: seven wide-swinging
// vertices made a wedge with a bite out of it, which reads as a broken pie
// chart. A rock wants many small facets, not few deep ones.
const ROCK_RADII = [13.2, 14.6, 12.4, 15, 13.8, 12.2, 14.4, 12.8, 13.6];
const ROCK_PITS = [
  [6, 40, 2.6],
  [7.5, 170, 2.0],
  [5, 275, 1.6],
];

const rockPoints = turn =>
  ROCK_RADII.map((r, i) => {
    const a = turn + (i * 2 * Math.PI) / ROCK_RADII.length;
    return [16 + r * Math.cos(a), 16 + r * Math.sin(a)];
  });

function rock(c, turn) {
  const points = rockPoints(turn);
  c.polygon(points, [92, 94, 106]);
  c.polygon(shrink(points, 16, 16, 0.82), [143, 146, 158]);
  // Craters carried round with the rock, so it reads as turning rather than as
  // an outline wobbling in place.
  for (const [dist, deg, size] of ROCK_PITS) {
    const a = turn + (deg * Math.PI) / 180;
    c.disc(
      16 + dist * Math.cos(a),
      16 + dist * Math.sin(a),
      size,
      [110, 112, 124],
    );
  }
}

/**
 * A jerry can, at `scale` of the cell.
 *
 * ONE DRAWING AT TWO SIZES rather than two drawings, because the two are the
 * same object and a reader has to see that at a glance: a big can and a small
 * can is "more" and "less", where two different containers would be two
 * different things to learn. Scaled about the FLOOR of the cell rather than its
 * middle, so both sit on a tile instead of the small one hovering.
 */
function fuelCan(c, scale) {
  const w = Math.round(18 * scale);
  const h = Math.round(23 * scale);
  const x = Math.round((32 - w) / 2);
  const y = 31 - h;
  const unit = Math.max(1, Math.round(2 * scale));
  // The body, its lit face, and the dark edge that keeps it off the background.
  c.rect(x, y, w, h, [128, 34, 28]);
  c.rect(x + unit, y + unit, w - 2 * unit, h - 2 * unit, [206, 62, 48]);
  c.rect(x + unit, y + unit, w - 2 * unit, unit, [238, 120, 96]);
  // The X brace, which is the mark that says jerry can and not box. Two thin
  // quads rather than strokes, because a quad is the only line this canvas
  // draws and a diagonal one pixel wide would vanish at the smaller size.
  const left = x + unit * 2;
  const right = x + w - unit * 2;
  const top = y + unit * 2;
  const bottom = y + h - unit * 2;
  const brace = [148, 40, 32];
  c.polygon(
    [
      [left, top],
      [left + unit, top],
      [right, bottom],
      [right - unit, bottom],
    ],
    brace,
  );
  c.polygon(
    [
      [right - unit, top],
      [right, top],
      [left + unit, bottom],
      [left, bottom],
    ],
    brace,
  );
  // A handle across the whole top, and a cap standing proud of it at one end.
  // One bar rather than two stubs: two read as chimneys, and the thing a can
  // is carried by is the line between them.
  c.rect(x + unit, y - unit, w - unit * 2, unit, [90, 92, 104]);
  c.rect(x + w - unit * 3, y - unit * 2, unit * 2, unit * 2, [118, 120, 132]);
}

const STATIC = {
  player: c => playerBody(c),
  ground(c) {
    // Fill the whole cell so the drawn tile is an exact 32x32 square: its top
    // edge is the cell top, matching the collision box (rules/collision.ts), so
    // an actor rests on the visible grass rather than floating above it.
    c.rect(0, 0, 32, 32, [107, 74, 43]); // soil fills the tile
    c.rect(0, 0, 32, 6, [90, 160, 44]); // grass top strip
  },
  crawler(c) {
    // A bug on six legs, standing on the floor of its cell: the legs reach the
    // bottom edge, so a crawler placed on a tile is walking on it rather than
    // hovering over it.
    //
    // PURPLE because every other color in the library already means something
    // — blue is the player, gold is a coin, green is grass, gray is stone, red
    // is the ball — and a thing that damages you should not have to be read
    // twice. The eyes are the player's eyes at the player's size, which is
    // what makes the two read as the same kind of creature.
    for (const x of [4, 11, 18, 25]) {
      c.rect(x, 23, 3, 8, [52, 28, 70]); // legs
    }
    for (const x of [9, 15, 21]) {
      c.polygon(
        [
          [x, 9],
          [x + 3, 2],
          [x + 6, 9],
        ],
        [52, 28, 70],
      ); // the spines along its back
    }
    c.roundRect(2, 7, 28, 19, 9, [52, 28, 70]); // the shell's edge
    c.roundRect(3, 8, 26, 17, 8, [138, 74, 178]); // the shell
    c.roundRect(5, 9, 22, 7, 5, [170, 108, 210]); // lit from above
    c.disc(12, 18, 2.6, [255, 255, 255]); // eyes
    c.disc(20, 18, 2.6, [255, 255, 255]);
    c.disc(12, 18, 1.2, [20, 30, 50]);
    c.disc(20, 18, 1.2, [20, 30, 50]);
  },
  wall(c) {
    // Courses of stone in a running bond, which is the pattern that says WALL
    // with four rectangles: each row is offset half a stone from the one above,
    // so the joints never line up into a column.
    //
    // IT HAS TO TILE, in both directions — a room is a line of these — so the
    // stones are 16 wide into a 32-wide cell and the offset is 8: whatever is
    // cut off one edge is what the next tile starts with. Nothing is drawn on
    // the outer boundary except mortar, so two neighbors share a joint rather
    // than showing a seam.
    c.rect(0, 0, 32, 32, [66, 70, 82]); // mortar, and the joints between stones
    for (let row = 0; row < 4; row++) {
      const y = row * 8;
      const shift = row % 2 ? 8 : 0;
      for (let stone = -1; stone < 2; stone++) {
        const x = shift + stone * 16;
        c.rect(x + 1, y + 1, 14, 6, [122, 128, 142]); // the stone
        c.rect(x + 1, y + 1, 14, 2, [148, 154, 168]); // its lit top edge
      }
    }
  },
  coin(c) {
    c.disc(16, 16, 13, [244, 196, 48]);
    c.disc(16, 16, 9, [255, 224, 120]);
    c.disc(16, 16, 5, [244, 196, 48]);
  },
  box(c) {
    c.rect(2, 2, 28, 28, [120, 78, 38]);
    c.rect(4, 4, 24, 24, [217, 138, 61]);
    for (let d = 0; d < 24; d++) {
      c.put(4 + d, 4 + d, [120, 78, 38]);
      c.put(27 - d, 4 + d, [120, 78, 38]);
    }
  },
  ball(c) {
    c.disc(16, 16, 13, [224, 72, 62]);
    c.disc(12, 12, 4, [255, 170, 165]);
  },
  ship: c => shipHull(c),
  asteroid: c => rock(c, 0),
  energyBall(c) {
    // A ball with a bright core and a softer shell, so it reads as something
    // charged rather than something fired: round from every side, which also
    // means rotation does nothing to it and it looks the same going any way.
    c.disc(16, 16, 7, [96, 208, 255]);
    c.disc(16, 16, 4.5, [190, 240, 255]);
    c.disc(16, 16, 2, [255, 255, 255]);
  },
  door(c) {
    // Frame, slab, two panels and a handle — the fewest marks that read as a
    // door at 32 pixels. The wood is `box`'s, because a crate and a door in the
    // same room should look like they were cut from the same tree.
    c.rect(2, 0, 28, 32, [92, 60, 30]); // the frame, floor to lintel
    c.rect(5, 3, 22, 29, [176, 116, 56]); // the door itself
    c.rect(8, 6, 16, 9, [140, 90, 42]); // upper panel
    c.rect(8, 19, 16, 9, [140, 90, 42]); // lower panel
    c.disc(22, 17, 2, [244, 196, 48]); // the handle, which is what says DOOR
  },
  robot(c) {
    // A tracked base and a boxy body with one eye. The TRACK is what makes it
    // read as ground-bound: a thing on treads goes where the floor goes, and
    // a player reads that before they read anything else about it.
    c.rect(2, 22, 28, 9, [46, 48, 58]); // the track, floor to axle
    for (const x of [5, 12, 19, 26]) {
      c.rect(x, 24, 3, 5, [120, 126, 140]); // its cleats
    }
    c.disc(8, 26, 3.5, [78, 84, 96]); // the drive wheels showing through
    c.disc(24, 26, 3.5, [78, 84, 96]);
    c.roundRect(5, 6, 22, 17, 4, [58, 62, 74]); // the body's edge
    c.roundRect(6, 7, 20, 15, 3, [148, 156, 172]); // the body
    c.rect(8, 9, 16, 4, [188, 196, 212]); // lit along the top
    c.disc(16, 16, 4.5, [40, 44, 54]); // the eye's socket
    c.disc(16, 16, 3, [232, 92, 72]); // …and the eye, which is the one warm
    c.disc(15, 15, 1.2, [255, 200, 180]); // color on it
    c.rect(15, 2, 2, 5, [78, 84, 96]); // an aerial, so it has a top
    c.disc(16, 2, 1.6, [232, 92, 72]);
  },
  pinball(c) {
    // Steel rather than the red `ball`, and lit hard from the upper left so it
    // reads as heavy: a thing you would not want to be under. The rim is what
    // stops it dissolving into a dark room.
    c.disc(16, 16, 13, [78, 84, 96]);
    c.disc(16, 16, 12, [168, 176, 192]);
    c.disc(13, 13, 7, [210, 218, 232]);
    c.disc(11, 11, 3.5, [246, 250, 255]); // the highlight
    c.disc(21, 21, 4, [120, 128, 146]); // …and the shadowed underside
  },
  bat(c) {
    // Wings spread, seen head-on, with a SCALLOPED trailing edge — three
    // fingers and two notches. That edge is the whole of what says bat rather
    // than bird at this size, and it is why the wing is a polygon rather than
    // the two triangles that would otherwise do.
    //
    // Symmetric about x = 16, so the drawing is written once and mirrored: a
    // thing that turns round every time it flaps must look the same going
    // either way, or it reads as flying backwards half the time.
    const WING = [104, 72, 138];
    const WING_EDGE = [68, 46, 94];
    const BODY = [52, 36, 68];
    const EYE = [255, 96, 96];
    const wing = [
      [15, 13],
      [21, 7],
      [31, 6],
      [25, 13],
      [30, 16],
      [23, 15],
      [26, 21],
      [16, 17],
    ];
    const mirrored = wing.map(([x, y]) => [32 - x, y]);
    c.polygon(wing, WING);
    c.polygon(mirrored, WING);
    // The arm along the leading edge, which gives the wing a bone rather than
    // leaving it a flat shape.
    c.polygon(
      [
        [15, 13],
        [21, 7],
        [31, 6],
        [31, 8],
        [22, 9],
        [16, 15],
      ],
      WING_EDGE,
    );
    c.polygon(
      [
        [17, 13],
        [11, 7],
        [1, 6],
        [1, 8],
        [10, 9],
        [16, 15],
      ],
      WING_EDGE,
    );
    // Ears before the head, so the head's edge cuts across their bases and
    // they read as attached rather than balanced on top.
    c.polygon(
      [
        [12, 14],
        [16, 14],
        [12, 7],
      ],
      BODY,
    );
    c.polygon(
      [
        [20, 14],
        [16, 14],
        [20, 7],
      ],
      BODY,
    );
    c.disc(16, 14, 4.5, BODY); // the head
    c.roundRect(13, 16, 6, 9, 3, BODY); // …and the body hanging under it
    c.disc(14.2, 13.5, 1.3, EYE);
    c.disc(17.8, 13.5, 1.3, EYE);
  },
  spring(c) {
    // A coil seen from the side, which is the one shape that says "this goes
    // up and down" standing still. Drawn symmetric top to bottom, because it
    // arrives at the ceiling as often as at the floor and turning it over
    // must not read as a different actor.
    const COIL = [196, 202, 216];
    const LIT = [232, 238, 250];
    c.rect(4, 2, 24, 4, [150, 156, 170]); // the plate it pushes with
    c.rect(4, 26, 24, 4, [150, 156, 170]);
    // Four turns, JOINED alternately at each end. Without the joins it is
    // four bars in a row, which reads as a ladder rather than a spring —
    // what says coil is that you can follow it from one end to the other.
    for (const [index, y] of [8, 13, 18, 23].entries()) {
      c.rect(7, y, 18, 3, COIL);
      c.rect(7, y, 18, 1, LIT);
      if (index < 3) {
        const atLeft = index % 2 === 0;
        c.rect(atLeft ? 22 : 7, y, 3, 8, COIL);
      }
    }
  },
  shuriken(c) {
    // Four blades from a hub, at the diagonals rather than the axes, so that
    // a spin reads as a spin at any frame — a cross aligned to the pixel grid
    // looks like a plus sign that flickers.
    const STEEL = [188, 196, 212];
    const EDGE = [120, 128, 146];
    for (const [dx, dy] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      c.polygon(
        [
          [16, 16],
          [16 + dx * 6, 16 - dy * 6],
          [16 + dx * 15, 16 + dy * 15],
          [16 - dx * 6, 16 + dy * 6],
        ],
        EDGE,
      );
      c.polygon(
        [
          [16, 16],
          [16 + dx * 4, 16 - dy * 4],
          [16 + dx * 13, 16 + dy * 13],
          [16 - dx * 4, 16 + dy * 4],
        ],
        STEEL,
      );
    }
    c.disc(16, 16, 4, EDGE);
    c.disc(16, 16, 2, [40, 44, 54]); // the hole in the middle
  },
  eyeball(c) {
    // SMALL and pale, because it is the one enemy a wall does not stop and it
    // has to be read as not-quite-there. An iris that fills most of it, so
    // that what a player sees is a thing looking at them.
    c.disc(16, 16, 10, [226, 232, 244]);
    c.disc(16, 16, 9, [246, 250, 255]);
    c.disc(15, 15, 5, [92, 148, 220]); // the iris, off center: it is looking
    c.disc(15, 15, 2.5, [24, 28, 40]);
    c.disc(13, 13, 1.2, [255, 255, 255]); // the catchlight
    // Veins, which is what stops a white disc reading as a ball.
    c.rect(23, 15, 3, 1, [226, 140, 140]);
    c.rect(6, 18, 3, 1, [226, 140, 140]);
  },
  blob(c) {
    // The wanderer: no eyes, no front, no direction. Everything else in the
    // room tells you where it is going and this one cannot, which is the
    // whole of what it is for — so it is drawn as a shape with no front.
    c.disc(16, 18, 11, [96, 176, 108]);
    c.disc(16, 17, 10, [126, 208, 138]);
    c.disc(12, 13, 4, [168, 232, 176]); // a wet highlight
    c.rect(5, 26, 22, 4, [78, 148, 92]); // squashed where it sits
  },
  rocket(c) {
    // Pointing RIGHT unrotated, because that is where a heading of zero
    // points (rules/turning) — the ship and the asteroid point up because
    // `facing` is what turns those, and this is turned by a heading instead.
    c.polygon(
      [
        [4, 10],
        [22, 10],
        [30, 16],
        [22, 22],
        [4, 22],
      ],
      [92, 96, 108],
    ); // the body and its nose
    c.polygon(
      [
        [6, 12],
        [21, 12],
        [27, 16],
        [21, 20],
        [6, 20],
      ],
      [206, 62, 48],
    );
    c.rect(6, 14, 10, 3, [246, 160, 140]); // lit along the top
    // Fins at the tail, above and below, which is what says rocket rather
    // than bullet at this size.
    c.polygon(
      [
        [4, 10],
        [10, 10],
        [4, 4],
      ],
      [92, 96, 108],
    );
    c.polygon(
      [
        [4, 22],
        [10, 22],
        [4, 28],
      ],
      [92, 96, 108],
    );
    c.disc(24, 16, 2.5, [120, 200, 255]); // the eye at the nose
  },
  doorOpen(c) {
    // The frame it left behind: the same lintel and jambs, and dark where the
    // slab was. It has to read as a way THROUGH rather than as a hole, so the
    // jambs stay lit and the opening is the room's own darkness.
    c.rect(2, 0, 28, 32, [92, 60, 30]); // the frame, floor to lintel
    c.rect(5, 3, 22, 29, [26, 24, 38]); // the doorway, dark
    c.rect(2, 0, 28, 3, [140, 90, 42]); // the lintel, lit
    c.rect(2, 0, 3, 32, [140, 90, 42]); // and both jambs
    c.rect(27, 0, 3, 32, [140, 90, 42]);
    // The slab, swung back inside the frame — a sliver, so the door is
    // visibly open rather than gone.
    c.rect(24, 4, 3, 27, [176, 116, 56]);
  },
  gem(c) {
    // A cut stone: a flat table on top, facets falling away to a point. GREEN,
    // because gold is a coin and red is a fuel can, and this has to be told
    // from both across a room.
    c.polygon(
      [
        [8, 9],
        [24, 9],
        [16, 27],
      ],
      [24, 128, 96],
    ); // the body, tapering to a point
    c.polygon(
      [
        [10, 10],
        [22, 10],
        [16, 24],
      ],
      [56, 200, 150],
    ); // its lit face
    c.polygon(
      [
        [16, 10],
        [22, 10],
        [16, 24],
      ],
      [30, 160, 118],
    ); // …and the shaded half, which is what makes it read as cut
    c.rect(7, 5, 18, 4, [88, 224, 176]); // the table, brightest
    c.rect(7, 5, 18, 2, [180, 250, 230]);
  },
  post(c) {
    // A stake driven into the ground, lit from the left. The shaded half is
    // what makes it read as round rather than as a stripe, and the band near
    // the top is what makes it a MARKER rather than a piece of timber.
    c.roundRect(11, 3, 10, 29, 3, [92, 60, 30]); // the post and its edge
    c.roundRect(12, 4, 8, 27, 2, [176, 116, 56]); // sunlit wood
    c.rect(16, 5, 4, 26, [140, 90, 42]); // the shaded half
    c.rect(10, 14, 12, 3, [216, 76, 66]); // the painted band
    c.rect(9, 29, 14, 3, [72, 48, 26]); // the ground it stands in
  },
  flag(c) {
    // A chequered flag: the one picture that says FINISH without a word, and
    // the reason it is chequered rather than a colored pennant is that every
    // color in this library already means something else.
    c.rect(8, 2, 3, 30, [150, 154, 166]); // the pole
    c.rect(8, 2, 1, 30, [96, 100, 112]); // its shaded edge
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 4; column++) {
        c.rect(
          11 + column * 4,
          5 + row * 4,
          4,
          4,
          (row + column) % 2 === 0 ? [240, 242, 246] : [40, 44, 52],
        );
      }
    }
    c.rect(6, 29, 7, 3, [72, 48, 26]); // the ground it stands in
  },
  hill(c) {
    // A mound whose foot is below the cell, so the visible part is the top of
    // something bigger — and dimmer and bluer than `ground`, because at this
    // size what says FAR AWAY is color rather than detail. Wide enough to
    // touch both edges, so a row of them reads as a ridge.
    c.ellipse(16, 46, 20, 36, [46, 78, 62]);
    c.ellipse(12, 50, 13, 34, [64, 100, 74]); // the lit side, up and to the left
  },
  pipe(c) {
    // A SEGMENT. A pipe is a column of these, one per tile (`fixtures/flappy`),
    // so the shading runs ACROSS it and never along: anything horizontal here
    // would draw a seam at every tile boundary.
    c.rect(0, 0, 32, 32, [58, 142, 74]); // the body
    c.rect(2, 0, 7, 32, [96, 186, 108]); // lit down one side
    c.rect(24, 0, 6, 32, [38, 104, 54]); // shaded down the other
    c.rect(0, 0, 2, 32, [30, 84, 44]); // and its two hard edges
    c.rect(30, 0, 2, 32, [30, 84, 44]);
  },
  conveyor(c) {
    // A belt on two rollers, with chevrons pointing the way it carries. Tiles
    // sideways: the rollers sit inside the cell and the chevrons repeat every
    // sixteen, so a run of these is one belt rather than a row of machines.
    c.rect(0, 0, 32, 32, [48, 50, 58]); // the housing, filling the tile
    c.rect(0, 2, 32, 12, [86, 90, 102]); // the belt itself, lit from above
    c.rect(0, 14, 32, 3, [34, 36, 42]); // its shadow
    for (const cx of [8, 24]) {
      c.disc(cx, 8, 5, [58, 62, 72]); // a roller under the belt
      c.disc(cx, 8, 2, [120, 126, 140]); // …and its axle
    }
    for (const x of [2, 18]) {
      c.polygon(
        [
          [x, 3],
          [x + 6, 8],
          [x, 13],
          [x + 2, 8],
        ],
        [214, 176, 64],
      ); // a chevron, pointing right
    }
  },
  ice(c) {
    // Pale, and pale is the point: ice has to be readable as NOT ground from
    // across a room, and a blue floor is the one thing in the library that
    // cannot be mistaken for soil.
    c.rect(0, 0, 32, 32, [120, 176, 214]);
    c.rect(0, 0, 32, 7, [206, 236, 250]); // the lit top surface
    c.rect(0, 7, 32, 2, [166, 210, 236]);
    // Two glints, off the diagonal so a run of tiles does not read as stripes.
    c.polygon(
      [
        [5, 14],
        [13, 14],
        [9, 22],
      ],
      [176, 216, 240],
    );
    c.polygon(
      [
        [20, 18],
        [26, 18],
        [23, 26],
      ],
      [176, 216, 240],
    );
  },
  sludge(c) {
    // NOT a green strip on brown, which is what `ground` already is — the two
    // were told apart only by squinting, and a floor a player has to squint at
    // is a floor they walk on to by accident. So: no lit top edge, no crisp
    // line, and a color nothing else in the library uses. A thick ochre ooze
    // with a lumpy underside, sitting in the tile rather than growing out of
    // it.
    c.rect(0, 0, 32, 32, [58, 46, 30]); // the dark bed it sits in
    c.rect(0, 0, 32, 14, [138, 116, 44]); // the ooze, filling the top
    // A lumpy lower edge: three overlapping discs, so no two tiles in a row
    // line up into a stripe.
    for (const [cx, r] of [
      [5, 5],
      [16, 6],
      [27, 5],
    ]) {
      c.disc(cx, 14, r, [138, 116, 44]);
    }
    // …and bubbles in it, which is the mark that says thick rather than wet.
    c.disc(9, 6, 2.5, [176, 154, 70]);
    c.disc(22, 8, 3, [176, 154, 70]);
    c.disc(9, 6, 1.2, [96, 78, 28]);
    c.disc(22, 8, 1.4, [96, 78, 28]);
  },
  pilot: c => pilotBody(c),
  ladder(c) {
    // Two rails and two rungs. The rails reach both edges so a column of these
    // is one unbroken ladder; the rungs sit at 4 and 20, sixteen apart, which
    // is also the distance from the lower one to the next tile's upper.
    const wood = [198, 152, 78];
    const shade = [140, 100, 46];
    for (const x of [6, 22]) {
      c.rect(x, 0, 4, 32, shade);
      c.rect(x, 0, 3, 32, wood);
    }
    for (const y of [4, 20]) {
      c.rect(6, y, 20, 4, shade);
      c.rect(6, y, 20, 3, wood);
    }
  },
  fuelCan: c => fuelCan(c, 1),
  fuelCanSmall: c => fuelCan(c, 0.66),
  spike(c) {
    // Three teeth on a plate, pointing UP, filling the cell the way `ground`
    // does — so a row of them lies flat on the floor rather than hovering over
    // it, and so what you can see is what can damage you.
    c.rect(0, 26, 32, 6, [70, 74, 84]); // the plate they are set in
    for (let tooth = 0; tooth < 3; tooth++) {
      const x = 1 + tooth * 10;
      c.polygon(
        [
          [x, 27],
          [x + 5, 3],
          [x + 10, 27],
        ],
        [176, 180, 192],
      );
      // The right half darker, which is the whole of why it reads as a cone
      // rather than as a paper triangle.
      c.polygon(
        [
          [x + 5, 3],
          [x + 10, 27],
          [x + 5, 27],
        ],
        [112, 116, 130],
      );
    }
  },
};

// Each animation draws frame `t` (0..frames-1) into a SPRITE_SIZE canvas.
const ANIMATION_FRAME = {
  // A coin spinning about its vertical axis: the disc squashes horizontally to
  // an edge and back. Color shifts toward the darker rim at the thin frames.
  coinSpin(c, t, frames) {
    const wf = Math.max(0.12, Math.abs(Math.cos((Math.PI * t) / frames)));
    const gold = wf > 0.4 ? [244, 196, 48] : [196, 150, 30];
    c.ellipse(16, 16, 13 * wf, 13, gold);
    c.ellipse(16, 16, 9 * wf, 9, [255, 224, 120]);
  },
  // The player walking: body plus two legs that alternate lifting.
  playerWalk(c, t) {
    playerBody(c);
    const lift = [
      [0, 3],
      [1, 1],
      [3, 0],
      [1, 1],
    ][t];
    c.rect(11, 27, 4, 5 - lift[0], [40, 78, 150]); // left leg
    c.rect(17, 27, 4, 5 - lift[1], [40, 78, 150]); // right leg
  },
  // A tile-mounted switch: a lever on a base that sweeps from one side (frame 0)
  // to the other (last frame). The engine plays it non-looping, so it flips once
  // and holds; the knob shifts red (off) -> green (on) as it crosses.
  // The ship under power: the same hull, with a flame that flickers rather than
  // pulsing evenly — a smooth in-and-out reads as breathing, not burning.
  shipThrust(c, t) {
    // Long enough that the SHORT frames still clear the hull: the tail sits at
    // y=26, so a plume under about six pixels is drawn entirely underneath the
    // ship and the flicker reads as the flame cutting out.
    shipFlame(c, [11, 8, 10, 9][t]);
    shipHull(c);
  },
  // The jetpack lit. The flame flickers rather than pulsing evenly — a smooth
  // in-and-out reads as breathing, not burning — and the shortest frame still
  // clears the body, so the flicker is a flame guttering rather than one that
  // goes out.
  pilotFly(c, t) {
    pilotFlame(c, [9, 5, 8, 6][t]);
    pilotBody(c);
  },
  // Climbing: one arm up and the opposite leg down, and back. Four frames
  // rather than two, so the reach has a middle and does not read as a twitch.
  pilotClimb(c, t) {
    pilotBody(c);
    const reach = [0, 3, 6, 3][t];
    const limb = [40, 78, 150];
    c.rect(6, 6 - reach / 2, 4, 7, limb); // the arm that is reaching
    c.rect(22, 3 + reach / 2, 4, 7, limb); // …and the one coming down
    c.rect(11, 27, 4, 5 - reach / 2, limb); // legs, opposite the arms
    c.rect(17, 27, 4, 2 + reach / 2, limb);
  },
  // The rock turning. An eighth of a circle per frame, seven sides.
  asteroidSpin(c, t, frames) {
    rock(c, (t * 2 * Math.PI) / frames);
  },
  switch(c, t, frames) {
    c.roundRect(6, 21, 20, 9, 3, [78, 84, 94]); // housing on the tile
    c.roundRect(6, 21, 20, 3, 3, [120, 128, 140]); // top highlight
    c.disc(16, 22, 2.5, [40, 44, 52]); // pivot
    const denom = Math.max(1, frames - 1);
    const rad = ((135 - (90 * t) / denom) * Math.PI) / 180; // 135deg -> 45deg
    const L = 11;
    const tipX = 16 + L * Math.cos(rad);
    const tipY = 22 - L * Math.sin(rad);
    for (let s = 0; s <= 16; s++) {
      // The lever arm: a thick metal line from the pivot to the knob.
      const x = 16 + ((tipX - 16) * s) / 16;
      const y = 22 + ((tipY - 22) * s) / 16;
      c.disc(x, y, 1.4, [176, 182, 190]);
    }
    const f = t / denom;
    c.disc(tipX, tipY, 3.5, [
      Math.round(220 + (90 - 220) * f),
      Math.round(72 + (200 - 72) * f),
      Math.round(62 + (90 - 62) * f),
    ]); // knob: red (off) -> green (on)
  },
};

// ── PNG encoding (RGBA, 8-bit, no filtering) ─────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, dataBuf) {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), dataBuf]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(dataBuf.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
/**
 * RGBA bytes as a PNG.
 *
 * Exported because the rule-demo recorder writes strips with it
 * (specs/RULE_DEMOS.md). A pure-Node encoder, no image dependency — which is
 * what lets that recorder run without a browser in the build path.
 */
export function encodePng(rgba, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, y * width * 4, width * 4).copy(
      raw,
      y * (width * 4 + 1) + 1,
    );
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Every stock image as PIXELS, `{name: {width, height, data}}` in RGBA.
 *
 * What the drawings ARE, before anything encodes them. `stockImages` encodes
 * these; the actor-demo recorder blits them into a strip, which is the reason
 * this exists separately. That recorder runs in Node with no canvas, so its
 * choice was to decode the PNGs it had just been handed or to be given the
 * bytes that made them — and a decoder for our own encoder's output is a
 * second copy of the format, kept in step by hand, to arrive back where this
 * function already is.
 */
export function stockPixels() {
  const pixels = {};
  for (const name of SPRITE_NAMES) {
    const c = canvas(SPRITE_SIZE);
    STATIC[name](c);
    pixels[name] = {width: SPRITE_SIZE, height: SPRITE_SIZE, data: c.data};
  }
  for (const [name, {frames}] of Object.entries(ANIMATION_SPECS)) {
    const sheet = canvas(SPRITE_SIZE * frames, SPRITE_SIZE);
    for (let t = 0; t < frames; t++) {
      const frame = canvas(SPRITE_SIZE);
      ANIMATION_FRAME[name](frame, t, frames);
      blit(sheet, frame, t * SPRITE_SIZE);
    }
    pixels[name] = {
      width: SPRITE_SIZE * frames,
      height: SPRITE_SIZE,
      data: sheet.data,
    };
  }
  return pixels;
}

/**
 * Every stock image, as `{name: pngBuffer}`.
 *
 * The bytes, with nowhere to put them: `generateSprites` writes them to disk for
 * the demo's vendor directory, and `write-stock-assets.mjs` writes them into the
 * lab's source as data URLs, which is what an import copies into a project.
 */
export function stockImages() {
  const images = {};
  for (const [name, {width, height, data}] of Object.entries(stockPixels())) {
    images[name] = encodePng(data, width, height);
  }
  return images;
}

/** Write every built-in sprite and animation PNG into `outDir`. */
export function generateSprites(outDir) {
  mkdirSync(outDir, {recursive: true});
  for (const [name, png] of Object.entries(stockImages())) {
    writeFileSync(join(outDir, `${name}.png`), png);
  }
  return {sprites: SPRITE_NAMES, animations: Object.keys(ANIMATION_SPECS)};
}
