// What a gated lesson offers, and the one way gating can go badly wrong.
//
// Hiding blocks is easy; hiding a block a lesson tells the learner to add is a
// trap that looks exactly like a gate. So the table below says, for each lesson
// written so far, which blocks its instructions ask the learner to REACH FOR —
// and the test insists every one of them is in the toolbox at that point.
//
// The table is written by hand and read from the instructions, because nothing
// else knows: a lesson's starting project does not contain the blocks the
// lesson asks for, and its solved project is a thing only a test has.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../../blockly/domainBlocks';
import {projectOwnMetas, projectRuleMetas} from '../../blockly/projectModules';
import {projectFiles} from '../../runtime/projectFiles';
import {TILES} from '../catalogue';
import {GRANTED_BY, tile} from '../index';
import {LESSONS} from '../lessons';
import {holds as heldBy, shelfKeys} from '../shelf';
import {shelvedToolbox, EARNED_BLOCKS} from '../toolboxShelf';
import type {TileId} from '../types';

/**
 * The blocks each lesson tells the learner to go and find.
 *
 * NOT everything a solved project contains — the starter's own blocks are
 * already on screen, and a block in a rule's drawer was never gated. These are
 * the ones the instructions send somebody to the toolbox for.
 */
const ASKS_FOR: Partial<Record<TileId, readonly string[]>> = {
  'origin/first-world': [
    'world_add_actor',
    'world_set_sprite',
    'world_set_position',
  ],
  'input/arrows': ['world_use_trait'],
  // …and step five, which writes what the event carried rather than a word of
  // the learner's — the same block either way, since it takes a value and
  // wears a text shadow (`domainBlocks.worldPrint`).
  'input/press': ['world_use_trait', 'world_print', 'world_event_value'],
  'input/mouse': ['world_use_trait', 'world_print'],
  'input/two-hands': ['world_use_trait'],
  'motion/speed': ['world_use_trait'],
  'motion/gravity': ['world_use_trait', 'world_print'],
  'motion/force': [],
  'motion/units': [],
  'motion/drag': ['world_use_trait'],
  'motion/tween': [
    'world_play_tween_here',
    'world_set_position',
    'world_define_tween',
    'world_play_tween',
  ],
  'logic/if': [
    'world_trait_step',
    'controls_if',
    'logic_compare',
    'world_get_Space_PositionProperty',
  ],
  'logic/collision': ['world_use_trait', 'world_print'],
  'logic/and-or': ['logic_operation', 'world_get_Space_PositionProperty'],
  'look/sprite': ['world_set_sprite'],
  'place/position': ['world_set_position', 'world_random_place', 'math_number'],
  'logic/kinds': [
    'controls_if',
    'world_is_a',
    'world_event_actor',
    'world_print',
  ],
  // The two Memory lessons need numbers and arithmetic, which are Place's
  // lesson on a branch they never touch — so those tiles OFFER them, and these
  // two rows are what says an offer reaches the toolbox as a grant does.
  'memory/variable': [
    'variables_set_Number',
    'variables_get_Number',
    'math_number',
    'math_arithmetic',
  ],
  'memory/many': ['world_for_each', 'world_all_actors', 'world_set_sprite'],
  // The drawer this lesson grants, and the words the learner types into the
  // literal.
  'memory/lists': [
    'lists_create_with',
    'world_for_each_word',
    'variables_set_List',
    'variables_get_List',
    'text',
  ],
  'memory/world-state': ['world_rule_property', 'text_join', 'text'],
  'memory/actor-state': ['world_rule_property'],
  'memory/score': ['world_print', 'math_number'],
  'look/drawing': ['math_arithmetic'],
  'look/background': [
    'world_set_background',
    'world_set_background_repeat',
    'world_set_background_offset',
    'world_vector',
  ],
  'look/animation': ['world_play_animation'],
  'look/effect': ['world_add_effect', 'world_add_world_effect'],
  'place/edges': ['world_use_trait'],
  'place/map': [],
  'place/camera': [
    'world_define_camera',
    'world_use_camera',
    'world_use_trait',
  ],
  'place/camera-feel': ['world_use_trait'],
  'place/layers': [
    'world_define_layer',
    'world_layer_fixed',
    'world_layer_parallax',
  ],
  'platformer/jump': ['world_use_trait'],
  'platformer/jetpack': [
    'world_use_trait',
    // The release is the half of the switch the lesson before it never
    // needed: a jump is a press and nothing else.
    'world_on_Input_ReleasesEvent',
  ],
  // Two `use trait` rows and nothing else: the control scheme is a trait, so
  // the four handlers a project would otherwise write are not written.
  'platformer/ladders': ['world_use_trait'],
  // Four `use trait` rows and one number: everything the lesson asks for is
  // already on screen or in the rule's own drawer.
  'platformer/surfaces': ['world_use_trait'],
  'platformer/enemies': ['world_use_trait'],
  // Only the trait rows: naming what to hunt reuses the value block the
  // starter's chaser already has on screen. `first actor in` is unlocked on
  // another branch, so a lesson that sent somebody for one would be asking
  // for a block they have not got.
  'platformer/hunter': ['world_use_trait'],
  'platformer/flier': ['world_use_trait'],
  'platformer/pads': [],
  'platformer/walls': [],
  'platformer/digging': ['world_use_trait'],
  'platformer/ground': ['world_use_trait'],
  'platformer/pickups': ['world_use_trait', 'world_print'],
  'platformer/hazards': ['world_use_trait', 'world_print'],
  'arcade/bounce': [],
  'arcade/paddle': ['world_use_trait'],
  'arcade/zap': ['world_use_trait'],
  'arcade/bricks': [
    'world_trait_step',
    'controls_if',
    'logic_compare',
    'world_count_of_kind',
    'world_all_actors',
  ],
  'arcade/waves': ['math_arithmetic'],
  'story/text': ['world_add_actor', 'world_set_position'],
  'story/reveal': ['world_add_trait'],
  'story/script': [
    'world_add_trait',
    'controls_if',
    'logic_compare',
    'math_number',
  ],
  'story/choice': ['controls_if', 'logic_compare', 'world_event_actor'],
  'story/scene': [
    'world_set_sprite',
    'world_set_background',
    'world_set_music',
  ],
  'simulation/many': [
    'controls_repeat_ext',
    'world_print',
    'world_count_actors',
  ],
  'simulation/steering': ['world_use_trait'],
  // A Making lesson is spent in a `.rule` file, whose palette is the rule
  // author's rather than the world's — the toolbox this table checks is the
  // world's, and what the learner reaches for there is the generated setter,
  // which no gate can hide (`toolboxShelf`, "what the project mints").
  'making/property': [],
  // Both Making lessons so far are spent in a `.rule`, whose palette is the
  // rule author's rather than the world's.
  'making/change': [],
  'making/trait': [],
  'making/rule': [],
  'making/read': [],
  'making/block': [],
  'puzzle/grid': ['world_use_trait'],
  'puzzle/push': ['world_use_trait'],
  'puzzle/turns': ['world_use_trait'],
  // Not `any ⟨Dot⟩`: the new block's source socket wears one already, so the
  // one trip to the toolbox is for the block itself.
  'simulation/neighbors': ['world_actors_within'],
  'adventure/rooms': ['world_clear_world', 'world_load_map'],
  'adventure/keys': [
    'controls_if',
    'world_event_actor',
    'world_remove_actor',
    'text',
  ],
  // Only the declaration: the getter it mints does not exist until the
  // property does, so it cannot be in a toolbox built from the starter.
  'simulation/dials': ['world_rule_property'],
  'simulation/emergent': [
    'world_set_Physics_VelocityProperty',
    'world_get_Physics_VelocityProperty',
    'world_vector_math',
    'world_query_Steering_FromTowardOverQuery',
    'world_query_Steering_DistanceFromToQuery',
  ],
  // Nothing but the number: the kind is picked on the hat, so the two handlers
  // are a hat and one block each.
  'puzzle/goal': ['math_number'],
  'puzzle/undo': ['world_use_trait', 'world_on_Input_PressesEvent'],
  'adventure/world': [
    'world_define_camera',
    'world_use_camera',
    'world_use_trait',
    'world_set_background',
    'world_set_background_repeat',
  ],
  'adventure/people': ['world_add_trait'],
  'adventure/errand': ['math_arithmetic', 'world_count_of_kind'],
  'platformer/level': [
    'controls_if',
    'world_is_a',
    'world_event_actor',
    'world_print',
  ],
};

/** Every tile on the shortest way to this one, itself excluded. */
const before = (id: TileId): TileId[] => {
  const done: TileId[] = [];
  const walk = (at: TileId) => {
    for (const need of tile(at).requires) {
      if (!done.includes(need)) {
        walk(need);
        done.push(need);
      }
    }
  };
  walk(id);
  return done;
};

/** The toolbox a learner sees while doing a lesson, having done its run-up. */
const offeredAt = (id: TileId): Set<string> => {
  const files = projectFiles(LESSONS[id]!.source);
  const {toolbox} = buildDomainPalette(projectRuleMetas(files), {
    fileKind: 'world',
  });
  // The run-up done, and this lesson open — which is what lends a learner the
  // block their own instructions send them to find (`shelfKeys`).
  const keys = shelfKeys(new Set(before(id)), id);
  const granted = new Set(GRANTED_BY.keys());
  const shown = shelvedToolbox(toolbox, {
    holds: unlock => heldBy(keys, granted, unlock),
  }) as {blocks?: unknown[]}[];
  return new Set(
    shown.flatMap(category =>
      (category.blocks ?? [])
        .map(item =>
          typeof item === 'string' ? item : (item as {type?: string}).type,
        )
        .filter((type): type is string => typeof type === 'string'),
    ),
  );
};

const written = Object.keys(LESSONS) as TileId[];

describe.each(written)('the %s lesson', id => {
  it('offers every block its instructions send you to find', () => {
    const asked = ASKS_FOR[id];
    expect(asked, `${id} is not in ASKS_FOR`).toBeDefined();
    const offered = offeredAt(id);
    for (const type of asked ?? []) {
      expect(offered.has(type), `${id} asks for ${type}`).toBe(true);
    }
  });
});

describe('a gated first lesson', () => {
  // The number this whole mechanism exists for. Ungated it is twelve drawers
  // and a hundred and fifty-seven blocks, on a screen whose own detail pane
  // says the lesson unlocks the Actor drawer.
  it('is small enough to read', () => {
    const offered = offeredAt('origin/first-world');
    expect(offered.size).toBeLessThan(20);
  });

  it('is not so small the lesson cannot be done', () => {
    const offered = offeredAt('origin/first-world');
    expect(offered.has('world_actor')).toBe(true);
    expect(offered.has('world_world')).toBe(true);
  });
});

describe('the earned set', () => {
  // A rule's blocks are never gated: a project that HOLDS Gravity has Gravity's
  // blocks, earned or not, because a lesson may hand you anything (an edge
  // means readiness, not possession). No tile grants a rule's blocks one by
  // one, so no rule drawer can become earned — this says so.
  it('holds no block a project rule generates', () => {
    const generated = [...EARNED_BLOCKS].filter(type =>
      /^world_(do|get|set|on|query|emit)_[A-Z]/.test(type),
    );
    // Space and Appearance only: the engine's own two rules, which every
    // project has, and whose `set position` and `set sprite` are core
    // vocabulary rather than a mechanic anybody opted into.
    expect(generated.every(type => /_(Space|Appearance)_/.test(type))).toBe(
      true,
    );
  });

  // …and the catalogue is still allowed to SAY it grants one, because that is
  // what a learner reads. `arcade/bounce` unlocks "the bounciness property";
  // it simply does not gate the drawer that property lives in.
  it('lets a tile still name one as an unlock', () => {
    const named = TILES.flatMap(t =>
      t.unlocks
        .filter(u => u.kind === 'block')
        .map(u => (u as {type: string}).type),
    );
    expect(named).toContain('world_set_SolidBodies_BouncinessProperty');
    expect(EARNED_BLOCKS.has('world_set_SolidBodies_BouncinessProperty')).toBe(
      false,
    );
  });
});

describe('a property the learner just declared', () => {
  // Its get and set are minted from the declaring file's path and the name
  // typed into the block, so no tile can grant them and nothing knows them
  // ahead of time — and they land in the Actor drawer, which IS earned. Gated
  // by the ordinary rule they would be hidden the moment they appeared, which
  // is the one thing a lesson about declaring properties cannot survive.
  const declaring = (id: TileId, path: string, root: string): Set<string> => {
    const files = {...projectFiles(LESSONS[id]!.source)};
    const workspace = JSON.parse(files[path]) as {
      blocks: {blocks: {type?: string; next?: unknown}[]};
    };
    const at = workspace.blocks.blocks.find(block => block.type === root)!;
    at.next = {
      block: {
        type: 'world_rule_property',
        fields: {
          TYPE: 'number',
          ACCESS: 'writable',
          NAME: 'lives',
          DEFAULT: '3',
        },
        next: at.next,
      },
    };
    files[path] = JSON.stringify(workspace);
    const {toolbox} = buildDomainPalette(projectRuleMetas(files), {
      fileKind: 'world',
      ownProperties: projectOwnMetas(files),
    });
    // The run-up done, and this lesson open — which is what lends a learner
    // the block their own instructions send them to find (`shelfKeys`).
    const keys = shelfKeys(new Set(before(id)), id);
    const granted = new Set(GRANTED_BY.keys());
    const shown = shelvedToolbox(toolbox, {
      holds: unlock => heldBy(keys, granted, unlock),
    }) as {blocks?: unknown[]}[];
    return new Set(
      shown.flatMap(category =>
        (category.blocks ?? [])
          .map(item =>
            typeof item === 'string' ? item : (item as {type?: string}).type,
          )
          .filter((type): type is string => typeof type === 'string'),
      ),
    );
  };

  it('is offered by the world that declares it', () => {
    const offered = declaring(
      'memory/world-state',
      'worlds/main.world',
      'world_world',
    );
    expect(offered.has('world_get_WorldsMain_LivesProperty')).toBe(true);
    expect(offered.has('world_set_WorldsMain_LivesProperty')).toBe(true);
  });

  it('is offered by the actor that declares it', () => {
    const offered = declaring(
      'memory/actor-state',
      'actors/lamp.actor',
      'world_actor',
    );
    expect(offered.has('world_get_ActorsLamp_LivesProperty')).toBe(true);
  });
});
