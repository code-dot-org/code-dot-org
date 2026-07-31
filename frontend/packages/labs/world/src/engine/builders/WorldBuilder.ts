// Describes a World — the rules in play — and instantiates it. A World is a
// surface that glues rules and actors together (INTERFACE.md); `hideRule` marks
// a rule for the simple view without removing it, and `set` overrides a
// world-scoped property's default.

import type {EffectDocument} from '../../effect/model/types';
import type {AnimationDef} from '../core/animationTypes';
import type {AppliedEffectSpec, Property, Rule} from '../core/types';
import {World} from '../core/World';

export class WorldBuilder {
  private readonly id: string;
  private readonly name: string;
  private rules: Rule[] = [];
  private readonly hidden = new Set<Rule>();
  private readonly overrides: Array<[Property, unknown]> = [];
  private readonly animations: Record<string, AnimationDef> = {};
  private readonly effects: AppliedEffectSpec[] = [];

  constructor(opts: {id: string; name: string}) {
    this.id = opts.id;
    this.name = opts.name;
  }

  useRules(rules: Rule[]): this {
    this.rules = [...this.rules, ...rules];
    return this;
  }

  /** Mark a rule hidden in the simple view (still active at runtime). */
  hideRule(rule: Rule): this {
    this.hidden.add(rule);
    return this;
  }

  /** Whether a rule is marked hidden (for the interface layer). */
  isHidden(rule: Rule): boolean {
    return this.hidden.has(rule);
  }

  /** Override a world-scoped property's initial value. */
  set<T>(property: Property<T>, value: T): this {
    this.overrides.push([property, value]);
    return this;
  }

  /**
   * Register animations (typically from imported `.anim` files) by id, in
   * addition to the stock animations the active rules ship.
   */
  useAnimations(defs: Record<string, AnimationDef>): this {
    Object.assign(this.animations, defs);
    return this;
  }

  /**
   * Play an effect across the whole viewport (specs/EFFECT_EDITOR.md).
   *
   * The World counterpart to `ActorBuilder.useEffect`: that one filters one
   * actor's own pixels, this one filters everything the camera has drawn — the
   * underwater distortion covering a whole scene, rather than a wobble on one
   * fish. Same document, same parameters; only the surface it lands on differs.
   *
   * @param path     the effect's module path (`effects/underwater`)
   * @param document the parsed `.effect` file, imported as JSON by the bundler
   * @param values   values for the effect's declared parameters, by parameter id
   */
  useEffect(
    path: string,
    document: EffectDocument,
    values?: AppliedEffectSpec['values'],
  ): this {
    this.effects.push(values ? {path, document, values} : {path, document});
    return this;
  }

  /** Create a live World from this description. */
  instantiate(): World {
    return new World({
      id: this.id,
      name: this.name,
      rules: [...this.rules],
      overrides: [...this.overrides],
      animations: Object.entries(this.animations),
      effects: [...this.effects],
    });
  }
}
