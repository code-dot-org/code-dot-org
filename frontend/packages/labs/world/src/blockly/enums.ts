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
// The engine's are the only ones: `Key` is the list `world_key` has always
// carried, given a name so a rule can point at it instead of rebuilding it. A
// rule's own `define choices` waits on a place in the rule's data.

import type {ArgType} from '../engine';
import {KEY_CHOICES} from '../engine/core/keys';
import {BUTTON_CHOICES, DIRECTION_CHOICES} from '../engine/core/pointer';

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
   * learner-authored enum would normally have the two the same.
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

/**
 * Which way a swipe went, as an enum.
 *
 * The same argument again: the engine decides what counts as a swipe and which
 * way it went, so naming the four is the engine's and `rules/gestures.rule`
 * points at this (specs/GESTURES_PLAN.md).
 */
export const DIRECTION_ENUM: EnumMeta = {
  owner: ENGINE_OWNER,
  name: 'Direction',
  options: DIRECTION_CHOICES.map(([label, value]) => [label, value] as const),
};

/** The enums the engine provides. */
export const ENGINE_ENUMS: readonly EnumMeta[] = [
  KEY_ENUM,
  BUTTON_ENUM,
  DIRECTION_ENUM,
];

/** Every enum in play: the engine's. */
export const allEnums = (): EnumMeta[] => [...ENGINE_ENUMS];

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
 * A designed parameter's type: one of the plain kinds, an enum, a KIND, or a
 * MAP.
 *
 * `ArgType` is the ENGINE's list, and none of the other three is on it — the
 * engine never hears about an enum, and what reaches it for a `kind` or a
 * `map` is a module path as an ordinary string. This is the editor's wider
 * list, and every place the two differ is about what a SOCKET offers rather
 * than about what arrives through it.
 */
export type ParamType =
  | ArgType
  | 'kind'
  | 'map'
  | `${typeof ENUM_TYPE_PREFIX}${string}`;

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
