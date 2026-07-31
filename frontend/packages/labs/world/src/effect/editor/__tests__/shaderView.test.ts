import {describe, expect, it} from 'vitest';

import {compileEffect} from '../../compiler/compileEffect';
import {createEffectDocument} from '../../model/document';
import {preambleLineCount, splitShaderPreamble} from '../shaderView';

describe('splitShaderPreamble', () => {
  it('folds away everything before the first declaration', () => {
    const {fragmentSource} = compileEffect(createEffectDocument());
    const {preamble, body} = splitShaderPreamble(fragmentSource);

    // The setup: version, pragma, and the precision guard.
    expect(preamble).toContain('#version 100');
    expect(preamble).toContain('#pragma phaserTemplate(shaderName)');
    expect(preamble).toContain('#ifdef GL_FRAGMENT_PRECISION_HIGH');
    expect(preamble).toContain('precision highp float;');

    // The effect: what this particular graph became, starting at its uniforms.
    expect(body.startsWith('uniform sampler2D uMainSampler;')).toBe(true);
    expect(body).toContain('void main ()');
    expect(body).not.toContain('#');

    // Nothing is lost: the two halves are still the whole shader.
    expect(`${preamble}\n${body}`).toBe(fragmentSource);
  });

  it('folds the unguarded form too, without knowing its length', () => {
    // Asking for mediump emits one bare `precision` line and no directives.
    const {fragmentSource} = compileEffect(createEffectDocument(), {
      precision: 'mediump',
    });
    const {preamble, body} = splitShaderPreamble(fragmentSource);

    expect(preamble).toContain('precision mediump float;');
    expect(preamble).not.toContain('#ifdef');
    expect(body.startsWith('uniform sampler2D')).toBe(true);
  });

  it('never leaves the panel blank when there is no body', () => {
    const onlySetup = '#version 100\nprecision highp float;\n';
    const {preamble, body} = splitShaderPreamble(onlySetup);

    expect(preamble).toBe('');
    expect(body).toBe(onlySetup);
  });
});

describe('preambleLineCount', () => {
  it('counts what is folded, ignoring the blank separator', () => {
    const {fragmentSource} = compileEffect(createEffectDocument());
    const {preamble} = splitShaderPreamble(fragmentSource);

    // #version, #pragma, #ifdef, highp, #else, mediump, #endif.
    expect(preambleLineCount(preamble)).toBe(7);
  });
});
