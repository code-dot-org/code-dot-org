// One toolbox per surface: declarations out front, implementation inside.
//
// specs/NEXT.md §8. A rule's workspace is now two surfaces — what the rule
// OFFERS, and the body behind each `define …` — and the blocks that belong to
// them barely overlap. `define property` on a body surface would declare
// something in the middle of an implementation; `return` on the interface has
// no query to report from. Offering both everywhere is what made a rule's
// toolbox long enough to be worth splitting in the first place.
//
// A MENU, NOT THE KITCHEN — the same bargain `toolboxFilter` makes. Every
// block stays defined, so a file that already holds one still renders and
// still generates code. What changes is what is offered where.
//
// BY BLOCK TYPE, NOT BY CATEGORY, because the declarations are scattered:
// `define property` is offered under Actor, World AND Rule, and `define block`
// under Actor and Rule. Filtering the Rule category alone would leave the
// others behind, which is the mistake the first draft of the interface split
// made in the serializer (`bodySurfaces`).

import type {Toolbox, ToolboxCategory} from '@code-dot-org/blockly';

import {HIDE_BODIES} from './bodySurfaces';
import {DRAWING_CATEGORY} from './domainBlocks';

/**
 * Which surface a toolbox is being built for.
 *
 * `interface` is the rule itself. `body` is a member's implementation. `event`
 * is the odd one: `define event` has a surface but no implementation — an
 * event is a declaration, and the blocks that run for it live under the hat it
 * makes, in whatever file cares — so there is nowhere on it to put a
 * statement, and offering any would be offering blocks with no socket.
 *
 * `drawing` is a body with ONE MORE DRAWER. The pen and the shapes are the
 * only blocks in the lab that can be used in exactly one place — `pen` is
 * bound by the closure a drawing generates and nowhere else — so this is the
 * only surface that offers them, and every file's toolbox is one drawer
 * shorter for it.
 */
export type Surface = 'interface' | 'body' | 'event' | 'drawing';

/** The drawer holding what a definition's own block is made of. */
const SIGNATURE_DRAWER = 'Block';

/** What each surface writes its arguments in. */
const ARGUMENT_BLOCK = 'world_signature_argument';
const CHOICE_BLOCK = 'world_signature_choice';

/**
 * Blocks that say what a rule OFFERS.
 *
 * Every one of them is a declaration: it adds a property, a trait, an event, a
 * block or a step to the rule itself. None can appear inside an
 * implementation — a body is statements, and these are the things statements
 * get attached to.
 */
const DECLARATIONS: ReadonlySet<string> = new Set([
  'world_rule',
  'world_use_rule',
  'world_rule_trait',
  'world_use_trait',
  'world_rule_property',
  'world_rule_event',
  'world_rule_enum',
  'world_rule_enum_option',
  'world_rule_block',
  'world_rule_step_tick',
  'world_rule_step_in',
  'world_trait_step',
]);

/**
 * Blocks that only mean anything inside an implementation.
 *
 * `return` reports from the query it is written in, and `delta` is how long
 * the frame took — both are questions about a body that is running, and the
 * interface has no body to run.
 */
const IMPLEMENTATION: ReadonlySet<string> = new Set([
  'world_return',
  'world_step_delta',
  // The signature's own blocks. They go in the `arguments` row on a
  // definition's own surface — the interface has no such row, so offering them
  // there would be offering blocks with nowhere to put them.
  ARGUMENT_BLOCK,
  CHOICE_BLOCK,
  'world_signature_text',
]);

/** The type a toolbox entry offers, however it is written. */
const typeOf = (entry: unknown): string | undefined => {
  if (typeof entry === 'string') {
    return entry;
  }
  const item = entry as {kind?: string; type?: string};
  return item?.type;
};

const wanted = (surface: Surface, entry: unknown): boolean => {
  const type = typeOf(entry);
  if (!type) {
    // A separator, a label, a button — not a block, and not ours to judge.
    return true;
  }
  if (surface === 'event') {
    // An event's argument is a FILTER, and a filter over "any number" is a
    // comparison rather than a hat — so it takes choices and wording, and the
    // typed `argument` is not offered rather than offered and then refused.
    return type === CHOICE_BLOCK || type === 'world_signature_text';
  }
  if (surface === 'body') {
    // …and the choice item is the event's alone: a `define block` says the
    // same thing by picking an enum in `argument`'s type dropdown.
    return !DECLARATIONS.has(type) && type !== CHOICE_BLOCK;
  }
  return !IMPLEMENTATION.has(type);
};

/**
 * `toolbox` with only the blocks that can be used on this surface.
 *
 * Identity when the editor is not splitting rules at all: with `HIDE_BODIES`
 * off there is one surface holding both, and taking `return` off it would
 * leave no way to write a query.
 */
export function toolboxForSurface(toolbox: Toolbox, surface: Surface): Toolbox {
  if (!HIDE_BODIES || !Array.isArray(toolbox)) {
    return toolbox;
  }
  const categories = toolbox as ToolboxCategory[];
  // An event surface offers ONE drawer. There is no socket on it for anything
  // else, so a full toolbox there is a wall of blocks that cannot be used.
  //
  // A DRAWING'S SURFACE GETS ONE MORE, and it is the only place that does. The
  // pen and the shapes are added here rather than filtered in, because no
  // file's toolbox carries them any more (`structuralCategories`) — there is
  // nowhere else they could be used, so nowhere else offers them. First, since
  // it is what this surface is FOR.
  const chosen =
    surface === 'event'
      ? categories.filter(category => category.name === SIGNATURE_DRAWER)
      : surface === 'drawing'
        ? [DRAWING_CATEGORY, ...categories]
        : categories;
  return chosen
    .map(category => {
      if (!category.blocks) {
        return category;
      }
      return {
        ...category,
        blocks: category.blocks.filter(entry => wanted(surface, entry)),
      };
    })
    .filter(category => {
      // A row that is not a category — the heading over the rules
      // (`blockly/toolboxStyle`) — has no blocks to count and is not an empty
      // drawer. It divides whatever survives this.
      if (typeof (category as {kind?: string}).kind === 'string') {
        return true;
      }
      // A category with nothing left is a heading onto an empty drawer. One
      // that fills itself when opened keeps its place: `blocks` is only the
      // fixed part of it, and what `onLoad` will offer is not knowable here.
      const dynamic = (category as {onLoad?: unknown}).onLoad;
      return Boolean(dynamic) || (category.blocks?.length ?? 0) > 0;
    }) as Toolbox;
}
