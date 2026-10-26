import {parameterValueType} from '../glsl/valueTypes';
import {functionNodeType} from '../model/constants';
import type {EffectDocument, EffectFunction} from '../model/types';

import type {EffectNodeRegistry} from './registry';
import type {EffectNodeDefinition} from './types';

/**
 * The node definition for calling one of the document's functions.
 *
 * Like parameter ghosts, these are derived from the document rather than
 * registered statically: a function's ports are its declared inputs and its
 * one output. `emit` is unreachable — the compiler intercepts `fn:` node
 * types and compiles the function body itself, because emission needs the
 * compiler's shared helper sink and cycle tracking.
 */
export function functionNodeDefinition(
  fn: EffectFunction,
): EffectNodeDefinition {
  return {
    type: functionNodeType(fn.id),
    label: fn.name,
    category: 'function',
    description:
      fn.description ?? 'A node you built from its own workspace of nodes.',
    inputs: fn.parameters.map(input => ({
      id: input.id,
      label: input.name,
      // A function's bool/int input is a float port, like a parameter knob.
      type: parameterValueType(input.type),
      defaultValue: input.defaultValue,
      description: input.description,
    })),
    outputs: [{id: 'out', label: 'Out', type: fn.outputType}],
    emit: () => {
      throw new Error(
        `Function node "${fn.name}" must be compiled by compileEffect`,
      );
    },
  };
}

/**
 * A registry extended with the document's functions.
 *
 * `exclude` keeps a function out of its own palette — direct self-reference
 * is not offerable; indirect cycles are caught by the compiler.
 */
export function withDocumentFunctions(
  base: EffectNodeRegistry,
  document: EffectDocument,
  exclude?: string | null,
): EffectNodeRegistry {
  return base.extend(
    document.functions
      .filter(fn => fn.id !== exclude)
      .map(functionNodeDefinition),
  );
}
