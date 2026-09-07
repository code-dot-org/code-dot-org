// "Climbs ladders with the arrow keys" — the control scheme, as blocks.
//
// A CONTROL SCHEME IS NOT A MECHANIC, and this is where the difference is put.
// `Climbing` says what a ladder is and what climbing one does; it says nothing
// about keys, because a robot that takes ladders when the player is above it
// climbs without a keyboard. The rule used to carry the keys anyway, as a
// second trait called "Climbs with Arrow Keys", and that had two costs.
//
// The rule had to depend on `Input`, so importing a ladder imported keyboard
// reading whether or not anything was steered by hand. And the keys were the
// RULE's: a learner could elect the trait or not, and could not see which keys
// or change them, when the bindings are exactly the part a game wants to
// change. A trait that exists only to wire two other things together is a rule
// doing a project's job.
//
// WHAT IT WRITES, all of it in the actor:
//
//   actors/<target>.actor    use trait ⟨Climbing#Climbs⟩
//                            use trait ⟨Input#TakesKeyboardInput⟩
//
//                            each frame during ⟨decide⟩ do
//                              if   ⟨up arrow is down⟩    start ⟨me⟩ climbing up
//                              else if ⟨down arrow is down⟩ start ⟨me⟩ climbing down
//                              else                        stop ⟨me⟩ climbing
//
// POLLED, NOT HANDLED, and that is the shape the rule had for a reason worth
// keeping: reading the keys every frame is what makes LETTING GO end the climb
// without a handler saying so. A pair of `presses`/`releases` handlers would
// need a third to cover the frame a learner presses both.
//
// IN `decide`, before anything moves, so a climb begun this frame is already in
// force when the climb step runs.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {
  addRoot,
  append,
  hasRoot,
  holds,
  rowsUnder,
  type BlockJson,
} from './patch';

const CLIMBS = 'Climbing#ClimbsTrait';
const KEYBOARD = 'Input#TakesKeyboardInputTrait';
/** The step's name, which is also how `applied` recognises its own work. */
const STEP = 'climb with the arrow keys';

/** Which file holds this actor, and which of its roots defines it. */
const fileOf = (target: EnhanceTarget) =>
  target.block
    ? {
        path: `${target.path}.world`,
        root: {type: 'world_actor', id: target.block},
      }
    : {path: `${target.path}.actor`, root: {type: 'world_actor'}};

/** Whether a `use trait` for `trait` is already in this actor's chain. */
const wears = (
  contents: string,
  trait: string,
  root: {type: string; id?: string},
): boolean =>
  holds(
    contents,
    root,
    block => block.type === 'world_use_trait' && block.fields?.TRAIT === trait,
  );

/**
 * `start ⟨me⟩ climbing up` and its two siblings, which take the actor.
 *
 * `VALUE`, not `ACTOR`: these are rule-level designed blocks with one
 * parameter, and a designed block's parameter socket is `VALUE` whatever the
 * parameter is called. Read off how the rule itself called them before these
 * handlers moved out of it — written as `ACTOR` the socket is empty and the
 * block asks nobody to climb, in silence.
 */
const climbing = (action: string): BlockJson => ({
  type: `world_do_Climbing_${action}Action`,
  inputs: {VALUE: {block: {type: 'world_this_actor'}}},
});

const keyIsDown = (key: string): BlockJson => ({
  type: 'world_is_key_down',
  fields: {KEY: key},
});

/**
 * The one step, with the three cases in it.
 *
 * EXPORTED, because the shipped projects need the same rows a learner gets
 * from the wand — the jetpack Pilot and two lessons steer a climb this way.
 * Written twice they would drift, and the one that drifted would be the one
 * nobody was looking at.
 */
export const climbArrowsStep = (): BlockJson => ({
  type: 'world_trait_step',
  fields: {PHASE: 'decide', NAME: STEP},
  inputs: {
    DO: {
      block: {
        type: 'controls_if',
        extraState: {elseIfCount: 1, hasElse: true},
        inputs: {
          IF0: {block: keyIsDown('up arrow')},
          DO0: {block: climbing('StartClimbingUp')},
          IF1: {block: keyIsDown('down arrow')},
          DO1: {block: climbing('StartClimbingDown')},
          ELSE: {block: climbing('StopClimbing')},
        },
      },
    },
  },
});

/**
 * Whether this actor already reads the arrows for its climbing.
 *
 * WHERE THE STEP GOES DEPENDS ON WHERE THE ACTOR IS, and getting it wrong is
 * silent. `each frame` is a ROOT in an `.actor` file — it stands on its own
 * the way a handler does — and a ROW inside a world's own `define actor`,
 * where the definition is a chain. Chained into an actor file it is
 * structurally accepted and never runs: the first version of this gave the
 * Pilot the trait and the blocks, and it would not climb.
 */
const isStep = (block: {type: string; fields?: Record<string, unknown>}) =>
  block.type === 'world_trait_step' && block.fields?.NAME === STEP;

const reads = (
  contents: string,
  target: EnhanceTarget,
  root: {type: string; id?: string},
): boolean =>
  target.block
    ? rowsUnder(contents, root).some(isStep)
    : hasRoot(contents, isStep);

/** Rewrite one file's contents, leaving the rest of the project alone. */
const edit = (
  source: MultiFileSource,
  id: string,
  change: (contents: string) => string,
): MultiFileSource => ({
  ...source,
  files: {
    ...source.files,
    [id]: {...source.files[id], contents: change(source.files[id].contents)},
  },
});

export const climbArrowsEnhancement: Enhancement = {
  id: 'climbs-with-arrows',
  subject: 'actor',
  name: 'Climbs ladders with the arrow keys',
  description:
    'Lets this actor climb anything that can be climbed, steered with up and down. The keys are blocks in its file, so change them to whatever your game uses — and an actor that should climb without a keyboard takes the trait and leaves these out.',
  brings: ['Climbs Ladders', 'Reads the Keyboard'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      wears(contents, CLIMBS, root) &&
      wears(contents, KEYBOARD, root) &&
      reads(contents, target, root)
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    for (const name of ['Climbing', 'Input']) {
      const rule = STOCK_RULES.find(one => one.name === name);
      if (rule) {
        current = importStockRule(current, rule).source;
      }
    }

    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    if (!id) {
      return current;
    }
    return edit(current, id, contents => {
      let next = contents;
      for (const trait of [CLIMBS, KEYBOARD]) {
        if (!wears(next, trait, root)) {
          next = append(next, root, [
            {type: 'world_use_trait', fields: {TRAIT: trait}},
          ]);
        }
      }
      if (!reads(next, target, root)) {
        next = target.block
          ? append(next, root, [climbArrowsStep()])
          : addRoot(next, climbArrowsStep());
      }
      return next;
    });
  },
};
