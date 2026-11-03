// An actor's steps on their page (specs/DRAWING_PAGE_PLAN.md).

import {describe, expect, it} from 'vitest';

import {STEP_HEAD} from '../../blockly/pageHeads';
import type {ActorData} from '../actorData';
import {
  actorMoment,
  actorStepAt,
  actorStepDocument,
  actorStepId,
  actorStepProblem,
  addActorStep,
  removeActorStep,
  withActorStepDocument,
} from '../actorSteps';

const print = {type: 'world_print'};
const blinker: ActorData = {
  type: 'actor',
  name: 'Blinker',
  steps: [{name: 'blink', phase: 'react', body: print}],
};

describe('an actor’s steps', () => {
  it('are named on the trail by their place', () => {
    expect(actorStepAt(blinker, actorStepId(0))).toBe(0);
    expect(actorStepAt(blinker, actorStepId(1))).toBeUndefined();
    expect(actorStepAt(blinker, 'blink')).toBeUndefined();
  });

  it('may not share a name, which is the id each is defined under', () => {
    expect(actorStepProblem(blinker, undefined, ' blink ')).toBe(
      'Blinker already has a step called blink.',
    );
    expect(actorStepProblem(blinker, 0, 'blink')).toBeUndefined();
    expect(actorStepProblem(blinker, undefined, '  ')).toBe(
      'A step needs a name.',
    );
  });

  it('are added under a name not taken, deciding', () => {
    const {data, at} = addActorStep(blinker);
    expect(at).toBe(1);
    expect(data.steps![1]).toEqual({name: 'do something', phase: 'decide'});
    expect(addActorStep(data).data.steps![2].name).toBe('do something 2');
  });

  it('leave no empty list behind', () => {
    expect(removeActorStep(blinker, 0)).not.toHaveProperty('steps');
  });

  it('are written under a head that says their moment', () => {
    const page = JSON.parse(actorStepDocument(blinker, 0));
    expect(page.blocks.blocks[0]).toMatchObject({
      type: STEP_HEAD,
      fields: {MOMENT: actorMoment(blinker.steps![0])},
      next: {block: print},
    });
    expect(actorMoment(blinker.steps![0])).toBe('each frame, during react');

    delete page.blocks.blocks[0].next;
    expect(
      withActorStepDocument(blinker, 0, JSON.stringify(page)).steps,
    ).toEqual([{name: 'blink', phase: 'react'}]);
  });
});
