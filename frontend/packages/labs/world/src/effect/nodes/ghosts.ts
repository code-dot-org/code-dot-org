import {
  UNIFORM_EFFECT_TIME,
  UNIFORM_MAIN_SAMPLER,
  UNIFORM_TIME,
  VARYING_TEX_COORD,
} from '../glsl/symbols';
import {parameterValueType} from '../glsl/valueTypes';
import {
  INPUT_EFFECT_TIME_NODE_ID,
  INPUT_TEXTURE_NODE_ID,
  INPUT_TIME_NODE_ID,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  parameterIdFromNodeId,
  parameterNodeId,
} from '../model/constants';
import type {
  EffectGraphScope,
  EffectParameter,
  EffectValueType,
} from '../model/types';

/**
 * The pinned row items.
 *
 * A ghost is deliberately simpler than a node definition: one port, one type,
 * and — for inputs — the GLSL name it resolves to. There is no `emit` because
 * a ghost never computes anything; it names a value the shader is handed.
 */
export interface EffectGhost {
  id: string;
  label: string;
  description: string;
  type: EffectValueType;
  /** `source` ghosts sit in the input row, `target` in the output row. */
  role: 'source' | 'target';
  /**
   * GLSL expression the ghost resolves to. Absent for the output ghost, which
   * consumes rather than produces, and for parameters, whose uniform name is
   * assigned per compile.
   */
  glsl?: string;
}

export const inputGhosts: readonly EffectGhost[] = [
  {
    id: INPUT_TEXTURE_NODE_ID,
    label: 'Texture',
    description: 'The Actor image or World viewport this effect is applied to.',
    type: 'sampler2D',
    role: 'source',
    glsl: UNIFORM_MAIN_SAMPLER,
  },
  {
    id: INPUT_UV_NODE_ID,
    label: 'UV',
    description:
      'Which pixel this run is computing, from (0,0) at one corner to (1,1) at the other.',
    type: 'vec2',
    role: 'source',
    glsl: VARYING_TEX_COORD,
  },
  {
    id: INPUT_TIME_NODE_ID,
    label: 'Time',
    description: 'Seconds since the game started. Use for looping animation.',
    type: 'float',
    role: 'source',
    glsl: UNIFORM_TIME,
  },
  {
    id: INPUT_EFFECT_TIME_NODE_ID,
    label: 'Effect Time',
    description:
      'Seconds since this effect was applied. Use for one-shot animation.',
    type: 'float',
    role: 'source',
    glsl: UNIFORM_EFFECT_TIME,
  },
];

export const outputGhost: EffectGhost = {
  id: OUTPUT_NODE_ID,
  label: 'Output',
  description: 'The final color of the pixel.',
  type: 'vec4',
  role: 'target',
};

export function parameterGhost(parameter: EffectParameter): EffectGhost {
  return {
    id: parameterNodeId(parameter.id),
    label: parameter.name,
    description:
      parameter.description ?? 'A value supplied when the effect is used.',
    // A bool or int knob is a float on the wire; see `parameterValueType`.
    type: parameterValueType(parameter.type),
    role: 'source',
  };
}

/** Resolve any ghost id against a document, including parameter ghosts. */
export function ghostForNodeId(
  document: EffectGraphScope,
  nodeId: string,
): EffectGhost | undefined {
  const parameterId = parameterIdFromNodeId(nodeId);
  if (parameterId !== null) {
    const parameter = document.parameters.find(
      candidate => candidate.id === parameterId,
    );
    return parameter ? parameterGhost(parameter) : undefined;
  }

  if (nodeId === OUTPUT_NODE_ID) {
    return outputGhost;
  }

  return inputGhosts.find(ghost => ghost.id === nodeId);
}

/** Every ghost in the input row: the stock knobs, then the parameters. */
export function inputRowGhosts(document: EffectGraphScope): EffectGhost[] {
  return [...inputGhosts, ...document.parameters.map(parameterGhost)];
}
