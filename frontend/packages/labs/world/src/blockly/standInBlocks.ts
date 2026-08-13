// A definition for a block whose rule the project has not got.
//
// THE PROBLEM THIS SOLVES IS NOT CODE GENERATION. A member block names its
// member in its block TYPE — `world_query_Gravity_IsOnTheGroundQuery` — and
// those types are minted from the rule's metadata when the palette is built.
// Delete `rules/gravity.rule` and, on the next page load, nothing mints them.
// Blockly refuses to deserialize a type it does not know:
//
//   TypeError: Invalid block definition for type: world_query_Gravity_…
//
// and the editor component throws, so `player.actor` renders NOTHING. Not a
// broken block in a working file — no file. That is worse than the compile
// error it replaced, and it is what the generator guards could not reach.
//
// So a definition is synthesised from the SAVED STATE. The block is a fact
// about what a file holds, and a file that holds one is describing it: which
// fields it has, which sockets, and — from where it sits — whether it is a
// value or a statement. Enough to build something Blockly will load.
//
// WHAT THIS BUYS, AND WHY IT IS WORTH THE MACHINERY. The stand-in is a real
// block with the file's real fields and the file's real children, so:
//
//   - the file opens, and everything else in it works;
//   - the handler body under a dead hat is still there, still readable, still
//     editable — it was never anybody's to delete;
//   - the file SAVES BACK UNCHANGED. The fields hold their values and the
//     sockets hold their blocks, so a load-and-save round trip through a
//     missing rule loses nothing. That is the whole reason the fields are
//     `field_label_serializable` rather than plain labels;
//   - put the rule back and the real definition is registered over this one,
//     and the block is a working block again with everything still in it.
//
// It generates nothing, and it wears the same warning every other dead
// reference does (extensions/missingRule).

import type {BlockArgDefinition, BlockDefinition} from '@code-dot-org/blockly';
import {Blockly, defineBlock} from '@code-dot-org/blockly';

import {translate} from '../effect/localization';

import {missingRuleExtension} from './extensions/missingRule';
import {registerStandInRule} from './ruleRegistry';

/** A block as it appears in a serialized workspace — only what is read here. */
interface BlockState {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: BlockState; shadow?: BlockState}>;
  next?: {block?: BlockState; shadow?: BlockState};
}

/** Where a block sits, which is the only thing that says what SHAPE it is. */
type Shape = 'value' | 'statement';

/**
 * The rule a member block type belongs to, read back out of the type.
 *
 * The type is minted as `world_<kind>_<RuleSlug>_<Export>`, and the slug has
 * had its punctuation taken out (`ruleSlug`), so "Arrow Keys" comes back as
 * "ArrowKeys" and has to be split on its capitals again. That is lossy for a
 * rule whose name is not simply words — but the name is for a sentence in a
 * warning, and "Arrow Keys" is what it needs to say.
 */
function ruleNameOfType(type: string): string | undefined {
  const match =
    /^world_(?:on|emit|do|query|get|set|push|drop)_([A-Za-z0-9]+)_/.exec(type);
  if (!match) {
    return undefined;
  }
  return match[1].replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

/** The member's own words, for the block's face: `IsOnTheGroundQuery` → "is on the ground". */
function memberWordsOfType(type: string): string {
  const rest = type.replace(
    /^world_(?:on|emit|do|query|get|set|push|drop)_[A-Za-z0-9]+_/,
    '',
  );
  const words = rest
    .replace(/(Query|Action|Property|Event|Trait)$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return words || rest;
}

/**
 * Build a definition that will load `state`.
 *
 * Every field the state carries becomes a serializable LABEL: it shows what
 * was chosen and cannot be changed, which is the honest offer — the choices
 * came from a rule that is not here to say what they were. Every input becomes
 * a value socket, because that is what a rule member's parameters are; a rule's
 * own authoring blocks (which do have statement inputs) are built in and never
 * go missing.
 */
function standInFor(type: string, state: BlockState, shape: Shape) {
  const fields = Object.keys(state.fields ?? {});
  const inputs = Object.keys(state.inputs ?? {});
  let message0 = memberWordsOfType(type);
  const args0: BlockArgDefinition[] = [];
  for (const name of fields) {
    args0.push({type: 'field_label_serializable', name, text: ''});
    message0 += ` %${args0.length}`;
  }
  for (const name of inputs) {
    args0.push({type: 'input_value', name});
    message0 += ` %${args0.length}`;
  }
  const rule = ruleNameOfType(type);
  registerStandInRule(type, rule);
  return defineBlock({
    type,
    message0: message0.trim() || type,
    args0,
    inputsInline: true,
    // A value where it was plugged into a socket, a statement where it stood in
    // a chain. The value's output is `null` — no type at all — because whatever
    // it was plugged into is what it has to go on plugging into, and the type
    // that would have said so went with the rule.
    ...(shape === 'value'
      ? {output: null}
      : {previousStatement: true, nextStatement: true}),
    extensions: [missingRuleExtension],
    style: 'default',
    tooltip: translate(
      'This block belongs to a rule your project no longer has. It is kept so nothing in this file is lost.',
    ),
    generator: {
      // Nothing, on the same terms as every other dead reference: a rule that
      // is not there cannot be asked anything. A value one has to report
      // SOMETHING, and `null` is the emptiest answer that reads as false, adds
      // as zero, and is what a socket with nothing in it would have given.
      javascript() {
        return shape === 'value' ? (['null', 0] as [string, number]) : '';
      },
    },
  });
}

/**
 * Whether a block in an input is a statement rather than a value.
 *
 * Blockly's serialization does not say: a statement input's child and a value
 * input's child are written exactly alike, and only the DEFINITION knows which
 * kind of input it was — which for a stand-in is the definition that is gone.
 *
 * So it is read off the state. A block with a `next` is a statement, because
 * only statements chain; failing that, the input's NAME is the convention every
 * statement input in Blockly and in this lab follows. Wrong only for a dead
 * member block, alone, in a statement input called none of these — and the cost
 * of being wrong is one block refusing to connect, in a file that opens.
 */
const STATEMENT_INPUT = /^(DO\d*|ELSE|STACK|BODY)$/;
const shapeInInput = (name: string, child: BlockState | undefined): Shape =>
  child?.next || STATEMENT_INPUT.test(name) ? 'statement' : 'value';

/**
 * Definitions for every block type in `contents` that nothing else defines.
 *
 * TWO SOURCES OF "known", and leaving either out is a bug that looks like this
 * one did: `defined` is what the palette mints for the project's rules, and
 * `Blockly.Blocks` is everything registered — Blockly's own `controls_if` and
 * `math_arithmetic` among them, which the palette never lists and which would
 * otherwise be stood in for. A stand-in for `controls_if` gets a VALUE socket
 * where its `DO0` should be, and the first statement inside it refuses to
 * connect: "is missing a(n) output connection".
 */
export function standInBlocks(
  contents: readonly string[],
  defined: ReadonlySet<string>,
): BlockDefinition[] {
  const known = (type: string): boolean =>
    defined.has(type) || type in Blockly.Blocks;
  const wanted = new Map<string, {state: BlockState; shape: Shape}>();
  const visit = (block: BlockState | undefined, shape: Shape): void => {
    if (!block?.type) {
      return;
    }
    if (!known(block.type) && !wanted.has(block.type)) {
      wanted.set(block.type, {state: block, shape});
    }
    for (const [name, input] of Object.entries(block.inputs ?? {})) {
      const child = input?.block ?? input?.shadow;
      visit(child, shapeInInput(name, child));
    }
    visit(block.next?.block ?? block.next?.shadow, 'statement');
  };
  for (const source of contents) {
    try {
      const roots = (JSON.parse(source) as {blocks?: {blocks?: BlockState[]}})
        .blocks?.blocks;
      for (const root of roots ?? []) {
        // A top-level block is a statement: a hat, or a stack somebody moved
        // aside. Nothing is a value at the root of a workspace.
        visit(root, 'statement');
      }
    } catch {
      // Not valid JSON yet (mid-edit); it has nothing to say about types.
    }
  }
  return [...wanted].map(([type, {state, shape}]) =>
    standInFor(type, state, shape),
  );
}
