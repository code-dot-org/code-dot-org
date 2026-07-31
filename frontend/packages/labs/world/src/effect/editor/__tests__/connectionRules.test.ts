import {describe, expect, it} from 'vitest';

import {
  GHOST_PORT,
  INPUT_TEXTURE_NODE_ID,
  INPUT_TIME_NODE_ID,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
} from '../../model/constants';
import {addNode, createEffectDocument} from '../../model/document';
import {defaultNodeRegistry} from '../../nodes/definitions/index';
import {
  canConnect,
  connectableNodes,
  explainRefusal,
  portTypeOf,
  portsCompatible,
  type DragEndpoint,
} from '../connectionRules';
import {swizzlePlan} from '../swizzle';

// The passthrough document, plus a Combine XY for a float input port and a
// Saturation for a vec3 one.
const document = addNode(
  addNode(createEffectDocument(), {
    id: 'combine2-1',
    type: 'combine2',
    position: {x: 0, y: 0},
  }),
  {id: 'saturate-1', type: 'saturate', position: {x: 0, y: 0}},
);

describe('portsCompatible', () => {
  it('accepts matching types and scalar broadcast', () => {
    expect(portsCompatible('vec2', 'vec2')).toBe(true);
    expect(portsCompatible('float', 'vec3')).toBe(true);
  });

  it('rejects narrowing and cross-width widening', () => {
    expect(portsCompatible('vec4', 'vec3')).toBe(false);
    expect(portsCompatible('vec2', 'vec3')).toBe(false);
  });

  it('lets generic ports take any numeric type', () => {
    expect(portsCompatible('vec4', 'generic')).toBe(true);
    expect(portsCompatible('generic', 'float')).toBe(true);
  });

  it('never lets a texture into a generic port', () => {
    // A sampler cannot be multiplied or mixed; the compiler would only find
    // out after emitting GLSL the driver rejects. This is the rule that keeps
    // "texture wire → Multiply" out of both the drag and the picker.
    expect(portsCompatible('sampler2D', 'generic')).toBe(false);
    expect(portsCompatible('generic', 'sampler2D')).toBe(false);
  });

  it('matches textures only to texture ports', () => {
    expect(portsCompatible('sampler2D', 'sampler2D')).toBe(true);
    expect(portsCompatible('sampler2D', 'vec4')).toBe(false);
  });
});

describe('canConnect', () => {
  const connection = (
    source: string,
    sourceHandle: string,
    target: string,
    targetHandle: string,
  ) => ({source, sourceHandle, target, targetHandle});

  it('refuses a texture wire dropped on a generic math input', () => {
    expect(
      canConnect(
        document,
        defaultNodeRegistry,
        connection(INPUT_TEXTURE_NODE_ID, GHOST_PORT, 'sample-1', 'uv'),
      ),
    ).toBe(false);
  });

  it('still lets any non-texture value reach the Output', () => {
    expect(
      canConnect(
        document,
        defaultNodeRegistry,
        connection(INPUT_TIME_NODE_ID, GHOST_PORT, OUTPUT_NODE_ID, GHOST_PORT),
      ),
    ).toBe(true);
  });
});

describe('generic ports, resolved', () => {
  // A Multiply whose inputs made it a vec2 this compile. Its *declared*
  // output type is `generic`, which says nothing about what it carries.
  const withMultiply = addNode(document, {
    id: 'multiply-1',
    type: 'multiply',
    position: {x: 0, y: 0},
  });
  const resolved = {'multiply-1': {out: 'vec2' as const}};

  const connection = {
    source: 'multiply-1',
    sourceHandle: 'out',
    target: 'combine2-1',
    targetHandle: 'x',
  };

  it('reads a generic output as the type it actually resolved to', () => {
    expect(
      portTypeOf(
        withMultiply,
        defaultNodeRegistry,
        'multiply-1',
        'out',
        'source',
      ),
    ).toBe('generic');
    expect(
      portTypeOf(
        withMultiply,
        defaultNodeRegistry,
        'multiply-1',
        'out',
        'source',
        resolved,
      ),
    ).toBe('vec2');
  });

  it('lets a resolved-vec2 output land on a number port, to be narrowed', () => {
    expect(
      canConnect(withMultiply, defaultNodeRegistry, connection, resolved),
    ).toBe(true);
    expect(
      swizzlePlan(
        portTypeOf(
          withMultiply,
          defaultNodeRegistry,
          'multiply-1',
          'out',
          'source',
          resolved,
        )!,
        'float',
      )?.componentsNeeded,
    ).toBe(1);
  });

  it('refuses at drag time what would only have failed to compile', () => {
    // The same generic output, now resolved vec2, dropped on a vec3 port.
    // Without resolution this was accepted and blew up in the compiler.
    const toVec3 = {
      source: 'multiply-1',
      sourceHandle: 'out',
      target: 'saturate-1',
      targetHandle: 'color',
    };

    expect(canConnect(withMultiply, defaultNodeRegistry, toVec3)).toBe(true);
    expect(
      canConnect(withMultiply, defaultNodeRegistry, toVec3, resolved),
    ).toBe(false);
    expect(
      explainRefusal(
        withMultiply,
        defaultNodeRegistry,
        {nodeId: 'multiply-1', portId: 'out', handleType: 'source'},
        {nodeId: 'saturate-1', portId: 'color', handleType: 'target'},
        resolved,
      ),
    ).toMatch(/2D value.*takes a color \(RGB\)/);
  });

  it('leaves a generic *input* alone — it adapts to whatever arrives', () => {
    // Resolving the target end would mean reasoning about a type that the
    // wire being dragged is itself about to change.
    expect(
      portTypeOf(
        withMultiply,
        defaultNodeRegistry,
        'multiply-1',
        'a',
        'target',
        {'multiply-1': {a: 'vec2' as const}},
      ),
    ).toBe('generic');
  });
});

describe('explainRefusal', () => {
  const endpoint = (
    nodeId: string,
    portId: string,
    handleType: 'source' | 'target',
  ): DragEndpoint => ({nodeId, portId, handleType});

  const explain = (from: DragEndpoint, to: DragEndpoint) =>
    explainRefusal(document, defaultNodeRegistry, from, to);

  it('stays silent for a connection that would be accepted', () => {
    expect(
      explain(
        endpoint(INPUT_TIME_NODE_ID, GHOST_PORT, 'source'),
        endpoint('sample-1', 'uv', 'target'),
      ),
    ).toBeNull();
  });

  it('explains a texture dropped on a numeric port', () => {
    expect(
      explain(
        endpoint(INPUT_TEXTURE_NODE_ID, GHOST_PORT, 'source'),
        endpoint('sample-1', 'uv', 'target'),
      ),
    ).toBe('This wire carries a texture — only Sample can read one.');
  });

  it('explains a number dropped on a texture port', () => {
    expect(
      explain(
        endpoint(INPUT_TIME_NODE_ID, GHOST_PORT, 'source'),
        endpoint('sample-1', 'texture', 'target'),
      ),
    ).toBe('"Texture" needs a texture, and this wire carries a number.');
  });

  it('does not refuse a narrowing drop — the swizzle picker asks instead', () => {
    // combine2's X takes a float; the UV ghost carries a vec2. This used to
    // be refused with a "use Split" hint; now the drop lands and the learner
    // is asked which component they meant.
    expect(
      explain(
        endpoint(INPUT_UV_NODE_ID, GHOST_PORT, 'source'),
        endpoint('combine2-1', 'x', 'target'),
      ),
    ).toBeNull();
  });

  it('still refuses a widening drop, which no choice could rescue', () => {
    // A vec2 into a vec3 port: picking components cannot invent the third.
    expect(
      explain(
        endpoint(INPUT_UV_NODE_ID, GHOST_PORT, 'source'),
        endpoint('saturate-1', 'color', 'target'),
      ),
    ).toBe(
      'This wire carries a 2D value, but "Color" takes a color (RGB).' +
        ' Split and Combine can reshape it.',
    );
  });

  it('explains output-to-output and input-to-input drops', () => {
    expect(
      explain(
        endpoint('sample-1', 'color', 'source'),
        endpoint(INPUT_UV_NODE_ID, GHOST_PORT, 'source'),
      ),
    ).toMatch(/another output/);
    expect(
      explain(
        endpoint('sample-1', 'uv', 'target'),
        endpoint('sample-1', 'texture', 'target'),
      ),
    ).toMatch(/another input/);
  });

  it('explains a node fed back into itself', () => {
    expect(
      explain(
        endpoint('sample-1', 'color', 'source'),
        endpoint('sample-1', 'uv', 'target'),
      ),
    ).toMatch(/cannot feed itself/);
  });

  it('explains only the texture case at the Output, which takes all else', () => {
    expect(
      explain(
        endpoint(INPUT_TEXTURE_NODE_ID, GHOST_PORT, 'source'),
        endpoint(OUTPUT_NODE_ID, GHOST_PORT, 'target'),
      ),
    ).toBe('The Output needs a color, not a whole texture — Sample it first.');
    expect(
      explain(
        endpoint(INPUT_TIME_NODE_ID, GHOST_PORT, 'source'),
        endpoint(OUTPUT_NODE_ID, GHOST_PORT, 'target'),
      ),
    ).toBeNull();
  });

  it('orients the message the same when dragging backward from the input', () => {
    // Started from the target end: the wording still describes the wire and
    // the port, not the direction of the drag.
    expect(
      explain(
        endpoint('sample-1', 'texture', 'target'),
        endpoint(INPUT_TIME_NODE_ID, GHOST_PORT, 'source'),
      ),
    ).toBe('"Texture" needs a texture, and this wire carries a number.');
  });
});

describe('connectableNodes', () => {
  it('offers exactly the Sample node for a texture wire', () => {
    const options = connectableNodes(
      defaultNodeRegistry,
      'sampler2D',
      'source',
    );

    expect(options.map(option => option.definition.type)).toEqual(['sample']);
    expect(options[0].portId).toBe('texture');
  });

  it('binds to the first compatible port, skipping incompatible ones', () => {
    // Sample's first input is the texture; a float wire must land on `uv`.
    const options = connectableNodes(defaultNodeRegistry, 'float', 'source');
    const sample = options.find(option => option.definition.type === 'sample');

    expect(sample?.portId).toBe('uv');
  });

  it('offers the math library for a numeric wire', () => {
    const types = connectableNodes(defaultNodeRegistry, 'float', 'source').map(
      option => option.definition.type,
    );

    expect(types).toContain('multiply');
    expect(types).toContain('sine');
  });

  it('searches outputs when building backward from an input', () => {
    const options = connectableNodes(defaultNodeRegistry, 'vec2', 'target');
    const types = options.map(option => option.definition.type);

    // combine2 produces a vec2 directly; sample's vec4 cannot narrow to vec2.
    expect(types).toContain('combine2');
    expect(types).not.toContain('sample');
  });
});
