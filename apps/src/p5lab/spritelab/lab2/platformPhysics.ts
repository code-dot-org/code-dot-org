// Platformer collision resolution for player sprites. The engine runs it
// once per frame just before the paint — after p5's pre-phase velocity
// integration and after the frame's behaviors and events have moved
// sprites. Per player it reconstructs the frame's movement from the last
// resolved position, resolves it per axis against the walls, then settles
// leftover thin overlap.

// Max downward speed (px/frame): a single frame's step must stay small
// enough that a falling body can't pass a block corner between frames.
export const TERMINAL_FALL_SPEED = 10;

// Downward gravity (px/frame²), the zGameDev value, so block-tuned jump
// strengths behave identically here.
export const PLATFORM_GRAVITY = 0.75;

// What patrollers feel when the world's gravity is zero and the player is
// steered about: enough to settle onto blocks, gently.
export const PATROLLER_WEIGHTLESS_GRAVITY = 0.2;

// Slack (px) for exact-contact comparisons: resting and pinned contact are
// exact equalities, with possible sub-pixel noise on them.
export const CONTACT_EPSILON = 0.1;

// Thin-contact allowance (px): a wall overlapped by less than this along
// one axis doesn't block movement along the other, and any such thin
// overlap left at the end of the pass is pushed out the short way.
// One-cell notches and doorways are exactly player-sized on the default
// grid, so without the allowance there is zero clearance to enter them.
export const MIN_SOLID_OVERLAP = 8;

// Stepping off an edge falls at least this fast (px/frame): the very
// first airborne step already falls deeper than a landing accepts, so no
// walk-off can catch the far lip of a gap — at any costume shape or
// phase. Ramping from zero instead made a one-block gap a coin flip. A
// gap is a gap: crossing one takes a jump.
export const LEDGE_FALL_SPEED = MIN_SOLID_OVERLAP;

// At zero gravity nothing falls: a player is steered in four directions and
// only the walls and the view's edges stop it. The same resolver applies
// with the falling rules off.

// The player's solid body is the art box scaled by this factor, anchored
// at the feet: a default-size (50px) costume gets a 40px body, so every
// costume shape fits a one-cell opening, and the size block scales the
// body with the art. The feet anchor keeps body bottom == image bottom,
// which the grounded checks (image box, exact equality on the support
// line) measure.
export const PLAYER_BODY_SCALE = 0.8;

// The sprite fields the resolver reads; p5.play sprites satisfy these
// structurally. Walls are read-only boxes; players also get their velocity
// and position written.
export interface PhysicsBox {
  position: {x: number; y: number};
  width: number;
  height: number;
  scale: number;
}

export interface PhysicsSprite extends PhysicsBox {
  velocity: {x: number; y: number};
  __slab2Prev?: {x: number; y: number};
}

// A player with its position snapshotted before any stock collide pass
// this frame: the movement reconstruction must not see that pass's shove.
export interface MovedPlayer {
  sprite: PhysicsSprite;
  x: number;
  y: number;
}

interface View {
  width: number;
  height: number;
}

// Generated block art is keyed and cropped, so a tile's image can come up
// a few pixels short of square. Collision treats every wall as covering
// its full cell — a square on the image's longest side — so rows stay
// flush and seams stay closed no matter how the art cropped. Only
// collision squares up; the drawn sprite keeps the art's real aspect.
function wallHalf(wall: PhysicsBox): number {
  return (Math.max(wall.width, wall.height) * wall.scale) / 2;
}

// The feet-anchored solid body of a player sprite (see PLAYER_BODY_SCALE):
// `drop` is the body center's offset below the image center.
function playerBody(sprite: PhysicsSprite) {
  const imgHalfW = (sprite.width * sprite.scale) / 2;
  const imgHalfH = (sprite.height * sprite.scale) / 2;
  const halfW = imgHalfW * PLAYER_BODY_SCALE;
  const halfH = imgHalfH * PLAYER_BODY_SCALE;
  return {imgHalfW, halfW, halfH, drop: imgHalfH - halfH};
}

function flipWallsY(walls: PhysicsBox[], view: View): PhysicsBox[] {
  return walls.map(wall => ({
    ...wall,
    position: {x: wall.position.x, y: view.height - wall.position.y},
  }));
}

// Flip a sprite's vertical state across the view's horizontal midline (see
// the negative-gravity branch below).
function flipSpriteY(sprite: PhysicsSprite, view: View): void {
  sprite.position.y = view.height - sprite.position.y;
  sprite.velocity.y = -sprite.velocity.y;
  if (sprite.__slab2Prev) {
    sprite.__slab2Prev.y = view.height - sprite.__slab2Prev.y;
  }
}

export function resolvePlatformPhysics(
  moved: MovedPlayer[],
  walls: PhysicsBox[],
  view: View,
  gravity: number = PLATFORM_GRAVITY
) {
  // Negative gravity (the "set gravity" block flipping the world): mirror
  // everything vertically, resolve with the ordinary downward rules, and
  // mirror back. Landing on block tops becomes landing on their undersides,
  // and the floor rest becomes a ceiling rest, without a second copy of the
  // resolution rules.
  if (gravity < 0) {
    moved.forEach(m => {
      flipSpriteY(m.sprite, view);
      m.y = view.height - m.y;
    });
    resolvePlatformPhysics(moved, flipWallsY(walls, view), view, -gravity);
    moved.forEach(m => {
      flipSpriteY(m.sprite, view);
      m.y = view.height - m.y;
    });
    return;
  }
  const weightless = gravity === 0;
  const boxes = walls.map(wall => ({
    x: wall.position.x,
    y: wall.position.y,
    halfW: wallHalf(wall),
    halfH: wallHalf(wall),
  }));
  moved.forEach(({sprite, x: curX, y: curY}) => {
    // Resolution runs on the feet-anchored body box: y below is the BODY
    // center, `drop` below the sprite's image center.
    const {imgHalfW, halfW, halfH, drop} = playerBody(sprite);
    const stored = sprite.__slab2Prev || {x: curX, y: curY};
    const prev = {x: stored.x, y: stored.y + drop};
    const dx = curX - prev.x;
    const dy = curY + drop - prev.y;
    let x = prev.x + dx;
    let y = prev.y;
    boxes.forEach(wall => {
      // A wall side only blocks a body that was on its clear side last
      // frame (a two-row-tall player whose head brushes a head-height
      // block must not snap on top of it), and only when the vertical
      // overlap exceeds the thin-contact allowance.
      if (
        halfH + wall.halfH - Math.abs(y - wall.y) < MIN_SOLID_OVERLAP ||
        Math.abs(x - wall.x) >= halfW + wall.halfW
      ) {
        return;
      }
      if (dx > 0 && prev.x + halfW <= wall.x - wall.halfW + CONTACT_EPSILON) {
        x = Math.min(x, wall.x - wall.halfW - halfW);
      } else if (
        dx < 0 &&
        prev.x - halfW >= wall.x + wall.halfW - CONTACT_EPSILON
      ) {
        x = Math.max(x, wall.x + wall.halfW + halfW);
      }
    });
    // Side containment uses the image box so the art stays on screen; the
    // top is open on purpose — a jump may carry above the screen, gravity
    // brings the player back.
    x = Math.min(Math.max(x, imgHalfW), view.width - imgHalfW);
    y = prev.y + dy;
    // Purely vertical motion is stable: land on whatever is directly
    // below, bump the head on whatever is directly above — a straight-up
    // jump comes straight back down, never shoved sideways. The clauses
    // below only arbitrate corners reached with horizontal movement.
    const vertical = Math.abs(dx) <= CONTACT_EPSILON;
    let landed = false;
    boxes.forEach(wall => {
      if (
        Math.abs(x - wall.x) >= halfW + wall.halfW ||
        Math.abs(y - wall.y) >= halfH + wall.halfH
      ) {
        return;
      }
      const top = wall.y - wall.halfH;
      const centerOn = Math.abs(x - wall.x) <= wall.halfW;
      // The body was already at or over this column before the frame's
      // movement, so the crossing is a genuine arrival — this includes
      // standing on the block, so footing also holds until the body fully
      // leaves an edge. A body that only now moved over the corner fails
      // all three clauses and the final push-out below slides it off
      // sideways (at most one step wide), keeping gaps enterable.
      const wasAt =
        halfW + wall.halfW - Math.abs(prev.x - wall.x) > -CONTACT_EPSILON;
      // A landing accepts feet up to the thin-contact allowance past the
      // top, not merely touching it: a body that slipped sideways through
      // a tight opening arrives a few px deep and must still land here.
      if (dy > 0 && prev.y + halfH <= top + MIN_SOLID_OVERLAP) {
        if (vertical || centerOn || wasAt) {
          y = Math.min(y, top - halfH);
          sprite.velocity.y = 0;
          landed = true;
        }
      } else if (
        dy < 0 &&
        prev.y - halfH >= wall.y + wall.halfH - MIN_SOLID_OVERLAP &&
        (vertical || centerOn || wasAt)
      ) {
        y = Math.max(y, wall.y + wall.halfH + halfH);
        sprite.velocity.y = 0;
      }
    });
    // The bottom clamp sits the feet exactly on the floor line, so
    // hasSupportAt's floor branch holds and the player can jump from pits.
    if (y > view.height - halfH) {
      y = view.height - halfH;
      sprite.velocity.y = 0;
      landed = true;
    }
    // Weightless, nothing brings a player back from above the view, so the
    // top is closed too.
    if (weightless && y < halfH) {
      y = halfH;
    }
    // Final push-out: a landing or head bump declined above slides off
    // the corner sideways; other thin overlap (sideways drift through a
    // tight opening, a lip brushed on the way up) is pushed out the short
    // way. Per-frame sideways movement is smaller than the allowance, so
    // overlap entered from a clear side always resolves; deeper overlap
    // (a sprite spawned inside a wall) is left alone.
    boxes.forEach(wall => {
      const penX = halfW + wall.halfW - Math.abs(x - wall.x);
      const penY = halfH + wall.halfH - Math.abs(y - wall.y);
      // Contact-slack tolerance, not zero: resting feet recompute the
      // resting overlap through different roundings, and fractional sprite
      // sizes (real art is rarely a binary-exact height) leave a ±1e-14
      // residue that a zero test reads as overlap — firing corner pushes
      // off contact that is actually flush.
      if (penX <= CONTACT_EPSILON || penY <= CONTACT_EPSILON) {
        return;
      }
      const crossed =
        y < wall.y
          ? dy > 0 && prev.y + halfH <= wall.y - wall.halfH + CONTACT_EPSILON
          : dy < 0 && prev.y - halfH >= wall.y + wall.halfH - CONTACT_EPSILON;
      if (crossed) {
        x += x < wall.x ? -penX : penX;
      } else if (penY <= MIN_SOLID_OVERLAP && penY <= penX) {
        if (y < wall.y) {
          y -= penY;
          // Keep upward speed: popping onto a lip must not cancel a jump.
          sprite.velocity.y = Math.min(sprite.velocity.y, 0);
        } else {
          y += penY;
          sprite.velocity.y = Math.max(sprite.velocity.y, 0);
        }
      } else if (penX <= MIN_SOLID_OVERLAP) {
        x += x < wall.x ? -penX : penX;
      }
    });
    if (weightless) {
      // Steered, not falling: no ledge drop, and no vertical speed carried
      // from before gravity went to zero (a jump in flight, a fall).
      sprite.velocity.y = 0;
      sprite.position.x = x;
      sprite.position.y = y - drop;
      sprite.__slab2Prev = {x, y: y - drop};
      return;
    }
    // Footing lost this frame with nothing catching the fall: drop at
    // ledge speed at once (see LEDGE_FALL_SPEED).
    if (!landed && sprite.velocity.y >= 0) {
      const hadFooting =
        prev.y + halfH >= view.height - CONTACT_EPSILON ||
        boxes.some(
          wall =>
            Math.abs(prev.y + halfH - (wall.y - wall.halfH)) <=
              CONTACT_EPSILON && Math.abs(prev.x - wall.x) < halfW + wall.halfW
        );
      if (hadFooting && sprite.velocity.y < LEDGE_FALL_SPEED) {
        sprite.velocity.y = LEDGE_FALL_SPEED;
      }
    }
    // Gravity accrues after the cap, so the effective fall step is the cap
    // plus one gravity step.
    if (sprite.velocity.y > TERMINAL_FALL_SPEED) {
      sprite.velocity.y = TERMINAL_FALL_SPEED;
    }
    sprite.velocity.y += gravity;
    sprite.position.x = x;
    sprite.position.y = y - drop;
    sprite.__slab2Prev = {x, y: y - drop};
  });
}

/**
 * Whether a sprite is standing on support in the gravity direction: a wall
 * face within contact slack of the body's feet (or its head, under flipped
 * gravity), or the view's floor (ceiling). Mirrors the resolver's footing
 * geometry; the jump command and the patrol behavior ask this.
 */
export function isSupported(
  sprite: PhysicsSprite,
  walls: PhysicsBox[],
  view: View,
  gravity: number = PLATFORM_GRAVITY
): boolean {
  if (gravity < 0) {
    return isSupported(
      flippedSprite(sprite, view),
      flipWallsY(walls, view),
      view,
      -gravity
    );
  }
  const {halfW, halfH, drop} = playerBody(sprite);
  const feet = sprite.position.y + drop + halfH;
  if (feet >= view.height - CONTACT_EPSILON) {
    return true;
  }
  return wallsAtFeet(walls, feet).some(
    wall =>
      Math.abs(sprite.position.x - wall.position.x) < halfW + wallHalf(wall)
  );
}

/**
 * Whether there is footing at foot level `offsetX` from the sprite's centre
 * — a point probe, so it sees a gap narrower than the sprite — in the
 * gravity direction. The floor (ceiling, under flipped gravity) counts. The
 * patrol behavior looks one step ahead with this before it turns.
 */
export function hasSupportAt(
  sprite: PhysicsSprite,
  offsetX: number,
  walls: PhysicsBox[],
  view: View,
  gravity: number = PLATFORM_GRAVITY
): boolean {
  if (gravity < 0) {
    return hasSupportAt(
      flippedSprite(sprite, view),
      offsetX,
      flipWallsY(walls, view),
      view,
      -gravity
    );
  }
  const {halfH, drop} = playerBody(sprite);
  const feet = sprite.position.y + drop + halfH;
  if (feet >= view.height - CONTACT_EPSILON) {
    return true;
  }
  const probe = sprite.position.x + offsetX;
  return wallsAtFeet(walls, feet).some(
    wall => Math.abs(probe - wall.position.x) <= wallHalf(wall)
  );
}

// The walls whose top is at foot level, within contact tolerance.
function wallsAtFeet(walls: PhysicsBox[], feet: number): PhysicsBox[] {
  return walls.filter(
    wall =>
      Math.abs(feet - (wall.position.y - wallHalf(wall))) <= CONTACT_EPSILON
  );
}

// The sprite as it stands in a view flipped top for bottom, for reading
// upward gravity with the downward-gravity code.
function flippedSprite(sprite: PhysicsSprite, view: View): PhysicsSprite {
  return {
    ...sprite,
    position: {x: sprite.position.x, y: view.height - sprite.position.y},
    velocity: {x: sprite.velocity.x, y: -sprite.velocity.y},
  };
}
