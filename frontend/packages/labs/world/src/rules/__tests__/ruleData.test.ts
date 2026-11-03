// A rule as data (specs/RULE_EDITOR_PLAN.md, step 1).

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {LESSONS} from '../../progression/lessons';
import {projectFiles} from '../../runtime/projectFiles';
import {
  isRuleData,
  ruleKeyRows,
  withRuleKeyRows,
  type RuleData,
} from '../ruleData';
import {resolveRuleContents} from '../ruleReference';
import {STOCK_RULES} from '../stock';

describe('every stock rule', () => {
  it.each(STOCK_RULES.map(rule => [rule.id, rule.contents]))(
    '%s is data, and reads as a rule',
    (id, contents) => {
      expect(isRuleData(JSON.parse(contents))).toBe(true);
      expect(parseRuleMeta(`rules/${id}`, contents)).toBeDefined();
    },
  );
});

// Every rule the lab ships or teaches with: the shelf, and each scenario's
// and lesson's own.
const EVERY_RULE: Array<[string, string]> = [
  ...STOCK_RULES.map(
    one => [`stock ${one.id}`, one.contents] as [string, string],
  ),
  ...[
    ...Object.entries(WORLD_SCENARIOS).map(
      ([tag, one]) => [`scenario ${tag}`, one.source] as const,
    ),
    ...Object.entries(LESSONS).map(
      ([id, one]) => [`lesson ${id}`, one.source] as const,
    ),
  ].flatMap(([where, source]) =>
    Object.entries(projectFiles(source))
      .filter(([path]) => path.endsWith('.rule'))
      .map(
        ([path, held]) =>
          [`${where} ${path}`, resolveRuleContents(held)] as [string, string],
      ),
  ),
];

describe('every rule the lab ships or teaches with', () => {
  // A rename walks a rule's keys as the blocks they stand for and reads them
  // back (`blockly/rewriteWorkspaces`); reading back must lose nothing.
  it.each(EVERY_RULE)('%s reads every key back from its rows', (_, held) => {
    const data = JSON.parse(held) as RuleData;
    expect(isRuleData(data)).toBe(true);
    expect(withRuleKeyRows(data, ruleKeyRows(data))).toEqual(data);
  });
});

describe('a rule', () => {
  const data: RuleData = {
    type: 'rule',
    name: 'Keys',
    ability: 'Has Keys',
    properties: [{name: 'count', type: 'number', access: 'writable', value: 0}],
  };

  it('is resolved as itself', () => {
    expect(resolveRuleContents(JSON.stringify(data))).toBe(
      JSON.stringify(data),
    );
  });

  it('is not one when written in define rule rows', () => {
    const rows = JSON.stringify({
      blocks: {blocks: [{type: 'world_rule', fields: {NAME: 'Keys'}}]},
    });
    expect(parseRuleMeta('rules/keys', rows)).toBeUndefined();
  });
});
