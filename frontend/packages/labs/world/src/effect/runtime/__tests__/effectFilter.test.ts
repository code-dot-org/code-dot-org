import {describe, expect, it} from 'vitest';

import {compileEffect} from '../../compiler/compileEffect';
import {
  GHOST_PORT,
  OUTPUT_NODE_ID,
  emptyEffectDocument,
  parameterNodeId,
} from '../../model/constants';
import {edge} from '../../model/document';
import {buildUniformValues} from '../effectFilter';

/**
 * Booting Phaser needs a WebGL context, so the filter classes themselves are
 * verified in the World lab. What is testable here is the value marshalling
 * between an `.effect` document and the uniforms the shader expects.
 */
const document = {
  ...emptyEffectDocument(),
  parameters: [
    {id: 'strength', name: 'strength', type: 'float' as const, defaultValue: 1},
    {
      id: 'offset',
      name: 'offset',
      type: 'vec2' as const,
      defaultValue: [0, 0],
    },
  ],
  edges: [
    edge(
      {node: parameterNodeId('strength'), port: GHOST_PORT},
      {node: OUTPUT_NODE_ID, port: GHOST_PORT},
    ),
  ],
};

describe('buildUniformValues', () => {
  it('falls back to each parameter default', () => {
    const compiled = compileEffect(document);

    expect(buildUniformValues(compiled)).toEqual(
      new Map<string, number | number[]>([
        ['uParam_strength', 1],
        ['uParam_offset', [0, 0]],
      ]),
    );
  });

  it('applies supplied values by parameter id, not uniform name', () => {
    const compiled = compileEffect(document);

    expect(buildUniformValues(compiled, {strength: 0.5})).toEqual(
      new Map<string, number | number[]>([
        ['uParam_strength', 0.5],
        ['uParam_offset', [0, 0]],
      ]),
    );
  });
});
