import type {EffectPortType, EffectValueType} from '../../model/types';
import type {
  EffectNodeCategory,
  EffectNodeDefinition,
  EffectPortDefinition,
} from '../types';

/** Identity wrapper that pins the definition type without widening literals. */
export function defineNode(
  definition: EffectNodeDefinition,
): EffectNodeDefinition {
  return definition;
}

interface ExpressionNodeOptions {
  type: string;
  label: string;
  category: EffectNodeCategory;
  description: string;
  inputs: readonly EffectPortDefinition[];
  /** Defaults to a single port `out` of type `generic`. */
  output?: EffectPortDefinition;
  /**
   * Build the output expression. `inputs` holds one GLSL expression per input
   * port, already coerced; `type` is the resolved output type, which generic
   * nodes need in order to name a constructor.
   */
  glsl(inputs: Readonly<Record<string, string>>, type: EffectValueType): string;
}

const DEFAULT_OUTPUT: EffectPortDefinition = {
  id: 'out',
  label: 'Out',
  type: 'generic',
};

/**
 * The common case: a node that is one pure GLSL expression over its inputs.
 *
 * The expression is emitted inline rather than assigned to a local. GLSL
 * compilers fold this away, and inline expressions keep the generated shader
 * readable when a learner inspects it.
 */
export function expressionNode(
  options: ExpressionNodeOptions,
): EffectNodeDefinition {
  const output = options.output ?? DEFAULT_OUTPUT;

  return defineNode({
    type: options.type,
    label: options.label,
    category: options.category,
    description: options.description,
    inputs: options.inputs,
    outputs: [output],
    emit: context => ({
      [output.id]: options.glsl(context.inputs, context.types[output.id]),
    }),
  });
}

/** A `float` input port with a scalar default. */
export function floatInput(
  id: string,
  label: string,
  defaultValue = 0,
): EffectPortDefinition {
  return {id, label, type: 'float', defaultValue};
}

/** A port whose type is resolved from whatever is wired into the node. */
export function genericInput(
  id: string,
  label: string,
  defaultValue: number = 0,
): EffectPortDefinition {
  return {id, label, type: 'generic', defaultValue};
}

export function port(
  id: string,
  label: string,
  type: EffectPortType,
): EffectPortDefinition {
  return {id, label, type};
}
