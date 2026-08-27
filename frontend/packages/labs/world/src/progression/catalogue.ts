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
      {kind: 'category', name: 'Actor'},
      {kind: 'category', name: 'World'},
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
          {pointer: {x: 192, y: 144, buttons: ['left']}, seconds: 0.1},
          {pointer: {x: 192, y: 144, buttons: []}, seconds: 0.1},
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
      inspect: files =>
        !Object.entries(files).some(
          ([path, contents]) =>
            path.startsWith('actors/') &&
            contents.includes('world_set_position'),
        ),
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
    unlocks: [{kind: 'block', type: 'world_do_Physics_ApplyForceAction'}],
    check: {
      kind: 'outcome',
      says: 'Velocity after the shove is within tolerance of the expected value, and the actor keeps moving after it.',
      falsePass:
        'Setting the velocity directly rather than applying a force — the same outcome from a different idea. Ask for two shoves and check they add.',
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
      {kind: 'block', type: 'world_vector_length'},
      {kind: 'block', type: 'world_map_size'},
    ],
    check: {
      kind: 'outcome',
      says: 'The crossing takes two seconds, give or take a fifth, on the scripted clock.',
      falsePass:
        'Guessing a number that happens to fit the demo screen. Run it again on a map of a different width.',
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
      says: 'After the shove stops, speed decays below a tenth of its peak within the scripted window.',
      falsePass:
        'Zeroing the velocity in a handler. Assert the decay is gradual by sampling it twice.',
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
      {kind: 'block', type: 'world_define_tween'},
      {kind: 'block', type: 'world_play_tween'},
    ],
    check: {
      kind: 'outcome',
      says: 'The actor is at the tween’s end position when the tween reports it has finished.',
      falsePass:
        'A tween that moves nothing, ending where it began. Require the end to differ from the start.',
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
      {kind: 'category', name: 'Logic'},
      {kind: 'block', type: 'controls_if'},
      {kind: 'block', type: 'logic_compare'},
    ],
    check: {
      kind: 'outcome',
      says: 'Two scripted runs, one either side of the middle, end differently.',
      falsePass:
        'Changing colour unconditionally. The run that stays on the left must not change.',
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
      says: 'The player stops at the wall, and the spike’s handler runs on contact and not before.',
      falsePass:
        'A handler that runs every frame regardless. Assert it has not run while the player is still walking.',
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
    ],
    check: {
      kind: 'outcome',
      says: 'A coin and a spike reaching the same handler produce different results.',
      falsePass:
        'Two handlers, one per kind. Assert the workspace has one, or run a third kind that must be ignored.',
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
      says: 'The door opens with both switches down and stays shut with either one alone.',
      falsePass:
        '`or` in place of `and`, which passes the first half. Both single-switch runs are the check.',
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
    check: {
      kind: 'shape',
      says: 'A variable is written once and read at least twice, and the behaviour is unchanged.',
      falsePass:
        'Naming something and using it once. The count is the check, and it is why this one is a `shape`.',
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
      {kind: 'block', type: 'world_actors_with_trait'},
      {kind: 'block', type: 'world_count_of_kind'},
    ],
    check: {
      kind: 'outcome',
      says: 'All six coins changed, from a workspace holding one loop.',
      falsePass:
        'Six blocks, one per coin. Add a seventh coin at runtime and require it to change too.',
    },
  },
  {
    id: 'memory/world-state',
    region: 'memory',
    at: at('memory', 1, 1),
    title: 'State the world shares',
    teaches: 'A value that belongs to the game rather than to anything in it.',
    task: 'Count something by hand, and draw the number where a player can see it.',
    requires: ['memory/variable'],
    unlocks: [
      {kind: 'block', type: 'world_rule_property'},
      {kind: 'rule', id: 'writing'},
      {kind: 'actor', id: 'label'},
      {kind: 'block', type: 'text_join'},
    ],
    check: {
      kind: 'outcome',
      says: 'The drawn text reads the right number after three scripted pickups.',
      falsePass:
        'Drawing a fixed string that happens to be right at the end. Sample it after two pickups as well.',
    },
  },
  {
    id: 'memory/actor-state',
    region: 'memory',
    at: at('memory', 2, 1),
    title: 'State an actor carries',
    teaches:
      'The same property on many actors, each with its own value — which is what an instance is.',
    task: 'Two lamps. Make each remember whether it is lit, without the world keeping a list.',
    requires: ['memory/world-state'],
    unlocks: [{kind: 'block', type: 'world_this_actor'}],
    check: {
      kind: 'outcome',
      says: 'The two lamps hold different values at the same moment.',
      falsePass:
        'One world-level flag driving both. Two lamps in different states is precisely what that cannot do.',
    },
  },
  {
    id: 'memory/score',
    region: 'memory',
    at: at('memory', 3, 0),
    title: 'Somebody already counted',
    teaches:
      'Recognising your own hand-rolled thing in a library, and what you get for swapping.',
    task: 'Replace the counter you wrote with Scoring, and get "reached the target" for nothing.',
    requires: ['memory/many'],
    unlocks: [{kind: 'rule', id: 'score'}],
    check: {
      kind: 'trace',
      says: 'The "reaches the target" event fires once, at five, and not again.',
      falsePass:
        'Firing it by hand from the pickup handler. Assert the score property is what the event carries.',
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
      {kind: 'editor', id: 'image'},
      {kind: 'block', type: 'world_set_sprite'},
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
    task: 'Give an actor a `define drawing` and build a health bar out of two rectangles.',
    requires: ['look/sprite'],
    unlocks: [
      {kind: 'category', name: 'Drawing'},
      {kind: 'actor', id: 'progressBar'},
    ],
    check: {
      kind: 'outcome',
      says: 'The drawing renders, and its width follows a property rather than a constant.',
      falsePass:
        'Two fixed rectangles that look right at full health. Set the property to a third and look again.',
    },
  },
  {
    id: 'look/background',
    region: 'look',
    at: at('look', 1, 1),
    title: 'Behind everything',
    teaches: 'The backdrop is not an actor, and neither is what sits in front.',
    task: 'Add a backdrop, then a repeating one, then move it as the world moves.',
    requires: ['look/sprite'],
    unlocks: [
      {kind: 'block', type: 'world_set_background'},
      {kind: 'block', type: 'world_set_background_repeat'},
      {kind: 'block', type: 'world_set_background_color'},
    ],
    check: {
      kind: 'outcome',
      says: 'The background is set, repeats, and its offset changes as the view moves.',
      falsePass:
        'A very large actor placed behind everything. Assert the world’s background property, not the picture.',
    },
  },
  {
    id: 'look/animation',
    region: 'look',
    at: at('look', 3, 0),
    title: 'Pictures in a row',
    teaches: 'An animation is a file that reads rectangles out of one image.',
    task: 'Import a walk cycle, then cut your own out of a sheet you painted.',
    requires: ['look/drawing'],
    unlocks: [
      {kind: 'editor', id: 'animation'},
      {kind: 'block', type: 'world_play_animation'},
      {kind: 'asset', id: 'playerWalk'},
    ],
    check: {
      kind: 'outcome',
      says: 'The actor’s frame advances while it is moving and holds while it is still.',
      falsePass:
        'Playing the animation always. The still half is the half that needs a condition.',
    },
  },
  {
    id: 'look/effect',
    region: 'look',
    at: at('look', 2, 1),
    title: 'An effect is a recipe',
    teaches: 'A shader is a description of how to paint, not a picture.',
    task: 'Import an effect, put it on an actor, then on the whole world, and change one of its knobs.',
    requires: ['look/background'],
    unlocks: [
      {kind: 'editor', id: 'effect'},
      {kind: 'block', type: 'world_add_effect'},
      {kind: 'block', type: 'world_add_world_effect'},
    ],
    check: {
      kind: 'outcome',
      says: 'The actor carries the effect at runtime, with a parameter differing from the imported default.',
      falsePass:
        'Importing the effect and never adding it. Read the running actor, not the project.',
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
      {kind: 'block', type: 'world_set_position'},
      {kind: 'block', type: 'world_vector'},
      {kind: 'block', type: 'world_random_place'},
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
          markers.some(at => at.x < 128 && at.y < 96) &&
          markers.some(at => at.x > 256 && at.y > 192)
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
      'A level is data: a file that says what is where, separate from the code that runs it.',
    task: 'Paint a floor and some walls in the map editor, load them, and say how big the world is.',
    requires: ['place/position'],
    unlocks: [
      {kind: 'editor', id: 'map'},
      {kind: 'block', type: 'world_load_map'},
      {kind: 'block', type: 'world_set_map_size'},
    ],
    check: {
      kind: 'outcome',
      says: 'The world holds the actors the map names, at the places it names.',
      falsePass:
        'Placing them with `add actor` and keeping an empty map. Count what the map declares.',
    },
  },
  {
    id: 'place/edges',
    region: 'place',
    at: at('place', 1, 1),
    title: 'The end of the world',
    teaches:
      'What happens at a boundary is a choice, and there are two of them.',
    task: 'Stop an actor at the edge on one axis, and bring it back on the other side on the other.',
    requires: ['place/position'],
    unlocks: [
      {kind: 'rule', id: 'bounds'},
      {kind: 'rule', id: 'wrap'},
    ],
    check: {
      kind: 'outcome',
      says: 'The actor stays inside on one axis and reappears opposite on the other.',
      falsePass:
        'Electing both on both axes, which looks fine until you watch which edge it left by.',
    },
  },
  {
    id: 'place/layers',
    region: 'place',
    at: at('place', 2, 1),
    title: 'What is in front',
    teaches:
      'Drawing order is a thing you declare, and some things should not move with the view at all.',
    task: 'Put the score in a layer that ignores the camera, and the hills in one that lags behind it.',
    requires: ['place/map'],
    unlocks: [
      {kind: 'block', type: 'world_define_layer'},
      {kind: 'block', type: 'world_within_layer'},
      {kind: 'block', type: 'world_layer_fixed'},
      {kind: 'block', type: 'world_layer_parallax'},
    ],
    check: {
      kind: 'outcome',
      says: 'The score’s screen position is unchanged after the view has travelled; the hills have moved less than the ground.',
      falsePass:
        'Moving the score every frame to follow the camera. Assert the layer is fixed, not the position.',
    },
  },
  {
    id: 'place/camera',
    region: 'place',
    at: at('place', 3, 0),
    title: 'A window on a bigger world',
    teaches: 'What is drawn and where things are are two different questions.',
    task: 'Follow the player around a map three screens wide, and stop the view at the edges.',
    requires: ['place/map'],
    unlocks: [
      {kind: 'rule', id: 'camera'},
      {kind: 'rule', id: 'cameraFollow'},
      {kind: 'rule', id: 'cameraConfined'},
      {kind: 'block', type: 'world_define_camera'},
    ],
    check: {
      kind: 'outcome',
      says: 'The view tracks the player and never shows past the end of the map.',
      falsePass:
        'A map exactly one screen wide, where a confined camera cannot move and so is never wrong.',
    },
  },
  {
    id: 'place/camera-feel',
    region: 'place',
    at: at('place', 4, 0),
    title: 'Correct, and pleasant',
    teaches:
      'The difference between a camera that is right and a camera that is comfortable.',
    task: 'Add easing so the view catches up, and a deadzone so small movements do not move it at all.',
    requires: ['place/camera'],
    unlocks: [
      {kind: 'rule', id: 'cameraEase'},
      {kind: 'rule', id: 'cameraDeadzone'},
    ],
    check: {
      kind: 'outcome',
      says: 'A small scripted movement moves the player and not the view; a large one moves the view over several frames.',
      falsePass:
        'A deadzone so large the camera never moves. The large movement is what rules that out.',
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
    task: 'Jump. Then add a moment of grace after walking off a ledge, and a second jump in the air.',
    requires: ['input/press', 'motion/gravity'],
    unlocks: [{kind: 'rule', id: 'jump'}],
    check: {
      kind: 'outcome',
      says: 'A press from the ground raises y; a press in mid-air does nothing until double jump is on.',
      falsePass:
        'An unlimited jump, which passes the first half. The mid-air press is the check.',
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
    task: 'Coins that vanish when you touch them, and a count of how many you hold.',
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
        'Removing the coin in the collision handler and counting separately — which is the lesson done the long way, so accept it and say so.',
    },
  },
  {
    id: 'platformer/hazards',
    region: 'platformer',
    at: at('platformer', 3, 2),
    title: 'Something that can hurt you',
    teaches:
      'A rule that does not know who it is hurting: one ability says what can be damaged, another says what damages.',
    task: 'A spike, and then a patrolling enemy that is dangerous without being told about the player.',
    requires: ['platformer/ground'],
    unlocks: [
      {kind: 'rule', id: 'health'},
      {kind: 'actor', id: 'healthBar'},
    ],
    check: {
      kind: 'trace',
      says: 'Health falls once per touch, not once per frame of contact.',
      falsePass:
        'A mercy time longer than the scripted contact. Hold the contact for three seconds and require several hits.',
    },
  },
  {
    id: 'platformer/level',
    region: 'platformer',
    at: at('platformer', 2, 3),
    title: 'A level',
    teaches:
      'A start, a route, an end — and the state that says which you are in.',
    task: 'Put it together: a map, a camera, hazards, coins, and somewhere to be trying to get to.',
    requires: ['platformer/pickups', 'platformer/hazards'],
    unlocks: [
      {kind: 'template', id: 'platformer'},
      // The stock Player: gravity, walking, jumping and the space bar, already
      // assembled. It belongs to the capstone rather than to `jump`, because
      // what it saves is the assembly, and the assembly is what the four tiles
      // before this one were for.
      {kind: 'actor', id: 'player'},
    ],
    check: {
      kind: 'outcome',
      says: 'A scripted run reaches the goal and enters the win state; a run into a spike does not.',
      falsePass:
        'A win that fires on any collision. The losing run is what tells them apart.',
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
    unlocks: [{kind: 'block', type: 'world_remove_actor'}],
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
      {kind: 'block', type: 'world_add_actor'},
      {kind: 'block', type: 'world_all_actors'},
      {kind: 'block', type: 'world_count_actors'},
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
    unlocks: [{kind: 'block', type: 'world_trait_step'}],
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
      {kind: 'block', type: 'world_rule_trait'},
      {kind: 'block', type: 'world_use_trait'},
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
const lastNumber = (samples: unknown[] | undefined): number => {
  const value = samples?.[samples.length - 1];
  return typeof value === 'number' ? value : -1;
};

const lastList = <T>(samples: unknown[] | undefined): T[] => {
  const value = samples?.[samples.length - 1];
  return Array.isArray(value) ? (value as T[]) : [];
};
