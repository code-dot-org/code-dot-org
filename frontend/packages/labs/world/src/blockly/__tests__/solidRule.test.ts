// The default project's `rules/solid.rule` — impenetrability, in blocks.
//
// The RESPONDING half: what measures overlap is `rules/collisions.rule` now
// (specs/COLLISION.md), and this reads what that wrote. What is left here is
// the Solid trait, the geometry of pushing one body out of another, and the
// step that walks the movers — ordered after `find`, so it acts on contacts
// that are this tick's.

import {describe, expect, it} from 'vitest';

import {starterFile} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

// Its `use rule`s name other rules of this project, which have to be registered
// before a module can be generated from it — the same call the editor makes.
registerDefaultProjectRules();

const source = starterFile('solidRule').contents;
const meta = parseRuleMeta('rules/solid', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/solid.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(starterFile('solidRule').name).toBe('solid.rule');
    expect(source).not.toContain('world-lab');
  });

  it('declares only the trait that says "you cannot pass"', () => {
    // A Solid blocks every side; being able to collide at all is Contacts'
    // (every actor with a box has that, whether or not anything pushes it), and
    // gravity's "Acts as Ground" is a surface you may pass up through. A tile
    // carries several of these, and they were never the same thing.
    expect(meta.name).toBe('Solid Bodies');
    expect(meta.ability).toBe('Has Solid Bodies');
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'SolidTrait',
    ]);
    expect(meta.traits[0].requires).toEqual(['Collisions#CanCollideTrait']);
  });

  it('is written against Contacts, and says so', () => {
    expect(meta.requires).toEqual(['Physics', 'Collisions']);
    expect(module_).toContain('from "rules/collisions"');
    expect(module_).not.toContain('rules/solid');
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

  it('says what a friction of 1 is worth, once, on the world', () => {
    // `friction` is the 0…1 coefficient every other tool uses, so it needs
    // something to be a fraction OF. That is a world property in gravity's own
    // units, defaulting to the same 9 — so friction 1 holds a body in an
    // ordinary world, and a heavier world raises this once instead of every
    // surface being re-tuned.
    const grip = meta.properties.find(
      property => property.id === 'grip_strength',
    );

    expect(grip?.scope).toBe('world');
    expect(grip?.type).toBe('number');
    expect(grip?.default).toBe(9);
  });

  it('takes the response as numbers on the solid, defaulting to a dead stop', () => {
    // The trampoline is bouncy and the ice is slippery — properties of the
    // SOLID, not of whatever hits it (specs/COLLISION.md). They sit on this
    // rule's own trait, so every solid has them and the push actions need no
    // "if it has trait" guard; and 0 and 0 are what the rule did before there
    // were numbers for it.
    const numbers = meta.properties.filter(
      property => property.ownerTraitId === 'Solid',
    );

    expect(numbers.map(property => property.id)).toEqual([
      'bounciness',
      'friction',
      'drag',
    ]);
    for (const property of numbers) {
      expect(property.type).toBe('number');
      expect(property.default).toBe(0);
      expect(property.scope).toBe('actor');
    }
  });

  it('keeps every coefficient between 0 and 1', () => {
    // Bounciness above one hands back more speed than arrived — energy from
    // nowhere, every bounce. Friction and drag above one reverse what they are
    // meant to slow. All three reads go through a query that says so once, by
    // name, rather than the same comparison written out six times.
    const clamp = meta.queries.find(
      query => query.ref.exportName === 'KeptBetween0And1Query',
    );

    expect(clamp?.returns).toBe('number');
    expect(clamp?.params.map(param => param.type)).toEqual(['number']);
    // Three coefficients on two axes, and friction is read again by the test
    // that decides whether the body is held.
    expect(
      (source.match(/world_query_SolidBodies_KeptBetween0And1Query/g) ?? [])
        .length,
    ).toBeGreaterThanOrEqual(6);
  });

  it('keeps friction and drag apart, because neither can do the other’s job', () => {
    // Friction SUBTRACTS, so it either stops a body or lets it keep gathering
    // speed — it cannot say "slide at this speed". Drag SCALES, so it settles
    // at a steady slide but can never hold anything. A wall-slide wants drag; a
    // wall-grab wants friction; ice wants neither.
    expect(source).toContain('"OP": "POWER"'); // drag scales, over the frame
    expect(source).toContain('world_query_SolidBodies_SlowedByQuery'); // friction subtracts
  });

  it('takes friction off the speed rather than scaling it', () => {
    // A scaling cannot hold a body against a constant pull: gravity ADDS a
    // fixed amount every frame and a fraction of what is there can only ever
    // balance it at some terminal speed. So friction subtracts, in gravity's
    // own units and over the frame's own length — `friction × frame`, the same
    // shape as `strength × frame`.
    const slowed = meta.queries.find(
      query => query.ref.exportName === 'SlowedByQuery',
    );

    expect(slowed?.returns).toBe('number');
    expect(slowed?.params.map(param => param.type)).toEqual([
      'number',
      'number',
    ]);
    // Once per axis.
    expect(
      (source.match(/world_query_SolidBodies_SlowedByQuery/g) ?? []).length,
    ).toBe(2);
  });

  it('puts the body back when the grip takes the whole slide', () => {
    // Velocity alone cannot pin anything: gravity adds its speed before the
    // move and friction takes it away after, so a body on a perfectly grippy
    // wall still travels one frame's worth every frame. Undoing that frame's
    // slide is what makes "grippier than gravity" mean stuck.
    expect(source).toContain('logic_ternary');
    expect(source.match(/colWas2/g)?.length).toBeGreaterThan(2);
  });

  it('reads them off the solid it is pushing out of, never off the body', () => {
    // The trampoline is bouncy and the ice is slippery: both numbers belong to
    // the surface. A read that took them from the moving body would be a
    // different rule, and a different sentence.
    const readsFrom: string[] = [];
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (!node || typeof node !== 'object') {
        return;
      }
      const block = node as {
        type?: string;
        inputs?: Record<string, {block?: {fields?: {VAR?: {name?: string}}}}>;
      };
      if (
        /^world_get_SolidBodies_(Bounciness|Friction|Drag)Property$/.test(
          block.type ?? '',
        )
      ) {
        readsFrom.push(
          block.inputs?.ACTOR?.block?.fields?.VAR?.name ?? '(none)',
        );
      }
      Object.values(node as Record<string, unknown>).forEach(walk);
    };
    walk(JSON.parse(source));

    expect(readsFrom.length).toBeGreaterThanOrEqual(4);
    expect(new Set(readsFrom)).toEqual(new Set(['solid']));
  });

  it('runs on contacts that are this tick’s', () => {
    // The per-tick chain: velocity → move → find who is touching → push them
    // apart → land. Anchoring on `find` rather than on `reposition` is what
    // stops the two from being unordered relative to each other.
    const [step] = meta.steps;
    expect(step.id).toBe('resolve');
    expect(step.order.kind).toBe('after');
    expect(step.order.anchor?.ownerRef.ruleName).toBe('Collisions');
    expect(step.order.anchor?.stepId).toBe('find');
  });
});
