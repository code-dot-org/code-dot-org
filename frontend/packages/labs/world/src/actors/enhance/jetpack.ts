// "Flies with a jetpack" — flight you hold down rather than press.
//
// Different from jumping, which is one push and then physics. Here the actor
// is always trading height against fuel, and letting go is part of flying
// rather than the end of it (`rules/stock/jetpack`).
//
// GRAVITY IS ELECTED WITH IT, which is the one thing here that is a decision.
// The trait is written against `Affected by Gravity` — a jetpack is a way of
// resisting a fall, and an actor that was never falling has nothing to resist
// — and the Blob in the jetpack level elects both by hand
// (`fixtures/jetpack`). So the row writes both rather than leaving a learner
// with a flight key that does nothing until they find the falling row.
//
// That also means "Falls when nothing holds it up" reads as already applied
// afterwards, which is true: it is.
//
// AND THE TRAIT ALONE DOES NOTHING, which a played test found and reading
// would not have. Flight is held down, so it is two handlers rather than a
// step that watches a key: `presses space → start flying`, `releases space →
// stop flying` (`rules/stock/jetpack` explains why it is not a step). A row
// that elected the trait and stopped would leave a learner holding space at an
// actor that falls — the worst kind of enhancement, one that writes blocks and
// changes nothing.
//
// SPACE, the same key the platformer's jump takes, and on purpose: the jetpack
// level binds both to it, so a jump becomes a hop that turns into flight if
// the key is held (`fixtures/jetpack`). An actor with both rows gets exactly
// that, with no third decision to make.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {
  edit,
  electTraits,
  fileOf,
  importRules,
  me,
  subjectOf,
  wears,
} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, down, hasRoot, type BlockJson} from './patch';

const FLIES = 'Jetpack#FliesWithAJetpackTrait';
const GRAVITY = 'Gravity#AffectedByGravityTrait';
/**
 * …and the keyboard, which is what makes the handlers reach this actor.
 *
 * A hat reading "when ⟨me⟩ presses space" is delivered to actors that take
 * keyboard input, so without this the two handlers are written, look right,
 * and are never called: the actor holds space and falls. Found by playing it,
 * twice — once for the missing handlers and once for this.
 */
const KEYBOARD = 'Input#TakesKeyboardInputTrait';
const TRAITS = [GRAVITY, FLIES, KEYBOARD];

const FLY_KEY = 'space';
const PRESSES = 'world_on_Input_PressesEvent';
const RELEASES = 'world_on_Input_ReleasesEvent';
const START = 'world_do_Jetpack_StartFlyingAction';
const STOP = 'world_do_Jetpack_StopFlyingAction';

/** `when ⟨me⟩ presses/releases ⟨space⟩ → start/stop ⟨me⟩ flying`. */
const handler = (
  target: EnhanceTarget,
  hat: string,
  action: string,
): BlockJson => ({
  type: hat,
  fields: {FILTER0: FLY_KEY},
  ...(target.block ? {inputs: {ACTOR: subjectOf(target)}} : {}),
  next: {block: {type: action, inputs: {VALUE: me()}}},
});

/**
 * Whether this actor already answers the fly key with that action.
 *
 * BOTH THE HAT AND WHAT IS UNDER IT, the reasoning `enhance/platformerControls`
 * spells out: space is a key a project may well press to shoot or to talk, and
 * reading such a handler as "already flies" would leave an actor that can never
 * be given a jetpack, silently.
 */
const answers =
  (target: EnhanceTarget, hat: string, action: string) =>
  (block: BlockJson): boolean => {
    if (block.type !== hat || block.fields?.FILTER0 !== FLY_KEY) {
      return false;
    }
    const named = (block.inputs?.ACTOR as {block?: BlockJson} | undefined)
      ?.block?.fields?.ACTOR;
    const mine = target.block
      ? named === `local:${target.block}`
      : named === undefined;
    return mine && [...down(block)].some(row => row.type === action);
  };

/** The two handlers flight is made of, as hat-and-action pairs. */
const HANDLERS: Array<[string, string]> = [
  [PRESSES, START],
  [RELEASES, STOP],
];

export const jetpackEnhancement: Enhancement = {
  id: 'jetpack',
  subject: 'actor',
  name: 'Flies with a jetpack',
  description:
    'Gives this actor flight it holds down: press and hold to thrust upward, let go and it falls. It carries fuel that runs out while the key is held and fills up again when it is not, so flying is a thing to spend rather than a thing to have. How hard it pushes, how fast it may fly and how much fuel it carries are blocks in its file. It falls too — a jetpack is a way of resisting a fall, so the falling comes with it.',
  brings: [
    'Flies with a Jetpack',
    'Affected by Gravity',
    'Reads the Keyboard',
    'two handlers for the space bar',
  ],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      TRAITS.every(trait => wears(contents, trait, root)) &&
      HANDLERS.every(([hat, action]) =>
        hasRoot(contents, answers(target, hat, action)),
      )
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Gravity', 'Jetpack', 'Input']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => {
          let next = electTraits(contents, root, TRAITS);
          for (const [hat, action] of HANDLERS) {
            if (!hasRoot(next, answers(target, hat, action))) {
              // Beside the definition rather than under it: a hat takes no
              // previous connection, and `DisableOrphansPlugin` grays out a
              // top-level block that has one, along with everything below it.
              next = addRoot(next, handler(target, hat, action));
            }
          }
          return next;
        });
  },
};
