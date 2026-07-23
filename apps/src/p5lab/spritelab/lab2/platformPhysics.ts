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

// Slack (px) for exact-contact comparisons: resting and pinned contact are
// exact equalities, with possible sub-pixel noise on them.
export const CONTACT_EPSILON = 0.1;

// The squeeze band (px): a face engaged thinner than this on the
// perpendicular axis doesn't block, and the leftover thin penetration
// resolves along its shallow axis at the end of the pass. One-cell notches
// and doorways are exactly player-sized on the default grid, so without a
// band there is zero clearance to enter them.
export const MIN_SOLID_OVERLAP = 8;

// Stepping off an edge falls at least this fast (px/frame): the very
// first airborne step already drops past the landing band, so no walk-off
// can catch the far lip of a gap — at any costume shape or phase. Ramping
// from zero instead made a one-block gap a coin flip. A gap is a gap:
// crossing one takes a jump.
export const LEDGE_FALL_SPEED = MIN_SOLID_OVERLAP;

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

export function resolvePlatformPhysics(
  moved: MovedPlayer[],
  walls: PhysicsBox[],
  view: View
) {
  const boxes = walls.map(wall => ({
    x: wall.position.x,
    y: wall.position.y,
    halfW: (wall.width * wall.scale) / 2,
    halfH: (wall.height * wall.scale) / 2,
  }));
  moved.forEach(({sprite, x: curX, y: curY}) => {
    const imgHalfW = (sprite.width * sprite.scale) / 2;
    const imgHalfH = (sprite.height * sprite.scale) / 2;
    const halfW = imgHalfW * PLAYER_BODY_SCALE;
    const halfH = imgHalfH * PLAYER_BODY_SCALE;
    // Resolution runs on the feet-anchored body box: y below is the BODY
    // center, `drop` below the sprite's image center.
    const drop = imgHalfH - halfH;
    const stored = sprite.__slab2Prev || {x: curX, y: curY};
    const prev = {x: stored.x, y: stored.y + drop};
    const dx = curX - prev.x;
    const dy = curY + drop - prev.y;
    let x = prev.x + dx;
    let y = prev.y;
    boxes.forEach(wall => {
      // A face only blocks a body that was on its clear side last frame
      // (swept: a two-row-tall player whose head brushes a head-height
      // block must not be snapped on top of it), and only when engaged
      // thicker than the squeeze band vertically.
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
    // below, bonk on whatever is directly above — a straight-up jump comes
    // straight back down, never shoved sideways. The clauses below only
    // arbitrate corners reached with horizontal movement.
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
      // leaves an edge. A same-frame lateral graze fails all three
      // clauses and slides off via de-penetration (at most one step
      // wide), keeping gaps enterable.
      const wasAt =
        halfW + wall.halfW - Math.abs(prev.x - wall.x) > -CONTACT_EPSILON;
      // Crossing tolerance is the squeeze band, not mere contact: a body
      // that slipped sideways through the band arrives with feet already
      // a few px past the face and must still be caught here.
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
    // De-penetration: a declined crossing slides off the corner sideways;
    // other thin penetration (squeeze-band drift, a lip grazed on the way
    // up) resolves along its shallow axis. Per-frame dx is smaller than
    // the band, so overlap entered from a clear side always resolves;
    // deeper overlap (a sprite spawned inside a wall) is left alone.
    boxes.forEach(wall => {
      const penX = halfW + wall.halfW - Math.abs(x - wall.x);
      const penY = halfH + wall.halfH - Math.abs(y - wall.y);
      if (penX <= 0 || penY <= 0) {
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
    sprite.velocity.y += PLATFORM_GRAVITY;
    sprite.position.x = x;
    sprite.position.y = y - drop;
    sprite.__slab2Prev = {x, y: y - drop};
  });
}
