// The blocks the agent may use, and what each one says.
//
// Without this the model invents block types. With it, writing a workspace is
// a constrained task: pick a type from the list, fill the fields and inputs
// `args0` names, chain statements with `next`.
//
// TRIMMED HARD. The full definitions are 73,000 characters — colors, tooltips,
// help urls, style names, extension lists, none of which a caller needs. What
// is left is 32,000: the type, the sentence the block says, its sockets, and
// whether it stacks or plugs in. `message0` is the same string the student
// reads on the block, which is the point: a tutor that says "add a `take
// ⟨amount⟩ damage` block" and a project that has one are talking about the
// same thing.

import {buildDomainPalette, DOMAIN_BLOCKS} from '../blockly/domainBlocks';
import type {RuleMeta} from '../blockly/ruleMeta';

/** A block definition, as Blockly declares it. */
interface BlockDefinition {
  type?: string;
  message0?: string;
  args0?: unknown[];
  previousStatement?: unknown;
  nextStatement?: unknown;
  output?: unknown;
}

/** What a caller needs to write one. */
export interface CatalogueEntry {
  type: string;
  /** The sentence the block says; `%1` and friends are its sockets. */
  says?: string;
  /** The sockets, in order — a field to fill or an input to plug into. */
  args?: unknown[];
  /** True for a block that stacks in a sequence rather than plugging in. */
  statement?: boolean;
  /** What a value block returns, when it is one. */
  returns?: unknown;
}

export const catalogueEntry = (block: BlockDefinition): CatalogueEntry => ({
  type: block.type ?? '',
  ...(block.message0 ? {says: block.message0} : {}),
  ...(block.args0?.length ? {args: block.args0} : {}),
  ...(block.previousStatement !== undefined || block.nextStatement !== undefined
    ? {statement: true}
    : {}),
  ...(block.output !== undefined ? {returns: block.output} : {}),
});

/**
 * Every block this project can use — the built-ins plus its own rules'.
 *
 * A project's `.rule` files contribute set/get/action/query/event blocks
 * exactly as a built-in does (`buildDomainPalette`), so a catalogue built
 * without them would omit precisely the blocks the student's own rules provide.
 */
export const blockCatalogue = (
  projectRules: readonly RuleMeta[],
): CatalogueEntry[] => {
  const {blocks} = buildDomainPalette(projectRules, {allRuleModules: true});
  const all = [...(DOMAIN_BLOCKS as BlockDefinition[]), ...blocks];
  const seen = new Set<string>();
  const entries: CatalogueEntry[] = [];
  for (const block of all) {
    const entry = catalogueEntry(block);
    if (!entry.type || seen.has(entry.type)) {
      continue;
    }
    seen.add(entry.type);
    entries.push(entry);
  }
  return entries.sort((a, b) => a.type.localeCompare(b.type));
};
