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
// `requires` names a neighbour, that no two tiles share a cell, that every tile
// is reachable from Origin, and that a region's tiles touch each other.

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
      // The Console whole: printing is how anything invisible is seen, and both
      // the Input and the Motion branches ask for a print within two lessons.
      // Origin is the only tile every path goes through, so it is the only
      // place a thing both branches need can be granted (specs/PROGRESSION.md).
      //
      // NOT a bare number. Every socket in this lesson arrives with a shadow
      // already in it, so a Math drawer here would hold one block nothing
      // needed — a drawer that exists to be empty-handed.
      {kind: 'category', name: 'Console'},
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
    unlocks: [{kind: 'rule', id: 'input'}],
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
        const travelled = arrived[0].x - start[0].x;
        return travelled > 280 && travelled < 360;
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
        const travelled = Math.abs(arrived[0].x - start[0].x) > 150;
        return !jumped && travelled;
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
    task: 'Make an actor change colour only once it is past the middle of the screen.',
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
      {kind: 'rule', id: 'writing'},
      {kind: 'actor', id: 'label'},
      {kind: 'block', type: 'text'},
      {kind: 'block', type: 'text_join'},
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
      // A pen needs a colour, and this is the first lesson that holds one.
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
        const travelled = view[3] > view[1] + 1;
        const catchingUp = view[4] > view[3] + 0.5;
        return stillThere && travelled && catchingUp;
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
    id: 'platformer/ground',
    region: 'platformer',
    at: at('platformer', 2, 2),
    title: 'Floors that move',
    teaches: 'Something can be solid and still be going somewhere.',
    task: 'A platform that patrols back and forth, and a player that rides it.',
    requires: ['platformer/jump'],
    unlocks: [{kind: 'rule', id: 'patrol'}],
    check: {
      kind: 'outcome',
      says: 'The player standing still travels with the platform.',
      falsePass:
        'A platform that moves under a player who stays put — the difference is the player’s x, so measure that.',
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
      'A rule that does not know who it is hurting: one ability says what can be damaged, another says what damages.',
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
      says: 'One run right: the coins go, the Spike hurts, and the world is won only once the Flag is reached.',
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
    task: 'A ball in a box. Set the walls’ bounciness and find the value where it never slows down.',
    requires: ['motion/force', 'logic/collision'],
    unlocks: [
      {kind: 'block', type: 'world_set_SolidBodies_BouncinessProperty'},
    ],
    check: {
      kind: 'outcome',
      says: 'After a wall hit the velocity component across that wall is reversed within tolerance.',
      falsePass:
        'Flipping the velocity by hand in a collision handler. Assert the handler is not there.',
    },
  },
  {
    id: 'arcade/paddle',
    region: 'arcade',
    at: at('arcade', 2, 2),
    title: 'A thing you steer',
    teaches: 'Constraining a player is a rule, not a check you write.',
    task: 'A paddle on the arrow keys that cannot leave the screen — the whole paddle, not its middle.',
    requires: ['arcade/bounce'],
    unlocks: [{kind: 'block', type: 'world_view_size'}],
    check: {
      kind: 'outcome',
      says: 'Holding left for two seconds stops the paddle with its edge at the wall, not its centre.',
      falsePass:
        'Clamping the centre, which looks right until half the paddle is outside. Measure the edge.',
    },
  },
  {
    id: 'arcade/shoot',
    region: 'arcade',
    at: at('arcade', 1, 3),
    title: 'A bullet is spawned',
    teaches:
      'Making things while the game runs, and the other half nobody remembers: taking them away again.',
    task: 'Fire on a key with a cooldown, and make the bullets clean up after themselves.',
    requires: ['arcade/bounce'],
    unlocks: [
      {kind: 'rule', id: 'shoots'},
      {kind: 'rule', id: 'expires'},
    ],
    check: {
      kind: 'outcome',
      says: 'Two seconds of held fire produces the cooldown’s count of bullets, and none of them survives its lifetime.',
      falsePass:
        'A cooldown that is really the frame rate. Assert the count, not that it is fewer than 120.',
    },
  },
  {
    id: 'arcade/bricks',
    region: 'arcade',
    at: at('arcade', 3, 2),
    title: 'Many, and then none',
    teaches: 'Counting what is left is how a game knows it is over.',
    task: 'A wall of bricks that go one at a time, and an end when the last one does.',
    requires: ['arcade/paddle'],
    unlocks: [{kind: 'block', type: 'world_clear_world'}],
    check: {
      kind: 'outcome',
      says: 'The game ends on the last brick and not on the second to last.',
      falsePass:
        'Counting the hits rather than the bricks, which is the same number until a brick is added.',
    },
  },
  {
    id: 'arcade/waves',
    region: 'arcade',
    at: at('arcade', 2, 3),
    title: 'It gets harder',
    teaches:
      'A timer belongs to an actor, and the interval can be a value like any other.',
    task: 'A spawner that sends more of them, faster, the longer you last.',
    requires: ['arcade/shoot', 'arcade/bricks'],
    unlocks: [
      {kind: 'rule', id: 'time'},
      {kind: 'template', id: 'arcade'},
    ],
    check: {
      kind: 'outcome',
      says: 'The gap between spawns is shorter at the end of the scripted run than at the start.',
      falsePass:
        'A fixed interval with more spawned each time. Measure the interval, not the count.',
    },
  },

  // ── Genre: Puzzle (Logic + Memory) ────────────────────────────────────────
  {
    id: 'puzzle/grid',
    region: 'puzzle',
    at: at('puzzle', 1, 2),
    title: 'A step, not a speed',
    teaches: 'Discrete movement: one whole square, or none at all.',
    task: 'Move one tile at a time, and put up a wall that refuses a step.',
    requires: ['logic/kinds', 'memory/many'],
    unlocks: [{kind: 'rule', id: 'grid'}],
    check: {
      kind: 'outcome',
      says: 'Four presses land the player exactly four tiles on, and a fifth into a wall lands nowhere.',
      falsePass:
        'A speed tuned to look like a tile per press. Assert the position is a whole multiple of the tile size.',
    },
  },
  {
    id: 'puzzle/push',
    region: 'puzzle',
    at: at('puzzle', 2, 2),
    title: 'Nobody wrote pushing',
    teaches:
      'A mechanic that falls out of two facts you already have — which is what composition buys.',
    task: 'Give a crate `Can Be Pushed` and read the rule to find out why that was enough.',
    requires: ['puzzle/grid'],
    unlocks: [{kind: 'asset', id: 'box'}],
    check: {
      kind: 'outcome',
      says: 'A crate moves one tile when walked into, and refuses when there is a wall behind it.',
      falsePass:
        'Moving the crate from the player’s own handler. The wall case is what catches it.',
    },
  },
  {
    id: 'puzzle/turns',
    region: 'puzzle',
    at: at('puzzle', 1, 3),
    title: 'Everybody moves, then the world moves',
    teaches: 'Turn order: a game where time is a sequence rather than a rate.',
    task: 'An enemy that takes exactly one step for each step you take.',
    requires: ['puzzle/grid'],
    unlocks: [{kind: 'rule', id: 'turns', proposed: true}],
    check: {
      kind: 'outcome',
      says: 'The enemy has taken exactly as many steps as the player after ten presses.',
      falsePass:
        'An enemy on a timer that happens to match. Vary the press rate in the trace.',
    },
  },
  {
    id: 'puzzle/goal',
    region: 'puzzle',
    at: at('puzzle', 3, 2),
    title: 'Counted, not declared',
    teaches:
      'A win condition is a question about the world, asked at the right moment.',
    task: 'Marks on the floor. Win when no crate is left off one — and not a move earlier.',
    requires: ['puzzle/push'],
    unlocks: [{kind: 'rule', id: 'goals', proposed: true}],
    check: {
      kind: 'outcome',
      says: 'The win fires on the last crate and not before, over a scripted solution.',
      falsePass:
        'Winning on a move count. Solve it a longer way in a second trace.',
    },
  },
  {
    id: 'puzzle/undo',
    region: 'puzzle',
    at: at('puzzle', 2, 3),
    title: 'Taking it back',
    teaches: 'A history is a stack, and undo is what makes a puzzle forgiving.',
    task: 'Record each move, and step back through them.',
    requires: ['puzzle/turns', 'puzzle/goal'],
    unlocks: [
      {kind: 'rule', id: 'history', proposed: true},
      {kind: 'template', id: 'puzzle'},
    ],
    check: {
      kind: 'outcome',
      says: 'Three moves then three undos restores every actor to where it started.',
      falsePass:
        'Undoing only the player. The crates are why the check reads every actor.',
    },
  },

  // ── Genre: Story (Memory + Look) ──────────────────────────────────────────
  {
    id: 'story/text',
    region: 'story',
    at: at('story', 1, 2),
    title: 'Words on a screen',
    teaches: 'Text is state an actor carries; drawing it is a separate job.',
    task: 'A speech box with a line in it, wrapped to fit, anchored where you want it.',
    requires: ['memory/world-state', 'look/drawing'],
    unlocks: [
      {kind: 'actor', id: 'speechBox'},
      {kind: 'block', type: 'world_draw_paragraph'},
    ],
    check: {
      kind: 'outcome',
      says: 'The text drawn is the text set, and changing the property changes what is drawn.',
      falsePass:
        'A fixed string in the drawing. Setting the property is what has to move it.',
    },
  },
  {
    id: 'story/script',
    region: 'story',
    at: at('story', 2, 2),
    title: 'A place in a list',
    teaches:
      'A conversation is a state machine: it knows where it is and what moves it on.',
    task: 'Five lines, advanced by a click. Each line raises an event; you decide what a line means.',
    requires: ['story/text'],
    unlocks: [{kind: 'rule', id: 'conversation'}],
    check: {
      kind: 'trace',
      says: 'The line event fires once per advance, in order, five times.',
      falsePass:
        'Firing on every frame while a line shows. The count over a scripted five clicks is the check.',
    },
  },
  {
    id: 'story/reveal',
    region: 'story',
    at: at('story', 1, 3),
    title: 'At reading pace',
    teaches:
      'Something that happens over time, and the click that says "all of it, now".',
    task: 'Show a line a few letters at a time, and let an impatient reader skip to the end.',
    requires: ['story/text'],
    unlocks: [{kind: 'rule', id: 'reveals'}],
    check: {
      kind: 'outcome',
      says: 'The line is partial at 0.2s, whole immediately after the skip click, and reports finishing once.',
      falsePass:
        'Revealing so fast it is whole at 0.2s. The partial sample is the point.',
    },
  },
  {
    id: 'story/choice',
    region: 'story',
    at: at('story', 3, 2),
    title: 'A question that matters',
    teaches: 'Branching, and a variable that remembers which way you went.',
    task: 'Ask something. Send the talk somewhere else, and have it remembered two scenes later.',
    requires: ['story/script'],
    unlocks: [
      {kind: 'block', type: 'world_do_Conversation_SendToLineAction'},
      // Something to click an answer with.
      {kind: 'actor', id: 'button'},
    ],
    check: {
      kind: 'outcome',
      says: 'Two scripted runs, differing only in the answer, reach two different endings.',
      falsePass:
        'A branch that rejoins immediately. The endings are compared, not the branch.',
    },
  },
  {
    id: 'story/scene',
    region: 'story',
    at: at('story', 2, 3),
    title: 'Staged',
    teaches:
      'The same script, dressed: who is speaking, where, and to what music.',
    task: 'Portraits that change with the speaker, backdrops that change with the place, and a track under it.',
    requires: ['story/reveal', 'story/choice'],
    unlocks: [
      {kind: 'actor', id: 'portrait'},
      {kind: 'block', type: 'world_play_sound'},
      {kind: 'block', type: 'world_set_music'},
      {kind: 'template', id: 'story'},
    ],
    check: {
      kind: 'outcome',
      says: 'The portrait and the backdrop are the right ones on lines two and four.',
      falsePass:
        'Changing them on a timer that matches the scripted clicks. Click at an irregular rate.',
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
    task: 'Walk out of the first screen. Bring the camera, the layers and the backdrop with you.',
    requires: ['look/background', 'place/map'],
    unlocks: [{kind: 'template', id: 'adventure'}],
    check: {
      kind: 'outcome',
      says: 'The player leaves the first screen and the view follows without showing past the map.',
      falsePass: 'A map one screen wide. The check reads the map size first.',
    },
  },
  {
    id: 'adventure/rooms',
    region: 'adventure',
    at: at('adventure', 2, 2),
    title: 'A door to somewhere else',
    teaches: 'More than one map, and what should survive going between them.',
    task: 'Two rooms and the door between them. Arrive in the right place on the other side.',
    requires: ['adventure/world'],
    unlocks: [{kind: 'rule', id: 'scenes', proposed: true}],
    check: {
      kind: 'outcome',
      says: 'Walking into the door loads the second map and places the player at its entrance.',
      falsePass:
        'Teleporting within one big map. Assert which map is loaded, not where the player is.',
    },
  },
  {
    id: 'adventure/people',
    region: 'adventure',
    at: at('adventure', 1, 3),
    title: 'Somebody who is there',
    teaches:
      'An actor with a life of its own, and a label that travels with it.',
    task: 'An NPC that walks about, has a name over its head, and says something when you reach it.',
    requires: ['adventure/world'],
    unlocks: [{kind: 'rule', id: 'attachment'}],
    check: {
      kind: 'outcome',
      says: 'The label stays over the NPC as it patrols, and the conversation starts on contact.',
      falsePass:
        'A label placed once at the start. Sample its position after the NPC has moved.',
    },
  },
  {
    id: 'adventure/keys',
    region: 'adventure',
    at: at('adventure', 3, 2),
    title: 'A door that wants something',
    teaches:
      'Carrying a thing, and spending it — which is not the same as counting it.',
    task: 'A locked door, a key somewhere else, and a key that is gone once it is used.',
    requires: ['adventure/rooms'],
    unlocks: [{kind: 'rule', id: 'inventory', proposed: true}],
    check: {
      kind: 'outcome',
      says: 'The door refuses without the key, opens with it, and a second locked door still refuses.',
      falsePass:
        'A key that is never spent. The second door is what asks about that.',
    },
  },
  {
    id: 'adventure/errand',
    region: 'adventure',
    at: at('adventure', 2, 3),
    title: 'Something to be doing',
    teaches:
      'A task the game keeps track of, and a way to see how far along it is.',
    task: 'Find four of something across two rooms, with a bar that fills as you do.',
    requires: ['adventure/people', 'adventure/keys'],
    unlocks: [{kind: 'rule', id: 'progress'}],
    check: {
      kind: 'outcome',
      says: 'Progress reaches exactly 1 when the fourth is found, and 0.5 at the second.',
      falsePass:
        'A bar driven by the room number. The midpoint sample is what separates them.',
    },
  },

  // ── Genre: Simulation (Place + Input) ─────────────────────────────────────
  {
    id: 'simulation/many',
    region: 'simulation',
    at: at('simulation', 1, 2),
    title: 'A hundred of something',
    teaches: 'What scale costs, and finding out rather than guessing.',
    task: 'Spawn a hundred wanderers on a click, watch the frame time, and find where it breaks.',
    requires: ['place/edges', 'input/mouse'],
    unlocks: [
      // `add actor` came with the first lesson and `all actors` with the loop
      // that walks them; what this one adds is asking about a crowd, and taking
      // one back out.
      {kind: 'block', type: 'world_count_actors'},
      {kind: 'block', type: 'world_remove_actor'},
      {kind: 'block', type: 'world_first_actor'},
    ],
    check: {
      kind: 'outcome',
      says: 'The world holds a hundred, all of them moving, with the frame time under budget.',
      falsePass:
        'A hundred that do not move. The check reads positions before and after.',
    },
  },
  {
    id: 'simulation/steering',
    region: 'simulation',
    at: at('simulation', 2, 2),
    title: 'Toward, and away',
    teaches:
      'A direction worked out from two positions, and the distance question behind it.',
    task: 'One that chases you and one that runs, and the block that answers "which is nearest".',
    requires: ['simulation/many'],
    unlocks: [{kind: 'rule', id: 'steering'}],
    check: {
      kind: 'outcome',
      says: 'The chaser’s distance to the player falls over the run; the fleer’s rises.',
      falsePass:
        'A chaser that simply moves right, toward where the player happens to be. Move the player mid-trace.',
    },
  },
  {
    id: 'simulation/neighbours',
    region: 'simulation',
    at: at('simulation', 1, 3),
    title: 'Everything near me',
    teaches:
      'A filter over a list — the shape every flock, swarm and crowd is written with.',
    task: 'Ask which actors are within a distance, and colour them.',
    requires: ['simulation/many'],
    unlocks: [
      {kind: 'block', type: 'world_actors_within', proposed: true},
      {kind: 'block', type: 'world_filter_actors'},
    ],
    check: {
      kind: 'outcome',
      says: 'For a fixed layout the count matches a hand-computed one, and changes when the radius does.',
      falsePass: 'Counting everything. The radius change is the check.',
    },
  },
  {
    id: 'simulation/emergent',
    region: 'simulation',
    at: at('simulation', 3, 2),
    title: 'Three rules, and behaviour nobody wrote',
    teaches:
      'Local rules make global behaviour, and neither one explains the other.',
    task: 'Keep apart, go the same way, stay together. Then take one away and watch what breaks.',
    requires: ['simulation/steering'],
    unlocks: [{kind: 'block', type: 'world_count_with'}],
    check: {
      kind: 'outcome',
      says: 'The spread of headings narrows over the run, and widens again with alignment removed.',
      falsePass:
        'Everything given the same heading at the start. The check reads the change, not the value.',
    },
  },
  {
    id: 'simulation/dials',
    region: 'simulation',
    at: at('simulation', 2, 3),
    title: 'The properties are the experiment',
    teaches:
      'A parameter you can turn while it runs, and a question you can answer by turning it.',
    task: 'Expose the numbers, change one without restarting, and write down what happened.',
    requires: ['simulation/neighbours', 'simulation/emergent'],
    unlocks: [{kind: 'template', id: 'simulation'}],
    check: {
      kind: 'outcome',
      says: 'A property change is applied live, with no restart reported, and the behaviour differs afterwards.',
      falsePass:
        'A change that restarts the world, which also works and is not the lesson. The reload mode is read.',
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
    task: 'Open the file behind a trait you have used twenty times. Find the line that makes you fall.',
    requires: ['platformer/level'],
    unlocks: [{kind: 'category', name: 'Rule'}],
    check: {
      kind: 'shape',
      says: 'The rule file behind an elected trait was opened, and the lesson’s question about it answered.',
      falsePass:
        'Opening it and reading nothing — which no check can see. This is why the tile also asks a question.',
    },
  },
  {
    id: 'making/change',
    region: 'making',
    at: at('arcade', 3, 3),
    title: 'Change it',
    teaches:
      'Your project has its own COPY of every rule it uses, and changing it changes nothing anywhere else.',
    task: 'Alter a number inside a rule, watch the game change, then start a new project and find it unchanged.',
    requires: ['arcade/waves'],
    unlocks: [{kind: 'block', type: 'world_rule_step_tick'}],
    check: {
      kind: 'outcome',
      says: 'The project’s behaviour differs from the stock rule’s in the way the edit predicts.',
      falsePass:
        'Getting the same effect from a property instead. Compare the rule file, not only the behaviour.',
    },
  },
  {
    id: 'making/property',
    region: 'making',
    at: at('puzzle', 3, 3),
    title: 'A property is a block',
    teaches: 'What you declare in a rule becomes vocabulary in the toolbox.',
    task: 'Add a property to a rule. Find the two blocks that appear in its category, and use them.',
    requires: ['puzzle/undo'],
    unlocks: [{kind: 'block', type: 'world_rule_event'}],
    check: {
      kind: 'outcome',
      says: 'The declared property exists on the built actor, and its generated blocks are used and work.',
      falsePass:
        'Declaring it and never reading it. The generated getter has to appear in the workspace.',
    },
  },
  {
    id: 'making/block',
    region: 'making',
    at: at('story', 3, 3),
    title: 'Your own vocabulary',
    teaches:
      'A function: one name for something you had written out three times, with the parts that vary as parameters.',
    task: 'Find the three places your script says the same thing, and give them a block of their own.',
    requires: ['story/scene'],
    unlocks: [
      {kind: 'block', type: 'world_rule_block'},
      {kind: 'block', type: 'world_return'},
    ],
    check: {
      kind: 'outcome',
      says: 'The block is called from two places with different arguments, and both do the right thing.',
      falsePass:
        'A block with no parameters called twice, which is a shortcut and not an abstraction.',
    },
  },
  {
    id: 'making/behavior',
    region: 'making',
    at: at('adventure', 3, 3),
    title: 'Shared, without the ceremony',
    teaches:
      'The middle of the space: work several kinds of actor share, without being a rule about it.',
    task: 'Two kinds of NPC doing the same thing twice. Write it once as a behavior.',
    requires: ['adventure/errand'],
    unlocks: [{kind: 'block', type: 'world_behavior'}],
    check: {
      kind: 'outcome',
      says: 'Two kinds of actor run one behavior, and removing it stops both.',
      falsePass:
        'One behavior used by one kind. The second kind is the whole point.',
    },
  },
  {
    id: 'making/trait',
    region: 'making',
    at: at('simulation', 3, 3),
    title: 'A trait of your own',
    teaches:
      'Election: a rule that offers something, and the actors that choose to be it.',
    task: 'One rule, two traits, and two kinds of agent that take one each.',
    requires: ['simulation/dials'],
    unlocks: [
      // `use trait` is how an actor ELECTS one and came with the first lesson.
      // What this teaches is declaring one, which is a rule's own business.
      {kind: 'block', type: 'world_rule_trait'},
      {kind: 'block', type: 'world_rule_enum'},
    ],
    check: {
      kind: 'outcome',
      says: 'Two kinds of actor carry different traits from one rule, and behave differently because of it.',
      falsePass:
        'Two traits both elected by everything, which is one trait with two names.',
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

const lastList = <T>(samples: unknown[] | undefined): T[] => {
  const value = samples?.[samples.length - 1];
  return Array.isArray(value) ? (value as T[]) : [];
};
