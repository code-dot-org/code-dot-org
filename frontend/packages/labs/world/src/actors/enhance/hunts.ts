// Rows that set an actor after somebody — the shape, and the two new ones.
//
// THREE ROWS ASK THE SAME QUESTION AND WRITE THE SAME ANSWER. Steering chases,
// Flapping swoops, Prowling patrols until you are close and then comes for
// you. Each is a trait plus one line saying WHO, and that line is the same
// line every time: on the frame the actor arrives, set its quarry to the first
// actor of a kind.
//
// WHEN IT IS CREATED, rather than every frame or once in the world. Every
// frame asks sixty times a second a question whose answer changes once; once
// in the world aims the hunters that were there at the start and leaves every
// later one standing, which is exactly what a spawner makes.
//
// `first actor of`, because these properties hold ONE actor and `any ⟨kind⟩`
// is a list. Handed the list the socket takes a value of the wrong shape: it
// still compiles, and the hunter still stands still.
//
// ASKED AGAIN, IT REPOINTS. An actor hunts one thing, so saying it twice is a
// learner changing their mind rather than asking for a second hat.
//
// This was `enhance/chases` alone until there were three of it. What differs
// between them is a rule, a trait or three, and the name of the property —
// which is what the spec below carries.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {actorChoices} from './actorChoices';
import {
  edit,
  electTraits,
  fileOf,
  importRules,
  kindOf,
  me,
  subjectOf,
  wears,
} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, down, rootsOf, type BlockJson} from './patch';

const CREATED_HAT = 'world_on_Space_CreatedEvent';

/** What one hunting row is, beyond the shape they share. */
export interface HuntSpec {
  id: string;
  name: string;
  description: string;
  brings: readonly string[];
  /** What the question is called under the row. */
  label: string;
  /** The stock rules the trait needs in the project. */
  rules: readonly string[];
  /** Everything the actor must wear, the hunting trait among them. */
  traits: readonly string[];
  /** The `set …` block that names the quarry. */
  property: string;
}

/** `first actor of ⟨any ⟨kind⟩⟩` — the property holds one, not a list. */
const firstOf = (actor: string) => ({
  block: {type: 'world_first_actor', inputs: {SOURCE: kindOf(actor)}},
});

export const huntRow = (spec: HuntSpec): Enhancement => {
  /** The hat this adds: when it appears, it learns what it is after. */
  const handler = (target: EnhanceTarget, actor: string): BlockJson => ({
    type: CREATED_HAT,
    inputs: {ACTOR: subjectOf(target)},
    next: {
      block: {
        type: spec.property,
        inputs: {ACTOR: me(), VALUE: firstOf(actor)},
      },
    },
  });

  /** Whether a block is the hat this wrote, about this actor. */
  const isOurs = (target: EnhanceTarget) => (block: BlockJson) => {
    if (block.type !== CREATED_HAT) {
      return false;
    }
    const named = (block.inputs?.ACTOR as {block?: BlockJson} | undefined)
      ?.block?.fields?.ACTOR;
    const mine = target.block
      ? named === `local:${target.block}`
      : named === undefined;
    return mine && [...down(block)].some(row => row.type === spec.property);
  };

  /** Who that hat currently points at, if the file holds one. */
  const aimedAt = (
    contents: string,
    target: EnhanceTarget,
  ): string | undefined => {
    for (const root of rootsOf(contents)) {
      if (!isOurs(target)(root)) {
        continue;
      }
      for (const row of down(root)) {
        if (row.type !== spec.property) {
          continue;
        }
        const value = (row.inputs?.VALUE as {block?: BlockJson} | undefined)
          ?.block;
        const from = (value?.inputs?.SOURCE as {block?: BlockJson} | undefined)
          ?.block;
        return from?.fields?.ACTOR as string | undefined;
      }
    }
    return undefined;
  };

  /** Aim the hat this wrote somewhere else, in place. */
  const repoint = (
    contents: string,
    target: EnhanceTarget,
    actor: string,
  ): string => {
    const workspace = JSON.parse(contents) as {blocks?: {blocks?: BlockJson[]}};
    for (const root of workspace.blocks?.blocks ?? []) {
      if (!isOurs(target)(root)) {
        continue;
      }
      for (const row of down(root)) {
        if (row.type === spec.property) {
          row.inputs = {...row.inputs, VALUE: firstOf(actor)};
        }
      }
    }
    return JSON.stringify(workspace, null, 2);
  };

  return {
    id: spec.id,
    subject: 'actor',
    name: spec.name,
    description: spec.description,
    brings: spec.brings,
    asks: {label: spec.label, options: actorChoices},
    applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
      const {path, root} = fileOf(target);
      const id = fileIdAt(source, path);
      const contents = id ? source.files[id].contents : '';
      return (
        spec.traits.every(trait => wears(contents, trait, root)) &&
        answer !== undefined &&
        aimedAt(contents, target) === answer
      );
    },
    apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
      if (answer === undefined) {
        return source;
      }
      const current = importRules(source, spec.rules);
      const {path, root} = fileOf(target);
      const id = fileIdAt(current, path);
      if (id === undefined) {
        return current;
      }
      return edit(current, id, contents => {
        const next = electTraits(contents, root, spec.traits);
        return aimedAt(next, target) === undefined
          ? // Beside the definition rather than under it: a hat takes no
            // previous connection, and `DisableOrphansPlugin` grays out a
            // top-level block that has one along with everything below it.
            addRoot(next, handler(target, answer))
          : repoint(next, target, answer);
      });
    },
  };
};

/**
 * "Flaps and glides" — the bat.
 *
 * ONE TRAIT AND NOTHING ELSE, which is what the jetpack level's Bat wears
 * (`fixtures/jetpack`): it is not affected by gravity, because flapping IS its
 * relationship with the vertical. An actor given both would be fighting itself.
 */
export const flapsEnhancement = huntRow({
  id: 'flaps',
  name: 'Flaps and glides',
  description:
    'Sets this actor flying after somebody in beats: a few flaps upward, then a glide down, then again — a bat, a bird, anything that does not hold a height. It ignores the ground entirely, so it crosses gaps and ledges that a walker cannot. How hard it flaps, how long it glides and how fast it travels are blocks in its file.',
  brings: ['Flaps and Glides', 'a line saying who'],
  label: 'Hunting',
  rules: ['Flapping'],
  traits: ['Flapping#FlapsAndGlidesTrait'],
  property: 'world_set_Flapping_ActorToHuntProperty',
});

/**
 * "Hunts you when you get close" — the prowler.
 *
 * THREE TRAITS, because prowling is a walker's behaviour rather than a flier's:
 * it falls, and it climbs to reach you. The Robot in the jetpack level wears
 * exactly these three, and the rule declares both dependencies itself
 * (`rules/stock/prowling`).
 */
export const prowlsEnhancement = huntRow({
  id: 'prowls',
  name: 'Hunts you when you get close',
  description:
    'Sets this actor pacing on its own until somebody comes near, and then coming after them — and giving up and going back to its beat when they get away. It walks the ground rather than flying, falling where there is nothing under it and climbing what can be climbed to follow. How near is near enough, and how fast it goes, are blocks in its file.',
  brings: ['Prowls', 'Affected by Gravity', 'Climbs', 'a line saying who'],
  label: 'Hunting',
  rules: ['Gravity', 'Climbing', 'Prowling'],
  traits: [
    'Gravity#AffectedByGravityTrait',
    'Climbing#ClimbsTrait',
    'Prowling#ProwlsTrait',
  ],
  property: 'world_set_Prowling_ActorToHuntProperty',
});
