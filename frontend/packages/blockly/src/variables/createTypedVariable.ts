import {Order} from 'blockly/javascript';

import {defineBlock} from '../blocks/defineBlock';
import type {BlockArgDefinition, BlockDefinition} from '../blocks/types';

/** How to build a {@link TypedVariable} flavour. Only `type` is required. */
export interface TypedVariableConfig {
  /**
   * The Blockly variable *type tag* that identifies this flavour (e.g.
   * `'Actor'`). Blockly keys a variable's type off this string; a field bound to
   * the flavour only lists and creates variables carrying it.
   */
  type: string;
  /**
   * The output connection check for the getter block — which sockets a read of
   * this variable may plug into. Defaults to {@link type}, so an `'Actor'`
   * variable reads into `Actor`-checked inputs and nowhere else.
   */
  check?: string;
  /** The block style for the getter (e.g. `'variable_blocks'`). */
  style?: string;
  /**
   * The field type that draws the name. Defaults to Blockly's own
   * `field_variable`, which lists every variable of this flavour on the
   * workspace.
   *
   * A lab whose language has SCOPES registers a field of its own and names it
   * here: a workspace is the only thing a Blockly variable can belong to, so a
   * name that exists inside one block is a distinction only the field can
   * make. Everything else about the flavour is unchanged.
   *
   * It applies to the GETTER and SETTER only. `field()` — spread into the
   * blocks that bind a name, a loop's and a declaration's — keeps Blockly's,
   * because such a block always names a variable and there is nothing to
   * decide.
   */
  readerFieldType?: string;
  /** The name a freshly-created variable of this type is given. Defaults to the
   * lower-cased {@link type}. */
  defaultName?: string;
  /** The getter block's registered type name. Defaults to `variables_get_<type>`. */
  getterType?: string;
  /**
   * The setter block's registered type name. Defaults to
   * `variables_set_<type>`.
   */
  setterType?: string;
  /**
   * The getter block's caption; `%1` is the variable field. Defaults to `%1`
   * (the bare variable name). Supply e.g. `'the %1'` to add fixed wording.
   */
  message0?: string;
  /**
   * The setter block's caption; `%1` is the variable field and `%2` the value
   * socket. Defaults to `set %1 to %2`.
   */
  setterMessage0?: string;
  /** The getter block's tooltip. */
  tooltip?: string;
  /** The setter block's tooltip. */
  setterTooltip?: string;
}

/** A reusable, typed Blockly variable flavour produced by {@link createTypedVariable}. */
export interface TypedVariable {
  /** The variable type tag (as supplied). */
  readonly type: string;
  /** The getter block's registered type name. */
  readonly getterType: string;
  /** The setter block's registered type name. */
  readonly setterType: string;
  /**
   * The getter block definition — a reporter whose output is checked to this
   * type. Register it (and offer it in the toolbox) so a variable of this type
   * can be read into a matching socket.
   */
  readonly getterBlock: BlockDefinition;
  /**
   * The setter block definition — a statement assigning a value of this type to
   * a variable of this flavour. Its value socket is checked to the same tag the
   * getter reports, so the two agree: what a `Vector` variable can be set to is
   * exactly what reading one can be plugged into.
   *
   * Register it (and offer it in the toolbox) to let a body hold intermediate
   * state. Without a setter a variable can only be BOUND by a binding block —
   * a loop's variable, a parameter — never assigned, so a body cannot keep a
   * value across two statements.
   */
  readonly setterBlock: BlockDefinition;
  /**
   * A `field_variable` argument bound to this flavour, to spread into a
   * *binding* block's args (a for-each loop's loop variable, a parameter). The
   * field lists and creates only variables of this type.
   */
  field(name: string, options?: {variable?: string}): BlockArgDefinition;
}

/**
 * Build a reusable, typed Blockly variable "flavour": a variable identified by a
 * Blockly variable *type tag*, plus a getter block whose output connection is
 * checked to that tag — so a variable of one flavour cannot be plugged where a
 * different type is expected. Typed variables nest and serialise like any
 * Blockly variable (`Blockly.serialization.workspaces`), and the getter maps to
 * a safe JS identifier through the generator's name table (`getVariableName`).
 *
 * The facility is type-agnostic: a lab calls it once per flavour it needs —
 * `createTypedVariable({type: 'Actor', style: 'sprite_blocks'})` — then wires the
 * returned `getterBlock` into its block set and spreads `field(name)` into any
 * block that binds one.
 */
export function createTypedVariable(
  config: TypedVariableConfig,
): TypedVariable {
  const {type} = config;
  const check = config.check ?? type;
  const style = config.style ?? 'variable_blocks';
  const defaultName = config.defaultName ?? type.toLowerCase();
  // WHICH FIELD DRAWS THE NAME. `field_variable` is Blockly's own and lists
  // every variable of this flavour on the workspace, which is right while a
  // workspace is the only thing a name can belong to. A lab whose language has
  // SCOPES registers a field of its own and names it here, and gets the rest of
  // the flavour — the check, the style, the generator — unchanged.
  // A field on a block that DECLARES a name — a loop's, a `let`'s — keeps
  // Blockly's own, because such a block always has a variable and inventing
  // one for it is right. A field on a block that READS a name is the lab's,
  // when a lab says so: it may name nothing, and what it can name depends on
  // where it sits.
  const readerFieldType = config.readerFieldType ?? 'field_variable';
  const getterType = config.getterType ?? `variables_get_${type}`;
  const setterType = config.setterType ?? `variables_set_${type}`;
  const message0 = config.message0 ?? '%1';
  const setterMessage0 = config.setterMessage0 ?? 'set %1 to %2';
  const tooltip = config.tooltip ?? `A ${type} variable.`;
  const setterTooltip =
    config.setterTooltip ?? `Put a value into a ${type} variable.`;

  const field = (
    name: string,
    options: {variable?: string} = {},
  ): BlockArgDefinition => ({
    type: 'field_variable',
    name,
    variable: options.variable ?? defaultName,
    variableTypes: [type],
    defaultType: type,
  });

  /** The same field, drawn by whatever this lab reads names with. */
  const readerField = (name: string): BlockArgDefinition =>
    ({
      ...(field(name) as unknown as Record<string, unknown>),
      type: readerFieldType,
    }) as unknown as BlockArgDefinition;

  const getterBlock = defineBlock({
    type: getterType,
    message0,
    args0: [readerField('VAR')],
    output: check,
    style,
    tooltip,
    generator: {
      javascript(block, generator) {
        // The field value is the variable id; the generator maps it to a safe,
        // collision-free JS identifier (and remembers it for the whole pass).
        //
        // AN EMPTY ID IS A REAL ANSWER where a lab scopes its names: a getter
        // that can see none has nothing to read, and reads `undefined` — which
        // is what an empty socket gives and what an unset variable held
        // anyway. Naming one would generate an identifier nothing declares.
        const id = block.getFieldValue('VAR');
        return [
          id ? generator.getVariableName(id) : 'undefined',
          Order.ATOMIC,
        ] as [string, number];
      },
    },
  });

  const setterBlock = defineBlock({
    type: setterType,
    message0: setterMessage0,
    args0: [readerField('VAR'), {type: 'input_value', name: 'VALUE', check}],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    style,
    tooltip: setterTooltip,
    generator: {
      javascript(block, generator) {
        // The same name table the getter reads, so an assignment and a read of
        // one variable agree on the identifier. Blockly's `finish()` emits the
        // `var` declarations for everything named this way.
        //
        // …and a setter naming nothing writes nothing, for the reason the
        // getter reads nothing: there is no identifier to assign to.
        const id = block.getFieldValue('VAR');
        if (!id) {
          return '';
        }
        const name = generator.getVariableName(id);
        const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '0';
        return `${name} = ${value};\n`;
      },
    },
  });

  return {type, getterType, setterType, getterBlock, setterBlock, field};
}
