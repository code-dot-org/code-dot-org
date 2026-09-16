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
//   actors/<target>.actor    define actor property ⟨health bar⟩ (actor)
//                            use trait ⟨Health#Has Health⟩
//
//                            when ⟨this actor⟩ is created:
//                              add actor ⟨Health Bar⟩ as ⟨bar⟩ do:
//                                set subject of ⟨bar⟩ to ⟨this actor⟩
//                                set parent of ⟨bar⟩ to ⟨this actor⟩
//                                set local position of ⟨bar⟩ to x 0 y −24
//                                set ⟨health bar⟩ of ⟨this actor⟩ to ⟨bar⟩
//
// THE BAR IS THE ACTOR'S CHILD (specs/PARENTING.md), which is what makes it
// ride along and what takes it away again: a parent removed removes its
// children, so the handler an earlier version wrote for that — `when this
// actor is removed: remove actor ⟨health bar of this actor⟩` — is gone, and
// with it the reason the Attachment rule existed.
//
// THE ACTOR STILL REMEMBERS ITS BAR, in a property of its own, because a
// project wants to say things about it — hide it, colour it — and `as ⟨bar⟩`
// is a block scope visible in the `add actor` body and nowhere else. A
// property is what an actor has that outlives a statement.
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
// 24 ABOVE, said in the bar's own frame: `set parent` keeps the bar where it
// was made, which is wherever `add actor` put it, and one `set local position`
// after it puts it over the head whatever the actor's size or heading.
//
// The bar stays a FILE in both: `add actor ⟨Health Bar⟩` reads the same in a
// world as in an actor, and a world that defines its own actors has no more
// claim to define its own bar than to define its own Coin.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {pathSlug} from '../../blockly/domainBlocks';
import {fileIdAt} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

import {edit, electTraits, fileOf, me, subjectOf, wears} from './actorPatch';
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
/**
 * The property the actor keeps its bar in.
 *
 * The NAME is what the block says and what the block TYPE is minted from:
 * `health bar` becomes `…_HealthBarProperty` on the file that declares it
 * (`blockly/ownProperties`).
 */
const BAR_PROPERTY = 'health bar';
const BAR_PROPERTY_EXPORT = 'HealthBarProperty';

/** What an own property this actor declares is keyed by: its file. */
const ownerOf = (target: EnhanceTarget): string => target.path;

/** The variable the handler's `add actor … as ⟨…⟩` binds. */
const barVariable = (target: EnhanceTarget) => {
  const stem = target.path.split('/').pop() ?? 'actor';
  return {id: `enhanceHealthBar_${stem}`, name: `${stem}Bar`, type: 'Actor'};
};

/** The variable the placement bound, as a socket's contents. */
const named = (variable: object) => ({
  block: {type: 'variables_get_Actor', fields: {VAR: variable}},
});

/** `define property ⟨health bar⟩` — where the actor remembers what it placed. */
const declareBar = (): BlockJson => ({
  type: 'world_rule_property',
  fields: {
    TYPE: 'actor',
    ACCESS: 'writable',
    NAME: BAR_PROPERTY,
  },
});

/** Whether the actor already declares somewhere to keep its bar. */
const declaresBar = (
  contents: string,
  root: {type: string; id?: string},
): boolean =>
  holds(
    contents,
    root,
    block =>
      block.type === 'world_rule_property' &&
      block.fields?.NAME === BAR_PROPERTY,
  );

/** The hat this adds: when this actor is created, it brings its own bar. */
const handler = (target: EnhanceTarget): BlockJson => {
  const variable = barVariable(target);
  const bar = named(variable);
  return {
    type: CREATED_HAT,
    inputs: {ACTOR: subjectOf()},
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
                  // …and whose it is, which is a separate question from what
                  // it is about: a HUD bar shows the player and must not
                  // follow it. A child goes where its parent goes, and goes
                  // when its parent goes (specs/PARENTING.md).
                  type: 'world_set_Space_ParentProperty',
                  inputs: {ACTOR: bar, VALUE: me()},
                  next: {
                    block: {
                      // …and where it sits on its parent: over the head.
                      type: 'world_set_local_position',
                      inputs: {
                        ACTOR: bar,
                        X: {block: {type: 'math_number', fields: {NUM: 0}}},
                        Y: {block: {type: 'math_number', fields: {NUM: -24}}},
                      },
                      next: {
                        block: {
                          // …and the actor remembers it, because `as ⟨bar⟩`
                          // is a block scope and a project may want to say
                          // things about the bar later.
                          type: `world_set_${pathSlug(ownerOf(target))}_${BAR_PROPERTY_EXPORT}`,
                          inputs: {ACTOR: me(), VALUE: bar},
                        },
                      },
                    },
                  },
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

export const healthEnhancement: Enhancement = {
  id: 'health',
  // The ACTOR's: every line it writes lands in the actor's own chain or in a
  // hat about it, and the bar is a companion the actor makes for itself.
  subject: 'actor',
  name: 'Health, and a bar above it',
  description:
    'Gives the actor health it can lose, and a Health Bar that rides over its head showing how much is left. Every one of these actors gets its own, brought along when it appears and taken away when it goes.',
  brings: ['Has Health', 'a Health Bar it carries with it'],
  refuse(_source: MultiFileSource, target: EnhanceTarget) {
    // A bar about itself would ride above its own head and draw its own empty
    // health, which is a picture of nothing rather than an error.
    return target.path === BAR_PATH
      ? 'A Health Bar cannot show its own health.'
      : undefined;
  },
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return wears(contents, HAS_HEALTH, root) && brings(contents, target);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    // The bar brings Health with it; riding along is the engine's own
    // parenting and imports nothing.
    current = importStockActor(current, stockActorById('healthBar')!).source;

    const {path, root} = fileOf(target);
    const targetId = fileIdAt(current, path);
    if (targetId) {
      current = edit(current, targetId, contents => {
        let next = electTraits(contents, root, [HAS_HEALTH]);
        if (!declaresBar(next, root)) {
          next = append(next, root, [declareBar()]);
        }
        if (!brings(next, target)) {
          next = addRoot(next, handler(target));
          next = withVariable(next, barVariable(target));
        }
        return next;
      });
    }
    return current;
  },
};
