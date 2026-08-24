import {deterministicResolver} from '@cdo/apps/aiLessons/navigation';
import {
  applyOverlay,
  EMPTY_OVERLAY,
  LessonOverlay,
} from '@cdo/apps/aiLessons/overlay';
import {HubStep, LabStep, LessonPlan} from '@cdo/apps/aiLessons/types';

const lesson: LessonPlan = {
  formatVersion: 2,
  id: 'tree',
  title: 'Tree lesson',
  objective: '',
  authorInputs: {prompt: ''},
  steps: [
    {
      id: 'hub',
      kind: 'hub',
      title: 'Skill map',
      next: 'after',
      paths: [{id: 'debugging', title: 'Debugging', steps: ['fixit']}],
    },
    {
      id: 'fixit',
      kind: 'lab',
      title: 'Fix it!',
      labType: 'weblab2',
      description: '',
      validation: 'tutor',
    },
    {
      id: 'after',
      kind: 'lab',
      title: 'After',
      labType: 'weblab2',
      description: '',
      validation: 'none',
    },
  ],
};

const remediation: LessonOverlay = {
  steps: [
    {
      id: 'gen-debugging-1-1',
      kind: 'lab',
      title: 'One more bug hunt',
      labType: 'weblab2',
      description: 'targeted practice',
      validation: 'tutor',
      sourceMode: 'sandbox',
      generated: true,
    } as LessonPlan['steps'][number],
  ],
  pathExtensions: {debugging: ['gen-debugging-1-1']},
  rounds: {debugging: 1},
};

describe('applyOverlay', () => {
  it('is the identity for an empty overlay', () => {
    expect(applyOverlay(lesson, EMPTY_OVERLAY)).toBe(lesson);
  });

  it('appends generated steps and extends the referenced path', () => {
    const merged = applyOverlay(lesson, remediation);
    expect(merged.steps.map(s => s.id)).toEqual([
      'hub',
      'fixit',
      'after',
      'gen-debugging-1-1',
    ]);
    const hub = merged.steps[0] as HubStep;
    expect(hub.paths[0].steps).toEqual(['fixit', 'gen-debugging-1-1']);
    expect((merged.steps[3] as LabStep).generated).toBe(true);
    // The authored lesson is untouched.
    expect(lesson.steps).toHaveLength(3);
    expect((lesson.steps[0] as HubStep).paths[0].steps).toEqual(['fixit']);
  });

  it('routes path continuation into the generated step and back', async () => {
    const merged = applyOverlay(lesson, remediation);
    expect(
      await deterministicResolver.resolveNext({
        lesson: merged,
        currentStepId: 'fixit',
        path: ['fixit'],
        completedStepIds: ['fixit'],
      })
    ).toEqual({kind: 'goto', stepId: 'gen-debugging-1-1'});
    expect(
      await deterministicResolver.resolveNext({
        lesson: merged,
        currentStepId: 'gen-debugging-1-1',
        path: ['gen-debugging-1-1'],
        completedStepIds: ['fixit', 'gen-debugging-1-1'],
      })
    ).toEqual({kind: 'goto', stepId: 'hub'});
  });

  it('drops colliding ids and dangling extensions', () => {
    const merged = applyOverlay(lesson, {
      steps: [
        {...remediation.steps[0], id: 'fixit'}, // collides with authored
      ],
      pathExtensions: {debugging: ['fixit', 'never-generated']},
      rounds: {},
    });
    expect(merged.steps.map(s => s.id)).toEqual(['hub', 'fixit', 'after']);
    expect((merged.steps[0] as HubStep).paths[0].steps).toEqual(['fixit']);
  });

  it('normalizes a terse generated step', () => {
    const merged = applyOverlay(lesson, {
      steps: [
        {
          id: 'gen-debugging-1-1',
          kind: 'lab',
          successCriteria: 'the bug is fixed',
        } as LessonPlan['steps'][number],
      ],
      pathExtensions: {debugging: ['gen-debugging-1-1']},
      rounds: {},
    });
    const generatedStep = merged.steps[3] as LabStep;
    expect(generatedStep.labType).toBe('weblab2');
    // Non-empty success criteria imply a tutor gate.
    expect(generatedStep.validation).toBe('tutor');
  });
});
