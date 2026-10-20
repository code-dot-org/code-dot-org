import {Progress} from '@cdo/apps/adaptive/progress';
import {routeAfterCompletion} from '@cdo/apps/adaptive/routing/routeAfterCompletion';
import {Checkpoint, Pathway} from '@cdo/apps/adaptive/types';

const panels = (id: string): Checkpoint['steps'][number] => ({
  id,
  title: id,
  kind: 'panels',
  panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
});

// A diagnostic that routes, with one survey question on build, and two
// first-ring build checkpoints, one skippable.
const pathway = {
  checkpoints: [
    {
      id: 'intro',
      title: 'Intro',
      description: 'Intro',
      routeAfterCompletion: true,
      steps: [
        {
          id: 'check',
          title: 'Check',
          kind: 'questions',
          questions: [
            {
              id: 1,
              type: 'MultipleChoiceQuestion',
              questionName: 'q1',
              questionTitle: 'Q1',
              choices: [
                {id: 'a', text: 'A'},
                {id: 'b', text: 'B'},
              ],
              measures: {skillId: 'build', evidenceLevels: {a: 0, b: 1}},
            },
          ],
        },
      ],
    },
    {
      id: 'basics',
      title: 'Basics',
      description: 'Basics',
      skillIds: ['build'],
      requires: ['intro'],
      skippable: true,
      steps: [panels('basics-1')],
    },
    {
      id: 'more',
      title: 'More',
      description: 'More',
      skillIds: ['build'],
      requires: ['intro'],
      steps: [panels('more-1')],
    },
  ],
} as unknown as Pathway;
const [intro, , more] = pathway.checkpoints;

/** Progress with the intro's check answered and complete. */
const introDone = (choice: string): Progress => ({
  steps: {
    check: {
      status: 'complete',
      timeSpent: 10,
      answers: {1: [{answerId: choice}]},
    },
  },
});

describe('routeAfterCompletion', () => {
  it('records the verdict for a checkpoint that asks for routing', () => {
    const progress = routeAfterCompletion(pathway, introDone('b'), intro);
    expect(progress.steps).toEqual(introDone('b').steps);
    expect(progress.lastRouting).toEqual({
      checkpointId: 'intro',
      evidence: {
        build: {
          skillId: 'build',
          evidenceLevel: 1,
          source: 'questions',
          from: [{kind: 'question', stepId: 'check', questionId: 1}],
        },
      },
      verdict: {
        completedCheckpoints: ['basics'],
        nextCheckpoint: 'more',
      },
    });
  });

  it('routes with no evidence, skipping nothing', () => {
    const progress = routeAfterCompletion(
      pathway,
      {steps: {check: {status: 'complete', timeSpent: 1}}},
      intro
    );
    expect(progress.lastRouting?.verdict).toEqual({
      completedCheckpoints: [],
      nextCheckpoint: 'basics',
    });
  });

  it('leaves progress alone for a checkpoint that does not ask for it', () => {
    const progress = introDone('b');
    expect(routeAfterCompletion(pathway, progress, more)).toBe(progress);
  });

  it('records a fresh verdict on a repeat completion', () => {
    const first = routeAfterCompletion(pathway, introDone('b'), intro);
    const second = routeAfterCompletion(pathway, first, intro);
    expect(second.lastRouting).toEqual(first.lastRouting);
    expect(second.lastRouting).not.toBe(first.lastRouting);
  });
});
