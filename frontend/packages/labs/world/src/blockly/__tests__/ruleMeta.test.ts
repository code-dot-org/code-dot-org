import {describe, expect, it} from 'vitest';

import * as WorldLab from '../../engine';
import {CollisionRule, GravityRule} from '../../engine';
import {
  builtinRuleMeta,
  extractRuleBodies,
  parseRuleMeta,
  ruleBodyKey,
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
    // Dependencies, as the world-lab export names a `use rule` would name.
    expect(new Set(gravity.requires)).toEqual(
      new Set(['MotionRule', 'CollisionRule']),
    );

    // Traits, valued by their world-lab export (built-in requires aren't
    // surfaced for authoring).
    expect(gravity.traits).toEqual(
      expect.arrayContaining([
        {
          id: 'affected',
          name: 'Affected by Gravity',
          ref: {source: 'builtin', exportName: 'AffectedByGravityTrait'},
          requires: [],
        },
        {
          id: 'ground',
          name: 'Acts as Ground',
          ref: {source: 'builtin', exportName: 'GroundTrait'},
          requires: [],
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

// Build a `.rule` workspace (Blockly JSON): a `define rule` root chaining
// members; a `define trait`'s properties/events nest in its `do` input.
const chain = (blocks: object[]): object | undefined =>
  blocks.reduceRight<object | undefined>(
    (next, block) => ({...block, ...(next ? {next: {block: next}} : {})}),
    undefined,
  );
const ruleFile = (name: string, ...members: object[]): string => {
  const body = chain(members);
  return JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_rule',
          fields: {NAME: name},
          ...(body ? {next: {block: body}} : {}),
        },
      ],
    },
  });
};
const prop = (type: string, name: string, def: string): object => ({
  type: 'world_rule_property',
  fields: {TYPE: type, NAME: name, DEFAULT: def},
});
const event = (name: string): object => ({
  type: 'world_rule_event',
  fields: {NAME: name},
});
const trait = (name: string, ...body: object[]): object => {
  const inner = chain(body);
  return {
    type: 'world_rule_trait',
    fields: {NAME: name},
    ...(inner ? {inputs: {DO: {block: inner}}} : {}),
  };
};
// `define action`/`define query`: the imperative-body blocks. Their `do` body is
// not read by `parseRuleMeta` (metadata is static), so these fixtures leave it
// empty — the body is exercised through `extractRuleBodies` below.
const action = (name: string): object => ({
  type: 'world_rule_action',
  fields: {NAME: name},
});
const query = (type: string, name: string): object => ({
  type: 'world_rule_query',
  fields: {TYPE: type, NAME: name},
});

describe('parseRuleMeta', () => {
  it('reads a nested `.rule` workspace into RuleMeta (scope by nesting)', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        'Has Wind',
        prop('number', 'strength', '5'), // world property (rule level)
        trait(
          'Windblown',
          prop('number', 'drag', '2'), // actor property (inside the trait)
          event('gusted'),
        ),
      ),
    );
    expect(meta).toMatchObject({
      id: 'Has_Wind', // slug(NAME)
      name: 'Has Wind',
      source: 'project',
      modulePath: 'rules/wind',
      ref: {
        source: 'project',
        exportName: 'HasWindRule',
        modulePath: 'rules/wind',
      },
    });
    // Ids/exports are derived from the NAME (slug + PascalCase).
    expect(meta?.traits).toEqual([
      {
        id: 'Windblown',
        name: 'Windblown',
        ref: {
          source: 'project',
          exportName: 'WindblownTrait',
          modulePath: 'rules/wind',
        },
        requires: [],
      },
    ]);
    // The rule-level property is world-scoped, with its authored default.
    expect(meta?.properties).toContainEqual(
      expect.objectContaining({
        id: 'strength',
        name: 'strength',
        type: 'number',
        default: 5,
        scope: 'world',
        ownerTraitId: undefined,
        ref: expect.objectContaining({exportName: 'StrengthProperty'}),
      }),
    );
    // The trait-nested property is actor-scoped, owned by the trait, default 2.
    expect(meta?.properties).toContainEqual(
      expect.objectContaining({
        id: 'drag',
        scope: 'actor',
        ownerTraitId: 'Windblown',
        default: 2,
        ref: expect.objectContaining({exportName: 'DragProperty'}),
      }),
    );
    expect(meta?.events).toEqual([
      {
        id: 'gusted',
        name: 'gusted',
        ref: {
          source: 'project',
          exportName: 'GustedEvent',
          modulePath: 'rules/wind',
        },
      },
    ]);
  });

  it('parses defaults by type, and rejects non-rule content', () => {
    const meta = parseRuleMeta(
      'rules/x',
      ruleFile(
        'X',
        prop('boolean', 'active', 'true'),
        prop('vector', 'gust', '3, 4'),
        prop('string', 'label', 'windy'),
      ),
    );
    const byId = new Map(meta!.properties.map(p => [p.id, p]));
    expect(byId.get('active')?.default).toBe(true);
    expect(byId.get('gust')?.default).toEqual({x: 3, y: 4});
    expect(byId.get('label')?.default).toBe('windy');

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
        'Has Wind',
        prop('number', 'strength', '5'),
        trait('Windblown', prop('number', 'drag', '2'), event('gusted')),
      ),
    )!;
    const code = ruleMetaToModule(meta);
    expect(code).toContain(`import {RuleBuilder} from 'world-lab';`);
    expect(code).toContain(
      `const rule = new RuleBuilder({id: "Has_Wind", name: "Has Wind"});`,
    );
    expect(code).toContain(
      `export const WindblownTrait = rule.addTrait({id: "Windblown", name: "Windblown"});`,
    );
    // World-scoped property on the rule, with its default.
    expect(code).toContain(
      `export const StrengthProperty = rule.addProperty("strength", "number", 5, {name: "strength"});`,
    );
    // Actor-scoped property on its trait.
    expect(code).toContain(
      `export const DragProperty = WindblownTrait.addProperty("drag", "number", 2, {name: "drag"});`,
    );
    expect(code).toContain(
      `export const GustedEvent = rule.addEvent("gusted", {name: "gusted"});`,
    );
    expect(code.trimEnd().endsWith('export default rule.build();')).toBe(true);
  });

  it('imports Vector only when a property needs it', () => {
    const withVec = parseRuleMeta(
      'rules/x',
      ruleFile('X', prop('vector', 'gust direction', '0, 1')),
    )!;
    const code = ruleMetaToModule(withVec);
    expect(code).toContain(`import {RuleBuilder, Vector} from 'world-lab';`);
    expect(code).toContain('new Vector(0, 1)');
  });
});

describe('rule + trait dependencies (use rule / use trait)', () => {
  const useRule = (value: string): object => ({
    type: 'world_use_rule',
    fields: {RULE: value},
  });
  const useTrait = (value: string): object => ({
    type: 'world_use_trait',
    fields: {TRAIT: value},
  });

  // `use rule` blocks at the rule level → rule requires; `use trait` inside a
  // `define trait`'s `do` → that trait's requires. Built-in (bare name) and
  // project (`module`/`module#export`) refs mix freely.
  const meta = parseRuleMeta(
    'rules/wind',
    ruleFile(
      'Has Wind',
      useRule('GravityRule'), // built-in rule dep
      useRule('rules/motion'), // project rule dep
      trait(
        'Windblown',
        useTrait('MovableTrait'), // built-in trait dep
        useTrait('rules/other#SomeTrait'), // project trait dep
        prop('number', 'drag', '2'),
      ),
    ),
  )!;

  it('parses use rule / use trait into rule + trait requires', () => {
    expect(meta.requires).toEqual(['GravityRule', 'rules/motion']);
    expect(meta.traits[0].requires).toEqual([
      'MovableTrait',
      'rules/other#SomeTrait',
    ]);
  });

  it('emits requires with the right imports in the module', () => {
    const code = ruleMetaToModule(meta);
    // Built-in deps join the world-lab import; project deps get their own.
    expect(code).toContain(
      `import {RuleBuilder, GravityRule, MovableTrait} from 'world-lab';`,
    );
    expect(code).toContain(`import Motion from "rules/motion";`); // rule (default)
    expect(code).toContain(`import {SomeTrait} from "rules/other";`); // trait (named)
    expect(code).toContain('rule.requires([GravityRule, Motion]);');
    expect(code).toContain(
      'WindblownTrait.requires([MovableTrait, SomeTrait]);',
    );
  });
});

describe('actions and queries (imperative members)', () => {
  it('parses actions/queries into metadata, scope by nesting', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        'Has Wind',
        action('Invert'), // world action (rule level)
        query('vector', 'Gust'), // world query
        trait(
          'Windblown',
          action('Flap'), // actor action (inside the trait)
          query('boolean', 'Is Gusting'), // actor query
        ),
      ),
    )!;
    // Ids/exports derive from the NAME; params are empty (a later step).
    expect(meta.actions).toContainEqual(
      expect.objectContaining({
        id: 'Invert',
        scope: 'world',
        ownerTraitId: undefined,
        params: [],
        ref: expect.objectContaining({exportName: 'InvertAction'}),
      }),
    );
    expect(meta.queries).toContainEqual(
      expect.objectContaining({
        id: 'Gust',
        scope: 'world',
        returns: 'vector',
        ref: expect.objectContaining({exportName: 'GustQuery'}),
      }),
    );
    expect(meta.actions).toContainEqual(
      expect.objectContaining({
        id: 'Flap',
        scope: 'actor',
        ownerTraitId: 'Windblown',
        ref: expect.objectContaining({exportName: 'FlapAction'}),
      }),
    );
    expect(meta.queries).toContainEqual(
      expect.objectContaining({
        id: 'Is_Gusting',
        scope: 'actor',
        ownerTraitId: 'Windblown',
        returns: 'boolean',
        ref: expect.objectContaining({exportName: 'IsGustingQuery'}),
      }),
    );
  });

  it('an unknown query return type falls back to boolean', () => {
    const meta = parseRuleMeta(
      'rules/x',
      ruleFile('X', query('nonsense', 'Q')),
    )!;
    expect(meta.queries[0].returns).toBe('boolean');
  });

  it('emits addAction/addQuery closures with their generated bodies', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        'Has Wind',
        action('Invert'),
        trait('Windblown', query('boolean', 'Is Gusting')),
      ),
    )!;
    // The bodies are what `extractRuleBodies` would produce, keyed the same way.
    const bodies = new Map([
      [
        ruleBodyKey('action', 'world', undefined, 'Invert'),
        'world.set(WorldLab.DirectionProperty, 1);\n',
      ],
      [
        ruleBodyKey('query', 'actor', 'Windblown', 'Is_Gusting'),
        'return actor.get(WorldLab.FallingProperty);\n',
      ],
    ]);
    const code = ruleMetaToModule(meta, bodies);
    // Bodies reference members as `WorldLab.<X>`, so a namespace import backs them.
    expect(code).toContain(`import * as WorldLab from 'world-lab';`);
    // A world action runs on `world`; the body is spliced verbatim.
    expect(code).toContain(
      `export const InvertAction = rule.addAction("Invert", (world) => {\nworld.set(WorldLab.DirectionProperty, 1);\n}, {name: "Invert"});`,
    );
    // An actor query is added to its trait, runs on `actor`, and declares its
    // return type.
    expect(code).toContain(
      `export const IsGustingQuery = WindblownTrait.addQuery("Is_Gusting", (actor) => {\nreturn actor.get(WorldLab.FallingProperty);\n}, {name: "Is Gusting", returns: "boolean"});`,
    );
  });

  it('adds no namespace import for a purely declarative rule', () => {
    const meta = parseRuleMeta(
      'rules/x',
      ruleFile('X', prop('number', 'strength', '5')),
    )!;
    expect(ruleMetaToModule(meta)).not.toContain('import * as WorldLab');
  });
});

describe('extractRuleBodies', () => {
  // A minimal live-block stand-in: the surface the extractor walks.
  const live = (
    type: string,
    fields: Record<string, string>,
    opts: {do?: unknown; next?: unknown} = {},
  ) => ({
    type,
    getFieldValue: (name: string) => fields[name] ?? null,
    getInputTargetBlock: (name: string) => (name === 'DO' ? opts.do : null),
    getNextBlock: () => opts.next ?? null,
  });

  it('generates each action/query body, keyed by scope/owner/id', () => {
    // rule → action Invert → trait Windblown(do: query Is Gusting).
    const root = live(
      'world_rule',
      {NAME: 'Has Wind'},
      {
        next: live(
          'world_rule_action',
          {NAME: 'Invert'},
          {
            next: live(
              'world_rule_trait',
              {NAME: 'Windblown'},
              {
                do: live('world_rule_query', {
                  TYPE: 'boolean',
                  NAME: 'Is Gusting',
                }),
              },
            ),
          },
        ),
      },
    );
    // The stand-in generator just tags each body by the block's NAME.
    const bodies = extractRuleBodies(
      root as never,
      block => `BODY(${block.getFieldValue('NAME')})\n`,
    );
    expect(
      bodies.get(ruleBodyKey('action', 'world', undefined, 'Invert')),
    ).toBe('BODY(Invert)\n');
    expect(
      bodies.get(ruleBodyKey('query', 'actor', 'Windblown', 'Is_Gusting')),
    ).toBe('BODY(Is Gusting)\n');
  });
});
