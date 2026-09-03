// "Health, and a bar above it" — the first enhancement, and the case that
// argued for the idea.
//
// The Health Bar is not a thing, it is a RELATIONSHIP: a bar, an actor with
// health, and a line pointing one at the other. That is why its own
// description has to explain the wiring in prose ("point it at an actor with
// subject… or add Attached to have it ride above the actor it is about"), and
// why the import shelf cannot demonstrate one at all — there is nothing on the
// shelf with health for a bar to be about (specs/RULE_DEMOS.md). A description
// that contains a recipe is a recipe missing from the lab.
//
// WHAT IT WRITES, in the order a learner would have written it:
//
//   actors/<target>.actor    use trait ⟨Health#Has Health⟩
//   actors/healthBar.actor   use trait ⟨Attachment#Attached⟩
//   worlds/*.world           add actor ⟨Health Bar⟩ as ⟨<target>Bar⟩ do:
//                              set subject of ⟨<target>Bar⟩ to ⟨any ⟨target⟩⟩
//                              set attached to of ⟨<target>Bar⟩ to ⟨any ⟨target⟩⟩
//
// AND NOT AN OFFSET, which the first draft set to (0, -24) and then found was
// already the Attachment rule's default — chosen there for a bar over a head,
// which is this. A line saying what would have happened anyway is a line to
// keep in step with a default that may change for a reason.
//
// AS ⟨name⟩ RATHER THAN `any ⟨Health Bar⟩`, which is what the bar's header
// suggests and what the starter world does. Naming the bar it just placed means
// a project may hold a second one — a HUD bar for the player, a rider over an
// enemy's head — and this touches only the one it made. The kind is still good
// enough for the SUBJECT, because "the player" is one actor in the games this
// is for; the day it is not, that line is the one to change.
//
// EVERY WORLD, because a bar belongs to the level it is drawn in and a project
// with two levels wants one in each. A world that never places the target gets
// a bar pointed at nobody, which draws as an empty track — the same thing that
// world would show for any actor it does not have.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {pathSlug} from '../../blockly/domainBlocks';
import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt, filePath} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {append, holds, type BlockJson} from './patch';

/** Where the bar lands, which is the stem the stock import gives it. */
const BAR_PATH = 'actors/healthBar';
const HAS_HEALTH = 'Health#HasHealthTrait';
const ATTACHED = 'Attachment#AttachedTrait';

/** The Actor variable the world's `add actor … as ⟨…⟩` binds. */
const barVariable = (target: EnhanceTarget) => {
  const stem = target.path.split('/').pop() ?? 'actor';
  return {id: `enhanceHealthBar_${stem}`, name: `${stem}Bar`, type: 'Actor'};
};

/** `any ⟨kind⟩` — the actors of that kind there are. */
const anyKind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});

/** The variable the placement bound, as a socket's contents. */
const named = (variable: object) => ({
  block: {type: 'variables_get_Actor', fields: {VAR: variable}},
});

const useTrait = (trait: string): BlockJson => ({
  type: 'world_use_trait',
  fields: {TRAIT: trait},
});

/** Whether a `use trait` for `trait` is already in the file's chain. */
const hasTrait = (contents: string, trait: string): boolean =>
  holds(
    contents,
    'world_actor',
    block => block.type === 'world_use_trait' && block.fields?.TRAIT === trait,
  );

/** The rows a world gains: the bar, and the three lines that aim it. */
const placement = (target: EnhanceTarget): BlockJson => {
  const variable = barVariable(target);
  const bar = named(variable);
  return {
    type: 'world_add_actor',
    fields: {ACTOR: BAR_PATH, NAMED: 'named', VAR: variable},
    extraState: {named: true},
    inputs: {
      DO: {
        block: {
          // Whose health it shows. The bar's own property, so its block type
          // carries the file it is declared in (`blockly/ownProperties`).
          type: `world_set_${pathSlug(BAR_PATH)}_SubjectProperty`,
          inputs: {ACTOR: bar, VALUE: anyKind(target.path)},
          next: {
            block: {
              // …and where it sits, which is a separate question from what
              // it is about: a HUD bar shows the player and must not follow
              // it. How far above is the Attachment rule's own default.
              type: 'world_set_Attachment_AttachedToProperty',
              inputs: {ACTOR: bar, VALUE: anyKind(target.path)},
            },
          },
        },
      },
    },
  };
};

/** Every `.world` file in the project, by id. */
const worldIds = (source: MultiFileSource): string[] =>
  Object.keys(source.files).filter(id =>
    (filePath(source, id) ?? '').endsWith('.world'),
  );

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

/** Whether this world already places a bar for this target. */
const wired = (contents: string, target: EnhanceTarget): boolean => {
  const {id} = barVariable(target);
  return holds(contents, 'world_world', block => {
    if (block.type !== 'world_add_actor') {
      return false;
    }
    const variable = block.fields?.VAR as {id?: string} | undefined;
    return variable?.id === id;
  });
};

export const healthEnhancement: Enhancement = {
  id: 'health',
  name: 'Health, and a bar above it',
  description:
    'Gives the actor health it can lose, and a Health Bar that rides over its head showing how much is left. Anything that deals damage takes it down; at nothing left, the actor dies.',
  brings: ['Has Health', 'Attached', 'a Health Bar'],
  refuse(target: EnhanceTarget) {
    // A bar about itself would ride above its own head and draw its own empty
    // health, which is a picture of nothing rather than an error.
    return target.path === BAR_PATH
      ? 'A Health Bar cannot show its own health.'
      : undefined;
  },
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const id = fileIdAt(source, `${target.path}.actor`);
    const contents = id ? source.files[id].contents : '';
    return (
      hasTrait(contents, HAS_HEALTH) &&
      worldIds(source).some(world =>
        wired(source.files[world].contents, target),
      )
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    // The bar brings Health with it; Attachment is what makes it ride along,
    // and nothing else here would have imported it.
    current = importStockActor(current, stockActorById('healthBar')!).source;
    const attachment = STOCK_RULES.find(rule => rule.name === 'Attachment');
    if (attachment) {
      current = importStockRule(current, attachment).source;
    }

    const targetId = fileIdAt(current, `${target.path}.actor`);
    if (targetId && !hasTrait(current.files[targetId].contents, HAS_HEALTH)) {
      current = edit(current, targetId, contents =>
        append(contents, 'world_actor', [useTrait(HAS_HEALTH)]),
      );
    }

    const barId = fileIdAt(current, `${BAR_PATH}.actor`);
    if (barId && !hasTrait(current.files[barId].contents, ATTACHED)) {
      current = edit(current, barId, contents =>
        append(contents, 'world_actor', [useTrait(ATTACHED)]),
      );
    }

    for (const world of worldIds(current)) {
      if (wired(current.files[world].contents, target)) {
        continue;
      }
      current = edit(current, world, contents =>
        append(
          contents,
          'world_world',
          [placement(target)],
          [barVariable(target)],
        ),
      );
    }
    return current;
  },
};
