// Which moments a step's dropdown offers, and why the block sits where it does.
//
// A trait-scoped step is chained under `define trait` rather than standing
// beside it with a subject dropdown, because the position already says what the
// dropdown would: the trait above it knows whether it is an actor's or a
// camera's. Reading it from there means the phase list narrows on its own —
// `push` is not a thing a camera does, so a camera trait never sees it, and the
// nonsense is absent rather than discouraged.
//
// Same arrangement `use trait` already uses (`traitSubjectFor`), which is the
// argument for the shape: one way to say what a member is about.

import {describe, expect, it} from 'vitest';

import type {Blockly} from '@code-dot-org/blockly';

import {PHASES} from '../../engine/core/phases';
import {phaseOptions, phaseSubjectFor} from '../phaseOptions';

/** A `PHASE` field on `type`, under the given chain of parents, innermost first. */
const field = (
  type: string,
  ...parents: Array<string | {type: string; subject?: string}>
): Blockly.FieldDropdown => {
  let parent: unknown = null;
  for (const entry of [...parents].reverse()) {
    const spec = typeof entry === 'string' ? {type: entry} : entry;
    const above = parent;
    parent = {
      type: spec.type,
      getParent: () => above,
      getFieldValue: (name: string) =>
        name === 'SUBJECT' ? (spec.subject ?? null) : null,
    };
  }
  const block = {type, getParent: () => parent};
  return {getSourceBlock: () => block} as unknown as Blockly.FieldDropdown;
};

const labels = (rows: Array<[string, string]>) => rows.map(([, id]) => id);

describe('what a step’s phase list is about', () => {
  it('is the camera’s under a camera trait', () => {
    expect(
      phaseSubjectFor(
        field('world_trait_step', {
          type: 'world_rule_trait',
          subject: 'camera',
        }),
      ),
    ).toBe('camera');
  });

  it('is the actor’s under an actor trait', () => {
    expect(
      phaseSubjectFor(
        field('world_trait_step', {
          type: 'world_rule_trait',
          subject: 'actor',
        }),
      ),
    ).toBe('actor');
  });

  it('is nobody’s for a step declared beside the rule', () => {
    // Reading the keyboard, walking every pair of bodies: real work that fits
    // no single actor, and no subject to narrow by.
    expect(phaseSubjectFor(field('world_rule_step_in'))).toBe('world');
  });
});

describe('what the dropdown offers', () => {
  it('gives a camera trait only the camera’s moments', () => {
    expect(
      labels(
        phaseOptions(
          field('world_trait_step', {
            type: 'world_rule_trait',
            subject: 'camera',
          }),
        ),
      ),
    ).toEqual(['choose', 'aim', 'smooth', 'confine', 'view']);
  });

  it('gives an actor trait only the actor’s', () => {
    expect(
      labels(
        phaseOptions(
          field('world_trait_step', {
            type: 'world_rule_trait',
            subject: 'actor',
          }),
        ),
      ),
    ).toEqual(['decide', 'push', 'move', 'touch', 'settle', 'react']);
  });

  it('gives a rule-level step all of them', () => {
    expect(phaseOptions(field('world_rule_step_in'))).toHaveLength(
      PHASES.length,
    );
  });

  it('shows a label to read and stores an id', () => {
    // `take the view` is what a learner picks; `view` is what the `.rule`
    // stores and the Scheduler looks up. Renaming the label must not move a
    // step, which is why the two are not one string.
    const rows = phaseOptions(
      field('world_trait_step', {type: 'world_rule_trait', subject: 'camera'}),
    );

    expect(rows).toContainEqual(['take the view', 'view']);
  });

  it('answers for a field with no block at all', () => {
    // The flyout renders a block with no parent, and asks it what to show.
    expect(phaseOptions(undefined)).toHaveLength(PHASES.length);
  });
});
