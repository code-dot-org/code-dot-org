// Describes a World — the rules in play — and instantiates it. A World is a
// surface that glues rules and actors together (INTERFACE.md); `hideRule` marks
// a rule for the simple view without removing it, and `set` overrides a
// world-scoped property's default.

import type {Property, Rule} from '../core/types';
import {World} from '../core/World';

export class WorldBuilder {
  private readonly id: string;
  private readonly name: string;
  private rules: Rule[] = [];
  private readonly hidden = new Set<Rule>();
  private readonly overrides: Array<[Property, unknown]> = [];

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

  /** Create a live World from this description. */
  instantiate(): World {
    return new World({
      id: this.id,
      name: this.name,
      rules: [...this.rules],
      overrides: [...this.overrides],
    });
  }
}
