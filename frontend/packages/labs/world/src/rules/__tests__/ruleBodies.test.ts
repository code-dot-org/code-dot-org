// A rule's bodies, each under its page's head (specs/COMPILE_FROM_DATA_PLAN.md,
// step 1).

import {describe, expect, it} from 'vitest';

import {MEMBER_HEAD, STEP_HEAD} from '../../blockly/pageHeads';
import {ruleBodyKey} from '../../blockly/ruleMeta';
import {ruleBodySheet} from '../ruleBodies';
import type {RuleData} from '../ruleData';

const nudge = {type: 'world_say', id: 'say'};

const wind: RuleData = {
  type: 'rule',
  name: 'Wind',
  ability: 'Has Wind',
  members: [
    {
      id: 'm1',
      kind: 'block',
      parts: [
        {kind: 'label', text: 'nudge by'},
        {kind: 'param', type: 'number', var: 'v1'},
      ],
      body: nudge,
    },
    {id: 'm2', kind: 'event', parts: [{kind: 'label', text: 'gusted'}]},
  ],
  steps: [{name: 'blow', phase: 'push'}],
  traits: [
    {
      name: 'Follows',
      subject: 'camera',
      members: [
        {
          id: 'm3',
          kind: 'block',
          parts: [{kind: 'label', text: 'is gusting'}],
          returns: 'boolean',
        },
      ],
      steps: [{name: 'aim at the actor', phase: 'aim'}],
    },
  ],
  variables: [{id: 'v1', name: 'amount', type: 'Number'}],
};

describe('a rule’s bodies', () => {
  const sheet = ruleBodySheet(wind);
  const roots = sheet.workspace.blocks.blocks;

  it('are filed by scope, owner, kind and id, in the order the rule says them', () => {
    expect(sheet.bodies.map(at => at.key)).toEqual([
      ruleBodyKey('action', 'world', undefined, 'nudge_by'),
      ruleBodyKey('step', 'world', undefined, 'blow'),
      ruleBodyKey('query', 'camera', 'Follows', 'is_gusting'),
      ruleBodyKey('step', 'camera', 'Follows', 'aim_at_the_actor'),
    ]);
  });

  it('hang under the head their page draws', () => {
    expect(roots.map(root => root.type)).toEqual([
      MEMBER_HEAD,
      STEP_HEAD,
      MEMBER_HEAD,
      STEP_HEAD,
    ]);
    expect(roots[0]).toMatchObject({
      id: sheet.bodies[0].head,
      extraState: {parts: wind.members![0].parts},
      next: {block: nudge},
    });
    expect(roots[1]).not.toHaveProperty('next');
  });

  it('take a block’s values, and a step nothing', () => {
    expect(sheet.bodies.map(at => at.params)).toEqual([['v1'], [], [], []]);
  });

  it('carry the rule’s variables, which the bodies read', () => {
    expect(sheet.workspace.variables).toEqual(wind.variables);
  });
});
