// What a block naming a trait says on hover: what the block does, and then
// what the chosen trait is for, since a dropdown option has no tooltip of its
// own and "Slows" or "Carries" says little alone.

import {afterEach, describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../../../rules/stock';
import {parseRuleMeta} from '../../ruleMeta';
import {registerProjectRules} from '../../ruleRegistry';
import {setProjectRuleMeta, setProjectRules} from '../../traitOptions';
import {traitTooltipText} from '../traitTooltip';

const OWN = 'Give the actor a trait (its properties and behavior).';

describe('a trait block’s tooltip', () => {
  afterEach(() => {
    registerProjectRules([]);
    setProjectRuleMeta([]);
    setProjectRules([]);
  });

  const withGravity = () => {
    const gravity = STOCK_RULES.find(rule => rule.id === 'gravity')!;
    registerProjectRules([parseRuleMeta('rules/gravity', gravity.contents)!]);
    setProjectRules(['Gravity']);
  };

  it('adds the chosen trait’s description, by the trait’s own name', () => {
    withGravity();
    expect(traitTooltipText(OWN, 'Gravity#AffectedByGravityTrait')).toBe(
      `${OWN}\n\nAffected by Gravity: Falls, and lands on whatever acts as ground.`,
    );
  });

  it('says only what the block does when nothing declares the trait', () => {
    expect(traitTooltipText(OWN, 'Gravity#AffectedByGravityTrait')).toBe(OWN);
    withGravity();
    expect(traitTooltipText(OWN, '')).toBe(OWN);
  });
});
