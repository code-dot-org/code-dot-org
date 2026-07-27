// Builds an immutable Rule (INTERFACE.md "builder style system"). A Rule is a
// set of required Rules, world-scoped Properties and Actions, Events, Traits,
// and per-tick Steps. Members are returned as they are added so a learner can
// capture and export them; `build()` freezes the traits and returns the Rule.

import {Trait} from '../core/Trait';
import type {
  GameEvent,
  Property,
  PropertyType,
  Rule,
  Step,
  StepFn,
  WorldAction,
} from '../core/types';
import type {World} from '../core/World';

export class RuleBuilder {
  private readonly id: string;
  private readonly name: string;
  private requiredRules: Rule[] = [];
  private readonly properties: Record<string, Property> = {};
  private readonly actions: Record<string, WorldAction> = {};
  private readonly events: Record<string, GameEvent> = {};
  private readonly traitMap: Record<string, Trait> = {};
  private readonly steps: Record<string, Step> = {};
  private built = false;

  constructor(opts: {id: string; name: string}) {
    this.id = opts.id;
    this.name = opts.name;
  }

  private assertMutable(): void {
    if (this.built) {
      throw new Error(`Rule '${this.id}' is already built`);
    }
  }

  /** Rules this one depends on; using it uses them too. */
  requires(rules: Rule[]): this {
    this.assertMutable();
    this.requiredRules = [...this.requiredRules, ...rules];
    return this;
  }

  /** Add a world-scoped property with a default value. */
  addProperty<T>(
    id: string,
    type: PropertyType,
    defaultValue: T,
    opts: {readonly?: boolean; name?: string} = {},
  ): Property<T> {
    this.assertMutable();
    const property: Property<T> = {
      id,
      type,
      default: defaultValue,
      readonly: opts.readonly ?? false,
      name: opts.name,
      scope: 'world',
      ownerId: this.id,
    };
    this.properties[id] = property as Property;
    return property;
  }

  /** Add a world-scoped action (a mutator invoked via `world.act`). */
  addAction(
    id: string,
    apply: (world: World, ...args: unknown[]) => void,
    opts: {name?: string} = {},
  ): WorldAction {
    this.assertMutable();
    const action: WorldAction = {id, name: opts.name, ownerId: this.id, apply};
    this.actions[id] = action;
    return action;
  }

  /** Create a trait this rule maintains; describe it further on the return. */
  addTrait(opts: {id: string; name: string}): Trait {
    this.assertMutable();
    const trait = new Trait(opts, this.id);
    this.traitMap[opts.id] = trait;
    return trait;
  }

  addEvent(id: string, opts: {name?: string} = {}): GameEvent {
    this.assertMutable();
    const event: GameEvent = {id, name: opts.name, ownerId: this.id};
    this.events[id] = event;
    return event;
  }

  /** Add a per-tick step with no ordering constraint. */
  addStep(id: string, run: StepFn): Step {
    return this.registerStep(id, run, {kind: 'free'});
  }

  /** Add a per-tick step that must run before another rule's step. */
  addStepBefore(id: string, anchor: Step, run: StepFn): Step {
    return this.registerStep(id, run, {kind: 'before', anchor});
  }

  /** Add a per-tick step that must run after another rule's step. */
  addStepAfter(id: string, anchor: Step, run: StepFn): Step {
    return this.registerStep(id, run, {kind: 'after', anchor});
  }

  private registerStep(id: string, run: StepFn, order: Step['order']): Step {
    this.assertMutable();
    const step: Step = {id, ownerId: this.id, order, run};
    this.steps[id] = step;
    return step;
  }

  /** Freeze the traits and produce the immutable Rule. */
  build(): Rule {
    this.assertMutable();
    this.built = true;
    for (const trait of Object.values(this.traitMap)) {
      trait.freeze();
    }
    return Object.freeze({
      id: this.id,
      name: this.name,
      requires: Object.freeze([...this.requiredRules]),
      properties: Object.freeze({...this.properties}),
      actions: Object.freeze({...this.actions}),
      events: Object.freeze({...this.events}),
      traits: Object.freeze({...this.traitMap}),
      steps: Object.freeze({...this.steps}),
    });
  }
}
