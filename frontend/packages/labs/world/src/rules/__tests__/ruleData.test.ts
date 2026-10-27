// A rule as data (specs/RULE_EDITOR_PLAN.md, step 1).
//
// The safety net for the Rule Editor: every stock rule is data, and folds
// back from its view, down to its bodies.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {
  foldRule,
  isRuleData,
  ruleView,
  ruleViewOf,
  type RuleData,
} from '../ruleData';
import {resolveRuleContents} from '../ruleReference';
import {STOCK_RULES} from '../stock';

type Node = Record<string, unknown>;

describe('every stock rule', () => {
  it.each(STOCK_RULES.map(rule => [rule.id, rule.contents]))(
    '%s is data, and folds back from its view',
    (_id, contents) => {
      const data = JSON.parse(contents) as RuleData;

      expect(isRuleData(data)).toBe(true);
      expect(foldRule(ruleView(data))).toEqual(data);
    },
  );

  it.each(STOCK_RULES.map(rule => [rule.id, rule.contents]))(
    '%s reads the same to the rest of the lab as its view',
    (id, contents) => {
      const meta = parseRuleMeta(`rules/${id}`, contents);
      expect(meta).toBeDefined();
      expect(
        parseRuleMeta(
          `rules/${id}`,
          JSON.stringify(ruleView(JSON.parse(contents) as RuleData)),
        ),
      ).toEqual(meta);
    },
  );
});

const rule = (rows: Node[], traits: Node[] = []) => ({
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_rule',
        fields: {NAME: 'Keys', ABILITY: 'Has Keys'},
        ...(rows.length ? {next: {block: chained(rows)}} : {}),
      },
      ...traits,
    ],
  },
});

const chained = (rows: Node[]): Node =>
  rows.reduceRight<Node | undefined>(
    (below, row) => (below ? {...row, next: {block: below}} : row),
    undefined,
  )!;

const doc = (text: string) => ({type: 'world_doc', fields: {DOC: text}});

describe('a rule', () => {
  it('takes its note first as its description', () => {
    expect(foldRule(rule([doc('What it is for.')]))?.description).toBe(
      'What it is for.',
    );
  });

  it('does not fold with a note among its members', () => {
    expect(
      foldRule(
        rule([
          doc('What it is for.'),
          {type: 'world_use_rule', fields: {RULE: 'Physics'}},
          doc('And another thing.'),
        ]),
      ),
    ).toBeUndefined();
  });

  it('does not fold with a row it does not know, or a loose root', () => {
    expect(foldRule(rule([{type: 'world_print'}]))).toBeUndefined();
    const loose = rule([]);
    loose.blocks.blocks.push({type: 'world_print'} as never);
    expect(foldRule(loose)).toBeUndefined();
  });

  it('reads what a hand-written rule leaves out as it always read', () => {
    // A rule written as blocks — by the tutor, say — may say no ability and
    // no access, and `parseRuleMeta` read both before it read the data.
    const folded = foldRule({
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Wind'},
            next: {
              block: {
                type: 'world_rule_property',
                fields: {TYPE: 'number', NAME: 'strength', DEFAULT: 2},
              },
            },
          },
        ],
      },
    });
    expect(folded?.ability).toBe('Wind');
    expect(folded?.properties?.[0].access).toBe('writable');
  });

  it('keeps what a block reports', () => {
    const data = foldRule(
      rule([
        {
          type: 'world_rule_block',
          fields: {RETURNS: 'boolean', DESCRIPTION: 'Whether.'},
          extraState: {parts: [{kind: 'label', text: 'is ready?'}]},
          inputs: {DO: {block: {type: 'world_return'}}},
        },
      ]),
    );
    expect(data?.members).toEqual([
      {
        id: 'block-0',
        kind: 'block',
        parts: [{kind: 'label', text: 'is ready?'}],
        description: 'Whether.',
        returns: 'boolean',
        body: {type: 'world_return'},
      },
    ]);
  });

  it('gives a trait its steps, and the rule a tick of its own', () => {
    const data = foldRule(
      rule(
        [{type: 'world_rule_step_tick', fields: {NAME: 'each tick'}}],
        [
          {
            type: 'world_rule_trait',
            fields: {NAME: 'Ticks', DESCRIPTION: 'Ticks.'},
            next: {
              block: {
                type: 'world_trait_step',
                fields: {PHASE: 'decide', NAME: 'tick'},
              },
            },
          },
        ],
      ),
    );
    expect(data?.steps).toEqual([{name: 'each tick'}]);
    expect(data?.traits).toEqual([
      {
        name: 'Ticks',
        description: 'Ticks.',
        steps: [{name: 'tick', phase: 'decide'}],
      },
    ]);
  });
});

describe('a data-shaped rule', () => {
  const data: RuleData = {
    type: 'rule',
    name: 'Keys',
    ability: 'Has Keys',
    properties: [{name: 'count', type: 'number', access: 'writable', value: 0}],
  };

  it('is read as its view, and resolved as itself', () => {
    expect(JSON.parse(ruleViewOf(JSON.stringify(data)))).toEqual(
      ruleView(data),
    );
    expect(resolveRuleContents(JSON.stringify(data))).toBe(
      JSON.stringify(data),
    );
  });

  it('leaves any other contents as they are', () => {
    const blocks = JSON.stringify(rule([]));
    expect(ruleViewOf(blocks)).toBe(blocks);
  });
});
