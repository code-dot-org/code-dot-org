// The demo worlds, by the rule each one demonstrates.
//
// Keyed by the stock rule's id, so a rule's demo is found the way everything
// else about it is. A rule with no entry has no demo yet, which the import
// dialog has to be comfortable with anyway (specs/RULE_DEMOS.md).

import {collectDemo} from './collect';
import {gravityDemo} from './gravity';
import {steeringDemo} from './steering';
import type {RuleDemo} from './types';

export const RULE_DEMOS: Readonly<Record<string, RuleDemo>> = {
  gravity: gravityDemo,
  steering: steeringDemo,
  collect: collectDemo,
};

/** The demo for a stock rule id, or undefined if it has none yet. */
export const ruleDemo = (id: string): RuleDemo | undefined => RULE_DEMOS[id];

export type {RuleDemo, RuleModules} from './types';
