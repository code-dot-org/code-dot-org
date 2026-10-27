// Which moments `each frame`'s dropdown offers.
//
// `each frame` is an actor's own work, so it is offered an actor's moments:
// `confine` is not a thing an actor does, and is absent rather than
// discouraged. A rule's steps are chosen on their page (`rules/ruleSteps`).

import {describe, expect, it} from 'vitest';

import type {Blockly} from '@code-dot-org/blockly';

import {PHASES} from '../../engine/core/phases';
import {DOMAIN_BLOCKS} from '../domainBlocks';
import {phaseOptions, phaseSubjectFor} from '../phaseOptions';

/** A `PHASE` field on a block of `type`. */
const field = (type: string): Blockly.FieldDropdown =>
  ({
    getSourceBlock: () => ({type, getParent: () => null}),
  }) as unknown as Blockly.FieldDropdown;

const labels = (rows: Array<[string, string]>) => rows.map(([, id]) => id);

describe('what `each frame` is offered', () => {
  it('is an actor’s moments', () => {
    expect(phaseSubjectFor(field('world_trait_step'))).toBe('actor');
    expect(labels(phaseOptions(field('world_trait_step')))).toEqual([
      'sense',
      'decide',
      'push',
      'move',
      'adjust',
      'touch',
      'settle',
      'react',
    ]);
  });

  it('answers for a field with no block at all', () => {
    // The flyout renders a block with no parent, and asks it what to show.
    expect(phaseOptions(undefined)).toHaveLength(PHASES.length);
  });
});

describe('what a step block asks for', () => {
  // One dropdown. There was briefly a second, choosing whether the step ran in
  // the moment or in the gap either side of it — nothing ever used a gap, and
  // the case that argued for them (wrapping at the screen edge, after positions
  // integrate and before contacts are found) is now the `adjust` moment. A
  // named moment is in this dropdown where a learner finds it; a gap was
  // invisible until you already knew you needed it.
  const fieldsOf = (type: string): string[] =>
    (
      (
        DOMAIN_BLOCKS.find(block => block.type === type) as {
          args0?: Array<{name?: string; type?: string}>;
        }
      ).args0 ?? []
    )
      .filter(arg => arg.type?.startsWith('field_'))
      .map(arg => arg.name ?? '');

  it('is a phase and a name, and nothing else', () => {
    expect(fieldsOf('world_trait_step')).toEqual(['PHASE', 'NAME']);
  });
});
