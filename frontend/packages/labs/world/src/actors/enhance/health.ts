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
// WHAT IT WRITES, and every line of it lands in the ACTOR:
//
//   actors/<target>.actor    use trait ⟨Health#Has Health⟩
//
//                            when ⟨this actor⟩ is created:
//                              add actor ⟨Health Bar⟩ as ⟨bar⟩ do:
//                                set subject of ⟨bar⟩ to ⟨this actor⟩
//                                set attached to of ⟨bar⟩ to ⟨this actor⟩
//
//   actors/healthBar.actor   use trait ⟨Attachment#Attached⟩
//
// NO WORLD IS TOUCHED, and that is the whole of the second draft. The first one
// placed the bar in every `.world` and pointed it with `any ⟨kind⟩`, which was
// wrong twice: giving one actor a bar meant editing files about levels, and two
// of that actor shared one bar between them, because "any" is one actor however
// many there are. An actor that hears its own creation adds its own bar, so a
// crawler and a player and six more crawlers each get one and no world knows
// anything about it.
//
// That needed an event the engine did not raise: `is created`, on the Space
// rule, queued like every other so a handler adding an actor is not growing a
// list somebody is walking (`engine/rules/spatial`).
//
// AS ⟨bar⟩ rather than `this actor`, because inside `add actor` the unnamed
// reading rebinds `this actor` to the thing being placed — and both halves of
// this wiring are about the actor that was CREATED, which is the handler's own
// subject (`blockly/extensions/addActorName`).
//
// NO OFFSET, though a bar over a head plainly needs one: 24 above is already
// the Attachment rule's default, chosen there for exactly this. A line saying
// what would have happened anyway is a line to keep in step with a default
// that may change for a reason.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {pathSlug} from '../../blockly/domainBlocks';
import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {
  addRoot,
  append,
  hasRoot,
  holds,
  withVariable,
  type BlockJson,
} from './patch';

/** Where the bar lands, which is the stem the stock import gives it. */
const BAR_PATH = 'actors/healthBar';
const HAS_HEALTH = 'Health#HasHealthTrait';
/** `when ⟨this actor⟩ is created` — the Space rule's own event, minted as a
 *  hat by the same machinery every rule event is (`blockly/domainBlocks`). */
const CREATED_HAT = 'world_on_Space_CreatedEvent';
const ATTACHED = 'Attachment#AttachedTrait';

/** `this actor` — the handler's subject, which is the actor just created. */
const me = () => ({block: {type: 'world_this_actor'}});

/** The variable the handler's `add actor … as ⟨…⟩` binds. */
const barVariable = (target: EnhanceTarget) => {
  const stem = target.path.split('/').pop() ?? 'actor';
  return {id: `enhanceHealthBar_${stem}`, name: `${stem}Bar`, type: 'Actor'};
};

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

/** The hat this adds: when this actor is created, it brings its own bar. */
const handler = (target: EnhanceTarget): BlockJson => {
  const variable = barVariable(target);
  const bar = named(variable);
  return {
    type: CREATED_HAT,
    inputs: {ACTOR: me()},
    next: {
      block: {
        type: 'world_add_actor',
        fields: {ACTOR: BAR_PATH, NAMED: 'named', VAR: variable},
        extraState: {named: true},
        inputs: {
          DO: {
            block: {
              // Whose health it shows. The bar's own property, so its block
              // type carries the file it is declared in
              // (`blockly/ownProperties`).
              type: `world_set_${pathSlug(BAR_PATH)}_SubjectProperty`,
              inputs: {ACTOR: bar, VALUE: me()},
              next: {
                block: {
                  // …and where it sits, which is a separate question from
                  // what it is about: a HUD bar shows the player and must not
                  // follow it. How far above is the Attachment rule's default.
                  type: 'world_set_Attachment_AttachedToProperty',
                  inputs: {ACTOR: bar, VALUE: me()},
                },
              },
            },
          },
        },
      },
    },
  };
};

/** Whether this actor already brings its own bar. */
const brings = (contents: string, target: EnhanceTarget): boolean => {
  const {id} = barVariable(target);
  return hasRoot(contents, block => {
    if (block.type !== 'world_add_actor') {
      return false;
    }
    const variable = block.fields?.VAR as {id?: string} | undefined;
    return variable?.id === id;
  });
};

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
    return hasTrait(contents, HAS_HEALTH) && brings(contents, target);
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
    if (targetId) {
      current = edit(current, targetId, contents => {
        let next = contents;
        if (!hasTrait(next, HAS_HEALTH)) {
          next = append(next, 'world_actor', [useTrait(HAS_HEALTH)]);
        }
        if (!brings(next, target)) {
          next = addRoot(next, handler(target));
          next = withVariable(next, barVariable(target));
        }
        return next;
      });
    }

    const barId = fileIdAt(current, `${BAR_PATH}.actor`);
    if (barId && !hasTrait(current.files[barId].contents, ATTACHED)) {
      current = edit(current, barId, contents =>
        append(contents, 'world_actor', [useTrait(ATTACHED)]),
      );
    }
    return current;
  },
};
