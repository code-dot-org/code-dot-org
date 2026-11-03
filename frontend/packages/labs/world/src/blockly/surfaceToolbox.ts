// One toolbox per surface: a whole file, or a page of one thing's code.
//
// A page is one body under its head (`pageHeads`), and offers what a body can
// use: `return` and `delta` among it, which a whole file has no body to run.
// A drawing's page alone offers the pen and the shapes.
//
// A MENU, NOT THE KITCHEN — the same bargain `toolboxFilter` makes. Every
// block stays defined, so a file that already holds one still renders and
// still generates code. What changes is what is offered where.

import type {Toolbox, ToolboxCategory} from '@code-dot-org/blockly';

import {DRAWING_CATEGORY} from './domainBlocks';

/**
 * Which surface a toolbox is being built for: a whole file (`interface`), a
 * block's or a step's page (`body`), or a drawing's page (`drawing`), which
 * is a body with the one drawer whose blocks bind `pen` and can be used
 * nowhere else.
 */
export type Surface = 'interface' | 'body' | 'drawing';

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
  // A separator, a label, a button — not a block, and not ours to judge.
  return !type || surface !== 'interface' || !IMPLEMENTATION.has(type);
};

/** `toolbox` with only the blocks that can be used on this surface. */
export function toolboxForSurface(toolbox: Toolbox, surface: Surface): Toolbox {
  if (!Array.isArray(toolbox)) {
    return toolbox;
  }
  const categories = toolbox as ToolboxCategory[];
  // A DRAWING'S SURFACE GETS ONE MORE drawer, and it is the only place that
  // does. The pen and the shapes are added here rather than filtered in,
  // because no file's toolbox carries them any more (`structuralCategories`)
  // — there is nowhere else they could be used, so nowhere else offers them.
  // First, since it is what this surface is FOR.
  const chosen =
    surface === 'drawing' ? [DRAWING_CATEGORY, ...categories] : categories;
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
