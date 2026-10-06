// What the curriculum does not hand out, written down on purpose.
//
// `toolboxShelf` gates a drawer the moment the catalogue grants anything in
// it: once one World block is earned, every OTHER World block is hidden until
// some tile grants it too. That is the right rule — a lesson's toolbox should
// match its detail pane — and it has a failure mode nobody sees. A block can
// be built, tested, documented and shipped, land in an earned drawer, and be
// reachable by NOBODY, and every test in the repo still passes: the shelf is
// consistent, the lessons all work, and the block is simply gone.
//
// It happened. Saving and the on-screen keyboard were built, specced and
// finished, and five blocks sat in the World drawer that no learner could
// open (specs/APPS.md).
//
// So this is the other direction, and it is a LEDGER rather than a rule.
// Every hidden block is listed below with the drawer it is in. A new one has
// to be either granted by a tile or added here, which makes the choice
// deliberate instead of silent. The list may shrink and must not grow: that is
// the whole of the test.
//
// It is not a list of MISTAKES. Most of these are things no lesson has been
// written for yet — the vector maths, the parenting blocks, the foreground.
// Some are genuinely missing and the list is how anybody would know which:
// `world_time`, `math_random_int` and `text_length` are on it, and none of
// them is exotic. Reading it is the cheapest survey of what the progression
// does not cover (specs/PROGRESSION.md).

import {describe, expect, it} from 'vitest';

import {STOCK_ACTORS} from '../../actors/stock';
import {buildDomainPalette} from '../../blockly/domainBlocks';
import {projectOwnMetas, projectRuleMetas} from '../../blockly/projectModules';
import {STOCK_RULES} from '../../rules/stock';
import {EARNED_BLOCKS, EARNED_CATEGORIES} from '../toolboxShelf';

/**
 * Blocks in an earned drawer that no tile grants, by the drawer they are in.
 *
 * Grouped as the toolbox groups them, because that is how a curriculum author
 * reads it: "what is in the World drawer that nobody is given".
 */
const NOT_TAUGHT: Record<string, readonly string[]> = {
  // The actor vocabulary past "this one": naming a kind, picking one out of
  // several, and the list operations over actors.
  Actor: [
    'world_remove_trait',
    'world_remove_effect',
    'world_show_as',
    'world_actor_kind',
    'world_ordered_actors',
    'world_take_actors',
    'world_any_actor',
    'world_same_actor',
    'world_extreme_actor',
    'world_push_actor',
    'world_clear_actors',
    'world_any_actors',
    'world_is_in_actors',
    'world_all_actors_in_layer',
    'world_is_in_layer',
    'variables_get_Actor',
    'world_kind_of',
    'world_actor_age',
    'world_acts_like',
    'world_define_drawing',
  ],
  // The world's drawer, and the topics it was split into
  // (specs/TOOLBOX_TOPICS.md): the same blocks the one World drawer hid,
  // filed where they now live.
  World: [
    'world_set_view_size',
    'world_actor_kind',
    'world_remove_world_effect',
  ],
  Cameras: [
    'world_move_camera',
    'world_camera',
    'world_all_cameras',
    'world_add_camera_trait',
    'world_remove_camera_trait',
    'world_this_camera',
  ],
  // The foreground, and the effect pairs.
  Backgrounds: [
    'world_set_foreground',
    'world_clear_foreground',
    'world_set_foreground_offset',
    'world_set_foreground_repeat',
    'world_add_background_effect',
    'world_remove_background_effect',
    'world_add_foreground_effect',
    'world_remove_foreground_effect',
    'world_add_layer_effect',
    'world_remove_layer_effect',
  ],
  // `world_time` stands out: every delay and cooldown is measured against it.
  Clock: ['world_time'],
  // The two map hats. A map that does something when it loads is a real
  // thing (the pause menu is one) and no lesson reaches it.
  Map: ['world_on_map_loads', 'world_on_map_unloads'],
  // Parenting, and the engine's own transform vocabulary. `is created` is on
  // this list, which is worth noticing: it is where an app restores what it
  // saved (specs/SAVING_PLAN.md).
  Space: [
    'world_local_position',
    'world_set_local_rotation',
    'world_local_rotation',
    'world_set_local_scale',
    'world_local_scale',
    'world_children_of',
    'world_set_Space_ScaleProperty',
    'world_get_Space_ScaleProperty',
    'world_set_Space_RotationProperty',
    'world_get_Space_RotationProperty',
    'world_set_Space_SkewProperty',
    'world_get_Space_SkewProperty',
    'world_get_Space_IntrinsicSizeProperty',
    'world_get_Space_ParentProperty',
    'world_query_Space_OutsideMapQuery',
    'world_do_Space_MoveAction',
    'world_do_Space_RotateAction',
    'world_do_Space_ScaleAction',
    'world_do_Space_ResizeAction',
    'world_on_Space_GotParentEvent',
    'world_on_Space_LostParentEvent',
    'world_on_Space_GainedChildEvent',
    'world_on_Space_LostChildEvent',
    'world_on_Space_LeftMapEvent',
    'world_on_Space_CreatedEvent',
    'world_on_Space_RemovedEvent',
    'world_on_Space_TweenFinishedEvent',
  ],
  Appearance: [
    'world_get_Appearance_SpriteProperty',
    'world_set_Appearance_OpacityProperty',
    'world_get_Appearance_OpacityProperty',
    'world_get_Appearance_AnimationProperty',
    'world_get_Appearance_FrameProperty',
    'world_on_Appearance_AnimationEndedEvent',
    'world_on_Appearance_FrameChangedEvent',
  ],
  Logic: ['logic_boolean', 'world_any_actors'],
  // The vector blocks, and three pieces of arithmetic a game reaches for on
  // its first day: a random number, a clamp, and a remainder.
  Math: [
    'world_angle',
    'math_modulo',
    'world_sign',
    'math_constrain',
    'math_trig',
    'math_random_int',
    'world_vector_of',
    'world_vector_rotate',
    'world_vector_component',
    'world_vector_direction',
    'world_vector_from_angle',
  ],
  Color: ['world_rgba', 'colour_random', 'colour_blend'],
  Text: [
    'world_new_line',
    'world_text_width',
    'text_length',
    'text_getSubstring',
    'world_comment',
    'world_doc',
  ],
};

const files = {
  ...Object.fromEntries(
    STOCK_RULES.map(rule => [`rules/${rule.id}.rule`, rule.contents]),
  ),
  ...Object.fromEntries(
    STOCK_ACTORS.map(actor => [`actors/${actor.id}.actor`, actor.contents]),
  ),
};
const palette = buildDomainPalette(projectRuleMetas(files), {
  allRuleModules: true,
  ownProperties: projectOwnMetas(files),
});

/** The same exemption `toolboxShelf` makes: a rule's own blocks are never gated. */
const generatedElsewhere = (type: string): boolean =>
  /^world_(do|get|set|on|query|emit)_(?!Space_|Appearance_)[A-Z]/.test(type);

const typeOf = (item: unknown): string | undefined =>
  typeof item === 'string'
    ? item
    : typeof (item as {type?: unknown}).type === 'string'
      ? (item as {type: string}).type
      : undefined;

/** Every hidden block, by drawer — the shelf's own arithmetic, read back. */
const hidden = (): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const category of palette.toolbox as Array<{
    name?: string;
    blocks?: readonly unknown[];
  }>) {
    const name = category.name ?? '';
    const types = (category.blocks ?? [])
      .map(typeOf)
      .filter((type): type is string => type !== undefined);
    // A drawer nothing is earned in is open, and a drawer granted whole is
    // open: neither hides anything.
    if (EARNED_CATEGORIES.has(name)) {
      continue;
    }
    if (!types.some(type => EARNED_BLOCKS.has(type))) {
      continue;
    }
    const missing = types.filter(
      type => !EARNED_BLOCKS.has(type) && !generatedElsewhere(type),
    );
    if (missing.length > 0) {
      out[name] = missing;
    }
  }
  return out;
};

describe('what an earned drawer hides', () => {
  it('is exactly what the ledger says, drawer by drawer', () => {
    // Compared per drawer rather than as one set, so a failure names the
    // drawer and the block instead of a diff of a hundred strings.
    const found = hidden();
    for (const [drawer, types] of Object.entries(found)) {
      expect([...types].sort(), `${drawer} hides these`).toEqual(
        [...(NOT_TAUGHT[drawer] ?? [])].sort(),
      );
    }
    expect(Object.keys(found).sort()).toEqual(
      Object.keys(NOT_TAUGHT)
        .filter(drawer => (NOT_TAUGHT[drawer] ?? []).length > 0)
        .sort(),
    );
  });

  it('does not hide the blocks this lab shipped most recently', () => {
    // The five that were invisible, named rather than left to the ledger: a
    // regression here is the exact bug the ledger exists for.
    const everything = Object.values(hidden()).flat();
    for (const type of [
      'world_save_memory',
      'world_recall_memory',
      'world_forget_memory',
      'world_type',
      'world_press_key',
      'world_now',
      'world_time_part',
      'world_time_text',
      'world_remember_actors',
      'world_recall_actors',
    ]) {
      expect(everything, `${type} is reachable`).not.toContain(type);
    }
  });
});
