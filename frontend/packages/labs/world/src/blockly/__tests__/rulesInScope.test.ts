// What a `.rule` is allowed to reach for.
//
// The failure mode on one side is a project that will not compile — a block
// offered from a rule the file never imported — and on the other it is a
// toolbox with most of itself missing. Both are quiet: the first blames the
// block, and the second looks like a broken editor rather than a wrong answer.
// So the cases worth pinning are the two kinds of empty answer, and the two
// kinds of file this must NOT narrow.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {buildDomainPalette} from '../domainBlocks';
import {projectRuleMetas} from '../projectModules';
import type {RuleMeta} from '../ruleMeta';
import {blockOwners, rulesInScope, rulesOutOfScope} from '../rulesInScope';

/** A rule, as far as scoping can see one. */
const rule = (name: string, requires: string[] = []): RuleMeta =>
  ({
    id: name.toLowerCase(),
    name,
    ability: name,
    modulePath: `rules/${name.toLowerCase()}`,
    requires,
    traits: [],
    properties: [],
    actions: [],
    queries: [],
    events: [],
    steps: [],
    enums: [],
  }) as unknown as RuleMeta;

// Climbing needs Gravity, Gravity needs Physics, and Scoring needs nobody —
// which is the shape that tells a transitive answer from a shallow one.
const RULES = [
  rule('Climbing', ['Gravity']),
  rule('Gravity', ['Physics']),
  rule('Physics'),
  rule('Scoring'),
];

const actor = (...traits: string[]) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: 'Hero'},
          next: traits.reduceRight<object | undefined>(
            (next, trait) => ({
              block: {
                type: 'world_use_trait',
                fields: {TRAIT: trait},
                ...(next ? {next} : {}),
              },
            }),
            undefined,
          ),
        },
      ],
    },
  });

/** A `.rule` document that names no other rule of its own accord. */
const ruleFile = (...blocks: object[]) => JSON.stringify({blocks: {blocks}});

/** Which rule owns which block, as the toolbox would say. */
const OWNERS = new Map([
  ['world_do_Scoring_AddToTheScoreAction', 'Scoring'],
  ['world_get_Gravity_FallingProperty', 'Gravity'],
]);

const named = (scope: ReadonlySet<string> | undefined) =>
  scope && [...scope].sort();

describe('a world', () => {
  it('is offered every rule the project holds', () => {
    // It runs every one (`projectModules`), so there is no smaller honest
    // answer — and `undefined` rather than the full set, so a caller reading
    // this cannot narrow by accident.
    expect(rulesInScope({kind: 'world', contents: actor()}, RULES)).toBe(
      undefined,
    );
    expect(rulesOutOfScope({kind: 'world', contents: actor()}, RULES)).toEqual(
      [],
    );
  });
});

describe('a rule', () => {
  it('gets itself and what it requires, all the way down', () => {
    // Itself, because a rule calls the blocks it designs; and Physics, which
    // it never names — Gravity does. A shallow answer would offer Climbing a
    // Gravity block and refuse it the Physics one underneath.
    expect(
      named(
        rulesInScope(
          {kind: 'rule', module: 'rules/climbing', contents: ruleFile()},
          RULES,
        ),
      ),
    ).toEqual(['Climbing', 'Gravity', 'Physics']);
  });

  it('leaves out the rules it has nothing to do with', () => {
    expect(
      rulesOutOfScope(
        {kind: 'rule', module: 'rules/climbing', contents: ruleFile()},
        RULES,
      ),
    ).toEqual(['Scoring']);
  });

  it('keeps a rule whose block it already holds, declared or not', () => {
    // The one property worth having unconditionally: the toolbox cannot hide a
    // block that is on the screen. Such a rule is broken — an undeclared
    // dependency does not compile — and hiding the category would neither fix
    // it nor say so, while making the sibling blocks needed to fix it
    // unreachable.
    const calling = ruleFile({
      type: 'world_rule',
      fields: {NAME: 'Climbing'},
      next: {block: {type: 'world_do_Scoring_AddToTheScoreAction'}},
    });

    expect(
      named(
        rulesInScope(
          {kind: 'rule', module: 'rules/climbing', contents: calling},
          RULES,
          OWNERS,
        ),
      ),
    ).toEqual(['Climbing', 'Gravity', 'Physics', 'Scoring']);
  });

  it('does not keep a rule for a block that belongs to nobody', () => {
    // `if`, `set position`, a variable getter — in no rule category, so no
    // rule is kept alive by one. Without this the closure would be seeded by
    // whatever the owner map happened not to know about.
    const plain = ruleFile(
      {type: 'world_rule', fields: {NAME: 'Climbing'}},
      {type: 'controls_if'},
      {type: 'world_set_position'},
    );

    expect(
      named(
        rulesInScope(
          {kind: 'rule', module: 'rules/climbing', contents: plain},
          RULES,
          OWNERS,
        ),
      ),
    ).toEqual(['Climbing', 'Gravity', 'Physics']);
  });

  it('reads what it holds however deep in the file that sits', () => {
    // Not only the rule's own chain: a trait is a root of its own, and a step's
    // body is a tree, so the walk is over the whole document.
    const buried = ruleFile(
      {type: 'world_rule', fields: {NAME: 'Climbing'}},
      {
        type: 'world_rule_trait',
        next: {
          block: {
            type: 'world_use_trait',
            fields: {TRAIT: 'Scoring#ScoresTrait'},
          },
        },
      },
    );

    expect(
      named(
        rulesInScope(
          {kind: 'rule', module: 'rules/climbing', contents: buried},
          RULES,
        ),
      ),
    ).toEqual(['Climbing', 'Gravity', 'Physics', 'Scoring']);
  });

  it('is offered EVERYTHING when its file cannot be read', () => {
    // A file mid-save parses to nothing, and reading that as "holds nothing"
    // would narrow to the declared set — which comes and goes with the save.
    expect(
      rulesInScope(
        {kind: 'rule', module: 'rules/climbing', contents: '{not json'},
        RULES,
      ),
    ).toBe(undefined);
    expect(rulesInScope({kind: 'rule', module: 'rules/climbing'}, RULES)).toBe(
      undefined,
    );
  });

  it('ignores a trait dropdown that names nothing', () => {
    // An unset dropdown reads as `''`. Split on `#` that is a rule called
    // nothing, and a lookup for it would match any rule whose name is empty
    // rather than simply finding no rule.
    const blank = ruleFile(
      {type: 'world_rule', fields: {NAME: 'Scoring'}},
      {type: 'world_use_trait', fields: {TRAIT: ''}},
      {type: 'world_use_trait', fields: {TRAIT: '#Bare'}},
    );

    expect(
      named(
        rulesInScope(
          {kind: 'rule', module: 'rules/scoring', contents: blank},
          RULES,
        ),
      ),
    ).toEqual(['Scoring']);
  });

  it('offers everything when the file is not a rule it can find', () => {
    // Being written, renamed, or not parsing. Nothing to close over, so
    // nothing worth hiding.
    expect(
      rulesInScope(
        {kind: 'rule', module: 'rules/nothing', contents: ruleFile()},
        RULES,
      ),
    ).toBe(undefined);
    expect(rulesInScope({kind: 'rule', contents: ruleFile()}, RULES)).toBe(
      undefined,
    );
  });
});

describe('an actor', () => {
  it('is offered every rule, whatever it elects', () => {
    // ELECTING A TRAIT IS NOT THE ONLY WAY AN ACTOR TOUCHES A RULE, and the
    // shipped files are the argument: the Pilot wins the game and adds to the
    // score without being a Goal or a Scoreboard, a health bar reads the
    // health of the thing it hangs over, a ledge damages whoever lands on it.
    // A `use trait` in any of them would be a lie about what the actor is.
    //
    // Narrowing on traits plus what is already written would keep those, and
    // still be wrong: a rule can change an actor's shape, or another actor's
    // traits, without either file saying so. The editor cannot tell which, so
    // it does not guess.
    // THE KIND IS THE ONLY THING BEING VARIED, which is why the module named
    // here is a rule's. Asked with an actor's own path — `actors/hero` — this
    // would answer "everything" whatever the rule said, because no rule is
    // written in that file and there would be nothing to close over. That
    // passes for the wrong reason: it would go on passing if actors were
    // narrowed again tomorrow.
    const asRule = {kind: 'rule', module: 'rules/climbing', contents: actor()};

    expect(rulesInScope({...asRule, kind: 'actor'}, RULES)).toBe(undefined);
    expect(rulesOutOfScope({...asRule, kind: 'actor'}, RULES)).toEqual([]);
    // …and the same file, called a rule, IS narrowed. Without this the
    // assertions above could hold because nothing narrows anything.
    expect(rulesOutOfScope(asRule, RULES)).toEqual(['Scoring']);
  });
});

describe('reading which rule owns which block', () => {
  it('takes them from the rule categories and nowhere else', () => {
    // Only categories named after a rule count. `Actor`, `Logic` and the
    // engine's own `Space` are categories too, and a block in one of them must
    // not make some rule look used.
    const toolbox = [
      {name: 'Actor', blocks: ['world_use_trait', 'world_set_position']},
      {name: 'Gravity', blocks: ['world_get_Gravity_FallingProperty']},
      {name: 'Logic', blocks: ['controls_if']},
    ];

    const owners = blockOwners(toolbox, RULES);

    expect(owners.get('world_get_Gravity_FallingProperty')).toBe('Gravity');
    expect(owners.has('world_set_position')).toBe(false);
    expect(owners.has('controls_if')).toBe(false);
  });

  it('is empty for a toolbox it cannot read', () => {
    expect(blockOwners(undefined, RULES).size).toBe(0);
  });
});

describe('every file every scenario ships', () => {
  /**
   * Whether narrowing would take away a block the file is holding.
   *
   * THE ONE THING THIS FEATURE COULD BREAK, and it would break it quietly: a
   * hidden category leaves its blocks defined, so the file still renders and
   * still compiles — a learner just opens it, sees a block, and cannot find
   * another like it anywhere in the toolbox. Nothing throws and nothing says
   * why. Run against the shipped content because that is the content a
   * learner meets, and because it is where the awkward patterns live.
   */
  const orphaned = (): string[] => {
    const found: string[] = [];
    for (const [tag, scenario] of Object.entries(WORLD_SCENARIOS)) {
      const files = projectFiles(scenario.source);
      const rules = projectRuleMetas(files);
      const owners = blockOwners(buildDomainPalette(rules).toolbox, rules);
      for (const [path, contents] of Object.entries(files)) {
        const kind = path.endsWith('.rule')
          ? 'rule'
          : path.endsWith('.actor')
            ? 'actor'
            : undefined;
        if (!kind) {
          continue;
        }
        const scope = rulesInScope(
          {kind, module: path.replace(/\.(rule|actor)$/, ''), contents},
          rules,
          owners,
        );
        if (!scope) {
          continue;
        }
        for (const block of everyType(JSON.parse(contents))) {
          const from = owners.get(block);
          if (from && !scope.has(from)) {
            found.push(`${tag} ${path}: ${block} (${from})`);
          }
        }
      }
    }
    return [...new Set(found)];
  };

  it('keeps every rule block it holds inside its own toolbox', () => {
    expect(orphaned()).toEqual([]);
  });
});

/** Every block type in a saved document, at any depth. */
function* everyType(node: unknown): Generator<string> {
  if (Array.isArray(node)) {
    for (const item of node) {
      yield* everyType(item);
    }
    return;
  }
  if (!node || typeof node !== 'object') {
    return;
  }
  const block = node as {type?: string};
  if (typeof block.type === 'string') {
    yield block.type;
  }
  for (const value of Object.values(block)) {
    yield* everyType(value);
  }
}
