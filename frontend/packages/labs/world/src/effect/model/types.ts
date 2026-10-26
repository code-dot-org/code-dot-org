/**
 * The `.effect` document model.
 *
 * An `.effect` file is the serialized form of a node graph that compiles to a
 * GLSL fragment shader. This module defines that serialized shape and nothing
 * else — no editor state, no compiler state. Anything the editor needs but the
 * file should not persist (selection, viewport, hover) lives in `src/editor`.
 */

/** GLSL types a wire may carry. */
export type EffectValueType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'sampler2D';

/**
 * A port type as *declared* by a node definition. `generic` means "resolved at
 * compile time from whatever is wired in" — see `resolveGenericType`.
 */
export type EffectPortType = EffectValueType | 'generic';

/**
 * Types a learner-facing parameter may take. Samplers are not configurable.
 *
 * `bool` and `int` are *authoring* constraints rather than GLSL types: both
 * become a plain `float` uniform, carrying 0/1 for a switch and whole numbers
 * for a counter. That is deliberate — a value that stays a float can be
 * multiplied, mixed, and added like any other number, which is the whole
 * point of a switch you can multiply a feature by. See `parameterValueType`.
 */
export type EffectParameterType =
  | Exclude<EffectValueType, 'sampler2D'>
  | 'bool'
  | 'int';

/**
 * What a function may return.
 *
 * Narrower than a parameter's type on purpose: `bool` and `int` describe how a
 * knob is *edited*, and a function body has no knob.
 */
export type EffectFunctionOutputType = Exclude<EffectValueType, 'sampler2D'>;

/**
 * A constant value. Scalars are plain numbers; vectors are component arrays
 * whose length must match their type (vec2 → 2, vec3 → 3, vec4 → 4).
 */
export type EffectLiteral = number | number[];

/** `{x, y}` in editor workspace coordinates. */
export interface EffectPosition {
  x: number;
  y: number;
}

/** Workspace dimensions, for the nodes a learner can resize. */
export interface EffectSize {
  width: number;
  height: number;
}

/** One end of a wire. */
export interface EffectPortRef {
  /** Node id, or one of the reserved ids in `./constants`. */
  node: string;
  /** Port id, as declared by the node definition. */
  port: string;
  /**
   * Components picked off the value as it leaves this port, always in
   * canonical `xyzw` form (`'x'`, `'zw'`) however the editor spells them for
   * the learner. Meaningful on an edge's `source` only: it is how a wide value
   * is narrowed to fit a narrower port — the *explicit* answer to "which
   * component did you mean", which is the one question the compiler refuses to
   * guess at.
   */
  swizzle?: string;
}

export interface EffectGraphNode {
  id: string;
  /** Key into the node registry, e.g. `multiply`. */
  type: string;
  position: EffectPosition;
  /**
   * Literal widget values keyed by port id. A value here is used when the
   * matching input port has no incoming wire; it is ignored when one exists.
   */
  params?: Record<string, EffectLiteral>;
  /**
   * A note about what this node is doing here, written by whoever built the
   * graph or by an assistant helping them. Distinct from the *definition's*
   * description, which explains what the node type does in general: this one
   * explains what this particular node is for in this particular effect.
   *
   * Shown beside the node while it is selected, and carried into the compiled
   * shader as a comment.
   */
  note?: string;
  /**
   * Explicit size, for nodes the learner can resize — Comment nodes today.
   * Absent means the node sizes itself from its content, which is what every
   * computing node does.
   */
  size?: EffectSize;
  /** The "eye" toggle — render this node's output in the editor. */
  inspected?: boolean;
}

export interface EffectGraphEdge {
  id: string;
  /** The output port the wire leaves from. */
  source: EffectPortRef;
  /** The input port the wire arrives at. Inputs accept exactly one wire. */
  target: EffectPortRef;
}

/**
 * A knob the effect exposes to its consumer. Parameters appear as extra nodes
 * in the pinned input row and become shader uniforms; their names and defaults
 * are what `.addEffect()` expands into on the Actor or World.
 */
export interface EffectParameter {
  /** Stable identity across renames. Also seeds the uniform name. */
  id: string;
  /** Learner-facing name; the argument name in `.addEffect()`. */
  name: string;
  type: EffectParameterType;
  defaultValue: EffectLiteral;
  /** Inclusive bounds for scalar parameters, used by the editor's slider. */
  min?: number;
  max?: number;
  description?: string;
}

/**
 * The graph fields shared by the main document and every function.
 *
 * The editor, the wiring rules, and the compiler's walker all operate on this
 * shape, which is what lets one set of machinery serve both levels. In a
 * function, `parameters` are its declared inputs — same editing UI, same
 * ghost knobs, different compilation (arguments instead of uniforms).
 */
export interface EffectGraphScope {
  parameters: EffectParameter[];
  nodes: EffectGraphNode[];
  edges: EffectGraphEdge[];
}

/**
 * A reusable node built from its own workspace of nodes.
 *
 * Compiles to a GLSL helper function; used via a node of type `fn:<id>`.
 * Inputs are numeric only — texture work stays in the main graph — and there
 * is a single output of a declared type.
 */
export interface EffectFunction extends EffectGraphScope {
  /** Stable identity; seeds the GLSL helper name. Never rename. */
  id: string;
  /** Learner-facing name: the node label and palette entry. */
  name: string;
  description?: string;
  /** Type of the single output the body must produce (or coerce to). */
  outputType: EffectFunctionOutputType;
}

export interface EffectDocument extends EffectGraphScope {
  /** Bumped whenever the on-disk shape changes; see `migrate` in ./schema. */
  version: number;
  name: string;
  /**
   * A short line about what the effect does, for a host listing effects in a
   * gallery or picker without opening them.
   *
   * Distinct from a Comment node: a comment explains the graph to whoever
   * opens the workspace, this describes the effect to someone who has not.
   */
  description?: string;
  functions: EffectFunction[];
  /**
   * Editor-only: id of the test texture shown in the input row. Persisted so a
   * learner reopening the file sees what they were working against.
   */
  testTexture?: string;
}
