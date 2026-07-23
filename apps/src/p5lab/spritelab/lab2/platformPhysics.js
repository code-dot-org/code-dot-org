// Platformer collision resolution for player sprites, engine-owned (no
// zGameDev loop runs in this lab; see SpriteLab2Engine). Pure sprite math:
// no p5 beyond the sprite fields read here, so the rules are unit-testable
// and portable.
//
// The resolver runs once per frame, immediately before the paint — after
// p5's pre-phase velocity integration and after the frame's behaviors and
// events have moved sprites. Per player it reconstructs the frame's
// movement from the last resolved position, applies the horizontal part
// and resolves it, then the vertical part, then settles leftover thin
// overlap. A wall face only blocks a body that was on its clear side last
// frame (swept, not overlap: a two-row-tall player whose head brushes a
// head-height block must not be teleported on top of it).
//
// The feel rules, each a sentence:
// - The solid body is 80% of the art box, anchored at the feet: every
//   default-size costume fits a one-cell opening; the size block scales
//   the body with the art, so enlarged sprites outgrow gaps on purpose.
// - A face engaged thinner than the squeeze band doesn't block, so
//   exact-fit openings are enterable.
// - A crossing lands (or bonks) when the player is genuinely arriving:
//   already at or over the column, center on it, or moving straight down.
//   A same-frame lateral graze slides off instead — at most one step wide,
//   so never a visible yank — keeping gaps enterable.
// - Purely vertical motion is stable: straight up comes straight back
//   down; a head bonk never shoves sideways.
// - Sides and floor contain the art; the top is open (gravity returns).

// Max downward speed (px/frame). A single frame's step must stay small
// enough that a falling body can't pass a block corner between frames.
export const TERMINAL_FALL_SPEED = 10;

// Downward gravity (px/frame²), matching the zGameDev library loop this
// resolver replaces. Accrues after the terminal cap, as the loop's
// post-paint ordering did, so trajectories are unchanged.
export const PLATFORM_GRAVITY = 0.75;

// Slack (px) for exact-contact comparisons: resting and pressed contact
// are exact equalities, with possible sub-pixel noise on them.
export const CONTACT_EPSILON = 0.1;

// The squeeze band (px): a face engaged thinner than this on the
// perpendicular axis doesn't block, and the leftover thin penetration
// resolves along its shallow axis at the end of the pass. One-cell
// notches and doorways are exactly player-sized on the default grid, so
// without a band there is zero clearance to enter them.
export const MIN_SOLID_OVERLAP = 8;

// The player's solid body is the art box scaled by this factor, anchored
// at the feet. A default-size (50px) costume gets a 40px body. The feet
// anchor keeps body bottom == image bottom, which the grounded checks
// (image box, exact equality on the support line) measure.
export const PLAYER_BODY_SCALE = 0.8;

/**
 * Resolve one frame of platformer physics for the given players.
 *
 * @param {Array<{sprite: Sprite, x: number, y: number}>} moved - players
 *   with their positions snapshotted BEFORE any stock collide pass this
 *   frame (the movement reconstruction must not see its shove).
 * @param {Sprite[]} walls - the solid sprites.
 * @param {{width: number, height: number}} view - playfield bounds.
 */
export function resolvePlatformPhysics(moved, walls, view) {
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
      // A face engaged thinner than the squeeze band vertically doesn't
      // block sideways movement; de-penetration below settles whatever
      // thin overlap results.
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
    // Purely vertical motion is stable: whatever the player is directly
    // over or under, they land on or bonk against — no corner
    // arbitration, no sideways correction. The stricter clauses below
    // only arbitrate corners reached with horizontal movement.
    const vertical = Math.abs(dx) <= CONTACT_EPSILON;
    boxes.forEach(wall => {
      if (
        Math.abs(x - wall.x) >= halfW + wall.halfW ||
        Math.abs(y - wall.y) >= halfH + wall.halfH
      ) {
        return;
      }
      const top = wall.y - wall.halfH;
      const centerOn = Math.abs(x - wall.x) <= wall.halfW;
      // The body was already at (touching — the pinned slide along a
      // face) or over this column before the frame's movement: crossing
      // its face is then a genuine arrival, not a lateral graze. Standing
      // on a block is the degenerate case, so this also keeps footing
      // until the body fully leaves an edge. Only a same-frame graze is
      // declined and slides off via de-penetration — its overlap is at
      // most one step, so the slide is never a visible yank, and gaps
      // stay enterable (a crossing graze mustn't grab the far corner).
      const wasAt =
        halfW + wall.halfW - Math.abs(prev.x - wall.x) > -CONTACT_EPSILON;
      // Crossing tolerance is the squeeze band, not mere contact: a
      // player who slipped sideways through the band arrives with feet
      // already a few px past the face and must still be caught here.
      if (dy > 0 && prev.y + halfH <= top + MIN_SOLID_OVERLAP) {
        if (vertical || centerOn || wasAt) {
          y = Math.min(y, top - halfH);
          sprite.velocity.y = 0;
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
    }
    // De-penetration: settle what the gates left overlapping. A declined
    // crossing (a lateral graze) slides off the corner sideways; other
    // thin penetration — squeeze-band drift, a lip grazed on the way up —
    // resolves along its shallow axis. dx per frame is smaller than the
    // band, so overlap entered from a clear side always resolves; deep
    // overlap (a sprite spawned inside a wall) is left for the program to
    // sort out.
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
    // Cap fall speed, then accrue gravity on top for the next frame (the
    // order the zGameDev loop produced).
    if (sprite.velocity.y > TERMINAL_FALL_SPEED) {
      sprite.velocity.y = TERMINAL_FALL_SPEED;
    }
    sprite.velocity.y += PLATFORM_GRAVITY;
    sprite.position.x = x;
    sprite.position.y = y - drop;
    sprite.__slab2Prev = {x, y: y - drop};
  });
}
