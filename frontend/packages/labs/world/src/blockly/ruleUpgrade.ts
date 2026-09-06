// Bringing a `.rule` written before steps were members up to date.
//
// A rule-level step used to be a definition ROOT standing beside `define
// rule`, with its body as the chain below it. It had to be: the body was
// hundreds of blocks long, and chaining it under the rule would have made one
// enormous column. Bodies live on their own surface now, so a step is one row
// like every other member — and a member's `next` is the member after it,
// which leaves the body needing the `do` mouth instead.
//
// AN OLD FILE DOES NOT SIMPLY LOOK WRONG. `world_rule_step_in` has a previous
// connection now, and `DisableOrphansPlugin` reads a top-level block with one
// as an orphan: the step and everything under it would be drawn greyed out and
// generate nothing, with no message saying why. So the shape is corrected on
// the way in, at every place a rule file is read.
//
// It is a rewrite of the DOCUMENT, not of the file: nothing is saved until the
// learner edits something, and then it is saved in the shape the editor now
// writes.

/** A saved block, as Blockly writes one. */
interface SavedBlock {
  type?: string;
  inputs?: Record<string, {block?: SavedBlock; shadow?: SavedBlock}>;
  next?: {block?: SavedBlock};
  [key: string]: unknown;
}

interface SavedDocument {
  blocks?: {blocks?: SavedBlock[]};
  [key: string]: unknown;
}

const isStep = (block: SavedBlock): boolean =>
  Boolean(block.type?.startsWith('world_rule_step'));

/** The last block in a chain, so a member can be added after it. */
const endOf = (block: SavedBlock): SavedBlock => {
  let at = block;
  while (at.next?.block) {
    at = at.next.block;
  }
  return at;
};

/**
 * `document` with any rule-level step roots chained onto the rule as members.
 *
 * Identity — the same object — when there are none, which is every file
 * written since the change and every file that never had a step.
 */
export function upgradeRuleDocument<T>(document: T): T {
  const parsed = document as SavedDocument;
  const roots = parsed.blocks?.blocks;
  if (!Array.isArray(roots) || !roots.some(isStep)) {
    return document;
  }
  const rule = roots.find(block => block.type === 'world_rule');
  if (!rule) {
    // Steps but no rule is not a shape this can mend, and guessing would make
    // a worse file than the one it was handed.
    return document;
  }

  const moved = roots.filter(isStep).map(step => {
    const {next, x, y, ...rest} = step;
    void x;
    void y;
    return {
      ...rest,
      // The chain below became the mouth. A step with nothing under it had no
      // body and still has none.
      ...(next?.block
        ? {inputs: {...(step.inputs ?? {}), DO: {block: next.block}}}
        : {}),
    } as SavedBlock;
  });

  // Onto the END of what the rule already declares, in the order they stood
  // beside it — a file's own order is the only order there is to keep.
  const chained = moved.reduceRight<SavedBlock | undefined>(
    (rest, step) => ({...step, ...(rest ? {next: {block: rest}} : {})}),
    undefined,
  );
  const owner = rule.next?.block ? endOf(rule.next.block) : rule;
  const withMembers = {...owner, ...(chained ? {next: {block: chained}} : {})};

  // Rebuilt rather than mutated: the rule is a tree of frozen-ish objects the
  // caller may still be holding, and a load that half-edited one would be very
  // hard to see.
  const graft = (block: SavedBlock): SavedBlock => {
    if (block === owner) {
      return withMembers;
    }
    return block.next?.block
      ? {...block, next: {block: graft(block.next.block)}}
      : block;
  };

  return {
    ...parsed,
    blocks: {
      ...parsed.blocks,
      blocks: roots.filter(block => !isStep(block)).map(graft),
    },
  } as T;
}
