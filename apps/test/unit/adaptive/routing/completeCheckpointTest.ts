import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress';
import {completeCheckpoint} from '@cdo/apps/adaptive/routing/completeCheckpoint';
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

const answered = (choice: string): Progress => ({
  ...EMPTY_PROGRESS,
  started: ['intro'],
  stepContext: {check: {answers: {1: [{answerId: choice}]}}},
});

describe('completeCheckpoint', () => {
  it('marks the checkpoint complete, once', () => {
    const once = completeCheckpoint(pathway, EMPTY_PROGRESS, 'more');
    expect(once.completed).toEqual(['more']);
    expect(completeCheckpoint(pathway, once, 'more')).toBe(once);
  });

  it('records the verdict when the checkpoint routes and there is evidence', () => {
    const progress = completeCheckpoint(pathway, answered('b'), 'intro');
    expect(progress.completed).toEqual(['intro']);
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

  it('does not apply the verdict', () => {
    const progress = completeCheckpoint(pathway, answered('b'), 'intro');
    expect(progress.completed).not.toContain('basics');
  });

  it('leaves the record alone with no evidence', () => {
    const progress = completeCheckpoint(pathway, EMPTY_PROGRESS, 'intro');
    expect(progress.lastRouting).toBeUndefined();
  });

  it('does not route a checkpoint that does not ask for it', () => {
    const progress = completeCheckpoint(pathway, answered('b'), 'more');
    expect(progress.lastRouting).toBeUndefined();
  });

  it('routes again on a repeat completion', () => {
    const first = completeCheckpoint(pathway, answered('b'), 'intro');
    const changed = {...first, stepContext: answered('a').stepContext};
    const second = completeCheckpoint(pathway, changed, 'intro');
    expect(second.lastRouting?.verdict.completedCheckpoints).toEqual([]);
    expect(second.lastRouting).not.toBe(first.lastRouting);
  });
});
