import type {EffectParameter} from '../model/types';

/**
 * Names the generated shader uses for its inputs.
 *
 * These match Phaser 4's filter conventions so a compiled effect can be handed
 * to a `BaseFilterShader` render node without a translation layer:
 * `uMainSampler` is the texture being filtered and `outTexCoord` is the
 * interpolated UV. The rest are ours, set from the effect controller each frame.
 *
 * @see https://docs.phaser.io/phaser/concepts/filters
 */
export const UNIFORM_MAIN_SAMPLER = 'uMainSampler';
export const VARYING_TEX_COORD = 'outTexCoord';

/** Monotonic engine runtime, in seconds. Drives continuous animation. */
export const UNIFORM_TIME = 'uTime';
/** Seconds since this effect was applied. Drives one-shot animation. */
export const UNIFORM_EFFECT_TIME = 'uEffectTime';
/** Size of the target being filtered, in pixels. */
export const UNIFORM_RESOLUTION = 'uResolution';

const PARAMETER_UNIFORM_PREFIX = 'uParam_';

/** GLSL identifiers are ASCII word characters and must not start with a digit. */
function sanitizeIdentifier(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9_]/g, '_');
  return /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned;
}

/**
 * Map each parameter id to a unique GLSL identifier.
 *
 * The default prefix produces uniform names for document parameters; function
 * inputs use the same machinery with an argument prefix. Sanitizing is lossy —
 * `strength-x` and `strength_x` collapse to the same identifier — so
 * collisions are broken with a numeric suffix rather than silently producing
 * a shader with a duplicated name.
 */
export function buildParameterUniformNames(
  parameters: readonly EffectParameter[],
  prefix: string = PARAMETER_UNIFORM_PREFIX,
): Map<string, string> {
  const names = new Map<string, string>();
  const taken = new Set<string>();

  for (const parameter of parameters) {
    const base = `${prefix}${sanitizeIdentifier(parameter.id)}`;
    let name = base;
    let suffix = 2;
    while (taken.has(name)) {
      name = `${base}_${suffix}`;
      suffix += 1;
    }
    taken.add(name);
    names.set(parameter.id, name);
  }

  return names;
}
