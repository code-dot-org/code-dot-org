import {
  UNIFORM_EFFECT_TIME,
  UNIFORM_MAIN_SAMPLER,
  UNIFORM_RESOLUTION,
  UNIFORM_TIME,
  VARYING_TEX_COORD,
} from '../glsl/symbols';
import {translate} from '../localization';
import type {EffectValueType} from '../model/types';

import {EffectCompileError} from './types';

export interface FragmentShaderParts {
  precision: 'mediump' | 'highp';
  /** `uniform <type> <name>;` lines for the effect's parameters. */
  parameterUniforms: string[];
  /** Helper function declarations, in the order they were first requested. */
  helpers: string[];
  /** Statements for the body of `main()`, already indented one level. */
  body: string[];
  /** The `vec4` expression assigned to `gl_FragColor`. */
  color: string;
}

/**
 * Assemble a complete GLSL ES 1.00 fragment shader.
 *
 * The layout mirrors Phaser 4's own filter shaders: a `#version 100` header,
 * the `phaserTemplate(shaderName)` pragma the renderer looks for, and the
 * precision guard it uses everywhere. Straying from that shape is what breaks
 * a shader when it is handed to a `BaseFilterShader` render node.
 */
export function buildFragmentShader(parts: FragmentShaderParts): string {
  const lines = ['#version 100', '#pragma phaserTemplate(shaderName)', ''];

  if (parts.precision === 'highp') {
    // `highp` is optional in fragment shaders, so the guard puts the question
    // to the compiler on the device that will actually run this — the only
    // machine that can answer it. A `.effect` is authored once and played
    // anywhere, so choosing at authoring time would be a guess about someone
    // else's GPU. Phaser's own filter shaders are written exactly this way.
    lines.push(
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
    );
  } else {
    // Nothing to ask: every implementation must support mediump. Wrapping it
    // in the guard would branch between two identical answers.
    lines.push('precision mediump float;');
  }

  lines.push(
    '',
    `uniform sampler2D ${UNIFORM_MAIN_SAMPLER};`,
    `uniform float ${UNIFORM_TIME};`,
    `uniform float ${UNIFORM_EFFECT_TIME};`,
    `uniform vec2 ${UNIFORM_RESOLUTION};`,
  );

  if (parts.parameterUniforms.length > 0) {
    lines.push('', ...parts.parameterUniforms);
  }

  lines.push('', `varying vec2 ${VARYING_TEX_COORD};`);

  for (const helper of parts.helpers) {
    lines.push('', helper);
  }

  lines.push('', 'void main ()', '{');
  lines.push(...parts.body.map(statement => `    ${statement}`));
  lines.push(`    gl_FragColor = ${parts.color};`, '}', '');

  return lines.join('\n');
}

/**
 * Present a value of any type as something visible on screen.
 *
 * This is the "eye" inspector's job: a UV coordinate is not a color, but
 * showing it as red-green is far more useful to a learner than refusing to
 * render. Scalars show as grayscale, 2D values fill blue with zero, and 3D
 * values become opaque.
 */
export function visualizeAsColor(
  expression: string,
  type: EffectValueType,
  location?: {node: string; port: string},
): string {
  switch (type) {
    case 'float':
      return `vec4(vec3(${expression}), 1.0)`;
    case 'vec2':
      return `vec4(${expression}, 0.0, 1.0)`;
    case 'vec3':
      return `vec4(${expression}, 1.0)`;
    case 'vec4':
      return expression;
    default:
      throw new EffectCompileError(
        translate('A texture cannot be shown directly — sample it first.'),
        location,
      );
  }
}
