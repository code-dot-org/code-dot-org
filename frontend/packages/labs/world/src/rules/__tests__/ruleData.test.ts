// A rule as data (specs/RULE_EDITOR_PLAN.md, step 1).
//
// The safety net for the Rule Editor: every stock rule folds into data, and
// the data's view is the rule again, down to its bodies.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {foldRule, ruleView, ruleViewOf, type RuleData} from '../ruleData';
import {resolveRuleContents} from '../ruleReference';
import {STOCK_RULES} from '../stock';

type Node = Record<string, unknown>;

/**
 * A workspace as the comparison reads it: without where its roots stand,
 * which the editor decides, and without what the view writes that a block
 * would assume anyway — a member's id and its eye open.
 */
function normalized(document: unknown): unknown {
  const walk = (node: unknown, root: boolean): unknown => {
    if (Array.isArray(node)) {
      return node.map(one => walk(one, root));
    }
    if (!node || typeof node !== 'object') {
      return node;
    }
    const copy: Node = {};
    for (const [key, value] of Object.entries(node as Node)) {
      if (root && (key === 'x' || key === 'y')) {
        continue;
      }
      copy[key] = walk(value, false);
    }
    const type = copy.type;
    if (type === 'world_rule_block' || type === 'world_rule_event') {
      delete copy.id;
      const fields = copy.fields as Node | undefined;
      if (fields?.ACCESS === 'shared') {
        delete fields.ACCESS;
      }
    }
    return copy;
  };
  const parsed = document as {blocks: {blocks: unknown[]}};
  return {
    ...parsed,
    blocks: {...parsed.blocks, blocks: walk(parsed.blocks.blocks, true)},
  };
}

describe('every stock rule', () => {
  it.each(STOCK_RULES.map(rule => [rule.id, rule.contents]))(
    '%s folds into data, and its view is the rule again',
    (_id, contents) => {
      const document = JSON.parse(contents);
      const data = foldRule(document);

      expect(data).toBeDefined();
      expect(normalized(ruleView(data!))).toEqual(normalized(document));
      expect(foldRule(ruleView(data!))).toEqual(data);
    },
  );

  it.each(STOCK_RULES.map(rule => [rule.id, rule.contents]))(
    '%s reads the same to the rest of the lab as data',
    (id, contents) => {
      const data = JSON.stringify(foldRule(JSON.parse(contents)));
      const meta = parseRuleMeta(`rules/${id}`, contents);
      expect(meta).toBeDefined();
      expect(parseRuleMeta(`rules/${id}`, resolveRuleContents(data))).toEqual(
        meta,
      );
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

  it('is read as its view', () => {
    expect(JSON.parse(ruleViewOf(JSON.stringify(data)))).toEqual(
      ruleView(data),
    );
    expect(JSON.parse(resolveRuleContents(JSON.stringify(data)))).toEqual(
      ruleView(data),
    );
  });

  it('leaves any other contents as they are', () => {
    const blocks = JSON.stringify(rule([]));
    expect(ruleViewOf(blocks)).toBe(blocks);
  });
});
