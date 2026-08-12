// Choices — a named set of string values (specs/ENUMS.md).
//
// An enum is an AUTHORING construct and nothing else. Its values are plain
// strings at runtime, the engine never learns that one exists, and no generated
// code mentions it: what it buys is at the edit surface, where an argument
// typed by an enum is a dropdown of its choices rather than a free text field,
// and an event argument typed by one is a filter.
//
// That is why this file holds no `exportName` and issues no `MemberRef`. A rule
// MEMBER is a thing generated code names (`WorldLab.SpriteProperty`); an enum
// is a thing the editor knows and the emitted JavaScript has already forgotten
// — the string is the whole of what survives.
//
// Two sources, as with rules. The engine's `Key` is the list `world_key` has
// always carried, given a name so a rule can point at it instead of rebuilding
// it; a rule's own arrive from `define choices` (ENUMS.md step 3).

import type {ArgType} from '../engine';
import {KEY_CHOICES} from '../engine/core/keys';
import {BUTTON_CHOICES} from '../engine/core/pointer';

/** A named set of string choices. */
export interface EnumMeta {
  /**
   * Who declares it — `Engine`, or a rule's NAME.
   *
   * A name rather than a path, like every other reference in the language, so
   * the rule that owns an enum can be renamed or moved and the blocks that use
   * it still resolve (ruleRegistry).
   */
  readonly owner: string;
  /** What it is called — `Key`. */
  readonly name: string;
  /**
   * The choices: what a learner reads, and what the block emits.
   *
   * They differ, and have to. The keyboard's space bar reads `space` and is
   * the string `" "`; its arrows read `up arrow` and are `"ArrowUp"`. A
   * learner-authored enum will normally have the two the same, which is what
   * `define choices` will produce.
   */
  readonly options: ReadonlyArray<readonly [label: string, value: string]>;
}

/** The stored form of a reference to an enum: `<Owner>#<Name>`. */
export function enumRef(meta: {owner: string; name: string}): string {
  return `${meta.owner}#${meta.name}`;
}

/** The owner name the engine's own enums declare. */
export const ENGINE_OWNER = 'Engine';

/**
 * The keys, as an enum.
 *
 * The World owns the keyboard — which keys are down, and which changed this
 * frame — so the set of key names is the engine's to state and no rule's to
 * invent. `rules/input.rule` points at this rather than listing the alphabet a
 * second time.
 */
export const KEY_ENUM: EnumMeta = {
  owner: ENGINE_OWNER,
  name: 'Key',
  // Straight from the engine's own table, so what a dropdown offers and what
  // the World compares are one list. The label differs from the value only for
  // the letters, which show `A` and are `a` (keys fold case).
  options: KEY_CHOICES.map(([label, value]) => [label, value] as const),
};

/**
 * The mouse's buttons, as an enum.
 *
 * The keyboard's argument exactly (see above): the World owns the mouse, so
 * naming its buttons is the engine's to state and `rules/mouse.rule` points at
 * this rather than listing them again.
 */
export const BUTTON_ENUM: EnumMeta = {
  owner: ENGINE_OWNER,
  name: 'MouseButton',
  options: BUTTON_CHOICES.map(([label, value]) => [label, value] as const),
};

/** The enums the engine provides. */
export const ENGINE_ENUMS: readonly EnumMeta[] = [KEY_ENUM, BUTTON_ENUM];

let projectEnums: readonly EnumMeta[] = [];

/**
 * Replace the project's own enums, as the editor replaces its rules.
 *
 * Called with everything `define choices` declared across the project's
 * `.rule` files, whenever those files change (ENUMS.md step 3).
 */
export function registerProjectEnums(metas: readonly EnumMeta[]): void {
  projectEnums = metas;
}

/** Every enum in play, the engine's first. */
export function allEnums(): EnumMeta[] {
  return [...ENGINE_ENUMS, ...projectEnums];
}

/**
 * Sets of choices claimed by more than one declaration — an ambiguous reference
 * each, the same problem two rules with one name are.
 *
 * A reference carries the owner (`Wind#Colors`), so two RULES may each declare
 * their own `Colors` without either being in doubt. What is in doubt is two
 * `define choices` blocks naming the same set inside one rule: they produce one
 * reference, `enumByRef` answers with the first, and the second's words appear
 * nowhere. Reported rather than silently picked, exactly as `duplicateRuleNames`
 * is — a learner whose choices do nothing should be told why.
 */
export function duplicateEnumNames(): string[] {
  const seen = new Set<string>();
  const duplicated = new Set<string>();
  for (const meta of allEnums()) {
    const ref = enumRef(meta);
    if (seen.has(ref)) {
      duplicated.add(ref);
    }
    seen.add(ref);
  }
  return [...duplicated];
}

/** The enum a stored reference means, or undefined if nothing declares it. */
export function enumByRef(ref: string): EnumMeta | undefined {
  return allEnums().find(meta => enumRef(meta) === ref);
}

/**
 * A dropdown's options for an enum, or an empty list for one nothing declares.
 *
 * Empty rather than throwing: a block may name an enum from a rule the learner
 * is halfway through writing, and a half-written project has to keep rendering.
 */
export function enumOptions(ref: string): Array<[string, string]> {
  return (enumByRef(ref)?.options ?? []).map(([label, value]) => [
    label,
    value,
  ]);
}

// ── Enums as parameter types ────────────────────────────────────────────────
// A designed block's parameter carries its type as a string (`number`,
// `vector`, `actor` — `typedVariables`). An enum parameter carries the enum it
// is typed by, in the same field: `enum:Engine#Key`. One field, because
// everything that reads a parameter type today keeps working — an enum
// parameter IS a string parameter, and `paramFlavour` will say so (ENUMS.md
// step 2).

const ENUM_TYPE_PREFIX = 'enum:';

/** The parameter type a parameter typed by this enum stores. */
export function enumParamType(ref: string): string {
  return `${ENUM_TYPE_PREFIX}${ref}`;
}

/** The enum a parameter type names, or undefined if it names a plain type. */
export function enumRefOfParamType(type: string): string | undefined {
  return type.startsWith(ENUM_TYPE_PREFIX)
    ? type.slice(ENUM_TYPE_PREFIX.length)
    : undefined;
}

/**
 * A designed parameter's type: one of the plain kinds, or an enum.
 *
 * `ArgType` is the ENGINE's list, and enums are not on it — the engine never
 * hears about one. This is the editor's wider list, and the only place the two
 * differ.
 */
export type ParamType = ArgType | `${typeof ENUM_TYPE_PREFIX}${string}`;

/**
 * The value block for an enum: a bare dropdown of its choices.
 *
 * One block type per enum, built with the palette, exactly as a block is built
 * per property and per event. It is what an enum-typed socket carries as its
 * shadow, so the argument reads as a dropdown while still accepting a value
 * dropped over it — which the emitting side needs, `rules/input.rule` sending
 * the key it is looping over.
 */
export function enumValueBlockType(ref: string): string {
  return `world_choice_${ref.replace(/[^A-Za-z0-9]+/g, '_')}`;
}
