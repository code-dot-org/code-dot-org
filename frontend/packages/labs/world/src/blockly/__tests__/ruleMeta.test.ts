import {describe, expect, it} from 'vitest';

import * as WorldLab from '../../engine';
import {MotionRule} from '../../engine';
// Gravity ships as a `.rule` now, not as engine code; the fixture the engine's
// own tests drive is still the richest example of a rule's shape (two traits,
// world and actor members, events), which is what this describes.
import * as CollisionFixture from '../../engine/__tests__/fixtures/collisionRule';
import {CollisionRule} from '../../engine/__tests__/fixtures/collisionRule';
import * as GravityFixture from '../../engine/__tests__/fixtures/gravityRule';
import {GravityRule} from '../../engine/__tests__/fixtures/gravityRule';
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
    builtinRuleMeta([rule as never], {
      ...(WorldLab as Record<string, unknown>),
      ...(GravityFixture as Record<string, unknown>),
      ...(CollisionFixture as Record<string, unknown>),
    })[0];

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
      default: 9,
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

// Build a `.rule` workspace (Blockly JSON): a `define rule` root chaining its
// world-scoped members, plus one TOP BLOCK per `define trait`, each chaining
// its own. A trait is a definition beside the rule, not inside it.
const chain = (blocks: object[]): object | undefined =>
  blocks.reduceRight<object | undefined>(
    (next, block) => ({...block, ...(next ? {next: {block: next}} : {})}),
    undefined,
  );
/**
 * A member that is its own TOP BLOCK — a trait or a step. `ruleFile` lifts these
 * out beside the rule rather than chaining them inside it.
 */
interface DefinitionRoot {
  __root: object;
}
const isRoot = (member: object): member is DefinitionRoot => '__root' in member;

const ruleFile = (name: string, ...members: object[]): string => {
  const body = chain(members.filter(m => !isRoot(m)));
  return JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_rule',
          fields: {NAME: name},
          ...(body ? {next: {block: body}} : {}),
        },
        ...members.filter(isRoot).map(m => m.__root),
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
    __root: {
      type: 'world_rule_trait',
      fields: {NAME: name},
      ...(inner ? {next: {block: inner}} : {}),
    },
  };
};
// `define block`: the imperative-body member, an action or a query by its
// RETURNS field alone. Its name is the wording of its labels, and its `do` body
// is not read by `parseRuleMeta` (metadata is static), so these fixtures leave
// it empty — the body is exercised through `extractRuleBodies` below.
const designed = (
  name: string,
  returns = 'none',
  params: Array<{type: string; var: string; name?: string}> = [],
): object => ({
  type: 'world_rule_block',
  fields: {RETURNS: returns},
  extraState: {
    parts: [
      {kind: 'label', text: name},
      ...params.map(param => ({kind: 'param', ...param})),
    ],
  },
});
const action = (name: string): object => designed(name);
const query = (type: string, name: string): object => designed(name, type);
// `define step`: NAME, ORDER (free/before/after), and STEP (the anchor value,
// `<owner>#<stepId>`) when ordered.
// `define step`: an event hat per ordering kind. Its NAME names the step; the
// anchor dropdown is only on the ordered two. Lifted to its own top block by
// `ruleFile`, like a trait — its body is the chain below it.
const step = (name: string, order = 'free', anchor = ''): object => ({
  __root:
    order === 'free'
      ? {type: 'world_rule_step_tick', fields: {NAME: name}}
      : {
          type: `world_rule_step_${order}`,
          fields: {NAME: name, STEP: anchor},
        },
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

  it('a RETURNS value that reports nothing recognizable is an action', () => {
    // One block covers both kinds, so an unreadable RETURNS cannot mean "a
    // query of some type" — it means the block reports nothing.
    const meta = parseRuleMeta(
      'rules/x',
      ruleFile('X', query('nonsense', 'Q')),
    )!;
    expect(meta.queries).toEqual([]);
    expect(meta.actions[0].id).toBe('Q');
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
        {params: [], body: 'world.set(WorldLab.DirectionProperty, 1);\n'},
      ],
      [
        ruleBodyKey('query', 'actor', 'Windblown', 'Is_Gusting'),
        {params: [], body: 'return actor.get(WorldLab.FallingProperty);\n'},
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
    // return type. It also opens by binding `world` from the actor: the engine
    // invokes it as `(actor, …args)` with no world in the signature, but a body
    // may ask a question about the world ("standing on any ground?"), and every
    // block that names `world` should work in one.
    expect(code).toContain(
      `export const IsGustingQuery = WindblownTrait.addQuery("Is_Gusting", (actor) => {\n  const world = actor.world;\nreturn actor.get(WorldLab.FallingProperty);\n}, {name: "Is Gusting", returns: "boolean"});`,
    );
  });

  it('does not bind `world` in a world-scoped body, which already has one', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile('Has Wind', action('Invert')),
    )!;
    const code = ruleMetaToModule(
      meta,
      new Map([
        [
          ruleBodyKey('action', 'world', undefined, 'Invert'),
          {params: [], body: 'world.set(X, 1);\n'},
        ],
      ]),
    );
    expect(code).not.toContain('const world = actor.world');
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
  // A minimal live-block stand-in: the surface the extractor walks (the `DO` and
  // `PARAMS` statement inputs, the next chain, and the fields).
  const live = (
    type: string,
    fields: Record<string, string>,
    opts: {do?: unknown; params?: unknown; next?: unknown; name?: string} = {},
  ) => ({
    type,
    getFieldValue: (name: string) => fields[name] ?? null,
    getInputTargetBlock: (name: string) =>
      name === 'DO' ? opts.do : name === 'PARAMS' ? opts.params : null,
    getNextBlock: () => opts.next ?? null,
    // A designed member has no NAME field: its name is its signature, which the
    // extractor reads through the mutator's saved state.
    saveExtraState: () =>
      opts.name ? {parts: [{kind: 'label', text: opts.name}]} : undefined,
  });
  it('generates each action/query body + signature, keyed by scope/owner/id', () => {
    // Two TOP blocks: the rule (chaining action Nudge) and the trait Windblown
    // (chaining query Is Gusting) beside it.
    const root = live(
      'world_rule',
      {NAME: 'Has Wind'},
      {next: live('world_rule_block', {RETURNS: 'none'}, {name: 'Nudge'})},
    );
    const traitRoot = live(
      'world_rule_trait',
      {NAME: 'Windblown'},
      {
        next: live(
          'world_rule_block',
          {RETURNS: 'boolean'},
          {name: 'Is Gusting'},
        ),
      },
    );
    // The stand-in generator tags each body by its designed name; the signature
    // is the member's parameters (here, Nudge takes one, the query none).
    const nameOf = (block: {
      saveExtraState?: () => {parts?: readonly {text?: string}[]} | undefined;
    }): string => block.saveExtraState?.()?.parts?.[0]?.text ?? '';
    const bodies = extractRuleBodies([root, traitRoot] as never, {
      body: block => `BODY(${nameOf(block)})\n`,
      chainBody: block => `CHAIN(${nameOf(block)})\n`,
      signature: block => (nameOf(block) === 'Nudge' ? ['amount'] : []),
    });
    expect(
      bodies.get(ruleBodyKey('action', 'world', undefined, 'Nudge')),
    ).toEqual({params: ['amount'], body: 'BODY(Nudge)\n'});
    expect(
      bodies.get(ruleBodyKey('query', 'actor', 'Windblown', 'Is_Gusting')),
    ).toEqual({params: [], body: 'BODY(Is Gusting)\n'});
  });
});

describe('designed block parameters', () => {
  // The designer stores the signature in the block's `extraState`
  // (`{parts: [...]}`); a parameter part's `var` is a variable id whose name the
  // variable map carries. A rule with one action taking (number amount, actor
  // target).
  const ruleWithParams = JSON.stringify({
    variables: [
      {id: 'v1', name: 'amount', type: 'Number'},
      {id: 'v2', name: 'target', type: 'Actor'},
    ],
    blocks: {
      blocks: [
        {
          type: 'world_rule',
          fields: {NAME: 'Has Wind'},
          next: {
            block: designed('Nudge', 'none', [
              {type: 'number', var: 'v1'},
              {type: 'actor', var: 'v2'},
            ]),
          },
        },
      ],
    },
  });

  it('parses params (name from the variable map, type from the block)', () => {
    const meta = parseRuleMeta('rules/wind', ruleWithParams)!;
    const nudge = meta.actions.find(a => a.id === 'Nudge')!;
    expect(nudge.params).toEqual([
      {name: 'amount', type: 'number'},
      {name: 'target', type: 'actor'},
    ]);
  });

  it('emits the params after the subject in the closure signature', () => {
    const meta = parseRuleMeta('rules/wind', ruleWithParams)!;
    // extractRuleBodies would resolve the VARs to these identifiers.
    const bodies = new Map([
      [
        ruleBodyKey('action', 'world', undefined, 'Nudge'),
        {
          params: ['amount', 'target'],
          body: 'world.act(WorldLab.X, amount);\n',
        },
      ],
    ]);
    const code = ruleMetaToModule(meta, bodies);
    expect(code).toContain(
      'rule.addAction("Nudge", (world, amount, target) => {',
    );
  });
});

describe('a rule that refers to itself', () => {
  it('names its own trait rather than importing its own module', () => {
    // A rule whose trait requires another of its traits (collision's Solid
    // requires its Can Collide). Importing there is not merely redundant: the
    // module declares the same symbol, and the bundle refuses to build —
    // "The symbol \"CanCollideTrait\" has already been declared".
    const meta = parseRuleMeta(
      'rules/collision',
      JSON.stringify({
        blocks: {
          blocks: [
            {type: 'world_rule', fields: {NAME: 'Has Collisions'}},
            {type: 'world_rule_trait', fields: {NAME: 'Can Collide'}},
            {
              type: 'world_rule_trait',
              fields: {NAME: 'Solid'},
              next: {
                block: {
                  type: 'world_use_trait',
                  fields: {TRAIT: 'rules/collision#CanCollideTrait'},
                },
              },
            },
          ],
        },
      }),
    )!;
    const code = ruleMetaToModule(meta);
    expect(code).toContain('SolidTrait.requires([CanCollideTrait]);');
    expect(code).not.toContain("from 'rules/collision'");
  });
});

describe('steps (per-tick behavior + ordering)', () => {
  it('builtinRuleMeta exposes a rule’s steps as anchor targets', () => {
    const motion = builtinRuleMeta(
      [MotionRule as never],
      WorldLab as Record<string, unknown>,
    )[0];
    const reposition = motion.steps.find(s => s.id === 'reposition');
    expect(reposition).toBeDefined();
    expect(reposition?.ownerRef).toEqual({
      source: 'builtin',
      exportName: 'MotionRule',
    });
  });

  it('parses steps and their ordering (free, before, after)', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        'Has Wind',
        step('gust', 'before', 'MotionRule#reposition'), // anchor a built-in
        step('land', 'after', 'rules/other#resolve'), // anchor a project rule
        step('settle'), // unordered
      ),
    )!;
    expect(meta.steps).toEqual([
      {
        id: 'gust',
        name: 'gust',
        ownerRef: {
          source: 'project',
          exportName: 'HasWindRule',
          modulePath: 'rules/wind',
        },
        order: {
          kind: 'before',
          anchor: {
            ownerRef: {source: 'builtin', exportName: 'MotionRule'},
            stepId: 'reposition',
          },
        },
      },
      expect.objectContaining({
        id: 'land',
        order: {
          kind: 'after',
          anchor: {
            ownerRef: {
              source: 'project',
              exportName: '',
              modulePath: 'rules/other',
            },
            stepId: 'resolve',
          },
        },
      }),
      expect.objectContaining({id: 'settle', order: {kind: 'free'}}),
    ]);
  });

  it('emits addStep / addStepBefore with anchor refs and (world, delta)', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        'Has Wind',
        step('gust', 'before', 'MotionRule#reposition'),
        step('land', 'after', 'rules/other#resolve'),
        step('settle'),
      ),
    )!;
    const bodies = new Map([
      [
        ruleBodyKey('step', 'world', undefined, 'gust'),
        {params: [], body: 'world.set(WorldLab.DirectionProperty, 1);\n'},
      ],
    ]);
    const code = ruleMetaToModule(meta, bodies);
    // A step's body references `WorldLab.*`, so the namespace import is present.
    expect(code).toContain(`import * as WorldLab from 'world-lab';`);
    // Before a built-in step → `WorldLab.<Rule>.steps[<id>]`, closure (world, delta).
    expect(code).toContain(
      `export const GustStep = rule.addStepBefore("gust", WorldLab.MotionRule.steps["reposition"], (world, delta) => {\nworld.set(WorldLab.DirectionProperty, 1);\n});`,
    );
    // After a project step → default-import the module, read its `.steps[...]`.
    expect(code).toContain(`import Other from "rules/other";`);
    expect(code).toContain(
      `export const LandStep = rule.addStepAfter("land", Other.steps["resolve"], (world, delta) => {\n});`,
    );
    // Unordered → plain addStep.
    expect(code).toContain(
      `export const SettleStep = rule.addStep("settle", (world, delta) => {\n});`,
    );
  });

  it('anchors a step to another step in the SAME rule via the local const', () => {
    // `finish` runs AFTER this rule's own `start` step. The anchor is the local
    // export const, not a self-import (which would read `.steps` pre-build), and
    // the target is emitted first even though it is declared second.
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile(
        'Has Wind',
        step('finish', 'after', 'rules/wind#start'), // self-anchor, declared first
        step('start'), // the anchor target, declared second
      ),
    )!;
    const code = ruleMetaToModule(meta);
    // No self-import of `rules/wind`.
    expect(code).not.toContain(`from "rules/wind"`);
    // The anchor target is emitted before the step that names it.
    const startAt = code.indexOf('export const StartStep');
    const finishAt = code.indexOf('export const FinishStep');
    expect(startAt).toBeGreaterThanOrEqual(0);
    expect(startAt).toBeLessThan(finishAt);
    // The anchor is the local const, not `Wind.steps[...]`.
    expect(code).toContain(
      `export const FinishStep = rule.addStepAfter("finish", StartStep, (world, delta) => {\n});`,
    );
  });
});
