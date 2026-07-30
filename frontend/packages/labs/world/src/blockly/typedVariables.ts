// The typed Blockly variables World Lab uses — the flavour of a value a variable
// holds, so a getter of one type only plugs into a matching socket. Two consumers
// share these, which is why they live in their own module (avoiding a cycle):
//   • the `for each` loop's actor variable (domainBlocks), and
//   • action/query PARAMETERS (the params mutator), which are variables the
//     mutator manages so the body reads them with the matching typed getter.
//
// `actor` is one flavour reused by both a loop variable and an actor parameter —
// a single `Actor` tag / `variables_get_Actor` getter, never duplicated.

import {createTypedVariable, type TypedVariable} from '@code-dot-org/blockly';

/** The actor variable — a `for each` loop's binding, or an `actor` parameter. */
export const ActorVariable: TypedVariable = createTypedVariable({
  type: 'Actor',
  style: 'sprite_blocks',
  // Not `actor`: the principal actor generates as the bare identifier `actor`, so
  // a variable named `actor` would shadow it. The generator also reserves it.
  defaultName: 'other',
  tooltip:
    'An actor held in a variable — e.g. the one a “for each” loop is on.',
});

// One flavour per parameter value type. Each getter's output is checked to the
// type, so reading a `number` parameter only fits a Number socket. The `type` is
// the authored value type (matches an {@link ArgType}); the flavour's tag is its
// PascalCase form (`variables_get_Number`).
const numberVariable = createTypedVariable({
  type: 'Number',
  style: 'math_blocks',
  defaultName: 'amount',
  tooltip: 'A number passed to this action or query.',
});
const booleanVariable = createTypedVariable({
  type: 'Boolean',
  style: 'logic_blocks',
  defaultName: 'flag',
  tooltip: 'A true/false value passed to this action or query.',
});
const stringVariable = createTypedVariable({
  type: 'String',
  style: 'text_blocks',
  defaultName: 'text',
  tooltip: 'Text passed to this action or query.',
});
const vectorVariable = createTypedVariable({
  type: 'Vector',
  style: 'location_blocks',
  defaultName: 'vec',
  tooltip: 'A vector passed to this action or query.',
});

/**
 * The parameter flavours, keyed by authored value type — the order is the type
 * dropdown's order. A param row binds `field_variable` to the flavour of its
 * chosen type; the body reads it with `flavour.getterBlock`.
 */
export const PARAM_FLAVOURS: ReadonlyArray<{
  type: string;
  variable: TypedVariable;
}> = [
  {type: 'number', variable: numberVariable},
  {type: 'boolean', variable: booleanVariable},
  {type: 'string', variable: stringVariable},
  {type: 'vector', variable: vectorVariable},
  {type: 'actor', variable: ActorVariable},
];

/** Look up a parameter flavour by its authored value type. */
export const paramFlavour = (type: string): TypedVariable =>
  (PARAM_FLAVOURS.find(f => f.type === type) ?? PARAM_FLAVOURS[0]).variable;

/** The parameter type dropdown's `[label, value]` options. */
export const PARAM_TYPE_OPTIONS: Array<[string, string]> = PARAM_FLAVOURS.map(
  ({type}) => [type, type],
);

/** The getter blocks that read a parameter — one per flavour. */
export const PARAM_GETTER_BLOCKS = PARAM_FLAVOURS.map(
  ({variable}) => variable.getterBlock,
);

/** The getter block types, for a toolbox that offers reading a parameter. */
export const PARAM_GETTER_TYPES = PARAM_FLAVOURS.map(
  ({variable}) => variable.getterType,
);
