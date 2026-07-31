import type {
  EffectLiteral,
  EffectParameterType,
  EffectValueType,
} from '../model/types';

/** Component count per type. Samplers are opaque handles, hence zero. */
const COMPONENT_COUNT: Record<EffectValueType, number> = {
  float: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  sampler2D: 0,
};

const VECTOR_TYPES: readonly EffectValueType[] = [
  'float',
  'vec2',
  'vec3',
  'vec4',
];

export function componentCount(type: EffectValueType): number {
  return COMPONENT_COUNT[type];
}

/**
 * The GLSL type a parameter actually becomes.
 *
 * `bool` and `int` are how a knob is *edited*, not what it carries: both are
 * `float` uniforms, 0/1 for a switch and whole numbers for a counter. Keeping
 * them floats is what lets a switch be multiplied straight into a value to
 * turn a feature on and off, with no conversion node in between.
 */
export function parameterValueType(type: EffectParameterType): EffectValueType {
  return type === 'bool' || type === 'int' ? 'float' : type;
}

/**
 * What a parameter of this type starts at when it is first created.
 *
 * A switch starts *on*, which is the one case that is not simply "zero":
 * wiring a fresh switch into a graph to gate a feature should not silently
 * turn that feature off and leave the learner wondering what they broke.
 */
export function defaultParameterValue(
  type: EffectParameterType,
): EffectLiteral {
  return type === 'bool' ? 1 : defaultLiteral(parameterValueType(type));
}

/** Whether a parameter's editor should hold it to whole numbers. */
export function isWholeNumberParameter(type: EffectParameterType): boolean {
  return type === 'bool' || type === 'int';
}

/** True for the numeric types — everything except `sampler2D`. */
export function isNumericType(type: EffectValueType): boolean {
  return VECTOR_TYPES.includes(type);
}

/**
 * The type that can hold both operands, or null when there is none.
 *
 * GLSL promotes a scalar against a vector (`float * vec3` is legal) but not a
 * vec2 against a vec3, which mirrors this rule exactly.
 */
export function widen(
  left: EffectValueType,
  right: EffectValueType,
): EffectValueType | null {
  if (left === right) {
    return left;
  }
  if (!isNumericType(left) || !isNumericType(right)) {
    return null;
  }
  if (left === 'float') {
    return right;
  }
  if (right === 'float') {
    return left;
  }
  // vec2 against vec3 and friends: no unambiguous promotion.
  return null;
}

/**
 * Wrap `expression` so it reads as `to` where it currently reads as `from`,
 * or return null when no implicit conversion exists.
 *
 * Only scalar-to-vector broadcast is implicit. Narrowing (vec4 → vec3) and
 * cross-width widening (vec2 → vec3) stay explicit so a learner sees a wire
 * type error rather than a silently dropped or invented component.
 */
export function coerce(
  expression: string,
  from: EffectValueType,
  to: EffectValueType,
): string | null {
  if (from === to) {
    return expression;
  }
  if (from === 'float' && isNumericType(to)) {
    return `${to}(${expression})`;
  }
  return null;
}

/** Component letters in canonical order. Index is the component's position. */
export const SWIZZLE_COMPONENTS = 'xyzw';

/** The type a swizzle produces: one letter is a float, four are a vec4. */
export function swizzleResultType(swizzle: string): EffectValueType {
  const types: EffectValueType[] = ['float', 'vec2', 'vec3', 'vec4'];
  return types[swizzle.length - 1] ?? 'float';
}

/**
 * Whether components of this type are spelled RGBA rather than XYZW.
 *
 * A vec4 in this editor is a color in all but name: it is what Sample returns,
 * what the Output takes, and what the color nodes build. Anything narrower is
 * far more often a coordinate. GLSL treats the two spellings as identical, so
 * this is presentation only — documents always store `xyzw`.
 */
function usesColorLetters(type: EffectValueType): boolean {
  return type === 'vec4';
}

/** How one component of `type` is spelled for a learner: "R", or "X". */
export function componentLabel(
  type: EffectValueType,
  component: string,
): string {
  const index = SWIZZLE_COMPONENTS.indexOf(component);
  if (index < 0) {
    return component.toUpperCase();
  }
  return (usesColorLetters(type) ? 'rgba' : 'xyzw')[index].toUpperCase();
}

/** How a whole swizzle reads — "R", or "RG" for a pair. */
export function swizzleLabel(type: EffectValueType, swizzle: string): string {
  return [...swizzle]
    .map(component => componentLabel(type, component))
    .join('');
}

/** Every component `type` has, spelled for a learner: "XY", "RGBA". */
export function componentsOf(type: EffectValueType): string {
  return swizzleLabel(type, SWIZZLE_COMPONENTS.slice(0, componentCount(type)));
}

/** Whether every letter of `swizzle` names a component `from` actually has. */
export function swizzleFits(from: EffectValueType, swizzle: string): boolean {
  if (swizzle.length < 1 || swizzle.length > 4) {
    return false;
  }
  const available = componentCount(from);
  return [...swizzle].every(letter => {
    const index = SWIZZLE_COMPONENTS.indexOf(letter);
    return index >= 0 && index < available;
  });
}

/**
 * Read components off an expression.
 *
 * GLSL only accepts a swizzle on a postfix expression, so anything that is not
 * already an identifier or member chain has to be parenthesized. Since the
 * compiler binds each node's result to a named local, the simple form is the
 * common one.
 */
export function applySwizzle(expression: string, swizzle: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/.test(expression)
    ? `${expression}.${swizzle}`
    : `(${expression}).${swizzle}`;
}

/** A GLSL float literal. `1` is an int in GLSL ES 1.00, so always emit a point. */
export function formatFloat(value: number): string {
  if (!Number.isFinite(value)) {
    // GLSL ES 1.00 has no inf/nan literals; clamp to something a shader can hold.
    return value > 0 ? '3.4e38' : Number.isNaN(value) ? '0.0' : '-3.4e38';
  }
  return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

/** Render a literal as a GLSL constructor of the given type. */
export function formatLiteral(
  value: EffectLiteral,
  type: EffectValueType,
): string {
  const components = componentCount(type);
  if (components === 0) {
    throw new Error(`Cannot express a literal of type ${type}`);
  }

  const values = typeof value === 'number' ? [value] : value;
  if (type === 'float') {
    return formatFloat(values[0] ?? 0);
  }

  // A single component broadcasts, matching GLSL's own vecN(float) constructor.
  const filled =
    values.length === 1
      ? new Array<number>(components).fill(values[0] ?? 0)
      : Array.from(
          {length: components},
          (_unused, index) => values[index] ?? 0,
        );

  return `${type}(${filled.map(formatFloat).join(', ')})`;
}

/** The zero value for a type — vec4 defaults to opaque black rather than clear. */
export function defaultLiteral(type: EffectValueType): EffectLiteral {
  switch (type) {
    case 'float':
      return 0;
    case 'vec2':
      return [0, 0];
    case 'vec3':
      return [0, 0, 0];
    case 'vec4':
      return [0, 0, 0, 1];
    default:
      throw new Error(`No literal value exists for type ${type}`);
  }
}
