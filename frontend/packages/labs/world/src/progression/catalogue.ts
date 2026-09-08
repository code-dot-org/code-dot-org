// The lessons, as tiles on the map.
//
// specs/PROGRESSION.md is the design this encodes: one Origin tile, six
// FOUNDATION regions around it (the programming concepts), six GENRE regions in
// the wedges between them (the kinds of game those concepts make), and MAKING
// beyond each genre's capstone (writing rules rather than using them).
//
// ── Where a tile sits ───────────────────────────────────────────────────────
//
// `at(sector, a, b)` names a cell by two of the six directions: `a` steps along
// the first, `b` along the next one clockwise. Its ring is `a + b`. Written
// this way rather than as a raw `[q, r]` because the numbers then say what the
// placement MEANS — a foundation grows outward with `b` at zero, its shoulder
// leans into the wedge beside it, and a genre lives where both counts are two
// or more.
//
// The sector is named by the region that owns it: a foundation's own wedge is
// the one clockwise from its axis, and that is the wedge its genre sits in. So
// `at('input', 2, 0)` is two steps out along Input's axis, `at('platformer', 1,
// 2)` is in the wedge between Input and Motion, and `at('platformer', 3, 3)` is
// past the far side of that wedge, where Making's tile for it sits.
//
// ── The shape of a region ───────────────────────────────────────────────────
//
// A foundation is a spike with shoulders:
//
//   (1,0) (2,0) (3,0) (4,0)   its axis, running outward from Origin
//   (1,1) (2,1)               shoulders, leaning into the wedge clockwise
//
// Two of those cells are GATEWAYS, and which lesson sits on them is a design
// decision rather than a layout one. `(1,1)` touches the wedge clockwise of the
// foundation and `(2,0)` touches the wedge anticlockwise of it, so those two
// cells are the only places a genre can be entered from. Motion puts `gravity`
// on `(2,0)` because the Platformer next door is entered through it; Input puts
// `mouse` there for the same reason, one wedge round, where clicking to place
// things is what Simulation wants.
//
// A genre is five cells in the middle of a wedge:
//
//   (1,2)  the gate — the only tile that touches both flanking foundations
//   (2,2)  (1,3)              the two branches out of the gate
//   (3,2)                     beyond the first branch
//   (2,3)  the capstone — needs both branches, and Making lies past it
//
// The layout test (./__tests__/layout.test.ts) checks all of this: that every
// `requires` names a neighbor, that no two tiles share a cell, that every tile
// is reachable from Origin, and that a region's tiles touch each other.

import {stockRule} from '../rules/stock';

import {sectorCell, type Axial} from './hex';
import {FOUNDATIONS, GENRES} from './regions';
import type {RegionId, Tile} from './types';

/**
 * A cell in the wedge a region owns: `a` steps along the first of its two
 * directions, `b` along the second. See the header.
 */
const at = (sector: RegionId, a: number, b: number): Axial => {
  const index = FOUNDATIONS.indexOf(sector);
  return sectorCell(index >= 0 ? index : GENRES.indexOf(sector), a, b);
};

export const TILES: readonly Tile[] = [
  // ── Origin ────────────────────────────────────────────────────────────────
  {
    id: 'origin/first-world',
    region: 'origin',
    at: [0, 0],
    title: 'First light',
    teaches: 'A project is files; a world holds actors; something runs.',
    task: 'A world with one actor in it, and a Run button. Add a second actor, give it a picture, and put it somewhere.',
    requires: [],
    unlocks: [
      // The seven blocks this lesson is done with, and not the drawers they
      // live in: a first lesson that opened the whole Actor drawer would offer
      // forty-two blocks to somebody who has met three (progression/toolboxShelf).
      {kind: 'block', type: 'world_actor'},
      {kind: 'block', type: 'world_use_trait'},
      {kind: 'block', type: 'world_this_actor'},
      {kind: 'block', type: 'world_world'},
      {kind: 'block', type: 'world_add_actor'},
      {kind: 'block', type: 'world_set_position'},
      {kind: 'block', type: 'world_set_sprite'},
      // Writing to the console: seeing something invisible is how both the
      // Input and the Motion branches start, within two lessons of here, and
      // Origin is the only tile every path goes through — so it is the only
      // place a thing both branches need can be granted
      // (specs/PROGRESSION.md). What an event CARRIED is granted by the tile
      // where events start carrying anything, and stays there.
      //
      // TWO BLOCKS, NOT A DRAWER. This granted the whole Console category when
      // there was one; that drawer held these two and `log`, and it is gone —
      // `write to console` lives in Text now, whose other blocks a first lesson
      // has no use for. Granting the drawer here would open all of them.
      //
      // NOT a bare number either. Every socket in this lesson arrives with a
      // shadow already in it, so a Math drawer here would hold one block
      // nothing needed — a drawer that exists to be empty-handed.
      {kind: 'block', type: 'world_print'},
      {kind: 'template', id: 'empty'},
    ],
    check: {
      kind: 'outcome',
      says: 'The built world holds two actors, and both draw a sprite.',
      falsePass:
        'Copying the given actor and never moving it — which is most of the lesson done, so it is an acceptable one.',
      run: {
        probes: {actors: {kind: 'actorCount'}, drawn: {kind: 'drawnCount'}},
        // A tenth of a second rather than nothing: a world places its actors
        // when it is built, and the first tick is what settles them.
        trace: [{seconds: 0.1}],
      },
      passes: ({samples}) =>
        lastNumber(samples.actors) >= 2 && lastNumber(samples.drawn) >= 2,
    },
  },

  // ── Foundation: Input ─────────────────────────────────────────────────────
  {
    id: 'input/arrows',
    region: 'input',
    at: at('input', 1, 0),
    title: 'Make it go',
    teaches: 'A trait is elected, and then the world does something for you.',
    task: 'A player that ignores you. Give it "Moves Across", then "Moves Down", and change its speed.',
    requires: ['origin/first-world'],
    unlocks: [{kind: 'rule', id: 'arrows'}],
    check: {
      kind: 'outcome',
      says: 'With right held for a second the actor’s x rises; with down held, its y.',
      falsePass:
        'Moving the actor with a per-frame `set position` instead of the trait — caught by also asserting the workspace has no `each frame`.',
      run: {
        probes: {hero: {kind: 'positions', of: 'Hero'}},
        trace: [
          {hold: ['ArrowRight'], seconds: 1},
          {hold: ['ArrowDown'], seconds: 1},
        ],
      },
      // Both axes, and each measured over its own stretch of the script: a
      // trait that moves across and one that moves down are separate elections,
      // and the lesson asks for both.
      passes: ({samples}) => {
        const [start, afterRight, afterDown] = samples.hero as Point[][];
        return (
          start?.[0] !== undefined &&
          afterRight[0].x > start[0].x + 20 &&
          afterDown[0].y > afterRight[0].y + 20
        );
      },
    },
  },
  {
    id: 'input/press',
    region: 'input',
    at: at('input', 1, 1),
    title: 'A key is an event',
    teaches: 'The difference between a key being HELD and a key being PRESSED.',
    task: 'A lamp that toggles sixty times a second. Make it toggle once per press.',
    requires: ['input/arrows'],
    unlocks: [
      {kind: 'rule', id: 'input'},
      // …and what a handler is HANDED. This is the tile where an event stops
      // being a moment and starts being a moment with something in it, and
      // "the key that was pressed" is the block's own first example. Nothing
      // granted it before, so a gated learner could reach the end of the map
      // without being offered the one block that reads what an event carried.
      {kind: 'block', type: 'world_event_value'},
    ],
    check: {
      kind: 'trace',
      says: 'One hold of the space bar says one thing, and a second press says a second.',
      falsePass:
        'A handler on the wrong key, which says nothing at all and so also says nothing twice. The first hold has to produce exactly one line, not at most one.',
      run: {
        probes: {},
        // Held, released, held again. Both halves matter: a handler that ran
        // every frame would say ninety things during the first stretch, and one
        // that ran once ever would say nothing during the third.
        trace: [
          {hold: [' '], seconds: 1},
          {hold: [], seconds: 0.2},
          {hold: [' '], seconds: 0.5},
        ],
      },
      passes: ({console: said}) => said.length === 2,
    },
  },
  {
    id: 'input/mouse',
    region: 'input',
    at: at('input', 2, 0),
    title: 'Point and click',
    teaches:
      'A click is an event, and it happens somewhere — so an actor can be told about its own.',
    task: 'Make an actor react to being clicked on, and to being clicked NEXT to.',
    requires: ['input/arrows'],
    unlocks: [{kind: 'rule', id: 'mouse'}],
    check: {
      kind: 'trace',
      says: 'A click on the actor says something; a click beside it says nothing.',
      falsePass:
        'Reacting to a click anywhere rather than on the actor — which is why the script clicks the empty space as well, and requires silence for it.',
      run: {
        probes: {},
        // Down and up in the same place is a click. Two of them: one on the
        // Target at the middle of the world, one well clear of it.
        trace: [
          {pointer: {x: 160, y: 160, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 160, y: 160, buttons: []}, seconds: 0.1},
          {pointer: {x: 40, y: 40, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 40, y: 40, buttons: []}, seconds: 0.1},
        ],
      },
      passes: ({console: said}) => said.length === 1,
    },
  },
  {
    id: 'input/two-hands',
    region: 'input',
    at: at('input', 3, 0),
    title: 'Two readings of four keys',
    teaches:
      'The same input can mean different things, and choosing which is a design decision.',
    task: 'Walking, and steering a ship. Swap one for the other and feel the difference.',
    requires: ['input/mouse'],
    unlocks: [{kind: 'rule', id: 'drive'}],
    check: {
      kind: 'outcome',
      says: 'Holding left turns the ship rather than moving it, and thrust afterwards moves it.',
      falsePass:
        'Electing both rules at once, which turns AND slides. The first stretch requires the ship to have stayed put, which walking cannot do.',
      run: {
        probes: {ship: {kind: 'positions', of: 'Ship'}},
        trace: [
          {hold: ['ArrowLeft'], seconds: 0.5},
          {hold: ['ArrowUp'], seconds: 1},
        ],
      },
      passes: ({samples}) => {
        const [start, turned, thrust] = samples.ship as Point[][];
        if (!start?.[0]) {
          return false;
        }
        const stayed = Math.hypot(
          turned[0].x - start[0].x,
          turned[0].y - start[0].y,
        );
        const moved = Math.hypot(
          thrust[0].x - turned[0].x,
          thrust[0].y - turned[0].y,
        );
        // Turning moves nothing; thrusting moves it a long way. Walking would
        // fail the first and do nothing about the second (there is no "Moves
        // Down" on this Ship).
        return stayed < 5 && moved > 40;
      },
    },
  },

  // ── Foundation: Motion ────────────────────────────────────────────────────
  {
    id: 'motion/speed',
    region: 'motion',
    at: at('motion', 1, 0),
    title: 'Speed is not a place',
    teaches: 'Setting a position every frame is not how things move.',
    task: 'An actor moved by a handler that runs every frame. Give it a velocity once instead, and delete the handler.',
    requires: ['origin/first-world'],
    unlocks: [{kind: 'rule', id: 'motion'}],
    check: {
      kind: 'outcome',
      says: 'The actor’s position changes over time, and nothing is setting its position by hand.',
      falsePass:
        'None worth the name — the shape half of this check is what the lesson is.',
      run: {
        probes: {hero: {kind: 'positions', of: 'Hero'}},
        trace: [{seconds: 1}],
      },
      // BOTH halves, and the second is why this one has an `inspect` at all:
      // the project the lesson starts with already moves. What makes the lesson
      // done is that it moves with the hand-written `each frame` gone.
      passes: ({samples}) => {
        const [start, after] = samples.hero as Point[][];
        return Boolean(start?.[0]) && Math.abs(after[0].x - start[0].x) > 20;
      },
      // NOT "no `each frame`". Setting a velocity every frame in `decide` is
      // how the Arrow Keys rule itself moves an actor, and a learner who does
      // the lesson that way has done the lesson. What the lesson replaces is
      // moving by PLACE — so that is what the shape half looks for.
      //
      // NOT "no `set position` anywhere", either, which is what this said while
      // a lesson had a file per actor: placing the Hero to begin with is a
      // `set position`, and it lives in the same file now that a lesson is one
      // file. What the lesson replaces is a `set position` INSIDE an `each
      // frame`, and saying exactly that is what stays true either way.
      inspect: files =>
        !nestedIn(files, 'world_trait_step', 'world_set_position'),
    },
  },
  {
    id: 'motion/gravity',
    region: 'motion',
    at: at('motion', 2, 0),
    title: 'Down',
    teaches: 'A rule can act on every actor that elected it, every frame.',
    task: 'Add gravity and some ground. Land on it, and hear about starting and stopping falling.',
    requires: ['motion/speed'],
    unlocks: [
      {kind: 'rule', id: 'gravity'},
      {kind: 'actor', id: 'ground'},
    ],
    check: {
      kind: 'outcome',
      says: 'The actor’s y rises and then holds at the ground, and "stops falling" fires once.',
      falsePass:
        'Ground placed so the actor starts on it and never falls. The trace starts the actor in the air.',
      run: {
        probes: {hero: {kind: 'positions', of: 'Hero'}},
        // Three samples: where it starts, where it is mid-fall, and where it
        // has come to rest. Falling and LANDING are two different claims, and
        // one sample at the end cannot tell them apart from never having moved.
        trace: [{seconds: 0.4}, {seconds: 1.6}],
      },
      passes: ({samples}) => {
        const [start, falling, landed] = samples.hero as Point[][];
        if (!start?.[0]) {
          return false;
        }
        const fell = falling[0].y > start[0].y + 10;
        const stopped = Math.abs(landed[0].y - falling[0].y) < 200;
        return fell && stopped && landed[0].y > start[0].y;
      },
    },
  },
  {
    id: 'motion/force',
    region: 'motion',
    at: at('motion', 1, 1),
    title: 'A shove',
    teaches:
      'A force changes a speed; a speed changes a place. Two steps, not one.',
    task: 'Push the actor once and watch what happens after the push is over.',
    requires: ['motion/speed'],
    unlocks: [{kind: 'block', type: 'world_vector_math'}],
    check: {
      kind: 'outcome',
      says: 'Nothing moves before the press; after it the Ball moves, and goes on moving once the key is let go.',
      falsePass:
        'Setting the velocity directly rather than applying a force — the same outcome from a different idea, and this check cannot tell them apart. What it does catch is moving the Ball BY PLACE, which stops the moment the key does.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        trace: [
          {seconds: 0.3},
          {hold: [' '], seconds: 0.1},
          {hold: [], seconds: 0.6},
        ],
      },
      passes: ({samples}) => {
        const [start, before, pressed, after] = samples.ball as Point[][];
        if (!start?.[0]) {
          return false;
        }
        const still = Math.abs(before[0].x - start[0].x) < 2;
        const shoved = pressed[0].x > before[0].x;
        // The half that matters: it is still going after the key is up. A
        // handler that moved it by place would have stopped dead.
        const coasting = after[0].x > pressed[0].x + 20;
        return still && shoved && coasting;
      },
    },
  },
  {
    id: 'motion/units',
    region: 'motion',
    at: at('motion', 3, 0),
    title: 'Units per second',
    teaches:
      'A rate is not a per-frame number: a speed is units per second, and a unit is 100 pixels.',
    task: 'Make an actor cross the screen in exactly two seconds.',
    requires: ['motion/gravity'],
    unlocks: [
      // How long a vector is — which is what a speed IS, once you know a speed
      // is a vector — and the arithmetic to work one out. `size of map`
      // belongs to the lesson that paints one.
      {kind: 'block', type: 'world_vector_length'},
      {kind: 'block', type: 'math_single'},
    ],
    check: {
      kind: 'outcome',
      says: 'After two seconds the Ball has crossed the world — 320 pixels, give or take a tile.',
      falsePass:
        'Guessing a number that happens to fit this screen. It is the right answer FOR this screen, which is what the lesson asked for; a second world of another width would tell arithmetic from luck, and this check does not have one.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        trace: [{seconds: 2}],
      },
      passes: ({samples}) => {
        const [start, arrived] = samples.ball as Point[][];
        if (!start?.[0]) {
          return false;
        }
        const traveled = arrived[0].x - start[0].x;
        return traveled > 280 && traveled < 360;
      },
    },
  },
  {
    id: 'motion/drag',
    region: 'motion',
    at: at('motion', 2, 1),
    title: 'Coasting to a stop',
    teaches: 'What makes a car a car rather than a spaceship.',
    task: 'Add Drag beside anything that moves, and find the top speed it gives you for free.',
    requires: ['motion/force'],
    unlocks: [{kind: 'rule', id: 'drag'}],
    check: {
      kind: 'outcome',
      says: 'The Ball travels a long way in the first half second and barely moves in the last one.',
      falsePass:
        'Zeroing the velocity outright, which also stops it. The middle sample is what asks for a DECAY: something that stopped dead would already be still there.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        // Three stretches of the SAME length, which is the whole of why this
        // check works: distance over half a second is comparable with distance
        // over another half second, and distance over 1.5 seconds is not. The
        // first version measured 0.5, 0.5 and 1.5 and a decaying ball covered
        // MORE ground in the last one — while slowing down the entire time.
        trace: [{seconds: 0.5}, {seconds: 0.5}, {seconds: 0.5}],
      },
      passes: ({samples}) => {
        const [start, early, middle, late] = samples.ball as Point[][];
        if (!start?.[0]) {
          return false;
        }
        const first = Math.abs(early[0].x - start[0].x);
        const second = Math.abs(middle[0].x - early[0].x);
        const last = Math.abs(late[0].x - middle[0].x);
        // Slowing, and still slowing. The middle stretch is what a thing that
        // stopped dead fails: it would already be still by then.
        return (
          first > 20 &&
          second < first * 0.9 &&
          second > 1 &&
          last < first * 0.65
        );
      },
    },
  },
  {
    id: 'motion/tween',
    region: 'motion',
    at: at('motion', 4, 0),
    title: 'A described movement',
    teaches:
      'Movement written once and played wherever, instead of a handler that watches a clock.',
    task: 'A door that opens and a platform that slides, both from one description.',
    requires: ['motion/units'],
    unlocks: [
      {kind: 'block', type: 'world_play_tween_here'},
      {kind: 'block', type: 'world_define_tween'},
      {kind: 'block', type: 'world_play_tween'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Door is still where it was put after a tenth of a second, and somewhere else a second later.',
      falsePass:
        'Setting the Door’s position outright, which also moves it — and is exactly what the lesson replaces. The early sample is what tells a journey from a jump: a `set position` has already finished by then.',
      run: {
        probes: {door: {kind: 'positions', of: 'Door'}},
        trace: [{seconds: 0.1}, {seconds: 1.2}],
      },
      passes: ({samples}) => {
        const [start, early, arrived] = samples.door as Point[][];
        if (!start?.[0]) {
          return false;
        }
        // Barely moved yet, and well on its way afterwards. A tween is a
        // journey, and a journey is the thing that has a middle.
        const jumped = Math.abs(early[0].x - start[0].x) > 60;
        const traveled = Math.abs(arrived[0].x - start[0].x) > 150;
        return !jumped && traveled;
      },
    },
  },

  // ── Foundation: Logic ─────────────────────────────────────────────────────
  {
    id: 'logic/if',
    region: 'logic',
    at: at('logic', 1, 0),
    title: 'Asking a question',
    teaches:
      'A question with two answers, and a program that takes one of them.',
    task: 'Make an actor change color only once it is past the middle of the screen.',
    requires: ['origin/first-world'],
    unlocks: [
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'logic_compare'},
      // …and the two blocks the question is asked from and inside: an actor's
      // own per-frame work, and reading where it is.
      {kind: 'block', type: 'world_trait_step'},
      {kind: 'block', type: 'world_get_Space_PositionProperty'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Ball travels to the middle of the world and stops there.',
      falsePass:
        'Setting the speed to nothing unconditionally, which stops it — at the left-hand edge, where it started. Both halves are asserted: it got to the middle, and it did not go past.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        trace: [{seconds: 3}],
      },
      passes: ({samples}) => {
        const [start, ended] = samples.ball as Point[][];
        if (!start?.[0]) {
          return false;
        }
        return ended[0].x > 145 && ended[0].x < 205;
      },
    },
  },
  {
    id: 'logic/collision',
    region: 'logic',
    at: at('logic', 2, 0),
    title: 'Touching is a question',
    teaches: 'Some questions the world answers for you, once a tick.',
    task: 'React when the player touches a spike, and stop it walking through a wall.',
    requires: ['logic/if'],
    unlocks: [
      {kind: 'rule', id: 'collisions'},
      {kind: 'rule', id: 'solid'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Ball stops short of the Wall instead of passing through it.',
      falsePass:
        'Stopping the Ball with an `if` on its position, which also stops it there. Nothing in this check tells that from a collision — what it does catch is the Ball sailing straight through, which is the state the lesson starts in.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        trace: [{seconds: 3}],
      },
      passes: ({samples}) => {
        const [start, ended] = samples.ball as Point[][];
        if (!start?.[0]) {
          return false;
        }
        // The Wall is at 288 and both are 32 wide, so a Ball resting against it
        // sits near 256. Well short of the far edge either way.
        return ended[0].x > 190 && ended[0].x < 265;
      },
    },
  },
  {
    id: 'logic/kinds',
    region: 'logic',
    at: at('logic', 1, 1),
    title: 'What a thing is',
    teaches: 'A type, asked at runtime: `is a`, and `has trait`.',
    task: 'One handler that treats a coin and a spike differently, without two handlers.',
    requires: ['logic/if'],
    unlocks: [
      {kind: 'block', type: 'world_is_a'},
      {kind: 'block', type: 'world_has_trait'},
      // …and the one the question is asked ABOUT: the other actor, inside a
      // handler for an event that carries one.
      {kind: 'block', type: 'world_event_actor'},
    ],
    check: {
      kind: 'trace',
      says: 'Touching the Coin and touching the Spike say different things.',
      falsePass:
        'Two handlers, one per kind, which also says two different things — and this check cannot tell that from one handler that asks. What it does catch is the state the lesson starts in, where both say the same.',
      run: {
        probes: {},
        // Long enough to roll past both of them.
        trace: [{seconds: 3}],
      },
      passes: ({console: said}) => said.length === 2 && said[0] !== said[1],
    },
  },
  {
    id: 'logic/and-or',
    region: 'logic',
    at: at('logic', 3, 0),
    title: 'Two questions at once',
    teaches: 'And, or, and not — and why the first two are not the same.',
    task: 'A door that opens only when both switches are down.',
    requires: ['logic/collision'],
    unlocks: [
      {kind: 'block', type: 'logic_operation'},
      {kind: 'block', type: 'logic_negate'},
    ],
    check: {
      kind: 'outcome',
      says: 'The low Ball stops in the middle and the high one carries on out of the world.',
      falsePass:
        '`or` in place of `and`, which stops BOTH — and passes any check that only looks at the low one. Looking at both is the whole of this one.',
      run: {
        probes: {balls: {kind: 'positions', of: 'Ball'}},
        trace: [{seconds: 3}],
      },
      passes: ({samples}) => {
        const balls = lastList<Point>(samples.balls);
        if (balls.length !== 2) {
          return false;
        }
        const low = balls.find(at => at.y > 160);
        const high = balls.find(at => at.y <= 160);
        return (
          low !== undefined &&
          high !== undefined &&
          low.x > 145 &&
          low.x < 205 &&
          high.x > 340
        );
      },
    },
  },

  // ── Foundation: Memory ────────────────────────────────────────────────────
  {
    id: 'memory/variable',
    region: 'memory',
    at: at('memory', 1, 0),
    title: 'A box for a number',
    teaches: 'A name for a value, so it is worked out once and used twice.',
    task: 'A handler that computes the same distance twice. Give it a name and use it.',
    requires: ['origin/first-world'],
    unlocks: [{kind: 'category', name: 'Variables'}],
    // Numbers are `place/position`'s lesson, and Memory's branch never passes
    // through Place. Offered rather than granted: you need one to type, and
    // being handed one is not being taught about them (./types, `offers`).
    offers: [
      {kind: 'block', type: 'math_number'},
      {kind: 'block', type: 'math_arithmetic'},
    ],
    check: {
      kind: 'shape',
      says: 'A name is set once and read at least twice, and the Posts are still in a row.',
      falsePass:
        'Naming something and using it once, which is a longer way of writing a number. The COUNT is the check, and it is the whole reason this one reads the workspace at all.',
      run: {
        probes: {posts: {kind: 'positions', of: 'Post'}},
        trace: [{seconds: 0.1}],
      },
      // The shape half is the lesson; the played half is what stops somebody
      // naming a value and then quietly breaking the row with it.
      inspect: files =>
        Object.entries(files).some(
          ([path, contents]) =>
            path.startsWith('worlds/') &&
            (contents.match(/variables_get_/g) ?? []).length >= 2 &&
            contents.includes('variables_set_'),
        ),
      passes: ({samples}) => {
        const posts = lastList<Point>(samples.posts);
        if (posts.length !== 3) {
          return false;
        }
        const across = posts.map(at => at.x).sort((a, b) => a - b);
        const level = posts.every(at => at.y === posts[0].y);
        // Still a row, and still evenly spaced — whatever the gap turned out
        // to be once it had a name.
        return level && across[1] - across[0] === across[2] - across[1];
      },
    },
  },
  {
    id: 'memory/many',
    region: 'memory',
    at: at('memory', 2, 0),
    title: 'All of them at once',
    teaches: 'Iteration: one instruction that reaches every actor of a kind.',
    task: 'Six coins. Turn every one of them gold, with one loop.',
    requires: ['memory/variable'],
    unlocks: [
      {kind: 'category', name: 'Loops'},
      {kind: 'block', type: 'world_for_each'},
      // …and the list it walks. A loop with nothing to walk is not a lesson.
      {kind: 'block', type: 'world_all_actors'},
      {kind: 'block', type: 'world_actors_with_trait'},
      {kind: 'block', type: 'world_count_of_kind'},
    ],
    check: {
      kind: 'outcome',
      says: 'All six Coins are drawn as coins, from a workspace holding one loop.',
      falsePass:
        'Six `set sprite` blocks, one per Coin, which also changes all six. The shape half is what asks for the loop — and it is the lesson, since the outcome is the same either way.',
      run: {
        probes: {drawn: {kind: 'sprites'}},
        trace: [{seconds: 0.1}],
      },
      inspect: files =>
        Object.values(files).some(contents =>
          contents.includes('world_for_each'),
        ),
      passes: ({samples}) =>
        lastList<string>(samples.drawn).filter(name => name.includes('coin'))
          .length === 6,
    },
  },
  {
    id: 'memory/world-state',
    region: 'memory',
    at: at('memory', 1, 1),
    title: 'State the world shares',
    teaches: 'A value that belongs to the game rather than to anything in it.',
    task: 'Two Labels disagree about how many lives are left. Make it one number they both read.',
    requires: ['memory/variable'],
    unlocks: [
      {kind: 'block', type: 'world_rule_property'},
      // The Label, which is where the words are now: `text`, its size, its
      // color and its anchor were the Writing rule's, and are this actor's own
      // declarations (specs/UI_ACTORS.md).
      {kind: 'actor', id: 'label'},
      {kind: 'block', type: 'text'},
      // …and the door into a chain for a value that is not words. Joining two
      // things was `text_join` and a mutator; a string block carries a socket
      // for whatever comes next now, so this lesson's "SCORE ⟨the score⟩" is a
      // chain rather than a bubble to open (`domainBlocks.worldAsText`).
      {kind: 'block', type: 'world_as_text'},
    ],
    check: {
      kind: 'outcome',
      says: 'Both Labels say the same thing, and each reads it from the world.',
      falsePass:
        'Typing the same words into both, which also makes them agree. So the shape half asks for the declaration AND for a read of it — the getter block is keyed by the file (`world_get_WorldsMain_…`), not by the name, so it holds whatever the property ends up called.',
      run: {
        probes: {said: {kind: 'property', of: 'Label', name: 'text'}},
        trace: [{seconds: 0.1}],
      },
      inspect: files => {
        const world = files['worlds/main.world'] ?? '';
        return (
          world.includes('world_rule_property') &&
          world.includes('world_get_WorldsMain_')
        );
      },
      passes: ({samples}) => {
        const said = lastList<string>(samples.said);
        return said.length === 2 && said[0] === said[1] && said[0].length > 0;
      },
    },
  },
  {
    id: 'memory/actor-state',
    region: 'memory',
    at: at('memory', 2, 1),
    title: 'State an actor carries',
    teaches:
      'The same property on many actors, each with its own value — which is what an instance is.',
    task: 'Two Lamps read one number and so cannot differ. Give each its own.',
    requires: ['memory/world-state'],
    // `this actor` came with the first lesson. What THIS one adds is a property
    // declared in an actor's own file — the thing that makes a value belong to
    // an instance rather than to the world.
    unlocks: [
      {kind: 'block', type: 'world_get_boolean_property'},
      {kind: 'block', type: 'world_set_boolean_property'},
    ],
    offers: [{kind: 'block', type: 'world_rule_property'}],
    check: {
      kind: 'outcome',
      says: 'The two Lamps say different things, from a number the Lamp itself holds.',
      falsePass:
        "Typing the two texts out, which also makes them differ — and so does setting the world's number twice, once before each Lamp, since the text is built as the Lamp is added. That one is worth naming because it WORKS: what it does not do is leave the Lamps holding anything, so nothing can ask a Lamp its number afterwards. The shape half is what says so — the Lamp declares the property, and the world reads it back.",
      run: {
        probes: {said: {kind: 'property', of: 'Lamp', name: 'text'}},
        trace: [{seconds: 0.1}],
      },
      inspect: files =>
        (files['actors/lamp.actor'] ?? '').includes('world_rule_property') &&
        (files['worlds/main.world'] ?? '').includes('world_get_ActorsLamp_'),
      passes: ({samples}) => {
        const said = lastList<string>(samples.said);
        return said.length === 2 && said[0] !== said[1];
      },
    },
  },
  {
    id: 'memory/lists',
    region: 'memory',
    at: at('memory', 3, 1),
    title: 'More than one of something',
    teaches:
      'A list: one name for several things, and the loop that walks what you put in it.',
    task: 'Three things to remember, remembered three separate times.',
    requires: ['memory/score'],
    // The DRAWER, rather than its blocks one at a time. Eleven blocks is a lot
    // to hand over at once and they are one idea: a list, the ways to fill it,
    // and the loops that walk it. `origin/first-world` grants seven blocks
    // instead of the Actor drawer for the opposite reason — forty-two blocks is
    // not one idea.
    unlocks: [{kind: 'category', name: 'Lists'}],
    // The words are the learner's to type, and `text` is Story's to grant.
    offers: [{kind: 'block', type: 'text'}],
    check: {
      kind: 'outcome',
      says: 'One note per thing in the list, saying the things in the order they were put in.',
      falsePass:
        'The three stacks the lesson starts with, which make the same three notes and have no list in them — so the shape half asks for the literal and the loop, and the run half for what the notes say. A learner who adds a fourth thing still passes: the check reads the three it knows about, at the front and in order.',
      run: {
        probes: {said: {kind: 'property', of: 'Label', name: 'text'}},
        // Nothing to drive: the world says its piece as it is built.
        trace: [{seconds: 0.1}],
      },
      inspect: files => {
        const world = files['worlds/main.world'] ?? '';
        return (
          world.includes('lists_create_with') &&
          world.includes('world_for_each_word')
        );
      },
      passes: ({samples}) => {
        const said = lastList<string>(samples.said);
        return (
          said.length >= 3 &&
          ['BREAD', 'MILK', 'JAM'].every((word, at) => said[at] === word)
        );
      },
    },
  },
  {
    id: 'memory/score',
    region: 'memory',
    at: at('memory', 3, 0),
    title: 'Somebody already counted',
    teaches:
      'Recognising your own hand-rolled thing in a library, and what you get for swapping.',
    task: 'Replace the counter you wrote with Scoring, and get "the target is reached" for nothing.',
    requires: ['memory/many'],
    unlocks: [{kind: 'rule', id: 'score'}],
    // The rule's own blocks arrive with the rule and are never gated. What the
    // learner reaches into the toolbox for is the number to type into `set
    // target score`, which belongs to Place's lesson on a branch this one never
    // touches.
    offers: [{kind: 'block', type: 'math_number'}],
    check: {
      kind: 'trace',
      says: 'One line on the console, and it says five — the moment the target was reached, not the tally at the end.',
      falsePass:
        'Printing a bare 5 from inside the handler, which says the same thing and knows nothing. The shape half asks that the printed value be the score, and the run half that the line arrive once: a project that counts to six and prints at the end says 6, and one that prints in the loop says six lines.',
      run: {
        probes: {},
        // Six clicks, and the target is five: the fifth is the one that says
        // anything, and the sixth is what proves it says nothing twice.
        trace: Array.from({length: 6}, () => [
          {pointer: {x: 160, y: 160, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 160, y: 160, buttons: []}, seconds: 0.1},
        ]).flat(),
      },
      inspect: files => {
        const world = files['worlds/main.world'] ?? '';
        return (
          world.includes('world_on_Scoring_TheTargetIsReachedEvent') &&
          world.includes('world_get_Scoring_ScoreProperty')
        );
      },
      passes: ({console: said}) => said.length === 1 && said[0] === '5',
    },
  },

  // ── Foundation: Look ──────────────────────────────────────────────────────
  {
    id: 'look/sprite',
    region: 'look',
    at: at('look', 1, 0),
    title: 'A picture is a file',
    teaches:
      'Nothing is built in: what a game draws is what the project holds.',
    task: 'Import a sprite from the library, then paint your own and use that instead.',
    requires: ['origin/first-world'],
    unlocks: [
      // `set sprite` came with the first lesson — a Hero without a picture is
      // not much of a first lesson. What this one adds is the EDITOR, and the
      // library to copy from.
      {kind: 'editor', id: 'image'},
      {kind: 'asset', id: 'player'},
      {kind: 'asset', id: 'coin'},
    ],
    check: {
      kind: 'outcome',
      says: 'The actor draws a sprite the project holds, and the file was edited after it was imported.',
      falsePass:
        'Importing and not painting — which this check cannot see, because nothing records when a picture was last touched. The check is weaker than the lesson, and this is where that is written down.',
      run: {probes: {drawn: {kind: 'sprites'}}, trace: [{seconds: 0.1}]},
      passes: ({samples}) => lastList<string>(samples.drawn).length > 0,
    },
  },
  {
    id: 'look/drawing',
    region: 'look',
    at: at('look', 2, 0),
    title: 'Draw it yourself',
    teaches:
      'A pen and five shapes — which is what every meter, bar and box in this lab is made of.',
    task: 'Two progress bars are both drawn full. Make the drawing read the number each one holds.',
    requires: ['look/sprite'],
    unlocks: [
      {kind: 'category', name: 'Drawing'},
      {kind: 'actor', id: 'progressBar'},
      // A pen needs a color, and this is the first lesson that holds one.
      {kind: 'block', type: 'colour_picker'},
    ],
    // The width wants arithmetic, which is Memory's lesson on a branch this one
    // never touches.
    offers: [
      {kind: 'block', type: 'math_arithmetic'},
      {kind: 'block', type: 'math_number'},
    ],
    check: {
      kind: 'outcome',
      says: 'The two Bars draw different pictures.',
      falsePass:
        'There is not one worth naming, which is unusual and is the lesson: ONE drawing is run for BOTH Bars, so the only way they can differ at all is by reading something the Bar itself holds. A drawing that draws two different pictures has been made to read.',
      run: {
        probes: {bars: {kind: 'drawings', of: 'Bar'}},
        trace: [{seconds: 0.1}],
      },
      passes: ({samples}) => {
        const bars = lastList<{key: string}>(samples.bars);
        return bars.length === 2 && bars[0].key !== bars[1].key;
      },
    },
  },
  {
    id: 'look/background',
    region: 'look',
    at: at('look', 1, 1),
    title: 'Behind everything',
    teaches: 'The backdrop is not an actor, and neither is what sits in front.',
    task: 'Add a backdrop, tile it, and slide it — and watch the actors stay where they are.',
    requires: ['look/sprite'],
    unlocks: [
      {kind: 'block', type: 'world_set_background'},
      // …and the way back: a lesson that hands out a sky and no way to take it
      // down is a lesson in a state you cannot leave.
      {kind: 'block', type: 'world_clear_background'},
      {kind: 'block', type: 'world_set_background_repeat'},
      {kind: 'block', type: 'world_set_background_color'},
      {kind: 'block', type: 'world_set_background_offset'},
    ],
    // Sliding it takes a vector, which is Motion's lesson on another branch.
    offers: [{kind: 'block', type: 'world_vector'}],
    check: {
      kind: 'outcome',
      says: 'The world draws a backdrop, it tiles, and it has been slid off the origin.',
      falsePass:
        "A very large actor placed behind everything, which looks the same and is not one — so the probe reads the WORLD's backdrop rather than counting pictures on screen. An actor cannot appear there however big it is.",
      run: {probes: {sky: {kind: 'backdrop'}}, trace: [{seconds: 0.1}]},
      passes: ({samples}) => {
        const sky = lastList<{
          sprite?: string;
          repeat: boolean;
          offset: {x: number; y: number};
        }>(samples.sky);
        const behind = sky[0];
        return Boolean(
          behind?.sprite &&
            behind.repeat &&
            (behind.offset.x !== 0 || behind.offset.y !== 0),
        );
      },
    },
  },
  {
    id: 'look/animation',
    region: 'look',
    at: at('look', 3, 0),
    title: 'Pictures in a row',
    teaches: 'An animation is a file that reads rectangles out of one image.',
    task: 'A Hero that slides without moving its legs. Give it a walk cycle.',
    requires: ['look/drawing'],
    unlocks: [
      {kind: 'editor', id: 'animation'},
      {kind: 'block', type: 'world_play_animation'},
      {kind: 'asset', id: 'playerWalk'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Hero’s frame changes as the game runs.',
      falsePass:
        'Setting a sprite that happens to be one frame of the walk, which looks like walking in a screenshot and never moves. The check samples the frame twice and asks that it CHANGED, which no still picture does.',
      run: {
        probes: {frame: {kind: 'property', of: 'Hero', name: 'frame'}},
        // Sampled ACROSS half a second rather than at each end of it. A walk
        // cycle is four frames at eight a second, so half a second is exactly
        // one loop and the two ends agree — the first version of this check
        // read frame 0 twice and refused a Hero that was walking perfectly.
        trace: Array.from({length: 6}, () => ({seconds: 0.08})),
      },
      passes: ({samples}) => {
        const frames = ((samples.frame ?? []) as unknown[][])
          .map(actors => actors[0])
          .filter(frame => frame !== undefined);
        return new Set(frames).size > 1;
      },
    },
  },
  {
    id: 'look/effect',
    region: 'look',
    at: at('look', 2, 1),
    title: 'An effect is a recipe',
    teaches: 'A shader is a description of how to paint, not a picture.',
    task: 'Put an effect on one actor, then over the whole view, from one file.',
    requires: ['look/background'],
    unlocks: [
      {kind: 'editor', id: 'effect'},
      {kind: 'block', type: 'world_add_effect'},
      {kind: 'block', type: 'world_add_world_effect'},
    ],
    check: {
      kind: 'outcome',
      says: 'One actor is painted through an effect, and so is the whole view.',
      falsePass:
        'Importing the effect and never adding it, which puts a file in the project and changes nothing. The probe reads the RUNNING actor and the running world, so an effect nobody played is not there to find.',
      run: {
        probes: {
          coin: {kind: 'effects', of: 'Coin'},
          hero: {kind: 'effects', of: 'Hero'},
          view: {kind: 'effects'},
        },
        trace: [{seconds: 0.1}],
      },
      passes: ({samples}) => {
        const on = (sample: unknown[] | undefined) =>
          lastList<{path: string}[]>(sample);
        const coin = on(samples.coin)[0] ?? [];
        const hero = on(samples.hero)[0] ?? [];
        const view = on(samples.view)[0] ?? [];
        // The Hero is in it because "on one actor" is half the lesson: an
        // effect on every actor is a world effect written out longhand.
        return coin.length > 0 && hero.length === 0 && view.length > 0;
      },
    },
  },

  // ── Foundation: Place ─────────────────────────────────────────────────────
  {
    id: 'place/position',
    region: 'place',
    at: at('place', 1, 0),
    title: 'x and y',
    teaches: 'A coordinate, and the vector that holds two of them.',
    task: 'Put three actors in three named places, then put one of them somewhere random.',
    requires: ['origin/first-world'],
    unlocks: [
      // `set position` came with the first lesson; what this one adds is the
      // number itself, the pair of them as a THING, and the shorthand for a
      // whole place.
      {kind: 'block', type: 'math_number'},
      {kind: 'block', type: 'world_vector'},
      {kind: 'block', type: 'world_random_place'},
      {kind: 'block', type: 'math_arithmetic'},
    ],
    check: {
      kind: 'outcome',
      says: 'All three land within tolerance of where they were asked to be.',
      falsePass:
        'Dragging them into place in the map editor. The lesson has no map file.',
      run: {
        probes: {markers: {kind: 'positions', of: 'Marker'}},
        trace: [{seconds: 0.1}],
      },
      // The world is 12 by 9 tiles of 32 — 384 across, 288 down. "Top left" and
      // "bottom right" are quadrants rather than points: the lesson names two
      // corners and a middle, and where exactly is the learner's business.
      passes: ({samples}) => {
        const markers = lastList<Point>(samples.markers);
        return (
          markers.length >= 3 &&
          markers.some(at => at.x < 107 && at.y < 107) &&
          markers.some(at => at.x > 213 && at.y > 213)
        );
      },
    },
  },
  {
    id: 'place/map',
    region: 'place',
    at: at('place', 2, 0),
    title: 'A room drawn, not typed',
    teaches:
      'A level is data: an arrangement that says what is where, separate from the code that says what each one is.',
    task: 'A floor of three tiles that stops short. Paint the rest of the room on the grid.',
    requires: ['place/position'],
    unlocks: [
      {kind: 'editor', id: 'map'},
      {kind: 'block', type: 'world_create_in_map'},
      // …and the same arrangement in a FILE, which is what a level shared
      // between worlds is. The lesson keeps its own in the block, where the
      // grid opens from the block that holds it.
      {kind: 'block', type: 'world_load_map'},
      // How big the level is, and how a world with no map says so. Both are
      // ideas about a world BIGGER than the view, which is `place/camera`.
      {kind: 'block', type: 'world_set_map_size'},
      {kind: 'block', type: 'world_map_size'},
    ],
    check: {
      kind: 'outcome',
      says: 'The room is painted: a dozen Grounds, in more than one row.',
      falsePass:
        'Placing them with `add actor` instead, one block each — which is the thing the lesson replaces, and which the check refuses by counting only what the ARRANGEMENT placed.',
      run: {
        probes: {ground: {kind: 'positions', of: 'Ground'}},
        trace: [{seconds: 0.1}],
      },
      // What the ARRANGEMENT holds, rather than what the world ended up with:
      // twenty `add actor ⟨Ground⟩` rows reach the same world and are the thing
      // the lesson replaces.
      inspect: files => {
        const grid = blockIn(files, 'world_create_in_map');
        const placements = (
          grid?.fields as {PLACEMENTS?: unknown[]} | undefined
        )?.PLACEMENTS;
        return Array.isArray(placements) && placements.length >= 12;
      },
      passes: ({samples}) => {
        const tiles = lastList<{x: number; y: number}>(samples.ground);
        const rows = new Set(tiles.map(tile => tile.y));
        return tiles.length >= 12 && rows.size >= 2;
      },
    },
  },
  {
    id: 'place/edges',
    region: 'place',
    at: at('place', 1, 1),
    title: 'The end of the world',
    teaches:
      'What happens at a boundary is a choice, and there are two of them.',
    task: 'A ball leaves and never comes back. Stop it at one edge and bring it round at the other.',
    requires: ['place/position'],
    unlocks: [
      {kind: 'rule', id: 'bounds'},
      {kind: 'rule', id: 'wrap'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Ball never leaves across, and comes back round downwards.',
      falsePass:
        'Electing all four traits, which keeps the Ball on screen and is not the lesson: bounds acts first on each axis, so the Ball simply stops in the corner and nothing ever wraps. The check asks for a wrap as well as for staying in.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        trace: Array.from({length: 10}, () => ({seconds: 0.5})),
      },
      passes: ({samples}) => {
        const path = (samples.ball ?? []).map(
          sample => (sample as {x: number; y: number}[])[0],
        );
        if (path.some(at => !at)) {
          return false;
        }
        // Inside across, all the way through — a Ball that left and came back
        // is not one that stayed.
        const inside = path.every(at => at.x >= 0 && at.x <= 320);
        // …and round downwards: it is going down the whole time, so the only
        // way `y` can fall is that it left the bottom and came back at the top.
        const wrapped = path.some(
          (at, index) => index > 0 && at.y < path[index - 1].y,
        );
        return inside && wrapped;
      },
    },
  },
  {
    id: 'place/layers',
    region: 'place',
    at: at('place', 2, 1),
    title: 'What is in front',
    teaches:
      'Drawing order is a thing you declare, and some things should not move with the view at all.',
    task: 'The score scrolls away with the scenery. Give it a layer that ignores the camera, and the hills one that lags.',
    requires: ['place/map'],
    unlocks: [
      {kind: 'block', type: 'world_define_layer'},
      {kind: 'block', type: 'world_within_layer'},
      {kind: 'block', type: 'world_layer_fixed'},
      {kind: 'block', type: 'world_layer_parallax'},
    ],
    check: {
      kind: 'shape',
      says: 'The Score is in a layer fixed to the screen, and the Hills are in one that moves less than the camera.',
      falsePass:
        'Moving the Score every frame to wherever the camera is, which looks identical and is a thing to keep in step by hand for the rest of the project. The check reads the LAYER, which is the declaration that makes it true once.',
      run: {probes: {view: {kind: 'cameras'}}, trace: [{seconds: 0.1}]},
      inspect: files => {
        const declared = blocksIn(files, 'world_define_layer').map(layer =>
          JSON.stringify(layer),
        );
        const holds = (what: string, who: string) =>
          declared.some(layer => layer.includes(what) && layer.includes(who));
        return (
          holds('world_layer_fixed', 'local:score') &&
          holds('world_layer_parallax', 'local:hill')
        );
      },
      // The world is still a world: the shape half is what this lesson can be
      // judged on, and a project that no longer runs has not done it.
      passes: ({samples}) => (samples.view?.length ?? 0) > 0,
    },
  },
  {
    id: 'place/camera',
    region: 'place',
    at: at('place', 3, 0),
    title: 'A window on a bigger world',
    teaches: 'What is drawn and where things are are two different questions.',
    task: 'A room three screens wide and a view showing the first. Follow the Hero, and stop at the walls.',
    requires: ['place/map'],
    unlocks: [
      {kind: 'rule', id: 'camera'},
      {kind: 'rule', id: 'cameraFollow'},
      {kind: 'rule', id: 'cameraConfined'},
      {kind: 'block', type: 'world_define_camera'},
      {kind: 'block', type: 'world_use_camera'},
    ],
    check: {
      kind: 'outcome',
      says: 'The view travels with the Hero, and stops where the room stops.',
      falsePass:
        'Following without confining, which tracks the Hero perfectly and then leaves the room behind it — three screens of nothing. Both halves are read: the view has to have MOVED, and it has to have STOPPED.',
      run: {
        probes: {view: {kind: 'cameras'}},
        trace: Array.from({length: 8}, () => ({seconds: 0.5})),
      },
      passes: ({samples}) => {
        const path = (samples.view ?? []).map(sample => {
          const cameras = sample as {x: number; active: boolean}[];
          return cameras.find(camera => camera.active)?.x;
        });
        if (path.some(x => x === undefined)) {
          return false;
        }
        const seen = path as number[];
        // Thirty tiles across is 960, and the view is 320 — so a camera that
        // stops where the room does never gets past 800, and one that followed
        // at all got well past where it started.
        return Math.max(...seen) > 300 && Math.max(...seen) <= 801;
      },
    },
  },
  {
    id: 'place/camera-feel',
    region: 'place',
    at: at('place', 4, 0),
    title: 'Correct, and pleasant',
    teaches:
      'The difference between a camera that is right and a camera that is comfortable.',
    task: 'The view is welded to the Hero. Give it slack for small movements and a moment to catch up on big ones.',
    requires: ['place/camera'],
    unlocks: [
      {kind: 'rule', id: 'cameraEase'},
      {kind: 'rule', id: 'cameraDeadzone'},
    ],
    check: {
      kind: 'outcome',
      says: 'A short step moves the Hero and not the view; a long walk moves the view, and it is still catching up after the keys are let go.',
      falsePass:
        'A deadzone so wide the view never moves at all, which passes the first half and fails the second — and easing alone, which lags beautifully and still lurches on the first step. The two are read separately because they are two different complaints.',
      run: {
        probes: {
          view: {kind: 'cameras'},
          hero: {kind: 'positions', of: 'Hero'},
        },
        // A short step, a pause, a long walk, and two stretches of nothing —
        // which is where easing shows: the keys are up and the view is still
        // moving.
        trace: [
          {hold: ['ArrowRight'], seconds: 0.15},
          {seconds: 0.4},
          {hold: ['ArrowRight'], seconds: 2},
          {seconds: 0.3},
          {seconds: 0.3},
        ],
      },
      passes: ({samples}) => {
        const view = (samples.view ?? []).map(sample => {
          const cameras = sample as {x: number; active: boolean}[];
          return cameras.find(camera => camera.active)?.x ?? 0;
        });
        const hero = (samples.hero ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        if (view.length < 6 || hero.length < 6) {
          return false;
        }
        // Slack: the short step moved the Hero and left the view alone.
        const stillThere =
          Math.abs(view[1] - view[0]) < 1 && hero[1] > hero[0] + 1;
        // …and the long walk moved it, and it was STILL moving afterwards,
        // which is the whole of what easing looks like from outside.
        const traveled = view[3] > view[1] + 1;
        const catchingUp = view[4] > view[3] + 0.5;
        return stillThere && traveled && catchingUp;
      },
    },
  },

  // ── Genre: Platformer (Input + Motion) ────────────────────────────────────
  {
    id: 'platformer/jump',
    region: 'platformer',
    at: at('platformer', 1, 2),
    title: 'Up',
    teaches:
      'An impulse against a force, and the two small lies that make a jump feel right.',
    task: 'A jump that works in mid-air and works forever. Make it a jump that knows what it is.',
    requires: ['input/press', 'motion/gravity'],
    unlocks: [{kind: 'rule', id: 'jump'}],
    check: {
      kind: 'outcome',
      says: 'Three presses spend exactly two jumps, and the Hero leaves the ground and comes back.',
      falsePass:
        'The hand-written jump the lesson starts from, which answers every press: it passes "it went up" on the first press and every press after it. Counting the jumps SPENT is what tells a jump from an upward push — one is not enough either, since the lesson asks for the second.',
      run: {
        probes: {
          hero: {kind: 'positions', of: 'Hero'},
          used: {kind: 'property', of: 'Hero', name: 'jumps used'},
        },
        // Three presses with a coast between each: one from the ground, one in
        // the air, and one that must be refused.
        trace: [
          {hold: ['space'], seconds: 0.1},
          {seconds: 0.25},
          {hold: ['space'], seconds: 0.1},
          {seconds: 0.25},
          {hold: ['space'], seconds: 0.1},
          {seconds: 0.6},
        ],
      },
      passes: ({samples}) => {
        const spent = (samples.used ?? []).map(
          sample => (sample as (number | undefined)[])[0],
        );
        const height = (samples.hero ?? []).map(
          sample => (sample as {y: number}[])[0]?.y ?? 0,
        );
        const most = Math.max(...spent.map(used => used ?? -1));
        return most === 2 && Math.min(...height) < 200;
      },
    },
  },
  {
    id: 'platformer/jetpack',
    region: 'platformer',
    at: at('platformer', 2, 1),
    title: 'Held, not pressed',
    teaches:
      'A force applied for as long as a key is held, out of something that runs out.',
    task: 'A ledge a jump cannot reach. Give the Hero thrust, and a tank to spend on it.',
    requires: ['platformer/jump'],
    unlocks: [{kind: 'rule', id: 'jetpack'}],
    check: {
      kind: 'outcome',
      says: 'Holding the key for a second lifts the Hero past anything a jump could reach, and the tank is lower at the end than it was at the start.',
      falsePass:
        'A bigger jump. Raising "jump strength" until one press clears the ledge passes "it got up there" and nothing else, so this reads the TANK as well as the height — flying is the only thing in the lab that spends fuel, and a jump spends none.',
      run: {
        probes: {
          hero: {kind: 'positions', of: 'Hero'},
          fuel: {kind: 'property', of: 'Hero', name: 'fuel'},
        },
        // Held, which is the whole lesson: a trace of presses would be a
        // trace about jumping.
        trace: [{hold: ['space'], seconds: 1.2}, {seconds: 0.5}],
      },
      passes: ({samples}) => {
        const heights = (samples.hero ?? []).map(
          sample => (sample as {y: number}[])[0]?.y ?? 0,
        );
        const tank = (samples.fuel ?? []).map(
          sample => (sample as (number | undefined)[])[0],
        );
        const filled = tank.filter(
          (level): level is number => typeof level === 'number',
        );
        // A default jump peaks 139 pixels up, which from the floor at 272 is
        // y = 133. Anything above 120 is thrust or a tuned jump; the tank is
        // what tells those apart.
        return (
          Math.min(...heights) < 120 &&
          filled.length > 1 &&
          filled[filled.length - 1] < filled[0]
        );
      },
    },
  },
  {
    id: 'platformer/ladders',
    region: 'platformer',
    at: at('platformer', 3, 1),
    // NOT "Down", which is what `motion/gravity` is called: two tiles whose
    // names begin the same way are two tiles a keyboard user cannot tell
    // apart, and a test in `accessibility` says so.
    title: 'Climbing down',
    teaches:
      'A floor that holds you up until you ask it not to, and why the control scheme is a separate trait.',
    task: 'A ledge with a ladder to it, and a Hero that walks straight past. Make the ladder a ladder and the Hero a climber.',
    requires: ['platformer/jetpack'],
    unlocks: [
      {kind: 'rule', id: 'climb'},
      {kind: 'asset', id: 'ladder'},
    ],
    check: {
      kind: 'outcome',
      says: 'Holding up carries the Hero to the top of the ladder, and holding down afterwards carries it back off the top — which is the half a one-way platform cannot do.',
      falsePass:
        'Climbing up alone, which is what a jump or a jetpack would also do. Going back DOWN through the top is the part that needs the rule: an actor resting on a surface is re-landed on it every frame, so a Hero that only ever went up would pass "it got there" and be stuck at the top forever.',
      run: {
        probes: {hero: {kind: 'positions', of: 'Hero'}},
        trace: [
          {hold: ['up arrow'], seconds: 1.4},
          {seconds: 0.3},
          {hold: ['down arrow'], seconds: 1},
        ],
      },
      passes: ({samples}) => {
        const heights = (samples.hero ?? []).map(
          sample => (sample as {y: number}[])[0]?.y ?? 0,
        );
        if (heights.length < 3) {
          return false;
        }
        // The ledge is at row 4, so a Hero standing on it is near y = 112.
        const climbed = Math.min(...heights) < 130;
        // …and back below it afterwards, which is the half that needs the
        // rule. Measured against the END rather than the start, so a Hero
        // that never left the floor cannot pass by standing still.
        const came = heights[heights.length - 1] > Math.min(...heights) + 60;
        return climbed && came;
      },
    },
  },
  {
    id: 'platformer/surfaces',
    region: 'platformer',
    at: at('platformer', 4, 0),
    title: 'Floors with opinions',
    teaches:
      'A rule that gets the last word on a number the player has already set, and why the moment it runs in is the whole design.',
    task: 'A belt, some ice and some sludge, all of them behaving like ordinary floor. Make each one act.',
    requires: ['platformer/ladders'],
    unlocks: [
      {kind: 'rule', id: 'surfaces'},
      {kind: 'asset', id: 'conveyor'},
      {kind: 'asset', id: 'ice'},
      {kind: 'asset', id: 'sludge'},
    ],
    check: {
      kind: 'outcome',
      says: 'Walking left along the row, the Hero is carried backwards over the belt, wades the sludge, and cannot turn round on the ice.',
      falsePass:
        'Slowing the Hero down, which passes "it took longer" and is not what any of the three do. Each leg is measured on its own against what the SAME walk covers on ordinary floor: the belt must push the Hero the wrong way, the sludge must be slower and still forwards, and the ice must ignore a reversed key entirely.',
      run: {
        probes: {hero: {kind: 'positions', of: 'Hero'}},
        // Broken into legs rather than two long holds, because a probe
        // samples per leg: the last two are what "still going the wrong way"
        // is measured between, and two samples would leave nothing to compare.
        trace: [
          ...Array.from({length: 4}, () => ({
            hold: ['right arrow'],
            seconds: 0.55,
          })),
          ...Array.from({length: 3}, () => ({
            hold: ['left arrow'],
            seconds: 0.3,
          })),
        ],
      },
      passes: ({samples}) => {
        const xs = (samples.hero ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        if (xs.length < 3) {
          return false;
        }
        // Still going right at the end, with the left arrow held: only ice
        // does that, and nothing else in the lab does it at all.
        const slid = xs[xs.length - 1] > xs[xs.length - 2];
        // …and it got there, which needs the belt and the sludge crossed.
        return slid && Math.max(...xs) > 200;
      },
    },
  },
  {
    id: 'platformer/pads',
    region: 'platformer',
    at: at('platformer', 5, 0),
    title: 'Two plates and one place',
    teaches:
      'A way across a room that is not a way through it, and why "one of them" is a thing a language has to be able to say.',
    task: 'A wall with no way round it, and a pad on each side that have nothing to do with each other. Make them one place.',
    requires: ['platformer/surfaces'],
    unlocks: [{kind: 'rule', id: 'teleport'}],
    check: {
      kind: 'outcome',
      says: 'The Hero gets to the far side of a wall it cannot walk round, climb or jump.',
      falsePass:
        'Anything that moved the Hero at all, which is why the wall runs floor to ceiling and the check reads the far SIDE of it rather than a distance traveled. Walking, jumping and falling are all still available and none of them crosses x = 176; the only thing in the room that does is a pad with somewhere to send you.',
      run: {
        probes: {hero: {kind: 'positions', of: 'Hero'}},
        trace: [
          // Land first: the Hero starts a little above the floor and the pad
          // it starts on, and a body in mid-air is touching neither.
          {seconds: 0.3},
          // Then ask, and go on asking. Held rather than tapped because a
          // press is one frame and a leg is a quarter of a second — and
          // holding it is harmless, since `use the pad` does nothing on the
          // pad it has just arrived at.
          ...Array.from({length: 6}, () => ({
            hold: ['down arrow'],
            seconds: 0.25,
          })),
        ],
      },
      passes: ({samples}) => {
        const xs = (samples.hero ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        // The wall is a column of tiles at x = 160, so its far face is 176.
        return xs.some(x => x > 176);
      },
    },
  },
  {
    id: 'platformer/walls',
    region: 'platformer',
    at: at('platformer', 6, 0),
    title: 'Walls that come and go',
    teaches:
      'A room whose shape is a fact about what you have done in it, and the one lever that takes an actor out of every rule that reads a touch.',
    task: 'A block across the corridor and a plate on the floor that does nothing to it. Make the plate move the wall.',
    requires: ['platformer/pads'],
    unlocks: [{kind: 'rule', id: 'switches'}],
    check: {
      kind: 'outcome',
      says: 'The Hero gets past a block that spans the corridor, having walked over the plate on the way.',
      falsePass:
        'Making the wall passable to begin with, which lets the Hero through and is a corridor with nothing across it. The check reads the wall SHUT at the start and open later, so a wall that was never in the way fails on the first half and a plate that never fired fails on the second.',
      run: {
        probes: {
          hero: {kind: 'positions', of: 'Hero'},
          wall: {kind: 'positions', of: 'Wall'},
        },
        trace: Array.from({length: 16}, () => ({
          hold: ['right arrow'],
          seconds: 0.25,
        })),
      },
      passes: ({samples}) => {
        const xs = (samples.hero ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        // The bar is a column at x = 208, so its far face is 224.
        return xs.some(x => x > 224);
      },
    },
  },
  {
    id: 'platformer/digging',
    region: 'platformer',
    at: at('platformer', 6, -1),
    title: 'A hole with a fuse on it',
    teaches:
      'Changing the room yourself, and why the thing that closes it owns the clock rather than the thing that opened it.',
    task: 'A floor you cannot get through and a Hero standing on it. Give yourself a way down, and find out what it costs.',
    requires: ['platformer/walls'],
    unlocks: [{kind: 'rule', id: 'digging'}],
    check: {
      kind: 'outcome',
      says: 'The Hero is standing on the upper floor to begin with, and below it by the end — through a hole it made itself.',
      falsePass:
        'Deleting a block of the Soil, which also puts the Hero underneath and is a floor with a gap drawn in it. So the check reads BOTH ends: it must be UP on the soil at the start and below it later. A floor with a hole already in it never holds the Hero up in the first place, and fails the first half before it can pass the second.',
      run: {
        probes: {hero: {kind: 'positions', of: 'Hero'}},
        trace: [
          {hold: ['down arrow'], seconds: 0.2},
          ...Array.from({length: 12}, () => ({seconds: 0.25})),
        ],
      },
      passes: ({samples}) => {
        const ys = (samples.hero ?? []).map(
          sample => (sample as {y: number}[])[0]?.y ?? 0,
        );
        if (ys.length < 3) {
          return false;
        }
        // Standing ON the soil is 240 — its top, less half a Hero. The floor
        // below is 272. So: up there first, down here later.
        return ys[0] < 250 && ys.some(y => y > 260);
      },
    },
  },
  {
    id: 'platformer/enemies',
    region: 'platformer',
    at: at('platformer', 4, 1),
    title: 'Something that turns',
    teaches:
      'Turning on the world rather than on a clock, and how one number makes two different enemies.',
    task: 'A steel ball that sits there. Make it roll the corridor and come back — and come back at the same place every time.',
    requires: ['platformer/hazards'],
    unlocks: [
      {kind: 'rule', id: 'turning'},
      {kind: 'asset', id: 'pinball'},
      {kind: 'asset', id: 'rocket'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Ball reaches BOTH walls and comes back off each of them, which is what turning on the world rather than on a clock buys.',
      falsePass:
        '"Patrols", which also goes one way and then the other and would pass "it reversed" — and, being a clock, would pass "it turns at regular places" too. What it cannot do is turn at the WALL. Its beat is a speed and a period and knows nothing about the room, so in a corridor this long it turns round in the middle of it and never touches either end. So this measures WHERE the Ball turns.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        // Fine legs, because the check has to see WHERE it turned rather
        // than that it is somewhere different from where it started.
        trace: Array.from({length: 24}, () => ({seconds: 0.25})),
      },
      passes: ({samples}) => {
        const xs = (samples.ball ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        if (xs.length < 8) {
          return false;
        }
        // It turned round at all: some sample is lower than one before it.
        const came = xs.some((here, at) => at > 0 && here < xs[at - 1]);
        // …and it got to BOTH ends. The corridor's clear floor runs from 48
        // to 416; a default patrol covers ninety pixels a leg and reaches
        // neither.
        return came && Math.max(...xs) > 380 && Math.min(...xs) < 90;
      },
    },
  },
  {
    id: 'platformer/hunter',
    region: 'platformer',
    at: at('platformer', 5, 1),
    title: 'An enemy that thinks',
    teaches:
      'Why an enemy that reads you every frame is useless in a platformer, and what it does instead.',
    task: 'A robot on the lower floor and a Hero on the upper one. Make the robot come and find you.',
    requires: ['platformer/enemies'],
    unlocks: [
      {kind: 'rule', id: 'prowling'},
      {kind: 'asset', id: 'robot'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Robot crosses the lower floor, takes the ladder, and arrives on the floor the Hero is standing on.',
      falsePass:
        '"Chases and Flees", which points itself at the Hero every frame and would pass any check that only asked whether it came closer. What it cannot do is get UP: it walks to the spot under the Hero and stays there, because the way up is a ladder and a chaser has no idea what one is. So this asks whether the Robot changed floors.',
      run: {
        probes: {robot: {kind: 'positions', of: 'Robot'}},
        trace: Array.from({length: 20}, () => ({seconds: 0.4})),
      },
      passes: ({samples}) => {
        const ys = (samples.robot ?? []).map(
          sample => (sample as {y: number}[])[0]?.y ?? 0,
        );
        if (ys.length < 4) {
          return false;
        }
        // A robot standing on the upper floor is at 112. A CHASER, which is
        // what the starter has, rises until it meets the underside of that
        // floor and stops at 176 — so the line between them is what this
        // measures, and the only way to cross it is the ladder.
        return Math.min(...ys) < 150;
      },
    },
  },
  {
    id: 'platformer/flier',
    region: 'platformer',
    at: at('platformer', 4, 2),
    title: 'Something in the air',
    teaches:
      'Why an enemy that never stops re-aiming is an enemy you cannot play against, and what committing to a line buys instead.',
    task: 'A bat below you that comes and keeps coming. Give it two phases, so that there is a moment you can move in.',
    requires: ['platformer/hunter'],
    unlocks: [
      {kind: 'rule', id: 'flapping'},
      {kind: 'asset', id: 'bat'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Bat both climbs and descends — it flaps up in bursts and glides back down, rather than rising steadily to the one place you are.',
      falsePass:
        '"Chases and Flees", which is what the Bat starts with and which also arrives: it is above the floor, below the Hero, and closing, so any check that asked whether it got nearer would pass it unchanged. What a chaser CANNOT do is move away from you, ever — it re-aims every frame, so its height only ever falls towards yours. So this asks for both directions: a rise and a drop, which is the flap and the glide taking turns and is not something anything else in the lab produces.',
      run: {
        probes: {bat: {kind: 'positions', of: 'Bat'}},
        // Fine legs, because the two phases have to be told apart from each
        // other rather than from standing still.
        trace: Array.from({length: 24}, () => ({seconds: 0.15})),
      },
      passes: ({samples}) => {
        const ys = (samples.bat ?? []).map(
          sample => (sample as {y: number}[])[0]?.y ?? 0,
        );
        if (ys.length < 8) {
          return false;
        }
        // Two pixels, which is well above the nudging a solid body does and
        // well below a flap or a glide.
        const rose = ys.some((y, index) => index > 0 && y < ys[index - 1] - 2);
        const fell = ys.some((y, index) => index > 0 && y > ys[index - 1] + 2);
        return rose && fell;
      },
    },
  },
  {
    id: 'platformer/ground',
    region: 'platformer',
    at: at('platformer', 2, 2),
    title: 'Floors that move',
    teaches: 'Something can be solid and still be going somewhere.',
    task: 'A platform that walks its beat and leaves the player standing where it was.',
    requires: ['platformer/jump'],
    unlocks: [
      {kind: 'rule', id: 'patrol'},
      {kind: 'rule', id: 'carry'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Hero, touching nothing and pressing nothing, ends up where the Platform went.',
      falsePass:
        'One half of the pair, which does nothing at all — a platform that carries nobody, or a rider standing on a floor that never said it was going anywhere. The check reads the Hero against the PLATFORM rather than against where it started, so a Hero that moved for some other reason is not a Hero that was carried.',
      run: {
        probes: {
          hero: {kind: 'positions', of: 'Hero'},
          platform: {kind: 'positions', of: 'Platform'},
        },
        trace: Array.from({length: 6}, () => ({seconds: 0.25})),
      },
      passes: ({samples}) => {
        const hero = lastList<{x: number}>(samples.hero)[0]?.x;
        const platform = lastList<{x: number}>(samples.platform)[0]?.x;
        const started = 120;
        return (
          typeof hero === 'number' &&
          typeof platform === 'number' &&
          // It went somewhere…
          Math.abs(platform - started) > 40 &&
          // …and the Hero went with it, give or take the frame the carry is
          // measured behind (`rules/carry`).
          Math.abs(hero - platform) <= 2
        );
      },
    },
  },
  {
    id: 'platformer/pickups',
    region: 'platformer',
    at: at('platformer', 1, 3),
    title: 'Things worth having',
    teaches: 'A rule that raises an event on both sides of a moment.',
    task: 'A Hero that walks through three coins. Make it take them, and count what it holds.',
    requires: ['platformer/jump'],
    unlocks: [
      {kind: 'rule', id: 'collect'},
      {kind: 'actor', id: 'coin'},
      {kind: 'asset', id: 'coinSpin'},
    ],
    check: {
      kind: 'outcome',
      says: 'Three coins taken leaves three counted and none in the world.',
      falsePass:
        'Removing the Coin in a collision handler and counting separately, which is the lesson done the long way — so this check accepts it, and says so here rather than pretending it cannot happen. What it will not accept is a world where the coins are gone and nothing holds them.',
      run: {
        probes: {
          coins: {kind: 'actorCount', of: 'Coin'},
          got: {kind: 'property', of: 'Hero', name: 'collected'},
        },
        trace: Array.from({length: 6}, () => ({seconds: 0.5})),
      },
      passes: ({samples}) => {
        const left = lastNumber(samples.coins);
        const held = (samples.got ?? []).map(sample => {
          const first = (sample as unknown[])[0];
          return Array.isArray(first) ? first.length : -1;
        });
        return left === 0 && Math.max(...held) === 3;
      },
    },
  },
  {
    id: 'platformer/hazards',
    region: 'platformer',
    at: at('platformer', 3, 2),
    title: 'Something that can hurt you',
    teaches:
      'A rule that does not know who it is damaging: one ability says what can be damaged, another says what damages.',
    task: 'A Hero that walks into a spike and stops. Make the spike dangerous, and the Hero the sort of thing it can hurt.',
    requires: ['platformer/ground'],
    unlocks: [
      {kind: 'rule', id: 'health'},
      {kind: 'actor', id: 'healthBar'},
    ],
    check: {
      kind: 'trace',
      says: 'Leaning on the Spike costs health more than once, and never more than once in a fifth of a second.',
      falsePass:
        'Hurting on every frame of contact, which also empties the bar and is the thing mercy time exists to prevent: the samples are a fifth of a second apart and mercy is half of one, so a legitimate hit costs at most one health per sample. Three at once is a hazard nobody could walk past.',
      run: {
        probes: {health: {kind: 'property', of: 'Hero', name: 'health'}},
        // Into the Spike, off it, and into it again — because being hurt
        // happens when a touch STARTS, and one long lean is one touch.
        trace: [
          ...Array.from({length: 8}, () => ({
            hold: ['ArrowRight'],
            seconds: 0.2,
          })),
          ...Array.from({length: 4}, () => ({
            hold: ['ArrowLeft'],
            seconds: 0.2,
          })),
          ...Array.from({length: 8}, () => ({
            hold: ['ArrowRight'],
            seconds: 0.2,
          })),
        ],
      },
      passes: ({samples}) => {
        const health = (samples.health ?? []).map(
          sample => (sample as (number | undefined)[])[0],
        );
        if (health.some(value => typeof value !== 'number')) {
          return false;
        }
        const values = health as number[];
        const hurtAtOnce = values.some(
          (value, index) => index > 0 && values[index - 1] - value > 1,
        );
        return values[0] === 3 && Math.min(...values) <= 1 && !hurtAtOnce;
      },
    },
  },
  {
    id: 'platformer/level',
    region: 'platformer',
    at: at('platformer', 2, 3),
    title: 'A level',
    teaches:
      'A start, a route, an end — and the state that says which you are in.',
    task: 'Everything from the last four lessons in one room, and a Flag that means nothing. Make reaching it mean something.',
    requires: ['platformer/pickups', 'platformer/hazards'],
    unlocks: [
      {kind: 'template', id: 'platformer'},
      // The stock Player: gravity, walking, jumping and the space bar, already
      // assembled. It belongs to the capstone rather than to `jump`, because
      // what it saves is the assembly, and the assembly is what the four tiles
      // before this one were for.
      {kind: 'actor', id: 'player'},
    ],
    // The question this lesson turns on is Logic's, and Platformer is entered
    // from Input and Motion — so a learner can arrive here without ever having
    // been told what `if` is. The lesson teaches none of it; it borrows it, and
    // says where it came from.
    offers: [
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'world_is_a'},
      {kind: 'block', type: 'world_event_actor'},
      {kind: 'block', type: 'logic_boolean'},
    ],
    check: {
      kind: 'outcome',
      says: 'One run right: the coins go, the Spike damages, and the world is won only once the Flag is reached.',
      falsePass:
        'A win that fires on any touch, which is true the moment the first Coin is taken — so the check reads `won` all the way along rather than at the end. The run takes two coins and a hit before it reaches the Flag, and every one of those has to leave the world unwon.',
      run: {
        probes: {
          won: {kind: 'worldProperty', path: 'My_World.won'},
          hero: {kind: 'positions', of: 'Hero'},
        },
        trace: Array.from({length: 12}, () => ({
          hold: ['ArrowRight'],
          seconds: 0.3,
        })),
      },
      passes: ({samples}) => {
        const won = (samples.won ?? []).map(value => value === true);
        const x = (samples.hero ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        // Unwon everywhere short of the Flag, and won by the end of the run.
        const early = won.every((yes, index) => !yes || x[index] > 500);
        return early && won[won.length - 1] === true;
      },
    },
  },

  // ── Genre: Arcade (Motion + Logic) ────────────────────────────────────────
  {
    id: 'arcade/bounce',
    region: 'arcade',
    at: at('arcade', 1, 2),
    title: 'Off the wall',
    teaches:
      'A property on a surface decides what a collision does to a speed.',
    task: 'A ball that stops dead at the wall. Find the bounciness where it never slows down.',
    requires: ['motion/force', 'logic/collision'],
    unlocks: [
      {kind: 'block', type: 'world_set_SolidBodies_BouncinessProperty'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Ball is moving as fast at the end of a long run as it was at the start.',
      falsePass:
        'Reversing the velocity by hand in a collision handler, which bounces and is not what the lesson is about — so the shape half asks that there is no handler. A wall that gives the speed back is a fact about the wall.',
      run: {
        probes: {ball: {kind: 'positions', of: 'Ball'}},
        trace: Array.from({length: 14}, () => ({seconds: 0.4})),
      },
      inspect: files =>
        !Object.values(files).some(contents =>
          contents.includes('world_on_Collisions_StartsTouchingEvent'),
        ),
      passes: ({samples}) => {
        const path = (samples.ball ?? []).map(
          sample => (sample as {x: number; y: number}[])[0],
        );
        if (path.some(at => !at)) {
          return false;
        }
        // How far it travels between samples. A bounce inside a sample makes
        // one step short, so the comparison is between the BIGGEST steps at
        // each end of the run rather than the last against the first.
        const steps = path
          .slice(1)
          .map((at, index) =>
            Math.hypot(at.x - path[index].x, at.y - path[index].y),
          );
        const fastest = (of: number[]) => Math.max(...of);
        const early = fastest(steps.slice(0, 4));
        const late = fastest(steps.slice(-4));
        return early > 20 && late >= early * 0.7;
      },
    },
  },
  {
    id: 'arcade/paddle',
    region: 'arcade',
    at: at('arcade', 2, 2),
    title: 'A thing you steer',
    teaches: 'Constraining a player is a rule, not a check you write.',
    task: 'A paddle kept on screen by hand, with half of it hanging off. Keep the whole paddle instead.',
    requires: ['arcade/bounce'],
    // NOT the Boundaries rule: `place/edges` grants that, and this lesson is
    // handed it rather than granting it a second time. What it adds is the
    // block that asks how big the view is, for a fence somebody still wants to
    // write by hand.
    unlocks: [{kind: 'block', type: 'world_view_size'}],
    check: {
      kind: 'outcome',
      says: 'Holding left stops the Paddle with its EDGE at the wall — half its own width from the side, whatever that width is.',
      falsePass:
        'Clamping the position to zero, which is what the lesson starts from: it stops, and it stops with half the Paddle off the screen. The check measures the Paddle rather than trusting a number, so making it wider cannot break the answer.',
      run: {
        probes: {
          paddle: {kind: 'positions', of: 'Paddle'},
          drawn: {kind: 'drawings', of: 'Paddle'},
        },
        trace: Array.from({length: 8}, () => ({
          hold: ['ArrowLeft'],
          seconds: 0.4,
        })),
      },
      passes: ({samples}) => {
        const path = lastList<{x: number}>(samples.paddle);
        const drawn = lastList<{width: number}>(samples.drawn);
        const at = path[0]?.x;
        const width = drawn[0]?.width;
        return (
          typeof at === 'number' &&
          typeof width === 'number' &&
          Math.abs(at - width / 2) <= 4
        );
      },
    },
  },
  {
    id: 'arcade/zap',
    region: 'arcade',
    at: at('arcade', 1, 3),
    title: 'An energy ball is spawned',
    teaches:
      'Making things while the game runs, and the other half nobody remembers: taking them away again.',
    task: 'One per press, and none of them ever leaves. Put a recharge time in front and a lifetime behind.',
    requires: ['arcade/bounce'],
    unlocks: [
      {kind: 'rule', id: 'zaps'},
      {kind: 'rule', id: 'expires'},
    ],
    check: {
      kind: 'outcome',
      says: 'Ten presses make fewer than ten energy balls, and the world empties itself afterwards.',
      falsePass:
        'A lifetime and no recharge, which also empties the world and answers as fast as a finger can move — and a recharge with no lifetime, which is a tidy stream that never ends. Both halves are read, because the lesson is that making and unmaking are two jobs.',
      run: {
        probes: {balls: {kind: 'actorCount', of: 'Energy Ball'}},
        // Ten presses in two seconds, then long enough for a lifetime to run
        // out. Held keys make ONE press: the event is the rising edge.
        trace: [
          ...Array.from({length: 10}, () => [
            {hold: ['space'], seconds: 0.1},
            {seconds: 0.1},
          ]).flat(),
          ...Array.from({length: 4}, () => ({seconds: 0.5})),
        ],
      },
      passes: ({samples}) => {
        const alive = (samples.balls ?? []).map(count =>
          typeof count === 'number' ? count : -1,
        );
        const most = Math.max(...alive);
        return most > 0 && most <= 6 && alive[alive.length - 1] === 0;
      },
    },
  },
  {
    id: 'arcade/bricks',
    region: 'arcade',
    at: at('arcade', 3, 2),
    title: 'Many, and then none',
    teaches: 'Counting what is left is how a game knows it is over.',
    task: 'Three bricks that go one at a time, and a game that never ends. End it on the last one.',
    requires: ['arcade/paddle'],
    // NOT `how many … in …`, nor `remove actor`: `memory/many` grants the
    // first and `adventure/keys` the second, and this lesson is handed both.
    // What it adds is the way a world sheds EVERYTHING.
    unlocks: [{kind: 'block', type: 'world_clear_world'}],
    // The question it turns on belongs to Memory, one region away, and Arcade
    // is entered from Motion and Logic.
    offers: [
      {kind: 'block', type: 'world_count_of_kind'},
      {kind: 'block', type: 'world_all_actors'},
      {kind: 'block', type: 'world_trait_step'},
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'logic_compare'},
      {kind: 'block', type: 'math_number'},
    ],
    check: {
      kind: 'outcome',
      says: 'The world is cleared on the last Brick, and not while any Brick is left.',
      falsePass:
        'Ending on any Brick going, which is true from the first one — and counting the HITS, which is the same number as the bricks until somebody adds a brick. The run catches the first; the second is why the lesson asks the world rather than keeping a tally, and this check cannot tell them apart on three bricks.',
      run: {
        probes: {
          bricks: {kind: 'actorCount', of: 'Brick'},
          cleared: {kind: 'worldProperty', path: 'My_World.cleared'},
        },
        trace: Array.from({length: 10}, () => ({seconds: 0.3})),
      },
      passes: ({samples}) => {
        const left = (samples.bricks ?? []).map(count =>
          typeof count === 'number' ? count : -1,
        );
        const cleared = (samples.cleared ?? []).map(value => value === true);
        const early = cleared.every((yes, index) => !yes || left[index] === 0);
        return early && cleared[cleared.length - 1] === true;
      },
    },
  },
  {
    id: 'arcade/waves',
    region: 'arcade',
    at: at('arcade', 2, 3),
    title: 'It gets harder',
    teaches:
      'A timer belongs to an actor, and the interval can be a value like any other.',
    task: 'A Rock a second, forever. Make the gap between them close as the game goes on.',
    requires: ['arcade/zap', 'arcade/bricks'],
    unlocks: [
      {kind: 'rule', id: 'time'},
      // …and the rule that holds what this lesson writes by hand, which is the
      // shape `memory/score` uses: write the thing, then meet the named
      // version. The lesson's last step is where a learner is told.
      {kind: 'rule', id: 'spawner'},
      {kind: 'template', id: 'arcade'},
    ],
    // The arithmetic is Memory's, one region away — Arcade is entered from
    // Motion and Logic, so a learner can arrive here without it.
    offers: [
      {kind: 'block', type: 'math_arithmetic'},
      {kind: 'block', type: 'math_number'},
    ],
    check: {
      kind: 'outcome',
      says: 'The gap between the last two Rocks is shorter than the gap between the first two.',
      falsePass:
        'Sending two Rocks per fire, which is harder and is not this: the gaps are exactly where they were. What is measured is WHEN the world gained a Rock, so any number arriving together counts once.',
      run: {
        probes: {rocks: {kind: 'actorCount', of: 'Rock'}},
        trace: Array.from({length: 60}, () => ({seconds: 0.1})),
      },
      passes: ({samples}) => {
        const counts = (samples.rocks ?? []).map(count =>
          typeof count === 'number' ? count : -1,
        );
        // The samples at which the world gained a Rock — one per arrival,
        // however many arrived.
        const arrivals = counts
          .map((count, index) => ({count, index}))
          .filter(({count, index}) => index > 0 && count > counts[index - 1])
          .map(({index}) => index);
        if (arrivals.length < 4) {
          return false;
        }
        const gaps = arrivals.slice(1).map((at, index) => at - arrivals[index]);
        return gaps[gaps.length - 1] < gaps[0];
      },
    },
  },

  // ── Genre: Puzzle (Logic + Memory) ────────────────────────────────────────
  {
    id: 'puzzle/grid',
    region: 'puzzle',
    at: at('puzzle', 1, 2),
    title: 'A step, not a speed',
    teaches:
      'A tile is a place, and a move is a step into one — or not at all.',
    task: 'A player that slides about between the tiles and walks through the walls.',
    requires: ['logic/kinds', 'memory/many'],
    unlocks: [{kind: 'rule', id: 'grid'}],
    check: {
      kind: 'outcome',
      says: 'Every press lands the Player on a tile, and the fifth press into the wall does not happen.',
      falsePass:
        'Sliding neatly, which looks like stepping until you let go between two tiles — so the check reads the position after every step has settled and asks that it is on a square. Walking through the wall is the other half: a step into a filled tile is not a slow stop, it never starts.',
      run: {
        probes: {player: {kind: 'positions', of: 'Player'}},
        trace: [1, 2, 3, 4, 5].flatMap(() => [
          {hold: ['ArrowLeft'], seconds: 0.1},
          {seconds: 0.2},
        ]),
      },
      passes: ({samples}) => {
        const path = (samples.player ?? []).map(
          sample => (sample as {x: number}[])[0]?.x,
        );
        if (path.some(x => typeof x !== 'number')) {
          return false;
        }
        // The samples after each rest: a step takes 0.12s and the rest is 0.2s,
        // so these are the places it came to a stop.
        const settled = (path as number[]).filter(
          (_x, index) => index > 0 && index % 2 === 0,
        );
        const onTiles = settled.every(x => Math.abs((x - 16) % 32) < 0.001);
        // Four steps left from the middle reaches the tile beside the wall,
        // and the fifth press does nothing at all.
        return onTiles && settled[settled.length - 1] === 48;
      },
    },
  },
  {
    id: 'puzzle/push',
    region: 'puzzle',
    at: at('puzzle', 2, 2),
    title: 'Nobody wrote pushing',
    teaches:
      'A rule that already knows what to do, if the thing it meets says it can be pushed.',
    task: 'A crate that stops you dead. Change one word and push it.',
    requires: ['puzzle/grid'],
    unlocks: [{kind: 'asset', id: 'box'}],
    check: {
      kind: 'outcome',
      says: 'The Crate is two tiles further along than it started, and the Player is where it was.',
      falsePass:
        'Taking `Fills a Tile` off the Crate, which also lets the Player through — and walks straight over it, leaving the Crate where it was. The check reads the CRATE, so a Player that passed through has moved nothing.',
      run: {
        probes: {
          player: {kind: 'positions', of: 'Player'},
          crate: {kind: 'positions', of: 'Crate'},
        },
        trace: [1, 2, 3, 4, 5].flatMap(() => [
          {hold: ['ArrowLeft'], seconds: 0.1},
          {seconds: 0.2},
        ]),
      },
      passes: ({samples}) => {
        const started = 144;
        const crate = lastList<{x: number}>(samples.crate)[0]?.x;
        const player = lastList<{x: number}>(samples.player)[0]?.x;
        return (
          typeof crate === 'number' &&
          typeof player === 'number' &&
          crate <= started - 64 &&
          player < started + 32
        );
      },
    },
  },
  {
    id: 'puzzle/turns',
    region: 'puzzle',
    at: at('puzzle', 1, 3),
    title: 'Everybody moves, then the world moves',
    teaches: 'Turn order: a game where time is a sequence rather than a rate.',
    task: 'An enemy on a timer, in a game where nothing else has a clock.',
    requires: ['puzzle/grid'],
    unlocks: [{kind: 'rule', id: 'turns'}],
    check: {
      kind: 'outcome',
      says: 'The Enemy has taken exactly one step for each step the Player finished.',
      falsePass:
        'An enemy on a timer that happens to match, which the varied press rate breaks. Ending the turn on the key press rather than on the finished step is caught by the last press of all: it is into a wall, so the Player does not move and neither should anything else.',
      run: {
        probes: {
          player: {kind: 'positions', of: 'Player'},
          enemy: {kind: 'positions', of: 'Enemy'},
        },
        // Seven presses at seven different rates: nothing on a clock of its
        // own can keep step with this, and the seventh is into the wall.
        trace: [0.15, 0.55, 0.25, 0.75, 0.3, 0.5, 0.35].flatMap(gap => [
          {hold: ['ArrowRight'], seconds: 0.1},
          {seconds: gap},
        ]),
      },
      passes: ({samples}) => {
        const player = lastList<Point>(samples.player)[0];
        const enemy = lastList<Point>(samples.enemy)[0];
        if (!player || !enemy) {
          return false;
        }
        // Six, not seven: the last press is refused by the wall, and a step
        // that did not happen is not a turn.
        return (
          Math.round((player.x - 80) / 32) === 6 &&
          Math.round((enemy.x - 48) / 32) === 6
        );
      },
    },
  },
  {
    id: 'puzzle/goal',
    region: 'puzzle',
    at: at('puzzle', 3, 2),
    title: 'Counted, not declared',
    teaches:
      'A win condition is a question about the world, asked at the right moment.',
    task: 'Two crates, two marks, and a puzzle that can be solved and never finishes.',
    requires: ['puzzle/push'],
    unlocks: [{kind: 'rule', id: 'goals'}],
    // Only the number. The kind this handler cares about is chosen on the hat
    // itself — `when ⟨any Crate⟩ starts touching ⟨Mark ▾⟩` — so the lesson
    // needs no `if`, no `is a` and no `event actor`, which is three blocks of
    // scaffolding gone from in front of the thing it is about.
    offers: [{kind: 'block', type: 'math_number'}],
    check: {
      kind: 'outcome',
      says: 'A scripted solution wins on the second crate and not on the first.',
      falsePass:
        'Counting arrivals only, which reaches two at the same moment here and is wrong the first time a crate is pushed OFF a mark — one trace cannot tell them apart, so the shape half asks for the leaving handler as well as the arriving one. Winning on a move count is refused by the same half: it has no handlers at all. Leaving the hat on ⟨any⟩ rather than picking ⟨Mark⟩ is not caught either, and was measured rather than assumed: a crate is touched by the player who pushes it and let go of again, and on this board those cancel out to the same score at the same moment (`lessonChecks`).',
      run: {
        probes: {
          won: {kind: 'worldProperty', path: 'Goals.won'},
          crates: {kind: 'positions', of: 'Crate'},
        },
        // Four pushes right to land the first crate, three steps back, two
        // down, and three more to land the second.
        trace: [
          'ArrowRight',
          'ArrowRight',
          'ArrowRight',
          'ArrowRight',
          'ArrowLeft',
          'ArrowLeft',
          'ArrowLeft',
          'ArrowDown',
          'ArrowDown',
          'ArrowRight',
          'ArrowRight',
          'ArrowRight',
        ].flatMap(key => [{hold: [key], seconds: 0.1}, {seconds: 0.2}]),
      },
      inspect: files => {
        const world = files['worlds/main.world'] ?? '';
        return (
          world.includes('world_on_Collisions_StartsTouchingEvent') &&
          world.includes('world_on_Collisions_StopsTouchingEvent')
        );
      },
      passes: ({samples}) => {
        const won = (samples.won ?? []).map(value => value === true);
        // How many crates are on a mark at each moment: the marks are at 240,
        // and a crate committed to that tile is within a few pixels of it.
        const placed = (samples.crates ?? []).map(
          sample =>
            (sample as {x: number}[]).filter(crate => crate.x >= 232).length,
        );
        const early = won.every((yes, at) => !yes || placed[at] === 2);
        return early && won[won.length - 1] === true;
      },
    },
  },
  {
    id: 'puzzle/undo',
    region: 'puzzle',
    at: at('puzzle', 2, 3),
    title: 'Taking it back',
    teaches: 'A history is a stack, and undo is what makes a puzzle forgiving.',
    task: 'A crate that can be pushed one square too far, and never pulled.',
    requires: ['puzzle/turns', 'puzzle/goal'],
    unlocks: [
      {kind: 'rule', id: 'history'},
      {kind: 'template', id: 'puzzle'},
    ],
    check: {
      kind: 'outcome',
      says: 'Three pushes and three undos put the Player and the Crate back where they started.',
      falsePass:
        'Undoing only the Player — the Crate is why the check reads both. A world with the handlers deleted also ends where it started, so the check asks that the Crate went somewhere first. Remembering after the step rather than before is NOT caught, and cannot be: a Grid step is booked and taken later in the frame, so both orders record the same board (`lessonChecks`).',
      run: {
        probes: {
          player: {kind: 'positions', of: 'Player'},
          crate: {kind: 'positions', of: 'Crate'},
        },
        trace: [
          'ArrowRight',
          'ArrowRight',
          'ArrowRight',
          'z',
          'z',
          'z',
        ].flatMap(key => [{hold: [key], seconds: 0.1}, {seconds: 0.2}]),
      },
      passes: ({samples}) => {
        // It has to have gone out before it can have come back: a project that
        // does nothing at all ends at the start too.
        const pushed = (samples.crate ?? []).some(
          sample => ((sample as Point[])[0]?.x ?? 0) > 200,
        );
        const crate = lastList<Point>(samples.crate)[0];
        const player = lastList<Point>(samples.player)[0];
        return (
          pushed &&
          !!crate &&
          Math.abs(crate.x - 144) < 1 &&
          !!player &&
          Math.abs(player.x - 80) < 1
        );
      },
    },
  },

  // ── Genre: Story (Memory + Look) ──────────────────────────────────────────
  {
    id: 'story/text',
    region: 'story',
    at: at('story', 1, 2),
    title: 'Words on a screen',
    teaches:
      'Drawn text is one line of canvas; a paragraph is a column and a wrap.',
    task: 'A sentence longer than the world, drawn as one line. Put it in something that can hold it.',
    requires: ['memory/world-state', 'look/drawing'],
    unlocks: [
      {kind: 'actor', id: 'speechBox'},
      {kind: 'block', type: 'world_draw_paragraph'},
    ],
    check: {
      kind: 'outcome',
      says: 'A Speech Box is in the world saying the line, and the Label is not.',
      falsePass:
        'Shortening the line until it fits the Label, which is a real answer to "it does not fit" and not to this — the check reads the whole sentence back off the Speech Box, so the words have to have moved rather than been trimmed.',
      run: {
        probes: {
          said: {kind: 'property', of: 'Speech Box', name: 'text'},
          labels: {kind: 'actorCount', of: 'Label'},
        },
        trace: [{seconds: 0.1}],
      },
      passes: ({samples}) => {
        const said = lastList<string>(samples.said);
        return (
          lastNumber(samples.labels) === 0 &&
          said.length === 1 &&
          said[0].length > 60
        );
      },
    },
  },
  {
    id: 'story/script',
    region: 'story',
    at: at('story', 2, 2),
    title: 'A place in a list',
    teaches:
      'Nothing waits, so a script is a cursor and an event rather than a sequence of blocks.',
    task: 'One line and a click that does nothing. Give it three lines and a place in them.',
    requires: ['story/text'],
    unlocks: [{kind: 'rule', id: 'conversation'}],
    // `add trait` is `story/reveal`'s, which is a SIBLING rather than a step on
    // the way here; the question and the comparison are Logic's, and Story is
    // entered from Memory and Look.
    offers: [
      {kind: 'block', type: 'world_add_trait'},
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'logic_compare'},
      {kind: 'block', type: 'math_number'},
    ],
    check: {
      kind: 'outcome',
      says: 'Clicking through says three different things.',
      falsePass:
        'Setting the text twice from the click handler itself, which says two things and cannot say a third without another flag — the count is what asks for the cursor. Three distinct lines is what a place in a list buys.',
      run: {
        probes: {said: {kind: 'property', of: 'Speech Box', name: 'text'}},
        trace: [1, 2, 3, 4].flatMap(() => [
          {pointer: {x: 60, y: 220, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 60, y: 220, buttons: []}, seconds: 0.1},
        ]),
      },
      passes: ({samples}) => {
        const said = (samples.said ?? []).map(sample => {
          const first = (sample as unknown[])[0];
          return typeof first === 'string' ? first : '';
        });
        return new Set(said.filter(line => line.length > 0)).size >= 3;
      },
    },
  },
  {
    id: 'story/reveal',
    region: 'story',
    at: at('story', 1, 3),
    title: 'At reading pace',
    teaches:
      'Saying a line is not showing one: the box puts it away whole and lets it out a letter at a time.',
    task: 'A line that is simply there before anybody has read it. Type it out, and let a reader skip.',
    requires: ['story/text'],
    unlocks: [
      // Electing a trait on ONE placed actor rather than on a kind: `add trait`
      // is the runtime half of `use trait`, and this is where it is met. A
      // GRANT rather than an offer, because an offer cannot reach a block no
      // tile grants — inside an earned drawer, unassigned means hidden.
      //
      // NOTHING ELSE, and it used to grant the `Reveals Text` rule. The
      // typewriter is the Speech Box's own now, so `say` and `show all of it`
      // arrive with the actor — a kind's own blocks are never gated, the way a
      // rule's are not (`toolboxShelf.generatedElsewhere`).
      {kind: 'block', type: 'world_add_trait'},
    ],
    check: {
      kind: 'outcome',
      says: 'A third of a second in, only part of the line is showing; a click later, all of it is.',
      falsePass:
        'Typing it out and no way past it, which is the first half and leaves a reader who has finished waiting for the machine — and setting `text` to a shorter line, which is showing all of a line rather than some of a long one. The check reads the length at two moments, before the click and after it.',
      run: {
        probes: {said: {kind: 'property', of: 'Speech Box', name: 'text'}},
        trace: [
          {seconds: 0.3},
          {pointer: {x: 60, y: 220, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 60, y: 220, buttons: []}, seconds: 0.1},
          {seconds: 0.2},
        ],
      },
      passes: ({samples}) => {
        const said = (samples.said ?? []).map(sample => {
          const first = (sample as unknown[])[0];
          return typeof first === 'string' ? first : '';
        });
        // Sample 1 is a third of a second in and sample 4 is after the click.
        return said.length >= 5 && said[1].length < 40 && said[4].length >= 70;
      },
    },
  },
  {
    id: 'story/choice',
    region: 'story',
    at: at('story', 3, 2),
    title: 'A question that matters',
    teaches: 'Branching is the cursor moving somewhere it would not have gone.',
    task: 'A story that asks whether you open the door and then tells you what you did anyway.',
    requires: ['story/script'],
    unlocks: [
      {kind: 'block', type: 'world_do_Conversation_SendToLineAction'},
      // Something to click an answer with.
      {kind: 'actor', id: 'button'},
    ],
    offers: [
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'logic_compare'},
      {kind: 'block', type: 'world_event_actor'},
      {kind: 'block', type: 'math_number'},
      {kind: 'block', type: 'logic_boolean'},
    ],
    check: {
      kind: 'outcome',
      says: 'Answering "Open it" moves the story off the question, and the world remembers that it was opened.',
      falsePass:
        'A button that moves the story on without recording anything, which reads correctly for one line and has forgotten by the next scene — so the check reads the world property as well as the cursor. A choice the story forgets is not a choice.',
      run: {
        probes: {
          line: {kind: 'property', of: 'Speech Box', name: 'line'},
          opened: {kind: 'worldProperty', path: 'My_World.opened_the_door'},
        },
        // Two clicks on the box to reach the question, then the left Button.
        trace: [
          {pointer: {x: 60, y: 220, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 60, y: 220, buttons: []}, seconds: 0.1},
          {pointer: {x: 60, y: 220, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 60, y: 220, buttons: []}, seconds: 0.1},
          {pointer: {x: 80, y: 120, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 80, y: 120, buttons: []}, seconds: 0.1},
          {seconds: 0.2},
        ],
      },
      passes: ({samples}) => {
        const line = lastList<number>(samples.line)[0];
        const opened = (samples.opened ?? [])[
          (samples.opened ?? []).length - 1
        ];
        return line === 3 && opened === true;
      },
    },
  },
  {
    id: 'story/form',
    // STORY's, and it sits past the tile that put a Button on the screen. The
    // question a game asks after "which answer did you click" is "what did you
    // type", and the answer needs something no single control can know: which
    // one of them is listening (specs/UI_ACTORS.md).
    region: 'story',
    at: at('memory', 4, 1),
    title: 'Tell it your name',
    teaches:
      'Which control is listening is a fact about the SCREEN, so it is a rule — and the keyboard can move it.',
    task: 'A form of three fields that tabs through them in the order somebody happened to add them. Put them in the order they are read in.',
    requires: ['story/choice'],
    unlocks: [
      {kind: 'rule', id: 'tabNavigation'},
      // …and the first actor that takes something other than a press. It
      // brings the Label it acts like, and the two rules it reads.
      {kind: 'actor', id: 'textInput'},
    ],
    offers: [
      {kind: 'block', type: 'world_this_actor'},
      {kind: 'block', type: 'math_number'},
    ],
    check: {
      kind: 'outcome',
      says: 'Typing, tabbing, and typing again fills the top field and then the middle one.',
      falsePass:
        'Leaving the order alone, which also fills two fields — so the check reads all three: the untouched project puts the second word in the BOTTOM field, because that is the order the world added them in.',
      run: {
        probes: {said: {kind: 'property', of: 'Text Input', name: 'text'}},
        // A click is a press and a release at one place (`runtime/checks`).
        // Then a word, a Tab, and another word.
        trace: [
          {pointer: {x: 160, y: 100, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 160, y: 100}, seconds: 0.1},
          {type: ['o', 'n', 'e'], seconds: 0.1},
          {hold: ['Tab'], seconds: 0.1},
          {hold: [], seconds: 0.1},
          {type: ['t', 'w', 'o'], seconds: 0.1},
        ],
      },
      passes: ({samples}) => {
        // In the order the WORLD holds them, which is the order they were
        // added: top, bottom, middle. A form in reading order puts the second
        // word in the middle field and leaves the bottom one empty.
        const words = samples.said as string[][];
        const last = words[words.length - 1];
        return (
          last?.length === 3 &&
          last[0] === 'one' &&
          last[1] === '' &&
          last[2] === 'two'
        );
      },
    },
  },
  {
    id: 'story/scene',
    region: 'story',
    at: at('story', 2, 3),
    title: 'Staged',
    teaches:
      'Who is speaking, where it is happening and what it sounds like all hang off the line that moved.',
    task: 'Three lines in an empty gray room. Bring somebody on, and move the story indoors.',
    requires: ['story/reveal', 'story/choice'],
    unlocks: [
      {kind: 'actor', id: 'portrait'},
      {kind: 'block', type: 'world_play_sound'},
      {kind: 'block', type: 'world_set_music'},
      // …and the two ways to stop, granted with the ones that start: a scene
      // that can turn the music on and not off is a scene with a bug in it.
      {kind: 'block', type: 'world_stop_music'},
      {kind: 'block', type: 'world_stop_all_sounds'},
      {kind: 'template', id: 'story'},
    ],
    offers: [
      {kind: 'block', type: 'world_add_trait'},
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'logic_compare'},
      {kind: 'block', type: 'math_number'},
      {kind: 'block', type: 'world_set_background'},
    ],
    check: {
      kind: 'outcome',
      says: 'A face is visible and changes with the speaker, and the backdrop changes with the place.',
      falsePass:
        'Bringing the Portrait on and leaving it there wearing one face, which is a character rather than a scene — the check reads the face at each line as well as the opacity, and the backdrop as well as the face.',
      run: {
        probes: {
          face: {kind: 'property', of: 'Portrait', name: 'sprite'},
          seen: {kind: 'property', of: 'Portrait', name: 'opacity'},
          sky: {kind: 'backdrop'},
        },
        trace: [1, 2, 3].flatMap(() => [
          {pointer: {x: 60, y: 220, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 60, y: 220, buttons: []}, seconds: 0.1},
        ]),
      },
      passes: ({samples}) => {
        const faces = (samples.face ?? []).map(sample =>
          String((sample as unknown[])[0]),
        );
        const seen = (samples.seen ?? []).map(sample =>
          Number((sample as unknown[])[0]),
        );
        const skies = (samples.sky ?? []).map(sample =>
          String((sample as {sprite?: string}[])[0]?.sprite),
        );
        return (
          new Set(faces).size >= 2 &&
          Math.max(...seen) > 0 &&
          new Set(skies.filter(name => name !== 'undefined')).size >= 2
        );
      },
    },
  },

  // ── Genre: Adventure (Look + Place) ───────────────────────────────────────
  {
    id: 'adventure/world',
    region: 'adventure',
    at: at('adventure', 1, 2),
    title: 'Bigger than the screen',
    teaches:
      'A world you cannot see all of, and a view that decides what you can.',
    task: 'A room three screens wide, seen through a window that never moves.',
    requires: ['look/background', 'place/map'],
    unlocks: [{kind: 'template', id: 'adventure'}],
    // Every piece of this belongs to a Place or Look tile, and the two edges
    // into Adventure are `look/background` and `place/map` — so a learner can
    // arrive having done neither `place/camera` nor `place/layers`. The lesson
    // is the assembly; it grants none of the parts.
    offers: [
      {kind: 'block', type: 'world_define_camera'},
      {kind: 'block', type: 'world_use_camera'},
      {kind: 'block', type: 'world_set_background'},
      {kind: 'block', type: 'world_set_background_repeat'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Walker leaves the first screen, the view goes with him and stops at the wall, and there is a backdrop behind it all.',
      falsePass:
        'A camera that follows and nothing behind it, which is the Place lesson over again — the backdrop is the half that makes a room somewhere rather than a strip of floor. Both are read, and so is the view stopping: a camera that runs off the end of the map shows three screens of nothing.',
      run: {
        probes: {
          walker: {kind: 'positions', of: 'Walker'},
          view: {kind: 'cameras'},
          sky: {kind: 'backdrop'},
        },
        trace: Array.from({length: 10}, () => ({
          hold: ['ArrowRight'],
          seconds: 0.4,
        })),
      },
      passes: ({samples}) => {
        const walked = lastList<{x: number}>(samples.walker)[0]?.x ?? 0;
        const seen = (samples.view ?? []).map(sample => {
          const cameras = sample as {x: number; active: boolean}[];
          return cameras.find(camera => camera.active)?.x ?? 0;
        });
        const behind = lastList<{sprite?: string}>(samples.sky)[0]?.sprite;
        // Thirty tiles is 960 and the view is 320, so a confined camera stops
        // at 800 — and one that never moved is still at 160.
        return (
          walked > 320 &&
          Math.max(...seen) > 300 &&
          Math.max(...seen) <= 801 &&
          Boolean(behind)
        );
      },
    },
  },
  {
    id: 'adventure/rooms',
    region: 'adventure',
    at: at('adventure', 2, 2),
    title: 'A door to somewhere else',
    teaches: 'More than one map, and what should survive going between them.',
    task: 'Two rooms in two files, and a door that does nothing.',
    requires: ['adventure/world'],
    // NOT a Scenes rule, which is what this tile asked for while `load map`
    // was a thing only a world being BUILT could do. Loading one while the game
    // runs is the whole of going somewhere else (`World.loadMap`), and it is a
    // block the world file already has — so what was a missing rule turned out
    // to be a missing half of a block.
    // IT GRANTS NOTHING, and it is the only tile that does not. Both blocks a
    // door is made of are already somebody's to give — `load map` is
    // `place/map`'s and `clear world` is `arcade/bricks`' — and what this
    // lesson adds is that the two of them together, in a handler rather than
    // under `define world`, are a way out of the room. There is no third block
    // to hand over for that, and inventing one to have something to unlock
    // would be a worse map.
    unlocks: [],
    // Lent, because the way here comes up through Look and Place and passes
    // through neither of the tiles that grant them. Half a door is no door.
    offers: [
      {kind: 'block', type: 'world_load_map'},
      {kind: 'block', type: 'world_clear_world'},
    ],
    check: {
      kind: 'outcome',
      says: 'Walking into the Door leaves room one behind and arrives at room two’s doorway.',
      falsePass:
        'Teleporting within one big map, which moves the Player and leaves the Door standing — so the check reads WHICH map is loaded (a Chest that was not there, and a Door that is gone) rather than where the Player is. Loading room two without clearing room one is refused by the same reading: both rooms would be in the world at once.',
      run: {
        probes: {
          chests: {kind: 'actorCount', of: 'Chest'},
          doors: {kind: 'actorCount', of: 'Door'},
          player: {kind: 'positions', of: 'Player'},
        },
        trace: Array.from({length: 10}, () => ({
          hold: ['ArrowRight'],
          seconds: 0.3,
        })),
      },
      passes: ({samples}) => {
        const chests = (samples.chests ?? []) as number[];
        const doors = (samples.doors ?? []) as number[];
        const arrived = chests.findIndex(count => count === 1);
        if (chests[0] !== 0 || arrived < 1 || doors[doors.length - 1] !== 0) {
          return false;
        }
        // Arriving is being where the other room's map says: the Player was at
        // the far side of room one a moment ago and is at room two's doorway
        // now, which is a jump no walking could do.
        const at = (index: number) =>
          ((samples.player ?? [])[index] as Array<{x: number}>)?.[0]?.x;
        return at(arrived - 1) > 200 && at(arrived) < 120;
      },
    },
  },
  {
    id: 'adventure/people',
    region: 'adventure',
    at: at('adventure', 1, 3),
    title: 'Somebody who is there',
    teaches:
      'An actor with a life of its own, and a label that travels with it.',
    task: 'A villager who walks her beat and leaves her own name behind.',
    requires: ['adventure/world'],
    unlocks: [{kind: 'rule', id: 'attachment'}],
    // Electing on ONE placed actor is `story/reveal`'s block, a region away.
    offers: [{kind: 'block', type: 'world_add_trait'}],
    check: {
      kind: 'outcome',
      says: 'The name is the same distance from the Villager at the end of her beat as at the start of it.',
      falsePass:
        'A label placed once over her head, which is right until she moves — so the check samples the gap while she is walking, and the Villager has to have walked for it to mean anything.',
      run: {
        probes: {
          who: {kind: 'positions', of: 'Villager'},
          name: {kind: 'positions', of: 'Label'},
        },
        trace: Array.from({length: 6}, () => ({seconds: 0.4})),
      },
      passes: ({samples}) => {
        const gaps = (samples.who ?? []).map((sample, at) => {
          const her = (sample as {x: number; y: number}[])[0];
          const name = (
            (samples.name ?? [])[at] as {x: number; y: number}[]
          )[0];
          return her && name ? Math.hypot(her.x - name.x, her.y - name.y) : NaN;
        });
        const walk = (samples.who ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        const moved = Math.max(...walk) - Math.min(...walk) > 40;
        const held = gaps.every(gap => Math.abs(gap - gaps[0]) < 2);
        return moved && held;
      },
    },
  },
  {
    id: 'adventure/keys',
    region: 'adventure',
    at: at('adventure', 3, 2),
    title: 'A door that wants something',
    teaches:
      'Carrying a thing, and spending it — which is not the same as counting it.',
    task: 'Two locked doors, one key, and no way through either of them.',
    requires: ['adventure/rooms'],
    // `remove actor` is granted HERE, and nowhere before it — which was a hole
    // rather than a decision: every tile that used one was handed it in its
    // own starting project, so a gated learner could reach the end of the map
    // without ever being offered the block. A door that opens by ceasing to
    // exist is as good a place to hand it over as the catalogue has.
    unlocks: [
      {kind: 'rule', id: 'inventory'},
      {kind: 'block', type: 'world_remove_actor'},
    ],
    // Three lent blocks, all for the same reason `adventure/world` lends the
    // camera's: Adventure is entered from Look and Place, so a learner can
    // arrive here having done neither Logic (`if`) nor the Story tiles that
    // grant the two ways of reading what an event carried.
    offers: [
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'world_event_actor'},
      {kind: 'block', type: 'text'},
    ],
    check: {
      kind: 'outcome',
      says: 'The first door refuses, opens once the Key is fetched, and the second one stays shut.',
      falsePass:
        'A key that is never spent, which opens both doors — the second door is the whole of what the check asks about. A door that opens on any touch is refused by the first bump, which happens before the Key has been anywhere near the Player.',
      run: {
        probes: {
          doors: {kind: 'actorCount', of: 'Door'},
          player: {kind: 'positions', of: 'Player'},
        },
        // Right into the first door, back over the Key, and right again.
        trace: [
          ...Array.from({length: 3}, () => ({
            hold: ['ArrowRight'],
            seconds: 0.3,
          })),
          ...Array.from({length: 4}, () => ({
            hold: ['ArrowLeft'],
            seconds: 0.3,
          })),
          ...Array.from({length: 8}, () => ({
            hold: ['ArrowRight'],
            seconds: 0.3,
          })),
        ],
      },
      passes: ({samples}) => {
        const doors = (samples.doors ?? []) as number[];
        const player = lastList<Point>(samples.player)[0];
        // Both shut for the first half: the Player bumps the first door before
        // it has been anywhere near the Key.
        const refused = doors.slice(0, 8).every(count => count === 2);
        // One opened, and only one — a key that was never spent opens both.
        const opened = doors[doors.length - 1] === 1;
        // …and the Player is through the first door and stopped at the second,
        // which is what makes the count above about a door rather than about
        // an actor removed some other way.
        const through = !!player && player.x > 216 && player.x < 288;
        return doors.length === 16 && refused && opened && through;
      },
    },
  },
  {
    id: 'adventure/errand',
    region: 'adventure',
    at: at('adventure', 2, 3),
    title: 'Something to be doing',
    teaches:
      'A task the game keeps track of, and a way to see how far along it is.',
    task: 'Four things to find, and a bar that has no idea how it is going.',
    requires: ['adventure/people', 'adventure/keys'],
    // The bar's own number, which is the thing this lesson is about setting.
    // A GRANT that gates nothing, like `arcade/bounce`'s bounciness: an
    // actor's own blocks arrive with the actor and are never hidden
    // (`toolboxShelf.generatedElsewhere`), so this reads well in a detail pane
    // and takes nothing away. It used to be the Progress rule, which was three
    // properties and no behavior at all.
    unlocks: [
      {kind: 'block', type: 'world_set_ActorsProgressBar_FractionProperty'},
    ],
    // The arithmetic is Memory's and the counting is `memory/many`'s; Adventure
    // is entered from Look and Place.
    offers: [
      {kind: 'block', type: 'math_arithmetic'},
      {kind: 'block', type: 'math_number'},
      {kind: 'block', type: 'world_count_of_kind'},
    ],
    check: {
      kind: 'outcome',
      says: 'The bar is exactly half full when two of the four are left, and full at the last.',
      falsePass:
        'Filling it a step at a time on each pickup without dividing, which is right for four things and wrong for any other number — and setting it full on the first, which the halfway sample refuses. The check reads the fraction AT the halfway point rather than at the end.',
      run: {
        probes: {
          done: {kind: 'property', of: 'Progress Bar', name: 'fraction'},
          left: {kind: 'actorCount', of: 'Token'},
        },
        // Holding right, because the Hero walks now rather than being shoved
        // (`lessons/index`): the errand is something the player does, so the
        // script has to do it. Ten samples over three seconds covers a walk of
        // 1.5 units a second from x=30 past the last Token at 260.
        trace: Array.from({length: 10}, () => ({
          hold: ['ArrowRight'],
          seconds: 0.3,
        })),
      },
      passes: ({samples}) => {
        const done = (samples.done ?? []).map(sample =>
          Number((sample as unknown[])[0]),
        );
        const left = (samples.left ?? []).map(count => Number(count));
        const halfway = done[left.indexOf(2)];
        return (
          Math.abs(halfway - 0.5) < 0.01 &&
          Math.abs(done[done.length - 1] - 1) < 0.01
        );
      },
    },
  },

  // ── Genre: Simulation (Place + Input) ─────────────────────────────────────
  {
    id: 'simulation/many',
    region: 'simulation',
    at: at('simulation', 1, 2),
    title: 'A hundred of something',
    teaches: 'What scale costs, and finding out rather than guessing.',
    task: 'One wanderer per click. Make it a hundred, and find where your machine stops liking it.',
    requires: ['place/edges', 'input/mouse'],
    unlocks: [
      // `add actor` came with the first lesson and `all actors` with the loop
      // that walks them; what this one adds is asking about a crowd, and taking
      // one back out.
      {kind: 'block', type: 'world_count_actors'},
      {kind: 'block', type: 'world_first_actor'},
      // `repeat ⟨n⟩ times`, which is the loop this lesson is: `memory/many`
      // walks a list that exists, and this makes a hundred that do not. A
      // GRANT rather than an offer, for the reason `story/reveal` grants
      // `add trait` — an offer cannot reach a block no tile grants.
      {kind: 'block', type: 'controls_repeat_ext'},
    ],
    // The Loops DRAWER is `memory/many`'s, and Simulation is entered from Place
    // and Input — so a learner can arrive here with no Loops drawer at all, and
    // a block granted inside a drawer they have not got is a block they cannot
    // see. The drawer is borrowed for the lesson; the block in it is granted.
    offers: [
      {kind: 'category', name: 'Loops'},
      {kind: 'block', type: 'math_number'},
    ],
    check: {
      kind: 'outcome',
      says: 'One click leaves a hundred in the world, and they are going somewhere.',
      falsePass:
        'A hundred that stand still, which is a hundred of nothing: the check reads every position twice and asks that most of them changed. A crowd that does not move costs nothing to draw and answers no question.',
      run: {
        probes: {
          crowd: {kind: 'actorCount', of: 'Wanderer'},
          where: {kind: 'positions', of: 'Wanderer'},
        },
        trace: [
          {pointer: {x: 160, y: 160, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 160, y: 160, buttons: []}, seconds: 0.1},
          {seconds: 0.4},
        ],
      },
      passes: ({samples}) => {
        const crowd = lastNumber(samples.crowd);
        const trail = (samples.where ?? []) as {x: number; y: number}[][];
        const before = trail[trail.length - 2] ?? [];
        const after = trail[trail.length - 1] ?? [];
        const moved = before.filter(
          (at, index) =>
            after[index] &&
            (after[index].x !== at.x || after[index].y !== at.y),
        ).length;
        return crowd >= 100 && moved > before.length / 2;
      },
    },
  },
  {
    id: 'simulation/steering',
    region: 'simulation',
    at: at('simulation', 2, 2),
    title: 'Toward, and away',
    teaches:
      'A direction worked out from two positions, and the distance question behind it.',
    task: 'Two actors with no opinion about where the player is. Make one close in and one keep away.',
    requires: ['simulation/many'],
    unlocks: [
      {kind: 'rule', id: 'steering'},
      // …and the rule for the question this one cannot answer, which the
      // lesson's last step is about: toward walks into the wall, and around is
      // a search. The same shape `arcade/waves` uses for Spawner — meet the
      // limit, then meet the rule that does not have it.
      {kind: 'rule', id: 'path'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Chaser is closer to the Player at the end than at the start, and the Fleer is further.',
      falsePass:
        'A Chaser that simply walks toward the corner the Player started in, which closes the gap until the Player moves — so the script walks right and then up, and a direction that was worked out once is a direction that is wrong by the end.',
      run: {
        probes: {
          player: {kind: 'positions', of: 'Player'},
          chaser: {kind: 'positions', of: 'Chaser'},
          fleer: {kind: 'positions', of: 'Fleer'},
        },
        // Right, then DOWN — toward the corner the Fleer is standing in and
        // away from the Chaser's. A Fleer that does nothing gets closer, and a
        // Chaser that does nothing gets further, so neither half can be passed
        // by standing still.
        trace: [
          ...Array.from({length: 4}, () => ({
            hold: ['ArrowRight'],
            seconds: 0.4,
          })),
          ...Array.from({length: 4}, () => ({
            hold: ['ArrowDown'],
            seconds: 0.4,
          })),
        ],
      },
      passes: ({samples}) => {
        const spot = (name: string, at: number) =>
          ((samples[name] ?? [])[at] as {x: number; y: number}[])?.[0];
        const last = (samples.player ?? []).length - 1;
        const gap = (name: string, at: number) => {
          const them = spot(name, at);
          const player = spot('player', at);
          return them && player
            ? Math.hypot(them.x - player.x, them.y - player.y)
            : NaN;
        };
        const chased = gap('chaser', last) < gap('chaser', 0);
        const fled = gap('fleer', last) > gap('fleer', 0);
        return chased && fled;
      },
    },
  },
  {
    id: 'simulation/neighbors',
    region: 'simulation',
    at: at('simulation', 1, 3),
    title: 'Everything near me',
    teaches:
      'A filter over a list — the shape every flock, swarm and crowd is written with.',
    task: 'Twenty-five Dots, all of them lit, and a question that lights a few.',
    requires: ['simulation/many'],
    unlocks: [
      {kind: 'block', type: 'world_actors_within'},
      {kind: 'block', type: 'world_filter_actors'},
      // …and the same question asked of a PLACE rather than of an actor, which
      // is the form anything searching somewhere it is not has to use.
      {kind: 'block', type: 'world_near_place_kind'},
      {kind: 'block', type: 'world_near_place_trait'},
    ],
    check: {
      kind: 'outcome',
      says: 'The lit Dots are the ones near the Walker: four to begin with, and a number that changes as it moves.',
      falsePass:
        'Lighting everything, which is what the starter does — and what a radius big enough to reach the far corner does too. The check reads the count, not the block.',
      run: {
        probes: {sprites: {kind: 'sprites'}},
        trace: Array.from({length: 8}, () => ({seconds: 0.3})),
      },
      passes: ({samples}) => {
        const lit = (samples.sprites ?? []).map(
          names =>
            (names as string[]).filter(name => name.includes('coin')).length,
        );
        // The first sample is read before the first frame's step has run, so
        // nothing is lit yet and nothing should be made of it.
        const seen = lit.slice(1);
        // Four is hand-computed: the Walker starts at (40, 160) after one
        // frame, the Dots are sixty apart, and eighty reaches one along the
        // row and one up and one down the column.
        return (
          seen.length === 8 &&
          seen[0] === 4 &&
          new Set(seen).size > 1 &&
          seen.every(count => count > 0 && count < 25)
        );
      },
    },
  },
  {
    id: 'simulation/emergent',
    region: 'simulation',
    at: at('simulation', 3, 2),
    title: 'Three rules, and behavior nobody wrote',
    teaches:
      'Local rules make global behavior, and neither one explains the other.',
    task: 'Twelve Boids going twelve ways, and two of the three rules that make a flock.',
    requires: ['simulation/steering'],
    unlocks: [{kind: 'block', type: 'world_count_with'}],
    // Vector arithmetic is `motion/force`'s to grant, and the way here does not
    // pass through it: a learner who came up the Place and Input side has never
    // been offered one. Lent for this lesson, which cannot be done without it.
    offers: [{kind: 'block', type: 'world_vector_math'}],
    check: {
      kind: 'outcome',
      says: 'The Boids begin pointing twelve ways and end pointing one, and nothing in the world says which.',
      falsePass:
        'Giving them all the same heading to start with, which the first sample refuses: the check reads the CHANGE. Keeping apart and staying together without going the same way is refused too — it half-aligns a flock and never holds it (`lessonChecks`).',
      run: {
        probes: {velocity: {kind: 'property', of: 'Boid', name: 'velocity'}},
        trace: Array.from({length: 12}, () => ({seconds: 0.5})),
      },
      passes: ({samples}) => {
        const order = (samples.velocity ?? []).map(sample =>
          headingOrder(sample as Array<{x: number; y: number}>),
        );
        const last = order[order.length - 1] ?? 0;
        // Spread to begin with — twelve headings thirty degrees apart cancel
        // exactly — and one heading by the end.
        return order.length === 13 && (order[0] ?? 1) <= 0.3 && last >= 0.9;
      },
    },
  },
  {
    id: 'simulation/dials',
    region: 'simulation',
    at: at('simulation', 2, 3),
    title: 'The properties are the experiment',
    teaches:
      'A parameter you can turn while it runs, and a question you can answer by turning it.',
    task: 'A flock that works, and five numbers typed where nobody can turn them.',
    requires: ['simulation/neighbors', 'simulation/emergent'],
    unlocks: [{kind: 'template', id: 'simulation'}],
    // `define property` is `memory/world-state`'s to grant, and the Simulation
    // side of the map does not pass through Memory. Lent for the one lesson
    // that is entirely about declaring one.
    offers: [{kind: 'block', type: 'world_rule_property'}],
    check: {
      kind: 'outcome',
      says: 'The flock forms, the dial is turned while it runs, and it comes apart — with nothing restarted.',
      falsePass:
        'Declaring the property and leaving the 30 typed where it was, which turns a dial nothing reads: the flock goes on flocking and the check refuses it. Nothing here can be passed by restarting, because the check never rebuilds — it patches the running world exactly as the reconciler does (`runtime/checks`, TraceStep.set).',
      run: {
        probes: {
          velocity: {kind: 'property', of: 'Boid', name: 'velocity'},
          dial: {kind: 'worldProperty', path: 'My_World.too_close'},
        },
        trace: [
          // Four seconds for the flock to form...
          ...Array.from({length: 8}, () => ({seconds: 0.5})),
          // ...then the dial is turned, mid-flight, and nothing is rebuilt.
          {set: {path: 'My_World.too_close', value: 200}, seconds: 0.5},
          ...Array.from({length: 6}, () => ({seconds: 0.5})),
        ],
      },
      passes: ({samples}) => {
        const dial = samples.dial ?? [];
        const order = (samples.velocity ?? []).map(sample =>
          headingOrder(sample as Array<{x: number; y: number}>),
        );
        // The property exists and reads what the lesson asked for, before and
        // after: a project that never declared one answers with nothing.
        const declared = dial[0] === 30 && dial[dial.length - 1] === 200;
        const flocked = (order[8] ?? 0) >= 0.9;
        const scattered = Math.min(...order.slice(9)) <= 0.5;
        return declared && flocked && scattered;
      },
    },
  },

  // ── The rim: Making ───────────────────────────────────────────────────────
  // Six tiles, one past each genre's capstone, each the authoring lesson that
  // genre most naturally leads to: a platformer makes you want to read Gravity,
  // a simulation makes you want a trait of your own. Which one you meet first
  // is therefore decided by which game you finished, and that is the design
  // rather than an accident of it.
  {
    id: 'making/read',
    region: 'making',
    at: at('platformer', 3, 3),
    title: 'Open it up',
    teaches: 'The rules are blocks, and you can read all of them.',
    task: 'A rule you have used half a dozen times and never looked inside.',
    requires: ['platformer/level'],
    unlocks: [{kind: 'category', name: 'Rule'}],
    check: {
      kind: 'shape',
      says: 'The world says how hard gravity pulls, and it is the number the rule actually holds.',
      falsePass:
        'Opening it and reading nothing, which no check can see — so the tile asks a question instead, and the check reads the ANSWER out of the rule file rather than knowing it. Change the number in the rule and the right answer changes with it.',
      run: {probes: {}, trace: [{seconds: 0.1}]},
      inspect: files => {
        // What the rule says, read at check time: the answer is whatever is in
        // the file, so editing the file cannot make a right answer wrong.
        const rule = files['rules/gravity.rule'] ?? '';
        const declared = rule.match(
          /"NAME":\s*"amount of gravity",\s*"DEFAULT":\s*"([^"]*)"/,
        )?.[1];
        const said = (files['worlds/main.world'] ?? '').match(
          /"NAME":\s*"how hard it pulls",\s*"DEFAULT":\s*"([^"]*)"/,
        )?.[1];
        return Boolean(declared) && said === declared;
      },
      passes: () => true,
    },
  },
  {
    id: 'making/change',
    region: 'making',
    at: at('arcade', 3, 3),
    title: 'Change it',
    teaches:
      'Your project has its own COPY of every rule it uses, and changing it changes nothing anywhere else.',
    task: 'A guard on a long slow beat, and the number that says how long — which is not in your world.',
    requires: ['arcade/waves'],
    unlocks: [{kind: 'block', type: 'world_rule_step_tick'}],
    check: {
      kind: 'outcome',
      says: "The Guard turns far more often than the stock rule turns him, and the rule file is not the library's any more.",
      falsePass:
        "Setting `across time` on the Guard from the world, which is a property and works and is not this lesson — so the file itself is compared against the library's copy. What a project can set from outside was always settable; what this teaches is that the inside is yours too.",
      run: {
        probes: {guard: {kind: 'positions', of: 'Guard'}},
        trace: Array.from({length: 24}, () => ({seconds: 0.25})),
      },
      // Byte-for-byte against the library's copy, which is what makes this a
      // question about the FILE rather than about the world around it. It
      // survives a rule being stored as a reference (rules/ruleReference)
      // because `projectFiles` resolves one to the shelf's exact bytes — an
      // unedited rule compares equal, an edited one does not. There is a test
      // on that identity in `projectWeight.test.ts`, because a resolution that
      // re-serialized would quietly pass this lesson for doing nothing.
      inspect: files =>
        (files['rules/patrol.rule'] ?? '') !== stockRule('patrol')?.contents,
      passes: ({samples}) => {
        const path = (samples.guard ?? []).map(
          sample => (sample as {x: number}[])[0]?.x ?? 0,
        );
        // How many times he changed his mind. The stock beat gives three in
        // six seconds; a beat a third as long gives about eleven.
        let turns = 0;
        for (let at = 2; at < path.length; at++) {
          const before = Math.sign(path[at - 1] - path[at - 2]);
          const after = Math.sign(path[at] - path[at - 1]);
          if (before && after && before !== after) {
            turns++;
          }
        }
        return turns >= 6;
      },
    },
  },
  {
    id: 'making/property',
    region: 'making',
    at: at('puzzle', 3, 3),
    title: 'A property is a block',
    teaches: 'What you declare in a rule becomes vocabulary in the toolbox.',
    task: 'A wind that blows everything at the same speed, because the speed is a number typed into the rule.',
    requires: ['puzzle/undo'],
    // NOT `define property`: `memory/world-state` grants that, and this lesson
    // is handed it. What it adds is the OTHER declaration a rule makes.
    unlocks: [{kind: 'block', type: 'world_rule_event'}],
    offers: [{kind: 'block', type: 'world_rule_property'}],
    check: {
      kind: 'outcome',
      says: 'The two Leaves end up in different places, which one number in the rule cannot do.',
      falsePass:
        'Declaring the property and never reading it, which adds two blocks to the toolbox and changes nothing — the Leaves still drift together, because the step is still using the 2 that was typed there.',
      run: {
        probes: {leaves: {kind: 'positions', of: 'Leaf'}},
        trace: Array.from({length: 4}, () => ({seconds: 0.3})),
      },
      // HOW FAR EACH ONE TRAVELS, not where the two of them ended up. The
      // Leaves wrap now (the wind carries them off a 320-pixel world in under
      // three seconds, and a lesson whose subject is a comparison has to stay
      // watchable), and once a position is modular "they are 40 apart" is a
      // claim that comes and goes as they lap each other. Distance over one
      // interval does not: it is the speed, which is the thing the lesson
      // changed.
      passes: ({samples}) => {
        const at = (index: number) =>
          (samples.leaves?.[index] ?? []) as {x: number}[];
        const [before, after] = [at(0), at(1)];
        if (before.length !== 2 || after.length !== 2) {
          return false;
        }
        // Forward only, and less than a lap: the wind blows one way, so a
        // position that went backwards went round the edge.
        const traveled = (which: number) =>
          (after[which].x - before[which].x + 320) % 320;
        return Math.abs(traveled(0) - traveled(1)) > 40;
      },
    },
  },
  {
    id: 'making/block',
    region: 'making',
    at: at('story', 3, 3),
    title: 'Your own vocabulary',
    teaches:
      'A function: one name for something you had written out twice, with the parts that vary as parameters.',
    task: 'The same sum in two steps with one number different. Give it a name.',
    requires: ['story/scene'],
    unlocks: [
      {kind: 'block', type: 'world_rule_block'},
      {kind: 'block', type: 'world_return'},
    ],
    check: {
      kind: 'outcome',
      says: 'One block, called from both steps, and the two still bob by different amounts.',
      falsePass:
        'A block with no parameters called twice, which is a shortcut rather than an abstraction — and makes both of them bob the same, since the number that differed has nowhere to go. The shape half asks for a parameter and for two call sites; the run half asks that the two still differ.',
      run: {
        probes: {
          cork: {kind: 'positions', of: 'Cork'},
          buoy: {kind: 'positions', of: 'Buoy'},
        },
        trace: Array.from({length: 8}, () => ({seconds: 0.15})),
      },
      inspect: files => {
        const rule = files['rules/bobbing.rule'] ?? '';
        const defined = blockIn({rule}, 'world_rule_block');
        const parts = (
          defined as {extraState?: {parts?: {kind: string}[]}} | undefined
        )?.extraState?.parts;
        const takesOne = (parts ?? []).some(part => part.kind === 'param');
        // Called from both steps: the generated query, twice in the file.
        const calls = rule.split('world_query_Bobbing_').length - 1;
        return takesOne && calls >= 2;
      },
      passes: ({samples}) => {
        const bob = (name: string) => {
          const path = (samples[name] ?? []).map(
            sample => (sample as {y: number}[])[0]?.y ?? 0,
          );
          return Math.max(...path) - Math.min(...path);
        };
        const gentle = bob('cork');
        const wild = bob('buoy');
        return gentle > 5 && wild > gentle * 2;
      },
    },
  },
  {
    id: 'making/rule',
    region: 'making',
    at: at('adventure', 3, 3),
    title: 'Shared, without a copy',
    teaches:
      'A rule of your own: work several kinds of actor share, written once and elected by each.',
    task: 'A Fish and a Bird, both bobbing, and the bob written out twice.',
    requires: ['adventure/errand'],
    // The root itself. `New rule` seeds one — with its trait and its step
    // beside it, since those are the three sentences a rule is — so the block
    // is not something this lesson has to be dragged from a drawer for; what
    // the grant does is put it IN the drawer from here on, for the rule that
    // wants a second one or was started from a blank file.
    unlocks: [{kind: 'block', type: 'world_rule'}],
    check: {
      kind: 'outcome',
      says: 'Both still bob, and neither of them carries a copy of the bobbing any more.',
      falsePass:
        'A rule written and used by one of them, with the other left as it was — which bobs, and is the duplication the lesson is about. The shape half asks that NO actor holds an `each frame` of its own, so one copy left behind is one too many.',
      run: {
        probes: {
          fish: {kind: 'positions', of: 'Fish'},
          bird: {kind: 'positions', of: 'Bird'},
        },
        trace: Array.from({length: 8}, () => ({seconds: 0.15})),
      },
      inspect: files => {
        // A rule that offers a trait with a step in it — the shape `New rule`
        // seeds, and the shape a bob that moved out of both actors lands in.
        const shared = Object.entries(files).some(
          ([path, contents]) =>
            path.startsWith('rules/') &&
            path.endsWith('.rule') &&
            contents.includes('world_rule_trait') &&
            contents.includes('world_trait_step'),
        );
        // The world is where both `define actor`s live, so a copy left in
        // either of them is a `world_trait_step` still sitting in this file.
        const copies = (files['worlds/main.world'] ?? '').includes(
          'world_trait_step',
        );
        return shared && !copies;
      },
      passes: ({samples}) => {
        const bobbed = (name: string) => {
          const path = (samples[name] ?? []).map(
            sample => (sample as {y: number}[])[0]?.y ?? 0,
          );
          return Math.max(...path) - Math.min(...path) > 20;
        };
        return bobbed('fish') && bobbed('bird');
      },
    },
  },
  {
    id: 'making/trait',
    region: 'making',
    at: at('simulation', 3, 3),
    title: 'A trait of your own',
    teaches:
      'Election: a rule that offers something, and the actors that choose to be it.',
    task: 'One weather and two kinds of thing, drifting the same way because the rule offers one ability.',
    requires: ['simulation/dials'],
    unlocks: [
      // `use trait` is how an actor ELECTS one and came with the first lesson.
      // What this teaches is declaring one, which is a rule's own business.
      {kind: 'block', type: 'world_rule_trait'},
      {kind: 'block', type: 'world_rule_enum'},
    ],
    check: {
      kind: 'outcome',
      says: 'The Leaf goes sideways and the Stone goes down, from one rule.',
      falsePass:
        'Two rules with a trait each, which also works and is a file more than it needs to be — and one trait with the Stone left out, which leaves it standing still rather than doing something else. The check reads both actors going DIFFERENT ways, not one of them moving.',
      run: {
        probes: {
          leaf: {kind: 'positions', of: 'Leaf'},
          stone: {kind: 'positions', of: 'Stone'},
        },
        trace: Array.from({length: 4}, () => ({seconds: 0.3})),
      },
      // Distances taken FORWARD ROUND THE EDGE, because both actors wrap now
      // (`lessons/index`: the wind carries them off the world in under three
      // seconds and the lesson stops being watchable). The weather only ever
      // adds — the Leaf drifts right, the Stone sinks — so a coordinate that
      // went backwards went round, and `% 320` is the distance it actually
      // traveled. It also makes the "and not the other way" halves stricter
      // rather than weaker: a small drift backwards reads as a large one
      // forwards, and is refused.
      passes: ({samples}) => {
        const forward = (from: number, to: number) => (to - from + 320) % 320;
        const drift = (name: string) => {
          const path = (samples[name] ?? []) as {x: number; y: number}[][];
          const first = path[0]?.[0];
          const last = path[path.length - 1]?.[0];
          return first && last
            ? {
                x: forward(first.x, last.x),
                y: forward(first.y, last.y),
              }
            : undefined;
        };
        const leaf = drift('leaf');
        const stone = drift('stone');
        if (!leaf || !stone) {
          return false;
        }
        return (
          Math.abs(leaf.x) > 40 &&
          Math.abs(leaf.y) < 10 &&
          Math.abs(stone.y) > 40 &&
          Math.abs(stone.x) < 10
        );
      },
    },
  },
];

/** A point, as a `positions` probe reports one. */
interface Point {
  x: number;
  y: number;
}

/**
 * The last sample a probe took — where the world ended up.
 *
 * Two, not one with an overload: a probe answers with a count or with a list,
 * and a caller always knows which it asked for. An absent sample reads as -1 or
 * as nothing rather than as `undefined`, so a comparison against it is false
 * instead of a thrown error inside somebody's lesson.
 */
/**
 * Whether any block of one type holds a block of another, anywhere below it.
 *
 * A shape half often means "this, inside that" — a `set position` inside an
 * `each frame` — and a file read as one string cannot tell the two apart. So
 * this walks the workspace: find the outer block, then look for the inner one
 * in everything hanging off it.
 *
 * An unparseable file is skipped rather than thrown on: a check runs against
 * whatever the learner has, and a file mid-edit is not a failed lesson.
 */
function nestedIn(
  files: Record<string, string>,
  outer: string,
  inner: string,
): boolean {
  const holds = (node: unknown): boolean => {
    if (Array.isArray(node)) {
      return node.some(holds);
    }
    if (typeof node !== 'object' || node === null) {
      return false;
    }
    const block = node as {type?: unknown};
    if (block.type === outer && JSON.stringify(node).includes(`"${inner}"`)) {
      return true;
    }
    return Object.values(node).some(holds);
  };
  return Object.values(files).some(contents => {
    try {
      return holds(JSON.parse(contents));
    } catch {
      return false;
    }
  });
}

/**
 * The first block of a type in any of the project's files.
 *
 * `nestedIn`'s sibling, for a check that wants to READ a block rather than ask
 * whether one is inside another — the arrangement a `create in map` holds is a
 * field on the block, so counting what a learner painted means finding it.
 */
function blocksIn(files: Record<string, string>, type: string): unknown[] {
  const found: unknown[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== 'object' || node === null) {
      return;
    }
    if ((node as {type?: unknown}).type === type) {
      found.push(node);
    }
    Object.values(node).forEach(walk);
  };
  for (const contents of Object.values(files)) {
    try {
      walk(JSON.parse(contents));
    } catch {
      // A file mid-edit is not a failed lesson (see `nestedIn`).
    }
  }
  return found;
}

function blockIn(
  files: Record<string, string>,
  type: string,
): {fields?: Record<string, unknown>} | undefined {
  const find = (
    node: unknown,
  ): {fields?: Record<string, unknown>} | undefined => {
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = find(item);
        if (found) {
          return found;
        }
      }
      return undefined;
    }
    if (typeof node !== 'object' || node === null) {
      return undefined;
    }
    if ((node as {type?: unknown}).type === type) {
      return node as {fields?: Record<string, unknown>};
    }
    for (const value of Object.values(node)) {
      const found = find(value);
      if (found) {
        return found;
      }
    }
    return undefined;
  };
  for (const contents of Object.values(files)) {
    try {
      const found = find(JSON.parse(contents));
      if (found) {
        return found;
      }
    } catch {
      // A file mid-edit is not a failed lesson (see `nestedIn`).
    }
  }
  return undefined;
}

const lastNumber = (samples: unknown[] | undefined): number => {
  const value = samples?.[samples.length - 1];
  return typeof value === 'number' ? value : -1;
};

/**
 * How much a set of headings agree: 1 is one direction, 0 is every direction.
 *
 * The mean of the unit vectors, which is the ordinary way to average angles —
 * averaging the numbers themselves says that north and slightly-west-of-north
 * average to south.
 */
const headingOrder = (velocities: Array<{x: number; y: number}>): number => {
  let x = 0;
  let y = 0;
  for (const velocity of velocities) {
    const speed = Math.hypot(velocity.x, velocity.y) || 1;
    x += velocity.x / speed;
    y += velocity.y / speed;
  }
  return velocities.length ? Math.hypot(x, y) / velocities.length : 0;
};

const lastList = <T>(samples: unknown[] | undefined): T[] => {
  const value = samples?.[samples.length - 1];
  return Array.isArray(value) ? (value as T[]) : [];
};
