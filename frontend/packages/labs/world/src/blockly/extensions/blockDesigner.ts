// A designed member's signature (specs/RULE_EDITOR_PLAN.md, step 7).
//
// A member's design is data, made on its page (`actors/editor/MemberPage`);
// `define block` and `define event` are rows of a view and no longer blocks
// (`viewRows`). What is left here is what a member's head and its call
// sites read of a signature.
//
// THE PARTS. A signature is an ordered list of labels and values, the same
// shape Blockly's own `message0` has: `push %1 toward %2` is "label, param,
// label, param", and naming a member is the case where the list is one label.

import type * as Blockly from 'blockly/core';

import {paramFlavour} from '../typedVariables';
import type {ShadowSpec} from '../valueShadow';

/**
 * One piece of a block's signature: fixed wording, or a value it takes.
 *
 * A parameter's `var` is the authority — it is what the body's variable blocks
 * point at, and what survives a rename. `name` is a cache of that variable's
 * name, kept so a design has something to show before the variable is bound.
 */
export type BlockPart =
  | {kind: 'label'; text: string}
  /** A line break: what follows starts a new row (`designParts`). */
  | {kind: 'row'}
  | {
      kind: 'param';
      type: string;
      var: string;
      name?: string;
      /**
       * What a call site starts with when it is left alone.
       *
       * Seeded into the shadow block on the socket (`typedValueInputs`), which
       * is why it is stored as the plain value that shadow holds. Absent for
       * the types that have no sensible one — there is no default actor.
       *
       */
      default?: unknown;
      /**
       * …or the whole BLOCK a call site starts with.
       *
       * The general form of the line above: `this actor` for an actor, `any
       * ⟨Coin⟩` for a kind, an arithmetic tree. THE SOCKET'S STATE, not a
       * shadow tree: it is shadowed only where it becomes a default, on the
       * call site (`shadowed`), because there it is exactly a placeholder.
       */
      shadow?: SocketState;
    };

/** A value socket's contents, as Blockly serializes them. */
export interface SocketState {
  block?: ShadowSpec;
  shadow?: ShadowSpec;
}

/**
 * A socket's contents as a DEFAULT: a shadow, and everything under it too.
 *
 * Blockly writes a real block as `block` and a shadow as `shadow`, and a
 * default whose sockets held real blocks would be one a caller could only half
 * replace. Flattening the whole tree is what keeps "the caller may overwrite
 * this" true at every depth — which is what a default is.
 *
 * Exported because the call site is where a default is made, and that is
 * `domainBlocks`.
 */
export const shadowed = (state: SocketState): ShadowSpec | undefined => {
  const flatten = (saved: ShadowSpec): ShadowSpec => {
    const {type, fields, inputs} = saved as ShadowSpec & {
      inputs?: Record<string, SocketState>;
    };
    const extra = (saved as {extraState?: unknown}).extraState;
    return {
      type,
      ...(fields ? {fields} : {}),
      ...(extra === undefined ? {} : {extraState: extra}),
      ...(inputs
        ? {
            inputs: Object.fromEntries(
              Object.entries(inputs).flatMap(([name, socket]) => {
                const child = socket.block ?? socket.shadow;
                return child ? [[name, {shadow: flatten(child)}] as const] : [];
              }),
            ),
          }
        : {}),
    } as ShadowSpec;
  };
  const held = state.block ?? state.shadow;
  return held ? flatten(held) : undefined;
};

/**
 * Bind every parameter to a variable, creating and renaming to match the
 * names the design gives them.
 *
 * A parameter IS a variable — the body reads it with an ordinary getter — so
 * naming one in the design has to be a variable rename, which is what makes
 * the name change everywhere the body already uses it.
 *
 * A name is made free of this signature's earlier parameters: two inputs
 * sharing a name would generate a function with a duplicated argument, which
 * is a syntax error.
 */
export function bindParams(
  map: Blockly.IVariableMap<Blockly.IVariableModel<Blockly.IVariableState>>,
  parts: BlockPart[],
): void {
  const used = new Set<string>();
  for (const part of parts) {
    if (part.kind !== 'param') {
      continue;
    }
    const tag = paramFlavour(part.type).type;
    let variable = part.var ? map.getVariableById(part.var) : null;
    // A variable's type is fixed, so a retyped part rebinds rather than
    // carrying a variable of the wrong type into the body's getters.
    if (variable && variable.getType() !== tag) {
      variable = null;
    }
    // The bound variable's own name comes before the type, or a signature
    // saved before names were cached would rename `amount` to `number` on
    // the next rebuild — silently, and everywhere the body uses it.
    const wanted =
      (part.name ?? '').trim() || variable?.getName() || (tag as string);
    // A name elsewhere in the file is another binding's, which this one
    // hides (specs/VARIABLE_OWNERSHIP_PLAN.md).
    const free = (candidate: string): boolean =>
      !used.has(candidate.toLowerCase());
    let name = wanted;
    for (let suffix = 2; !free(name); suffix++) {
      name = `${wanted}${suffix}`;
    }
    if (!variable) {
      variable = map.createVariable(name, tag);
    } else if (variable.getName() !== name) {
      map.renameVariable(variable, name);
    }
    used.add(name.toLowerCase());
    part.var = variable.getId();
    part.name = name;
  }
}
