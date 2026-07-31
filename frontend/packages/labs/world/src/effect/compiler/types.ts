import type {
  EffectLiteral,
  EffectParameterType,
  EffectPortRef,
  EffectValueType,
} from '../model/types';
import type {EffectNodeRegistry} from '../nodes/registry';

export interface EffectCompileOptions {
  /** Node definitions to compile against. Defaults to the stock registry. */
  registry?: EffectNodeRegistry;
  /**
   * Compile a preview shader that writes this port's value to the screen
   * instead of the graph's output — this is what the per-node "eye" produces.
   * Non-color types are visualized rather than reinterpreted; see
   * `visualizeAsColor`.
   */
  inspect?: EffectPortRef;
  /**
   * Float precision for the fragment shader. Defaults to `highp`, emitted
   * behind a `GL_FRAGMENT_PRECISION_HIGH` guard that falls back to `mediump`
   * on the rare device without fragment `highp` — the same shape Phaser's own
   * filter shaders use.
   *
   * The default matters: `mediump` guarantees only a 10-bit mantissa, so by
   * a hundred seconds in, `uTime` resolves to steps of about a tenth of a
   * second and time-driven effects visibly stutter. Ask for `mediump` only
   * when a specific device needs it; it is then emitted unguarded.
   */
  precision?: 'mediump' | 'highp';
}

/** One shader uniform that the effect's consumer supplies a value for. */
export interface EffectUniformDescriptor {
  /** Uniform name in the generated GLSL. */
  name: string;
  /** The `EffectParameter.id` it came from. */
  parameterId: string;
  /** The `.useEffect()` argument name. */
  label: string;
  /** The GLSL type of the uniform — what a host must actually upload. */
  type: EffectValueType;
  /**
   * How the parameter is authored, which is what a host should build UI from:
   * `bool` and `int` are float uniforms with an editing constraint.
   */
  kind: EffectParameterType;
  defaultValue: EffectLiteral;
  min?: number;
  max?: number;
  /**
   * False when the graph never reads this parameter. The uniform is still
   * declared, but GL drivers strip unused uniforms, so `getUniformLocation`
   * will return null for it at runtime.
   */
  used: boolean;
}

export interface CompiledEffect {
  /** Complete GLSL ES 1.00 fragment shader, ready for a Phaser filter. */
  fragmentSource: string;
  /** Every declared parameter, in document order. */
  parameters: EffectUniformDescriptor[];
  /** True when the shader reads the engine clock. */
  usesTime: boolean;
  /** True when the shader reads the per-effect clock. */
  usesEffectTime: boolean;
  /** Ids of the nodes that contributed, in the order they were emitted. */
  emittedNodeIds: string[];
  /**
   * Concrete type per port, keyed by node id then port id, for every node the
   * walk emitted. This is where generic ports become real types — a `multiply`
   * fed a vec4 reports vec4 — so the editor can color wires by what they
   * actually carry rather than by what the definition declares.
   */
  resolvedPortTypes: Record<string, Record<string, EffectValueType>>;
  /**
   * The same, per compiled function body, keyed by function id. Node ids are
   * scoped to each function's own workspace.
   */
  functionResolvedTypes: Record<
    string,
    Record<string, Record<string, EffectValueType>>
  >;
}

/** A graph that cannot be turned into a shader, located at a node or port. */
export class EffectCompileError extends Error {
  nodeId?: string;
  portId?: string;
  /**
   * Set when the error is inside a function's body: `nodeId` then refers to a
   * node in that function's workspace, not the main one. The editor only
   * highlights the node when the matching workspace is open.
   */
  functionId?: string;

  constructor(message: string, location?: Partial<EffectPortRef>) {
    super(message);
    this.name = 'EffectCompileError';
    this.nodeId = location?.node;
    this.portId = location?.port;
  }
}
