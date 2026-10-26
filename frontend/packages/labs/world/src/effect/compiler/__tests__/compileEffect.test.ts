import {describe, expect, it} from 'vitest';

import {
  GHOST_PORT,
  INPUT_TEXTURE_NODE_ID,
  INPUT_TIME_NODE_ID,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  emptyEffectDocument,
  parameterNodeId,
} from '../../model/constants';
import {createEffectDocument, edge} from '../../model/document';
import type {EffectDocument, EffectGraphNode} from '../../model/types';
import {compileEffect} from '../compileEffect';
import {EffectCompileError} from '../types';

/** Build a document from loose parts, so each test states only what it needs. */
function documentWith(
  nodes: EffectGraphNode[],
  edges: EffectDocument['edges'],
  parameters: EffectDocument['parameters'] = [],
): EffectDocument {
  return {...emptyEffectDocument(), nodes, edges, parameters};
}

const at = (x = 0, y = 0) => ({x, y});

/** Run `action` and hand back whatever it threw, keeping assertions top-level. */
function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('compileEffect', () => {
  it('compiles a passthrough effect to a complete GLSL ES 1.00 shader', () => {
    const {fragmentSource} = compileEffect(createEffectDocument());

    // Phaser's filter shaders begin with these two lines; the renderer looks
    // for the pragma when it assembles the program.
    expect(fragmentSource.startsWith('#version 100\n')).toBe(true);
    expect(fragmentSource).toContain('#pragma phaserTemplate(shaderName)');
    expect(fragmentSource).toContain('uniform sampler2D uMainSampler;');
    expect(fragmentSource).toContain('varying vec2 outTexCoord;');
    // Each node's result is a named local — the shader reads like the graph.
    expect(fragmentSource).toContain(
      'vec4 sample_1 = texture2D(uMainSampler, outTexCoord);',
    );
    expect(fragmentSource).toContain('gl_FragColor = sample_1;');
  });

  it('guards highp so it degrades on a device that lacks it', () => {
    // `highp` is optional in fragment shaders and using it unsupported is a
    // compile error, not a downgrade — so the choice belongs to the compiler
    // on the machine that runs the shader. Phaser writes all of its own
    // filter shaders this way.
    const {fragmentSource} = compileEffect(createEffectDocument());

    expect(fragmentSource).toContain(
      [
        '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        'precision highp float;',
        '#else',
        'precision mediump float;',
        '#endif',
      ].join('\n'),
    );
  });

  it('emits mediump unguarded, since every device has it', () => {
    // The old template asked `GL_FRAGMENT_PRECISION_HIGH` and then wrote
    // mediump in both branches — a question whose answer changed nothing.
    const {fragmentSource} = compileEffect(createEffectDocument(), {
      precision: 'mediump',
    });

    expect(fragmentSource).toContain('precision mediump float;');
    expect(fragmentSource).not.toContain('GL_FRAGMENT_PRECISION_HIGH');
  });

  it('refuses a graph with nothing wired to the output', () => {
    expect(() => compileEffect(emptyEffectDocument())).toThrow(
      EffectCompileError,
    );
  });

  it('emits only the nodes that reach the output', () => {
    const document = documentWith(
      [
        {id: 'sample-1', type: 'sample', position: at()},
        // Wired to nothing: a leftover experiment in the workspace.
        {id: 'sine-1', type: 'sine', position: at(200)},
      ],
      [
        edge(
          {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
          {node: 'sample-1', port: 'texture'},
        ),
        edge(
          {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
          {node: 'sample-1', port: 'uv'},
        ),
        edge(
          {node: 'sample-1', port: 'color'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    const {emittedNodeIds} = compileEffect(document);

    expect(emittedNodeIds).toContain('sample-1');
    expect(emittedNodeIds).not.toContain('sine-1');
  });

  it('uses a port literal when nothing is wired into it', () => {
    const document = documentWith(
      [{id: 'add-1', type: 'add', position: at(), params: {a: 0.25, b: 0.5}}],
      [
        edge(
          {node: 'add-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    expect(compileEffect(document).fragmentSource).toContain('(0.25 + 0.5)');
  });

  it('broadcasts a scalar across a generic node when a vector is wired in', () => {
    const document = documentWith(
      [
        {id: 'sample-1', type: 'sample', position: at()},
        {
          id: 'multiply-1',
          type: 'multiply',
          position: at(0, 200),
          params: {b: 0.5},
        },
      ],
      [
        edge(
          {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
          {node: 'sample-1', port: 'texture'},
        ),
        edge(
          {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
          {node: 'sample-1', port: 'uv'},
        ),
        edge(
          {node: 'sample-1', port: 'color'},
          {node: 'multiply-1', port: 'a'},
        ),
        edge(
          {node: 'multiply-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    // The vec4 on `a` resolves the node's generic type, so the 0.5 literal on
    // `b` is emitted as a vec4 rather than as a bare float.
    expect(compileEffect(document).fragmentSource).toContain(
      'vec4(0.5, 0.5, 0.5, 0.5)',
    );
  });

  it('shows a non-color value rather than refusing to render it', () => {
    const document = documentWith(
      [{id: 'length-1', type: 'length', position: at()}],
      [
        edge(
          {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
          {node: 'length-1', port: 'in'},
        ),
        edge(
          {node: 'length-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    const {fragmentSource} = compileEffect(document);
    expect(fragmentSource).toContain('float length_1 = length(outTexCoord);');
    expect(fragmentSource).toContain(
      'gl_FragColor = vec4(vec3(length_1), 1.0);',
    );
  });

  it('declares a helper function once however many nodes need it', () => {
    const document = documentWith(
      [
        {id: 'remap-1', type: 'remap', position: at()},
        {id: 'remap-2', type: 'remap', position: at(200)},
        {id: 'add-1', type: 'add', position: at(0, 200)},
      ],
      [
        edge({node: 'remap-1', port: 'out'}, {node: 'add-1', port: 'a'}),
        edge({node: 'remap-2', port: 'out'}, {node: 'add-1', port: 'b'}),
        edge(
          {node: 'add-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    const {fragmentSource} = compileEffect(document);
    const declarations = fragmentSource.match(
      /float effectRemap_float\(float value/g,
    );

    expect(declarations).toHaveLength(1);
  });

  it('rejects a wire whose type cannot reach the port it lands on', () => {
    const document = documentWith(
      [{id: 'sample-1', type: 'sample', position: at()}],
      [
        edge(
          {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
          {node: 'sample-1', port: 'texture'},
        ),
        // A float where a vec2 UV belongs.
        edge(
          {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
          {node: 'sample-1', port: 'uv'},
        ),
        edge(
          {node: 'sample-1', port: 'color'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    // float broadcasts to vec2, so this one is legal; the illegal direction is
    // the narrowing one.
    expect(() => compileEffect(document)).not.toThrow();

    const narrowing = documentWith(
      [
        {id: 'sine-1', type: 'sine', position: at()},
        {id: 'luminance-1', type: 'luminance', position: at(0, 200)},
      ],
      [
        edge(
          {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
          {node: 'luminance-1', port: 'color'},
        ),
        edge({node: 'luminance-1', port: 'out'}, {node: 'sine-1', port: 'x'}),
        edge(
          {node: 'sine-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    // vec2 cannot become the vec3 that Brightness Of takes.
    expect(() => compileEffect(narrowing)).toThrow(/vec2.*vec3/);

    // The error names the exact node and port — the editor's red outline and
    // port ring are built on this, so it is a contract, not a nicety.
    const error = captureError(() => compileEffect(narrowing));

    expect(error).toBeInstanceOf(EffectCompileError);
    expect((error as EffectCompileError).nodeId).toBe('luminance-1');
    expect((error as EffectCompileError).portId).toBe('color');
  });

  it('detects a cycle instead of recursing forever', () => {
    const document = documentWith(
      [
        {id: 'add-1', type: 'add', position: at()},
        {id: 'add-2', type: 'add', position: at(200)},
      ],
      [
        edge({node: 'add-1', port: 'out'}, {node: 'add-2', port: 'a'}),
        edge({node: 'add-2', port: 'out'}, {node: 'add-1', port: 'a'}),
        edge(
          {node: 'add-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    );

    expect(() => compileEffect(document)).toThrow(/loop/i);
  });

  describe('parameters', () => {
    const document = documentWith(
      [{id: 'multiply-1', type: 'multiply', position: at()}],
      [
        edge(
          {node: parameterNodeId('strength'), port: GHOST_PORT},
          {node: 'multiply-1', port: 'a'},
        ),
        edge(
          {node: 'multiply-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
      [
        {id: 'strength', name: 'strength', type: 'float', defaultValue: 1},
        {id: 'unused', name: 'unused', type: 'vec2', defaultValue: [0, 0]},
      ],
    );

    it('declares a uniform for every parameter', () => {
      const {fragmentSource} = compileEffect(document);

      expect(fragmentSource).toContain('uniform float uParam_strength;');
      expect(fragmentSource).toContain('uniform vec2 uParam_unused;');
    });

    it('reports which parameters the graph actually reads', () => {
      const {parameters} = compileEffect(document);

      expect(
        parameters.map(({parameterId, used}) => [parameterId, used]),
      ).toEqual([
        ['strength', true],
        ['unused', false],
      ]);
    });

    it('gives colliding parameter ids distinct uniform names', () => {
      const collidingDocument = documentWith(
        [],
        [
          edge(
            {node: parameterNodeId('a-b'), port: GHOST_PORT},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
        [
          {id: 'a-b', name: 'a b', type: 'float', defaultValue: 0},
          {id: 'a_b', name: 'a_b', type: 'float', defaultValue: 0},
        ],
      );

      const names = compileEffect(collidingDocument).parameters.map(
        parameter => parameter.name,
      );

      expect(new Set(names).size).toBe(2);
    });
  });

  describe('resolved port types', () => {
    it('reports the concrete type a generic port resolved to', () => {
      // This is what wire coloring runs on: the editor cannot know that this
      // multiply carries a vec4 without the compiler saying so.
      const document = documentWith(
        [
          {id: 'sample-1', type: 'sample', position: at()},
          {id: 'multiply-1', type: 'multiply', position: at(0, 200)},
        ],
        [
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'texture'},
          ),
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'uv'},
          ),
          edge(
            {node: 'sample-1', port: 'color'},
            {node: 'multiply-1', port: 'a'},
          ),
          edge(
            {node: 'multiply-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {resolvedPortTypes} = compileEffect(document);

      expect(resolvedPortTypes['multiply-1'].out).toBe('vec4');
      expect(resolvedPortTypes['sample-1'].color).toBe('vec4');
      expect(resolvedPortTypes[INPUT_UV_NODE_ID][GHOST_PORT]).toBe('vec2');
    });
  });

  describe('node notes', () => {
    it('leaves a standalone Comment node out of the shader entirely', () => {
      // No ports means nothing can wire to it, so the walk from the Output
      // never arrives — a comment is documentation, not computation.
      const document = documentWith(
        [
          {id: 'sample-1', type: 'sample', position: at()},
          {
            id: 'comment-1',
            type: 'comment',
            position: at(200),
            note: 'This effect ripples the picture sideways.',
          },
        ],
        [
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'texture'},
          ),
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'uv'},
          ),
          edge(
            {node: 'sample-1', port: 'color'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource, emittedNodeIds} = compileEffect(document);

      expect(emittedNodeIds).not.toContain('comment-1');
      expect(fragmentSource).not.toContain('ripples the picture sideways');
    });

    it("captions the node's statements in the generated shader", () => {
      const document = documentWith(
        [
          {
            id: 'sample-1',
            type: 'sample',
            position: at(),
            note: 'Read the picture.\nThis is where the color comes from.',
          },
        ],
        [
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'texture'},
          ),
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'uv'},
          ),
          edge(
            {node: 'sample-1', port: 'color'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);

      // One line comment per line of the note, directly above the statement.
      expect(fragmentSource).toContain(
        [
          '    // Read the picture.',
          '    // This is where the color comes from.',
          '    vec4 sample_1 = texture2D(uMainSampler, outTexCoord);',
        ].join('\n'),
      );
    });

    it('captions the noted node, not whatever was emitted upstream', () => {
      // Sine sits on top of a chain; resolving its input emits that chain
      // first, so a naive mark would put the comment above the chain's
      // opening statement instead of above Sine's own.
      const document = documentWith(
        [
          {id: 'multiply-1', type: 'multiply', position: at(), params: {b: 3}},
          {
            id: 'sine-1',
            type: 'sine',
            position: at(0, 100),
            note: 'Bends it into a wave.',
          },
        ],
        [
          edge(
            {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
            {node: 'multiply-1', port: 'a'},
          ),
          edge({node: 'multiply-1', port: 'out'}, {node: 'sine-1', port: 'x'}),
          edge(
            {node: 'sine-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);

      expect(fragmentSource).toContain(
        [
          '    float multiply_1 = (uTime * 3.0);',
          '    // Bends it into a wave.',
          '    float sine_1 = sin(multiply_1);',
        ].join('\n'),
      );
    });

    it('cannot be closed early by anything a learner types', () => {
      // Line comments, so a `*/` in a note is text rather than an escape.
      const document = documentWith(
        [
          {
            id: 'sample-1',
            type: 'sample',
            position: at(),
            note: 'tricky */ gl_FragColor = vec4(1.0);',
          },
        ],
        [
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'texture'},
          ),
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'uv'},
          ),
          edge(
            {node: 'sample-1', port: 'color'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);

      expect(fragmentSource).toContain(
        '// tricky */ gl_FragColor = vec4(1.0);',
      );
      // The smuggled statement is inside the comment, not beside it.
      expect(fragmentSource).not.toContain('\n    gl_FragColor = vec4(1.0);');
    });
  });

  describe('swizzled wires', () => {
    it('reads the chosen component off the source value', () => {
      const document = documentWith(
        [
          {id: 'sample-1', type: 'sample', position: at()},
          {id: 'sine-1', type: 'sine', position: at(200)},
        ],
        [
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'texture'},
          ),
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'uv'},
          ),
          // The green channel of the sampled color drives Sine.
          edge(
            {node: 'sample-1', port: 'color', swizzle: 'y'},
            {node: 'sine-1', port: 'x'},
          ),
          edge(
            {node: 'sine-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);
      // Named locals make the swizzle read cleanly, with no parentheses.
      expect(fragmentSource).toContain('float sine_1 = sin(sample_1.y);');
    });

    it('reads several components, in the order they were picked', () => {
      // The blue and red channels of the sampled color, used as a UV offset:
      // `.zx`, not `.xz` — order is a choice the learner made.
      const document = documentWith(
        [
          {id: 'sample-1', type: 'sample', position: at()},
          {id: 'sample-2', type: 'sample', position: at(200)},
        ],
        [
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'texture'},
          ),
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'uv'},
          ),
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-2', port: 'texture'},
          ),
          edge(
            {node: 'sample-1', port: 'color', swizzle: 'zx'},
            {node: 'sample-2', port: 'uv'},
          ),
          edge(
            {node: 'sample-2', port: 'color'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource, resolvedPortTypes} = compileEffect(document);

      expect(fragmentSource).toContain(
        'vec4 sample_2 = texture2D(uMainSampler, sample_1.zx);',
      );
      // The vec2 port took a vec2; no coercion was needed or invented.
      expect(resolvedPortTypes['sample-2'].color).toBe('vec4');
    });

    it('resolves a generic node to the narrowed type, not the source type', () => {
      const document = documentWith(
        [
          {id: 'sample-1', type: 'sample', position: at()},
          {id: 'multiply-1', type: 'multiply', position: at(200)},
        ],
        [
          edge(
            {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'texture'},
          ),
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'sample-1', port: 'uv'},
          ),
          edge(
            {node: 'sample-1', port: 'color', swizzle: 'w'},
            {node: 'multiply-1', port: 'a'},
          ),
          edge(
            {node: 'multiply-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {resolvedPortTypes} = compileEffect(document);
      // Multiply saw a float, not the vec4 the wire started as.
      expect(resolvedPortTypes['multiply-1'].out).toBe('float');
    });

    it('carries a scalar through when its source has narrowed to one number', () => {
      // Multiply was a vec2 when the `.y` was picked; its inputs changed and
      // it is a plain number now. There is only one value it could mean, and
      // GLSL will not let a component of a scalar be named at all.
      const document = documentWith(
        [
          {id: 'multiply-1', type: 'multiply', position: at(), params: {b: 2}},
          {id: 'sine-1', type: 'sine', position: at(200)},
        ],
        [
          edge(
            {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
            {node: 'multiply-1', port: 'a'},
          ),
          edge(
            {node: 'multiply-1', port: 'out', swizzle: 'y'},
            {node: 'sine-1', port: 'x'},
          ),
          edge(
            {node: 'sine-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);

      expect(fragmentSource).toContain('float sine_1 = sin(multiply_1);');
      expect(fragmentSource).not.toContain('multiply_1.y');
    });

    it('blames the wire when the source no longer has that component', () => {
      // Combine XY makes a vec2; asking it for `.z` is a wire left behind by
      // an edit, not something the learner could have picked today.
      const document = documentWith(
        [
          {id: 'combine2-1', type: 'combine2', position: at()},
          {id: 'sine-1', type: 'sine', position: at(200)},
        ],
        [
          edge(
            {node: 'combine2-1', port: 'out', swizzle: 'z'},
            {node: 'sine-1', port: 'x'},
          ),
          edge(
            {node: 'sine-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const error = captureError(() => compileEffect(document));

      expect(error).toBeInstanceOf(EffectCompileError);
      expect((error as EffectCompileError).message).toBe(
        'This wire takes Z from a value that only has XY.',
      );
      // Blamed at the input the wire lands on, which is where it is visible.
      expect((error as EffectCompileError).nodeId).toBe('sine-1');
      expect((error as EffectCompileError).portId).toBe('x');
    });
  });

  describe('switch and whole-number parameters', () => {
    /** Multiply a value by a switch: the classic on/off gate. */
    const gatedDocument = (type: 'bool' | 'int') =>
      documentWith(
        [{id: 'multiply-1', type: 'multiply', position: at()}],
        [
          edge(
            {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
            {node: 'multiply-1', port: 'a'},
          ),
          edge(
            {node: parameterNodeId('glow'), port: GHOST_PORT},
            {node: 'multiply-1', port: 'b'},
          ),
          edge(
            {node: 'multiply-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
        [{id: 'glow', name: 'glow', type, defaultValue: 1}],
      );

    it('declares a switch as a float uniform, so it can be multiplied', () => {
      const {fragmentSource, parameters} = compileEffect(gatedDocument('bool'));

      // `uniform bool` could not be multiplied by a number without a
      // conversion; a float carrying 0 or 1 gates a feature directly.
      expect(fragmentSource).toContain('uniform float uParam_glow;');
      expect(fragmentSource).toContain(
        'float multiply_1 = (uTime * uParam_glow);',
      );
      expect(parameters[0].type).toBe('float');
      // The declared kind survives for hosts building the knob's UI.
      expect(parameters[0].kind).toBe('bool');
    });

    it('declares a whole-number knob the same way', () => {
      const {fragmentSource, parameters} = compileEffect(gatedDocument('int'));

      expect(fragmentSource).toContain('uniform float uParam_glow;');
      expect(parameters[0].type).toBe('float');
      expect(parameters[0].kind).toBe('int');
    });

    it('lets a switch reach a port that wants a number', () => {
      // The wire out of the knob carries a float, so nothing about the graph
      // has to know the knob was a switch.
      const {resolvedPortTypes} = compileEffect(gatedDocument('bool'));

      expect(resolvedPortTypes[parameterNodeId('glow')].value).toBe('float');
    });
  });

  describe('color nodes', () => {
    it('emits a hand-picked RGBA color from its channel literals', () => {
      const document = documentWith(
        [
          {
            id: 'colorRgba-1',
            type: 'colorRgba',
            position: at(),
            params: {r: 0.25, g: 0.5},
          },
        ],
        [
          edge(
            {node: 'colorRgba-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);
      expect(fragmentSource).toContain(
        'vec4 colorRgba_1 = vec4(0.25, 0.5, 1.0, 1.0);',
      );
      expect(fragmentSource).toContain('gl_FragColor = colorRgba_1;');
    });

    it('converts HSLA through a helper, hue wireable to the clock', () => {
      const document = documentWith(
        [{id: 'colorHsla-1', type: 'colorHsla', position: at()}],
        [
          edge(
            {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
            {node: 'colorHsla-1', port: 'h'},
          ),
          edge(
            {node: 'colorHsla-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);
      expect(fragmentSource).toContain(
        'vec3 effectHslToRgb(float hue, float saturation, float lightness)',
      );
      expect(fragmentSource).toContain(
        'effectHslToRgb((uTime) / 360.0, 0.8, 0.6)',
      );
      expect(compileEffect(document).usesTime).toBe(true);
    });
  });

  describe('functions', () => {
    /** wobble(x) = sin(x * 3): one input, float out, used from the main graph. */
    const wobble = {
      id: 'fn1',
      name: 'Wobble',
      outputType: 'float' as const,
      parameters: [
        {id: 'param1', name: 'x', type: 'float' as const, defaultValue: 0.5},
      ],
      nodes: [
        {
          id: 'multiply-1',
          type: 'multiply',
          position: at(),
          params: {b: 3},
        },
        {id: 'sine-1', type: 'sine', position: at(0, 100)},
      ],
      edges: [
        edge(
          {node: parameterNodeId('param1'), port: GHOST_PORT},
          {node: 'multiply-1', port: 'a'},
        ),
        edge({node: 'multiply-1', port: 'out'}, {node: 'sine-1', port: 'x'}),
        edge(
          {node: 'sine-1', port: 'out'},
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        ),
      ],
    };

    const documentUsing = (
      functions: EffectDocument['functions'],
      nodes: EffectGraphNode[],
      edges: EffectDocument['edges'],
    ): EffectDocument => ({...emptyEffectDocument(), functions, nodes, edges});

    it('compiles a function to a GLSL helper and its use to a call', () => {
      const document = documentUsing(
        [wobble],
        [{id: 'call-1', type: 'fn:fn1', position: at()}],
        [
          edge(
            {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
            {node: 'call-1', port: 'param1'},
          ),
          edge(
            {node: 'call-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);

      expect(fragmentSource).toContain('float fn_fn1(float p_param1)');
      // The function body gets per-node locals too.
      expect(fragmentSource).toContain('float multiply_1 = (p_param1 * 3.0);');
      expect(fragmentSource).toContain('float sine_1 = sin(multiply_1);');
      expect(fragmentSource).toContain('return sine_1;');
      expect(fragmentSource).toContain('fn_fn1(uTime)');
      // The helper must be declared before main() uses it.
      expect(fragmentSource.indexOf('float fn_fn1')).toBeLessThan(
        fragmentSource.indexOf('void main'),
      );
    });

    it('feeds an unwired function input its default literal', () => {
      const document = documentUsing(
        [wobble],
        [{id: 'call-1', type: 'fn:fn1', position: at()}],
        [
          edge(
            {node: 'call-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      expect(compileEffect(document).fragmentSource).toContain('fn_fn1(0.5)');
    });

    it('declares nested functions in dependency order', () => {
      // outer(v) = wobble(v) + 1 — compiling outer must emit wobble first.
      const outer = {
        id: 'fn2',
        name: 'Outer',
        outputType: 'float' as const,
        parameters: [
          {id: 'param1', name: 'v', type: 'float' as const, defaultValue: 0},
        ],
        nodes: [
          {id: 'call-1', type: 'fn:fn1', position: at()},
          {id: 'add-1', type: 'add', position: at(0, 100), params: {b: 1}},
        ],
        edges: [
          edge(
            {node: parameterNodeId('param1'), port: GHOST_PORT},
            {node: 'call-1', port: 'param1'},
          ),
          edge({node: 'call-1', port: 'out'}, {node: 'add-1', port: 'a'}),
          edge(
            {node: 'add-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      };
      const document = documentUsing(
        [wobble, outer],
        [{id: 'use-1', type: 'fn:fn2', position: at()}],
        [
          edge(
            {node: 'use-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document);

      expect(fragmentSource.indexOf('float fn_fn1')).toBeLessThan(
        fragmentSource.indexOf('float fn_fn2'),
      );
      expect(fragmentSource).toContain('fn_fn1(p_param1)');
    });

    it('refuses functions that call themselves through each other', () => {
      const a = {
        ...wobble,
        id: 'fnA',
        name: 'A',
        nodes: [{id: 'call-1', type: 'fn:fnB', position: at()}],
        edges: [
          edge(
            {node: 'call-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      };
      const b = {
        ...wobble,
        id: 'fnB',
        name: 'B',
        nodes: [{id: 'call-1', type: 'fn:fnA', position: at()}],
        edges: [
          edge(
            {node: 'call-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      };
      const document = documentUsing(
        [a, b],
        [{id: 'use-1', type: 'fn:fnA', position: at()}],
        [
          edge(
            {node: 'use-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      expect(() => compileEffect(document)).toThrow(/cannot use itself/);
    });

    it('refuses the stock inputs inside a function, naming the fix', () => {
      const leaky = {
        ...wobble,
        id: 'fn9',
        name: 'Leaky',
        nodes: [{id: 'sine-1', type: 'sine', position: at()}],
        edges: [
          edge(
            {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
            {node: 'sine-1', port: 'x'},
          ),
          edge(
            {node: 'sine-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      };
      const document = documentUsing(
        [leaky],
        [{id: 'use-1', type: 'fn:fn9', position: at()}],
        [
          edge(
            {node: 'use-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const error = captureError(() => compileEffect(document));

      expect(error).toBeInstanceOf(EffectCompileError);
      expect((error as EffectCompileError).message).toMatch(
        /"Time" is not available inside a function/,
      );
      // Tagged with the function so the editor highlights the right workspace.
      expect((error as EffectCompileError).functionId).toBe('fn9');
    });

    it('refuses a body that cannot produce the declared output type', () => {
      const mismade = {
        ...wobble,
        id: 'fn3',
        name: 'Mismade',
        outputType: 'float' as const,
        nodes: [{id: 'combine2-1', type: 'combine2', position: at()}],
        edges: [
          edge(
            {node: 'combine2-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      };
      const document = documentUsing(
        [mismade],
        [{id: 'use-1', type: 'fn:fn3', position: at()}],
        [
          edge(
            {node: 'use-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      expect(() => compileEffect(document)).toThrow(
        /returns a float, but its output is wired to a vec2/,
      );
    });

    it('reports resolved port types per function body', () => {
      const document = documentUsing(
        [wobble],
        [{id: 'call-1', type: 'fn:fn1', position: at()}],
        [
          edge(
            {node: 'call-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {functionResolvedTypes} = compileEffect(document);

      expect(functionResolvedTypes.fn1['sine-1'].out).toBe('float');
    });
  });

  describe('clock use', () => {
    it('reports no clock use when the graph ignores time', () => {
      const compiled = compileEffect(createEffectDocument());

      expect(compiled.usesTime).toBe(false);
      expect(compiled.usesEffectTime).toBe(false);
    });

    it('reports clock use when the graph reads it', () => {
      const document = documentWith(
        [{id: 'sine-1', type: 'sine', position: at()}],
        [
          edge(
            {node: INPUT_TIME_NODE_ID, port: GHOST_PORT},
            {node: 'sine-1', port: 'x'},
          ),
          edge(
            {node: 'sine-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const compiled = compileEffect(document);

      expect(compiled.usesTime).toBe(true);
      expect(compiled.usesEffectTime).toBe(false);
    });
  });

  describe('inspection', () => {
    it('renders an intermediate value instead of the graph output', () => {
      const document = documentWith(
        [{id: 'distance-1', type: 'distance', position: at()}],
        [
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'distance-1', port: 'a'},
          ),
          edge(
            {node: 'distance-1', port: 'out'},
            {node: OUTPUT_NODE_ID, port: GHOST_PORT},
          ),
        ],
      );

      const {fragmentSource} = compileEffect(document, {
        inspect: {node: 'distance-1', port: 'out'},
      });

      // The radial gradient from the spec's worked example.
      expect(fragmentSource).toContain(
        'float distance_1 = distance(outTexCoord, vec2(0.5, 0.5));',
      );
      expect(fragmentSource).toContain(
        'gl_FragColor = vec4(vec3(distance_1), 1.0);',
      );
    });

    it('resolves types for a node the output does not reach', () => {
      // The editor leans on this: a half-built node has no entry in a normal
      // compile's `resolvedPortTypes`, so pointing `inspect` at its port is
      // how the editor learns what a generic port there is carrying — using
      // the compiler's own rules rather than a second copy of them.
      const document = documentWith(
        [{id: 'multiply-1', type: 'multiply', position: at()}],
        [
          edge(
            {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
            {node: 'multiply-1', port: 'a'},
          ),
          // Nothing wires multiply-1 onward; the graph's own output is bare.
        ],
      );

      expect(() => compileEffect(document)).toThrow(EffectCompileError);

      const {resolvedPortTypes} = compileEffect(document, {
        inspect: {node: 'multiply-1', port: 'out'},
      });

      expect(resolvedPortTypes['multiply-1'].out).toBe('vec2');
    });

    it('refuses to show a texture directly', () => {
      expect(() =>
        compileEffect(createEffectDocument(), {
          inspect: {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
        }),
      ).toThrow(/sample it first/);
    });
  });
});
