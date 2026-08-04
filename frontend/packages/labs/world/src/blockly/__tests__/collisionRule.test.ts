// The default project's `rules/collision.rule` — impenetrability, in blocks.
//
// The RESPONDING half: what measures overlap is `rules/contacts.rule` now
// (specs/COLLISION.md), and this reads what that wrote. What is left here is
// the Solid trait, the geometry of pushing one body out of another, and the
// step that walks the movers — ordered after `find`, so it acts on contacts
// that are this tick's.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

// Its `use rule`s name other rules of this project, which have to be registered
// before a module can be generated from it — the same call the editor makes.
registerDefaultProjectRules();

const source = DEFAULT_PROJECT.source.files.collisionRule.contents;
const meta = parseRuleMeta('rules/collision', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/collision.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(DEFAULT_PROJECT.source.files.collisionRule.name).toBe(
      'collision.rule',
    );
    expect(source).not.toContain('world-lab');
  });

  it('declares only the trait that says "you cannot pass"', () => {
    // A Solid blocks every side; being able to collide at all is Contacts'
    // (every actor with a box has that, whether or not anything pushes it), and
    // gravity's "Acts as Ground" is a surface you may pass up through. A tile
    // carries several of these, and they were never the same thing.
    expect(meta.name).toBe('Collisions');
    expect(meta.ability).toBe('Has Collisions');
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'SolidTrait',
    ]);
    expect(meta.traits[0].requires).toEqual(['Contacts#CanCollideTrait']);
  });

  it('is written against Contacts, and says so', () => {
    expect(meta.requires).toEqual(['Physics', 'Contacts']);
    expect(module_).toContain('from "rules/contacts"');
    expect(module_).not.toContain('rules/collision');
  });

  it('resolves one pair at a time, one axis at a time', () => {
    // The decomposition that keeps the step readable — the step loops, these do
    // the geometry for a single body against a single solid — and the split by
    // AXIS, which is what stops a jump sticking to a wall: the caller decides
    // which axis a pass resolves, rather than each pair deciding for itself.
    const [sideways, upOrDown] = meta.actions;

    expect(meta.actions).toHaveLength(2);
    expect(sideways.name).toContain('sideways');
    expect(upOrDown.name).toContain('up or down');
    for (const push of meta.actions) {
      expect(push.params.map(param => param.type)).toEqual([
        'actor',
        'actor',
        'number',
      ]);
    }
  });

  it('explains each block it defines', () => {
    // The tooltip a learner gets when they hover the block in the toolbox. A
    // member with none has a tooltip that repeats its name back at them.
    for (const member of [...meta.queries, ...meta.actions]) {
      expect(member.description, member.name).toMatch(/\w+ \w+/);
    }
  });

  it('runs on contacts that are this tick’s', () => {
    // The per-tick chain: velocity → move → find who is touching → push them
    // apart → land. Anchoring on `find` rather than on `reposition` is what
    // stops the two from being unordered relative to each other.
    const [step] = meta.steps;
    expect(step.id).toBe('resolve');
    expect(step.order.kind).toBe('after');
    expect(step.order.anchor?.ownerRef.ruleName).toBe('Contacts');
    expect(step.order.anchor?.stepId).toBe('find');
  });
});
