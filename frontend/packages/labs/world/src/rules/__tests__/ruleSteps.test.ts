// A rule's steps on a page of their own (specs/RULE_EDITOR_PLAN.md, step 5).

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import type {RuleData} from '../ruleData';
import {
  addStep,
  momentOf,
  phasesOf,
  removeStep,
  renameStep,
  stepAtOf,
  stepDocument,
  stepId,
  stepProblem,
  withStepDocument,
} from '../ruleSteps';

const timer = (): RuleData => ({
  type: 'rule',
  name: 'Time',
  ability: 'Has Time',
  steps: [{name: 'read the clock', phase: 'sense'}],
  traits: [
    {
      name: 'Has a Timer',
      steps: [{name: 'tick', phase: 'decide', body: {type: 'world_print'}}],
    },
    {name: 'Aimed', subject: 'camera'},
  ],
  variables: [{id: 'v1', name: 'left', type: 'Number'}],
});

describe('a step', () => {
  it('is found by its owner and its place', () => {
    const place = {owner: 'Has a Timer', at: 0};
    expect(stepAtOf(timer(), stepId(place))).toEqual(place);
    expect(stepAtOf(timer(), '#0')).toEqual({owner: null, at: 0});
    expect(stepAtOf(timer(), 'Has a Timer#4')).toBeUndefined();
  });

  it('says when it runs, and for whom', () => {
    const data = timer();
    expect(momentOf(data, {owner: null, at: 0}, data.steps![0])).toBe(
      'every frame, during sense',
    );
    expect(
      momentOf(data, {owner: 'Has a Timer', at: 0}, data.traits![0].steps![0]),
    ).toBe('each frame, during decide, for each actor with Has a Timer');
    expect(momentOf(data, {owner: null, at: 0}, {name: 'x'})).toBe(
      'every tick',
    );
  });

  it('runs in its holder’s moments, and the world’s', () => {
    const ids = (owner: string | null) =>
      phasesOf(timer(), owner).map(phase => phase.id);
    expect(ids('Aimed')).toContain('sense');
    expect(ids('Aimed')).not.toContain('push');
    expect(ids('Has a Timer')).toContain('push');
    expect(ids(null)).toContain('aim');
  });

  it('may not share an id with another step of the rule', () => {
    expect(stepProblem(timer(), undefined, 'Tick')).toMatch(/already has/);
    expect(
      stepProblem(timer(), {owner: 'Has a Timer', at: 0}, 'tick'),
    ).toBeUndefined();
    expect(stepProblem(timer(), undefined, '  ')).toMatch(/needs a name/);
  });

  it('is made with a name of its own, and taken away', () => {
    const {data, place} = addStep(timer(), 'Has a Timer');
    expect(place).toEqual({owner: 'Has a Timer', at: 1});
    expect(data.traits![0].steps![1]).toEqual({
      name: 'do something',
      phase: 'decide',
    });
    const again = addStep(data, null);
    expect(again.data.steps!.at(-1)!.name).toBe('do something 2');
    expect(removeStep(again.data, again.place).steps).toHaveLength(1);
  });
});

describe('a step’s page', () => {
  const place = {owner: 'Has a Timer', at: 0};

  it('is its head, saying its moment, with what it does below', () => {
    const document = JSON.parse(stepDocument(timer(), place));
    expect(document.blocks.blocks).toEqual([
      expect.objectContaining({
        type: 'world_step_head',
        fields: {
          MOMENT: 'each frame, during decide, for each actor with Has a Timer',
        },
        next: {block: {type: 'world_print'}},
      }),
    ]);
    expect(document.variables).toEqual(timer().variables);
  });

  it('comes back as the step’s body, and nothing below is none', () => {
    const saved = JSON.parse(stepDocument(timer(), place));
    saved.blocks.blocks[0].next = {block: {type: 'world_say'}};
    let data = withStepDocument(timer(), place, JSON.stringify(saved));
    expect(data.traits![0].steps![0].body).toEqual({type: 'world_say'});

    delete saved.blocks.blocks[0].next;
    data = withStepDocument(data, place, JSON.stringify(saved));
    expect(data.traits![0].steps![0]).toEqual({name: 'tick', phase: 'decide'});
  });
});

describe('a step renamed', () => {
  it('takes what is ordered against it along', () => {
    const file: ProjectFile = {
      id: 'r',
      name: 'other.rule',
      folderId: '0',
      language: 'rule',
      contents: JSON.stringify({
        blocks: {
          languageVersion: 0,
          blocks: [
            {
              type: 'world_rule_step_after',
              fields: {STEP: 'Time#read_the_clock'},
            },
          ],
        },
      }),
    };
    const source: MultiFileSource = {
      folders: {},
      files: {r: file},
      openFiles: [],
    };
    const next = renameStep(source, 'Time', 'read the clock', 'look at it');
    expect(next.files.r.contents).toContain('Time#look_at_it');
    expect(renameStep(source, 'Time', 'tick', 'tick')).toBe(source);
  });
});
