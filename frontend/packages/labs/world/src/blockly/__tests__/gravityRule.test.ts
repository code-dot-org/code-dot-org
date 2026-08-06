// The default project's `rules/gravity.rule` — the first rule authored in
// Blockly rather than shimmed from the engine.
//
// It is checked here rather than left to the browser because it is the proof
// that a `.rule` can be a real rule: parse the shipped file, and assert the
// module that comes out declares what the built-in `GravityRule` declares.
// Everything a `.actor` or `.world` in the same project references by name —
// the traits, the properties, the events — has to survive that round trip, or
// the default project does not load.

import {describe, expect, it} from 'vitest';

import {starterFile} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

// Its `use rule`s name other rules of this project, which have to be registered
// before a module can be generated from it — the same call the editor makes.
registerDefaultProjectRules();

const source = starterFile('gravityRule').contents;
const meta = parseRuleMeta('rules/gravity', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/gravity.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(starterFile('gravityRule').name).toBe('gravity.rule');
    expect(source).not.toContain('world-lab');
  });

  it('parses to the rule the built-in declares', () => {
    expect(meta.name).toBe('Gravity');
    expect(meta.ability).toBe('Has Gravity');
    // Collision is a project rule now, named by module path.
    expect(meta.requires).toEqual(['Physics', 'Solid Bodies']);
    expect(meta.traits.map(trait => trait.ref.exportName)).toEqual([
      'AffectedByGravityTrait',
      'ActsAsGroundTrait',
    ]);
    expect(meta.properties.map(property => property.ref.exportName)).toEqual([
      'DirectionProperty',
      'StrengthProperty',
      'GravityScaleProperty',
      'FallingProperty',
    ]);
    expect(meta.events.map(event => event.ref.exportName)).toEqual([
      'StartsFallingEvent',
      'StopsFallingEvent',
    ]);
  });

  it('explains each block it defines', () => {
    for (const member of [...meta.queries, ...meta.actions]) {
      expect(member.description, member.name).toMatch(/\w+ \w+/);
    }
  });

  it('marks `falling` read-only, because a step owns it', () => {
    // The property the landing step writes. Without this the palette offers a
    // `set falling` block whose value the next tick overwrites.
    const falling = meta.properties.find(p => p.id === 'falling');
    expect(falling?.readonly).toBe(true);
    expect(module_).toContain('readonly: true');
  });

  it('orders its step before Motion integrates', () => {
    // The reason step anchors exist: gravity must add to the velocity before
    // Motion turns velocity into position, or it lags a frame behind.
    const [step] = meta.steps;
    expect(step.order.kind).toBe('before');
    expect(step.order.anchor?.ownerRef.ruleName).toBe('Physics');
    expect(step.order.anchor?.stepId).toBe('reposition');
    expect(module_).toContain(
      'rule.addStepBefore("applyVelocity", Motion.steps["reposition"]',
    );
  });

  it('names its members where the rest of the project reaches for them', () => {
    // `player.actor` carries `Gravity#AffectedByGravityTrait` and handles
    // `world_on_Gravity_StartsFallingEvent`. Both are built from the rule's NAME
    // and its members' export names, so renaming either here — the rule in its
    // `define rule` block, or a member — silently unhooks the tutorial.
    const player = starterFile('player').contents;
    expect(player).toContain('Gravity#AffectedByGravityTrait');
    expect(player).toContain('world_on_Gravity_StartsFallingEvent');
  });

  it('declares the query that reads its read-only property', () => {
    // `falling` is step-owned, so it has no `set` block — but it must still be
    // READABLE, and this query is how. (Generating the getter only for settable
    // properties made a read-only one unreadable even from its own rule.)
    //
    // Only the DECLARATION is checked here: an action's or query's body is
    // generated from live blocks, not from this static parse, so `module_`
    // carries an empty one. The bodies are verified in the browser.
    const query = meta.queries.find(q => q.id.startsWith('is_on_the_ground'));
    expect(query?.scope).toBe('actor');
    expect(query?.ownerTraitId).toBe('Affected_by_Gravity');
    expect(query?.returns).toBe('boolean');
    expect(module_).toContain('AffectedByGravityTrait.addQuery(');
  });

  it('declares the invert action on the rule, not on a trait', () => {
    // Gravity's direction is world-scoped, so inverting it is the world's to do.
    const action = meta.actions.find(a => a.id === 'Invert_Gravity');
    expect(action?.scope).toBe('world');
    expect(module_).toContain('rule.addAction("Invert_Gravity", (world) =>');
  });

  it('names its own members locally, not through an import of itself', () => {
    // The self-reference case: a rule's body referencing its own member uses
    // the local `export const`. Importing the module into itself would be a
    // cycle that resolves to undefined.
    expect(module_).not.toContain("from 'rules/gravity'");
  });

  it('declares the landing step, anchored after collision resolves', () => {
    // The step that lands actors and raises the falling transitions. It runs
    // after Collision has pushed things out of solids, so what it sees is where
    // they ended up. The anchor names that rule, wherever its file is.
    const step = meta.steps.find(s => s.id === 'handleCollisions');
    expect(step?.order.kind).toBe('after');
    expect(step?.order.anchor?.ownerRef.ruleName).toBe('Solid Bodies');
    expect(step?.order.anchor?.stepId).toBe('resolve');
  });

  it('puts its looping members at rule scope, where a world exists', () => {
    // An actor-scoped member is invoked as `(actor, …args)`; it reaches the
    // world through `actor.world`, but these take the subject as a parameter
    // because they are questions about the world asked of a pair.
    for (const id of ['is_resting_on', 'land_on_ground_', 'rest_height_of']) {
      expect(meta.queries.find(q => q.id === id)?.scope).toBe('world');
    }
  });

  it('lands and reports in one walk of the grounds', () => {
    // `land on ground?` both snaps the actor and answers whether it did, so the
    // step walks the grounds once. It used to be an action that landed and a
    // query that re-walked them to answer — two passes for one question,
    // because a body could not hold the answer between them.
    expect(meta.queries.map(q => q.id)).not.toContain('is_on_a_ground_');
    expect(meta.actions.map(a => a.id)).not.toContain('land_on_grounds');
    expect(meta.queries.find(q => q.id === 'land_on_ground_')?.returns).toBe(
      'boolean',
    );
  });

  it('handles gravity in either direction with one test', () => {
    // The sign of gravity's direction lives in a variable, so the resting test
    // is written once rather than mirrored for the inverted case — which is
    // what the built-in does, and what a body without variables forced.
    const doc = JSON.parse(source) as {
      variables?: Array<{name: string; type: string}>;
    };
    expect(doc.variables).toContainEqual(
      expect.objectContaining({name: 'sign', type: 'Number'}),
    );
    expect(meta.queries.find(q => q.id === 'rest_height_of')?.returns).toBe(
      'number',
    );
  });

  it('grounds the ground actor on ITS OWN trait, not the engine’s', () => {
    // `actors/ground.js` kept importing the built-in `GroundTrait` after the
    // rule moved into the project, so the authored rule's ground loop matched
    // nothing: the player fell, was held up by collision, and never landed.
    const ground = starterFile('ground').contents;
    expect(ground).toContain("from 'rules/gravity'");
    expect(ground).toContain('ActsAsGroundTrait');
    // …and its `world-lab` import no longer names a ground trait, which would
    // be the ENGINE's — a different object, matching nothing the rule loops for.
    const worldLabImport = ground
      .split('\n')
      .find(line => line.includes("from 'world-lab'"));
    expect(worldLabImport).not.toContain('Ground');
  });

  it('holds the resting answer in a variable rather than asking twice', () => {
    // The first use of a variable SETTER in the shipped project. Before it
    // existed a body could bind a variable (a loop's, a parameter's) but never
    // assign one, so the landing step had to call `is on a ground?` once per
    // branch and pay for the ground walk twice.
    expect(source).toContain('variables_set_Boolean');
    const doc = JSON.parse(source) as {
      variables?: Array<{name: string; type: string}>;
    };
    expect(doc.variables).toContainEqual(
      expect.objectContaining({name: 'resting', type: 'Boolean'}),
    );
  });

  it('declares its traits and steps as top blocks, beside the rule', () => {
    // A trait and a step are each definitions of their own, not `do` mouths
    // nested in the rule's tower — so each is a separate stack a learner can
    // move and read alone.
    const tops = (
      JSON.parse(source) as {blocks: {blocks: Array<{type: string}>}}
    ).blocks.blocks;
    expect(tops.map(b => b.type)).toEqual([
      'world_rule',
      'world_rule_trait',
      'world_rule_trait',
      'world_rule_step_before',
      'world_rule_step_after',
    ]);
  });

  it('carries a step’s ordering in its block type, not a field', () => {
    // `before Motion ▸ reposition` and `when tick` are different KINDS of step,
    // not one block with a setting — which is why the anchor dropdown no longer
    // has to be hidden when it would be meaningless.
    const tops = (
      JSON.parse(source) as {
        blocks: {
          blocks: Array<{type: string; fields?: Record<string, string>}>;
        };
      }
    ).blocks.blocks;
    const before = tops.find(b => b.type === 'world_rule_step_before')!;
    expect(before.fields?.STEP).toBe('Physics#reposition');
    expect(before.fields?.ORDER).toBeUndefined();
  });

  it('chains a trait’s members below it, not inside a `do`', () => {
    const tops = (
      JSON.parse(source) as {
        blocks: {
          blocks: Array<{type: string; next?: unknown; inputs?: unknown}>;
        };
      }
    ).blocks.blocks;
    const trait = tops.find(b => b.type === 'world_rule_trait')!;
    expect(trait.next).toBeDefined();
    expect(trait.inputs).toBeUndefined();
  });

  it('asks Collisions what it is touching, rather than scanning the world', () => {
    // The whole point of splitting detection out (specs/COLLISION.md): landing
    // used to walk every actor in the world looking for grounds, once per
    // falling actor, re-deriving overlaps that Collisions had already worked
    // out. Now the loop's SOURCE is this actor's contacts, and what is left in
    // the loop is gravity's own question — is this ground under me?
    const sources: string[] = [];
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
        inputs?: Record<string, {block?: {type?: string}}>;
      };
      if (block.type === 'world_for_each') {
        sources.push(block.inputs?.SOURCE?.block?.type ?? '(all actors)');
      }
      Object.values(node as Record<string, unknown>).forEach(walk);
    };
    walk(JSON.parse(source));

    expect(sources).toContain('world_get_Collisions_ContactsProperty');
    // Its two per-tick steps still walk the world: every actor gravity pulls on,
    // and every actor that might have landed. It is the INNER loop, over one
    // faller's grounds, that had a shorter list available all along.
    expect(sources.filter(s => s === '(all actors)')).toHaveLength(2);
  });

  it('is what the world puts in play', () => {
    // By name — the world says which rule, and the generator works out which
    // file that is when it comes to write the import.
    expect(starterFile('main').contents).toContain('"Gravity"');
  });
});
