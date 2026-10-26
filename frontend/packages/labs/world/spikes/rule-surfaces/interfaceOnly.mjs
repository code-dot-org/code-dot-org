// A rule workspace with its implementations taken out.
//
// specs/NEXT.md §8 proposes that a rule open as its INTERFACE — the rule, its
// traits and properties, each designed block's signature, each step's name and
// phase — with a body built only when somebody opens it. This is that
// transform, written to measure what the split would buy before any of it is
// built for real.
//
// A body hangs off one of two places, and which one is not a detail: `next`
// on a root that is a HAT (a rule-level step, a behavior — what follows it is
// what runs) and the `DO` input on a member (a trait's step, a designed
// block). The same `next` field on `define rule` and `define trait` holds
// their MEMBERS, which are interface and stay. Reading `next` as "body"
// everywhere would empty the rule; reading only `DO` as "body" leaves every
// rule-level step behind, which is what the first draft of this did.

/** Roots whose `next` chain is what they run. */
const BODY_IN_NEXT = new Set([
  'world_rule_step_in',
  'world_rule_step_tick',
  'world_behavior',
]);

/** Members whose `DO` input is what they run. */
const BODY_IN_DO = new Set(['world_rule_block', 'world_trait_step']);

const strip = node => {
  const out = {...node};
  if (node.inputs) {
    const inputs = {};
    for (const [name, value] of Object.entries(node.inputs)) {
      // The body goes; every other socket is part of the signature (a
      // parameter's shadow, a property's default) and is kept.
      if (name === 'DO' && BODY_IN_DO.has(node.type)) {
        continue;
      }
      const block = value.block ? {...value, block: strip(value.block)} : value;
      inputs[name] = block;
    }
    out.inputs = inputs;
  }
  if (node.next?.block) {
    if (BODY_IN_NEXT.has(node.type)) {
      delete out.next;
    } else {
      out.next = {block: strip(node.next.block)};
    }
  }
  return out;
};

/** The same document with every body removed. */
export const interfaceOnly = doc => ({
  ...doc,
  blocks: {...doc.blocks, blocks: doc.blocks.blocks.map(strip)},
});

/** How many blocks a document holds, counting every socket and every `next`. */
export const countBlocks = doc => {
  const one = node => {
    let n = 1;
    for (const value of Object.values(node.inputs ?? {})) {
      const block = value.block ?? value.shadow;
      if (block) {
        n += one(block);
      }
    }
    if (node.next?.block) {
      n += one(node.next.block);
    }
    return n;
  };
  return doc.blocks.blocks.reduce((sum, block) => sum + one(block), 0);
};
