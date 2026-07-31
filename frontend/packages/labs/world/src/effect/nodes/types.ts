import type {
  EffectLiteral,
  EffectPortType,
  EffectValueType,
} from '../model/types';

/** Grouping used by the editor's node-add palette. */
export type EffectNodeCategory =
  | 'io'
  | 'math'
  | 'vector'
  | 'texture'
  | 'color'
  | 'utility'
  | 'function';

export interface EffectPortDefinition {
  id: string;
  label: string;
  type: EffectPortType;
  /**
   * Inputs only: the value used when nothing is wired in. An input with no
   * default is required, and compiling without it wired is an error.
   */
  defaultValue?: EffectLiteral;
  description?: string;
}

/**
 * What a node definition sees while emitting GLSL.
 *
 * Generic ports are already resolved by the time `emit` runs, and every input
 * expression has been coerced to its resolved type — so a definition can
 * combine `inputs.a` and `inputs.b` without checking whether one was a float
 * broadcast against a vec3.
 */
export interface EffectEmitContext {
  /** Id of the graph node being emitted, for diagnostics. */
  readonly nodeId: string;
  /** GLSL expression per input port id. */
  readonly inputs: Readonly<Record<string, string>>;
  /** Resolved concrete type per port id, inputs and outputs alike. */
  readonly types: Readonly<Record<string, EffectValueType>>;
  /** A unique GLSL identifier, prefixed with `hint` for readability. */
  local(hint: string): string;
  /** Append a statement to the body of `main()`. */
  statement(glsl: string): void;
  /**
   * Declare a helper function once per shader, no matter how many nodes ask.
   * `name` is the dedupe key; `source` is the full function declaration.
   */
  helper(name: string, source: string): void;
}

/** GLSL expression per output port id. */
export type EffectEmitResult = Record<string, string>;

export interface EffectNodeDefinition {
  /** Stable key stored in `EffectGraphNode.type`. Never rename. */
  type: string;
  label: string;
  category: EffectNodeCategory;
  description: string;
  inputs: readonly EffectPortDefinition[];
  outputs: readonly EffectPortDefinition[];
  /**
   * Show a color-picker swatch on the node, writing the picked color into
   * these channel inputs. `'rgba'` expects r/g/b inputs in 0–1; `'hsla'`
   * expects h in degrees (0–360) with s/l in 0–1. Alpha stays a number field
   * — native color inputs cannot pick it.
   */
  colorPicker?: 'rgba' | 'hsla';
  /**
   * Emit this node. Returning an expression per output port is enough for most
   * nodes; use `context.statement` when a value must be held in a local (for
   * reuse or because the expression would otherwise be evaluated twice).
   */
  emit(context: EffectEmitContext): EffectEmitResult;
}
