import {describe, expect, it} from 'vitest';

import * as WorldLab from '../../engine';
import {CollisionRule, GravityRule} from '../../engine';
import {
  builtinRuleMeta,
  parseRuleMeta,
  ruleMetaToModule,
  type RuleMeta,
} from '../ruleMeta';

// Derive metadata for a couple of the real built-in rules and assert it mirrors
// them — the shape the editor (trait dropdown, block generator) will consume,
// and that project `.rule` files will parse into.
describe('builtinRuleMeta', () => {
  const meta = (rule: (typeof WorldLab)[keyof typeof WorldLab]): RuleMeta =>
    builtinRuleMeta([rule as never], WorldLab as Record<string, unknown>)[0];

  it('describes a rule, its traits, and its world + actor members', () => {
    const gravity = meta(GravityRule);
    expect(gravity.id).toBe('gravity');
    expect(gravity.name).toBe('Has Gravity');
    expect(gravity.source).toBe('builtin');
    expect(gravity.ref).toEqual({source: 'builtin', exportName: 'GravityRule'});
    // Dependencies, by rule id.
    expect(new Set(gravity.requires)).toEqual(new Set(['motion', 'collision']));

    // Traits, valued by their world-lab export.
    expect(gravity.traits).toEqual(
      expect.arrayContaining([
        {
          id: 'affected',
          name: 'Affected by Gravity',
          ref: {source: 'builtin', exportName: 'AffectedByGravityTrait'},
        },
        {
          id: 'ground',
          name: 'Acts as Ground',
          ref: {source: 'builtin', exportName: 'GroundTrait'},
        },
      ]),
    );

    // World-scoped property (the rule's own).
    expect(gravity.properties).toContainEqual({
      id: 'strength',
      name: 'strength',
      type: 'number',
      default: 900,
      readonly: false,
      scope: 'world',
      ownerTraitId: undefined,
      ref: {source: 'builtin', exportName: 'StrengthProperty'},
    });
    // Actor-scoped property carries its owning trait id.
    expect(gravity.properties).toContainEqual(
      expect.objectContaining({
        id: 'falling',
        scope: 'actor',
        ownerTraitId: 'affected',
        readonly: true,
        ref: {source: 'builtin', exportName: 'FallingProperty'},
      }),
    );

    // A world action and an actor query, both by export.
    expect(gravity.actions).toContainEqual(
      expect.objectContaining({
        id: 'invert',
        scope: 'world',
        ref: {source: 'builtin', exportName: 'InvertAction'},
      }),
    );
    expect(gravity.queries).toContainEqual(
      expect.objectContaining({
        id: 'isOnGround',
        scope: 'actor',
        ownerTraitId: 'affected',
        returns: 'boolean',
        ref: {source: 'builtin', exportName: 'IsOnGroundQuery'},
      }),
    );

    // Events.
    expect(gravity.events.map(e => e.id).sort()).toEqual([
      'startsFalling',
      'stopsFalling',
    ]);
  });

  it('captures a world query with typed params (the touching predicate)', () => {
    const collision = meta(CollisionRule);
    const isTouching = collision.queries.find(q => q.id === 'isTouching');
    expect(isTouching?.returns).toBe('boolean');
    expect(isTouching?.params.map(p => p.type)).toEqual(['actor', 'actor']);
    expect(isTouching?.ref.exportName).toBe('IsTouchingQuery');
  });
});

// A hand-authored `.rule` workspace: a `world_rule` root chaining member
// declarations. Same JSON shape as `.actor`/`.world` files (a Blockly workspace).
const ruleFile = (...members: object[]): string => {
  const chain = members.reduceRight<object | undefined>(
    (next, block) => ({...block, ...(next ? {next: {block: next}} : {})}),
    undefined,
  );
  return JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_rule',
          fields: {NAME: 'Has Wind'},
          next: chain && {block: chain},
        },
      ],
    },
  });
};

describe('parseRuleMeta', () => {
  it('reads a declarative `.rule` workspace into RuleMeta (project refs)', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        {
          type: 'world_rule_trait',
          fields: {ID: 'windblown', NAME: 'Blown by Wind'},
        },
        {
          type: 'world_rule_property',
          fields: {ID: 'strength', NAME: 'wind strength', TYPE: 'number'},
        },
        {
          // An actor-scoped property (owned by a trait).
          type: 'world_rule_property',
          fields: {
            ID: 'drag',
            NAME: 'drag',
            TYPE: 'number',
            TRAIT: 'windblown',
          },
        },
        {type: 'world_rule_event', fields: {ID: 'gusted', NAME: 'is gusted'}},
      ),
    );
    expect(meta).toBeDefined();
    expect(meta).toMatchObject({
      id: 'Has_Wind',
      name: 'Has Wind',
      source: 'project',
      modulePath: 'rules/wind',
    });
    // Members are `project` refs into the module, named by the id convention.
    expect(meta?.traits).toEqual([
      {
        id: 'windblown',
        name: 'Blown by Wind',
        ref: {
          source: 'project',
          exportName: 'WindblownTrait',
          modulePath: 'rules/wind',
        },
      },
    ]);
    expect(meta?.properties).toContainEqual(
      expect.objectContaining({
        id: 'strength',
        scope: 'world',
        type: 'number',
        default: 0,
        ref: expect.objectContaining({
          source: 'project',
          exportName: 'StrengthProperty',
          modulePath: 'rules/wind',
        }),
      }),
    );
    // The actor-scoped one carries its owning trait id.
    expect(meta?.properties).toContainEqual(
      expect.objectContaining({
        id: 'drag',
        scope: 'actor',
        ownerTraitId: 'windblown',
      }),
    );
    expect(meta?.events).toEqual([
      {
        id: 'gusted',
        name: 'is gusted',
        ref: {
          source: 'project',
          exportName: 'GustedEvent',
          modulePath: 'rules/wind',
        },
      },
    ]);
  });

  it('returns undefined for non-rule or mid-edit content', () => {
    expect(parseRuleMeta('rules/x', 'not json yet')).toBeUndefined();
    expect(
      parseRuleMeta('rules/x', JSON.stringify({blocks: {blocks: []}})),
    ).toBeUndefined();
  });
});

describe('ruleMetaToModule', () => {
  it('emits a RuleBuilder module declaring the parsed rule (no steps)', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        {
          type: 'world_rule_trait',
          fields: {ID: 'windblown', NAME: 'Blown by Wind'},
        },
        {
          type: 'world_rule_property',
          fields: {ID: 'strength', NAME: 'wind strength', TYPE: 'number'},
        },
        {
          // actor-scoped: attaches to the trait above, not the rule.
          type: 'world_rule_property',
          fields: {
            ID: 'drag',
            NAME: 'drag',
            TYPE: 'number',
            TRAIT: 'windblown',
          },
        },
        {type: 'world_rule_event', fields: {ID: 'gusted', NAME: 'is gusted'}},
      ),
    )!;
    const code = ruleMetaToModule(meta);
    expect(code).toContain(`import {RuleBuilder} from 'world-lab';`);
    expect(code).toContain(
      `const rule = new RuleBuilder({id: "Has_Wind", name: "Has Wind"});`,
    );
    expect(code).toContain(
      `export const WindblownTrait = rule.addTrait({id: "windblown", name: "Blown by Wind"});`,
    );
    // World-scoped property on the rule.
    expect(code).toContain(
      `export const StrengthProperty = rule.addProperty("strength", "number", 0, {name: "wind strength"});`,
    );
    // Actor-scoped property on its trait.
    expect(code).toContain(
      `export const DragProperty = WindblownTrait.addProperty("drag", "number", 0, {name: "drag"});`,
    );
    expect(code).toContain(
      `export const GustedEvent = rule.addEvent("gusted", {name: "is gusted"});`,
    );
    expect(code.trimEnd().endsWith('export default rule.build();')).toBe(true);
  });

  it('imports Vector only when a property needs it', () => {
    const withVec = parseRuleMeta(
      'rules/x',
      ruleFile({
        type: 'world_rule_property',
        fields: {ID: 'gustDir', NAME: 'gust direction', TYPE: 'vector'},
      }),
    )!;
    expect(ruleMetaToModule(withVec)).toContain(
      `import {RuleBuilder, Vector} from 'world-lab';`,
    );
    expect(ruleMetaToModule(withVec)).toContain('new Vector(0, 0)');
  });
});
