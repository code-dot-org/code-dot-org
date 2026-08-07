import {describe, expect, it} from 'vitest';

// Gravity, collision and motion ship as `.rule` files now rather than as engine
// code. The fixtures the engine's own tests drive are still the richest examples
// of a rule's shape — traits, world and actor members, events, ordered steps —
// which is what this file describes, so it reads them from there.
import * as WorldLab from '../../engine';
import * as CollisionFixture from '../../engine/__tests__/fixtures/collisionRule';
import {CollisionRule} from '../../engine/__tests__/fixtures/collisionRule';
import * as GravityFixture from '../../engine/__tests__/fixtures/gravityRule';
import {GravityRule} from '../../engine/__tests__/fixtures/gravityRule';
import * as MotionFixture from '../../engine/__tests__/fixtures/motionRule';
import {MotionRule} from '../../engine/__tests__/fixtures/motionRule';
import {BUILTIN_RULE_META} from '../builtinMeta';
import {
  builtinRuleMeta,
  extractRuleBodies,
  parseRuleMeta,
  ruleBodyKey,
  ruleMetaToModule,
  type RuleMeta,
} from '../ruleMeta';
import {registerBuiltinRules, registerProjectRules} from '../ruleRegistry';

// Which rule a name means. The engine's own are registered by `builtinMeta` on
// import; the fixtures stand in for rules that used to be built in, and a name
// resolves only if something registered it — so they are registered here.
registerBuiltinRules([
  ...BUILTIN_RULE_META,
  ...builtinRuleMeta([GravityRule as never, MotionRule as never], {
    ...(WorldLab as Record<string, unknown>),
    ...(GravityFixture as Record<string, unknown>),
    ...(MotionFixture as Record<string, unknown>),
  }),
]);

// Derive metadata for a couple of the real built-in rules and assert it mirrors
// them — the shape the editor (trait dropdown, block generator) will consume,
// and that project `.rule` files will parse into.
describe('builtinRuleMeta', () => {
  const meta = (rule: (typeof WorldLab)[keyof typeof WorldLab]): RuleMeta =>
    builtinRuleMeta([rule as never], {
      ...(WorldLab as Record<string, unknown>),
      ...(GravityFixture as Record<string, unknown>),
      ...(CollisionFixture as Record<string, unknown>),
      ...(MotionFixture as Record<string, unknown>),
    })[0];

  it('describes a rule, its traits, and its world + actor members', () => {
    const gravity = meta(GravityRule);
    expect(gravity.id).toBe('gravity');
    expect(gravity.name).toBe('Has Gravity');
    expect(gravity.source).toBe('builtin');
    expect(gravity.ref).toEqual({
      source: 'builtin',
      exportName: 'GravityRule',
      ruleName: 'Has Gravity',
    });
    // Dependencies, as the NAMES a `use rule` would store — which is all a
    // reference is, whether the rule it names is the engine's or a file's.
    expect(new Set(gravity.requires)).toEqual(
      new Set(['Has Physics', 'Has Collisions']),
    );

    // Traits, each naming the rule it belongs to (built-in requires aren't
    // surfaced for authoring).
    expect(gravity.traits).toEqual(
      expect.arrayContaining([
        {
          id: 'affected',
          name: 'Affected by Gravity',
          ref: {
            source: 'builtin',
            exportName: 'AffectedByGravityTrait',
            ruleName: 'Has Gravity',
          },
          requires: [],
          // Every built-in trait is an actor's; a camera trait is authored.
          subject: 'actor',
        },
        {
          id: 'ground',
          name: 'Acts as Ground',
          ref: {
            source: 'builtin',
            exportName: 'GroundTrait',
            ruleName: 'Has Gravity',
          },
          requires: [],
          subject: 'actor',
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
      ref: {
        source: 'builtin',
        exportName: 'StrengthProperty',
        ruleName: 'Has Gravity',
      },
    });
    // Actor-scoped property carries its owning trait id.
    expect(gravity.properties).toContainEqual(
      expect.objectContaining({
        id: 'falling',
        scope: 'actor',
        ownerTraitId: 'affected',
        readonly: true,
        ref: {
          source: 'builtin',
          exportName: 'FallingProperty',
          ruleName: 'Has Gravity',
        },
      }),
    );

    // A world action and an actor query, both by export.
    expect(gravity.actions).toContainEqual(
      expect.objectContaining({
        id: 'invert',
        scope: 'world',
        ref: {
          source: 'builtin',
          exportName: 'InvertAction',
          ruleName: 'Has Gravity',
        },
      }),
    );
    expect(gravity.queries).toContainEqual(
      expect.objectContaining({
        id: 'isOnGround',
        scope: 'actor',
        ownerTraitId: 'affected',
        returns: 'boolean',
        ref: {
          source: 'builtin',
          exportName: 'IsOnGroundQuery',
          ruleName: 'Has Gravity',
        },
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
// An event's wording is its designed phrasing — labels, and the choices a
// handler filters on (specs/ENUMS.md). A plain one is a single label.
const event = (name: string): object => ({
  type: 'world_rule_event',
  extraState: {parts: [{kind: 'label', text: name}]},
});
const trait = (name: string, ...body: object[]): object =>
  subjectTrait(name, 'actor', ...body);

/** A trait declaring what elects it — an actor, or a camera. */
/** `in ⟨phase⟩ do ⟨name⟩` beside the rule — no subject, every moment offered. */
const stepIn = (name: string, phase: string): object => ({
  __root: {
    type: 'world_rule_step_in',
    fields: {NAME: name, PHASE: phase},
  },
});

/** `each frame in ⟨phase⟩ do ⟨name⟩`, chained under a `define trait`. */
const traitStep = (name: string, phase: string): object => ({
  type: 'world_trait_step',
  fields: {NAME: name, PHASE: phase},
});

/** A trait declaring what elects it — an actor, or a camera. */
const subjectTrait = (
  name: string,
  subject: 'actor' | 'camera',
  ...body: object[]
): object => {
  const inner = chain(body);
  return {
    __root: {
      type: 'world_rule_trait',
      fields: {NAME: name, SUBJECT: subject},
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
describe('a trait for a camera', () => {
  // The engine's `Trait` knows nothing of this. A trait is a trait; the subject
  // decides what a generated body calls its argument, and which dropdown offers
  // the trait — nothing about the trait object itself.
  const meta = () =>
    parseRuleMeta(
      'rules/follow',
      ruleFile(
        'Camera Follow',
        subjectTrait('Follows', 'camera', prop('number', 'ease', '0.2')),
      ),
    );

  it('says what elects it', () => {
    expect(meta()?.traits[0]).toMatchObject({
      id: 'Follows',
      subject: 'camera',
    });
  });

  it('makes its members camera-scoped rather than actor-scoped', () => {
    // Where an actor trait's property is `scope: 'actor'`, this is `'camera'`,
    // and that is the whole of what the generator needs to bind the right name.
    expect(meta()?.properties).toContainEqual(
      expect.objectContaining({id: 'ease', scope: 'camera'}),
    );
  });

  it('leaves the rule’s own members world-scoped', () => {
    const withBoth = parseRuleMeta(
      'rules/follow',
      ruleFile(
        'Camera Follow',
        prop('number', 'speed', '1'),
        subjectTrait('Follows', 'camera', prop('number', 'ease', '0.2')),
      ),
    );

    expect(withBoth?.properties).toContainEqual(
      expect.objectContaining({id: 'speed', scope: 'world'}),
    );
    expect(withBoth?.properties).toContainEqual(
      expect.objectContaining({id: 'ease', scope: 'camera'}),
    );
  });

  it('binds `camera` in its bodies, and the world from the camera', () => {
    // The engine invokes a member as `(subject, …args)`, so an actor trait's
    // body opens with `actor` and a camera trait's with `camera`. Both then
    // bind `world` from their own back-reference, which is what lets a body
    // ask a question about the world — "where is the player?" — without the
    // generator knowing which kind of body it is in.
    const module_ = ruleMetaToModule(
      parseRuleMeta(
        'rules/follow',
        ruleFile(
          'Camera Follow',
          subjectTrait('Follows', 'camera', designed('recentre')),
        ),
      )!,
    );

    expect(module_).toContain('(camera) => {');
    expect(module_).toContain('const world = camera.world;');
    expect(module_).not.toContain('const world = actor.world;');
  });

  it('reads a trait saved before the field existed as an actor’s', () => {
    // The field is absent in every `.rule` written so far, and those files must
    // keep meaning what they meant.
    const older = parseRuleMeta(
      'rules/wind',
      ruleFile('Has Wind', {
        __root: {
          type: 'world_rule_trait',
          fields: {NAME: 'Windblown'},
        },
      }),
    );

    expect(older?.traits[0].subject).toBe('actor');
  });
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
        ruleName: 'Has Wind',
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
          ruleName: 'Has Wind',
          modulePath: 'rules/wind',
        },
        requires: [],
        // Absent on a workspace saved before the field existed, which reads as
        // `actor` — the behaviour those files already had.
        subject: 'actor',
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
        // Chained under a trait, so it is about an ACTOR — a handler gets one.
        // Declared on the rule instead it would be the world's, with no actor
        // to hand over (`EventMeta.scope`).
        scope: 'actor',
        ownerTraitId: 'Windblown',
        // Its designed phrasing: one label, and no choice to filter on.
        parts: [{kind: 'label', text: 'gusted'}],
        ref: {
          source: 'project',
          exportName: 'GustedEvent',
          ruleName: 'Has Wind',
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

  // Every dependency is a NAME — the rule's, and `<Rule>#<Trait>` for a trait —
  // and which rule a name means is the registry's answer. So the project this
  // rule is written against is registered first, exactly as the editor and the
  // generator register the project's parsed `.rule` files before reading a
  // workspace.
  const other = parseRuleMeta('rules/other', ruleFile('Other', trait('Some')))!;
  const motion = parseRuleMeta('rules/motion', ruleFile('Motion'))!;
  registerProjectRules([other, motion]);

  const meta = parseRuleMeta(
    'rules/wind',
    ruleFile(
      'Has Wind',
      useRule('Space'), // built-in rule dep
      useRule('Motion'), // project rule dep
      trait(
        'Windblown',
        useTrait('Space#PositionalTrait'), // built-in trait dep
        useTrait('Other#SomeTrait'), // project trait dep
        prop('number', 'drag', '2'),
      ),
    ),
  )!;

  it('parses use rule / use trait into rule + trait requires', () => {
    expect(meta.requires).toEqual(['Space', 'Motion']);
    expect(meta.traits[0].requires).toEqual([
      'Space#PositionalTrait',
      'Other#SomeTrait',
    ]);
  });

  it('emits requires with the right imports in the module', () => {
    const code = ruleMetaToModule(meta);
    // Built-in deps join the world-lab import; project deps get their own — and
    // the module each is imported from is looked up from its name here, at the
    // one moment where a file has to be named at all.
    expect(code).toContain(
      `import {RuleBuilder, SpatialRule, PositionalTrait} from 'world-lab';`,
    );
    expect(code).toContain(`import Motion from "rules/motion";`); // rule (default)
    expect(code).toContain(`import {SomeTrait} from "rules/other";`); // trait (named)
    expect(code).toContain('rule.requires([SpatialRule, Motion]);');
    expect(code).toContain(
      'WindblownTrait.requires([PositionalTrait, SomeTrait]);',
    );
  });

  it('follows a rule that has moved, without touching what refers to it', () => {
    // The point of naming rather than locating: the same workspace, generated
    // against a project where `Motion` now lives somewhere else, imports it from
    // where it is now. Nothing stored changed — nothing stored says where.
    const moved = parseRuleMeta('mechanics/movement', ruleFile('Motion'))!;
    registerProjectRules([other, moved]);
    expect(ruleMetaToModule(meta)).toContain(
      `import Movement from "mechanics/movement";`,
    );
    registerProjectRules([other, motion]);
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
  it('generates a trait step’s body, keyed by that trait’s subject', () => {
    // The gap this test exists for: `visit` only knew `world_rule_block`, so a
    // step declared under a trait was walked past. Everything else about the
    // rule was right — it parsed, the module generated, the step was there —
    // and its closure was empty. A camera that never moved.
    //
    // The body is the `DO` mouth, not the chain below: a trait's members chain
    // through `next`, which is why a trait step is not shaped like a hat.
    const traitRoot = live(
      'world_rule_trait',
      {NAME: 'Follows', SUBJECT: 'camera'},
      {
        next: live(
          'world_trait_step',
          {NAME: 'aim at the actor', PHASE: 'aim'},
          {do: live('world_set_position', {})},
        ),
      },
    );

    const bodies = extractRuleBodies([traitRoot] as never, {
      body: () => 'AIMED\n',
      chainBody: () => 'CHAIN\n',
      signature: () => [],
    });

    expect(
      bodies.get(ruleBodyKey('step', 'camera', 'Follows', 'aim_at_the_actor')),
    ).toEqual({
      // A step takes no user params — its closure is the subject and `delta`.
      params: [],
      body: 'AIMED\n',
    });
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
                  fields: {TRAIT: 'Has Collisions#CanCollideTrait'},
                },
              },
            },
          ],
        },
      }),
    )!;
    const code = ruleMetaToModule(meta);
    expect(code).toContain('SolidTrait.requires([CanCollideTrait]);');
    expect(code).not.toContain('rules/collision');
  });
});

describe('steps (per-tick behavior + ordering)', () => {
  it('builtinRuleMeta exposes a rule’s steps as anchor targets', () => {
    // Motion is a `.rule` now; the fixture stands in for "a rule with a step",
    // and its exports have to be in the namespace for the ref to resolve.
    const motion = builtinRuleMeta([MotionRule as never], {
      ...(WorldLab as Record<string, unknown>),
      ...(MotionFixture as Record<string, unknown>),
    })[0];
    const reposition = motion.steps.find(s => s.id === 'reposition');
    expect(reposition).toBeDefined();
    expect(reposition?.ownerRef).toEqual({
      source: 'builtin',
      exportName: 'MotionRule',
      ruleName: 'Has Physics',
    });
  });
});

describe('a step that names the moment it runs in', () => {
  // What five of the seven stock steps could not say. Gravity means "this is a
  // force" and had to write `before Physics ▸ reposition`, so a learner adding
  // a second force had to discover Physics first (engine/core/phases).

  it('parses the phase off the block', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile('Has Wind', stepIn('gust', 'push')),
    )!;

    expect(meta.steps).toEqual([
      expect.objectContaining({
        id: 'gust',
        scope: 'world',
        order: {kind: 'phase', phase: 'push'},
      }),
    ]);
  });

  it('emits addStepIn, naming no other rule', () => {
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile('Has Wind', stepIn('gust', 'push')),
    )!;
    const code = ruleMetaToModule(meta, new Map());

    expect(code).toContain(
      `export const GustStep = rule.addStepIn("gust", "push", (world, delta) => {\n});`,
    );
    expect(code).not.toContain('MotionRule');
  });

  it('falls back to unordered when no phase is chosen', () => {
    // A dropdown never opened, or a phase since renamed. Unordered is the
    // weaker claim; guessing a moment would be a stronger one, and wrong.
    const meta = parseRuleMeta(
      'rules/wind',
      ruleFile('Has Wind', stepIn('gust', '')),
    )!;

    expect(meta.steps[0].order).toEqual({kind: 'free'});
  });
});

describe('a step declared under a trait', () => {
  // Position says two things so the author does not have to: what the body runs
  // for, and which moments it may name.

  it('takes its subject from the trait it is under', () => {
    const meta = parseRuleMeta(
      'rules/follow',
      ruleFile(
        'Camera Follow',
        subjectTrait('Follows', 'camera', traitStep('aim at it', 'aim')),
        trait('Heavy', traitStep('fall', 'push')),
      ),
    )!;

    expect(meta.steps).toEqual([
      expect.objectContaining({
        id: 'aim_at_it',
        scope: 'camera',
        ownerTraitId: 'Follows',
        order: {kind: 'phase', phase: 'aim'},
      }),
      expect.objectContaining({
        id: 'fall',
        scope: 'actor',
        ownerTraitId: 'Heavy',
        order: {kind: 'phase', phase: 'push'},
      }),
    ]);
  });

  it('generates the loop the author no longer writes', () => {
    // `for each camera in all cameras where has trait ⟨Follows⟩` was the first
    // thing every trait step had to say and the least interesting. It is the
    // declaration site's job now.
    const meta = parseRuleMeta(
      'rules/follow',
      ruleFile(
        'Camera Follow',
        subjectTrait('Follows', 'camera', traitStep('aim at it', 'aim')),
      ),
    )!;
    const bodies = new Map([
      [
        ruleBodyKey('step', 'camera', 'Follows', 'aim_at_it'),
        {params: [], body: 'camera.set(WorldLab.PositionProperty, here);\n'},
      ],
    ]);

    expect(ruleMetaToModule(meta, bodies)).toContain(
      `rule.addStepIn("aim_at_it", "aim", (world, delta) => {\n` +
        `for (const camera of world.cameras.with(FollowsTrait)) {\n` +
        `camera.set(WorldLab.PositionProperty, here);\n}\n});`,
    );
  });

  it('walks the actors for an actor trait', () => {
    const meta = parseRuleMeta(
      'rules/heavy',
      ruleFile('Heavy', trait('Falls', traitStep('fall', 'push'))),
    )!;

    expect(ruleMetaToModule(meta, new Map())).toContain(
      `for (const actor of world.actors.with(FallsTrait)) {`,
    );
  });
});
