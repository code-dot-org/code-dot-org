import fs from 'fs';
import path from 'path';

import {normalizeLessonPlan} from '@cdo/apps/aiLessons/lessonFormat';
import {LabStep, QuestionsStep} from '@cdo/apps/aiLessons/types';

const FIXTURES_DIR = path.resolve(
  __dirname,
  '../../../../dashboard/config/ai_lessons'
);

function loadFixture(name: string) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf-8'));
}

describe('normalizeLessonPlan', () => {
  it('migrates a v1 checkpoints lesson to steps', () => {
    const plan = normalizeLessonPlan({
      id: 'old',
      title: 'Old lesson',
      objective: 'obj',
      checkpoints: [
        {
          id: 'cp-1',
          title: 'Intro',
          labType: 'panels',
          description: '',
          successCriteria: '',
          panels: [{caption: 'hello'}],
        },
        {
          id: 'cp-2',
          title: 'Build a beat',
          labType: 'music',
          description: 'do the thing',
          successCriteria: 'uses a repeat block',
        },
        {
          id: 'cp-3',
          title: 'Poke around',
          labType: 'weblab2',
          description: 'explore',
          successCriteria: '',
        },
      ],
      authorInputs: {prompt: 'p'},
    });

    expect(plan.formatVersion).toBe(2);
    expect(plan.steps.map(s => s.kind)).toEqual(['panels', 'lab', 'lab']);
    const music = plan.steps[1] as LabStep;
    expect(music.labType).toBe('music');
    // Non-empty success criteria imply a tutor gate; empty means Continue.
    expect(music.validation).toBe('tutor');
    expect((plan.steps[2] as LabStep).validation).toBe('none');
  });

  it('fills defaults on terse v2 steps', () => {
    const plan = normalizeLessonPlan({
      title: 'Terse',
      steps: [
        {kind: 'lab', labType: 'weblab2', successCriteria: 'has a heading'},
        {kind: 'questions', questions: [{prompt: 'Which artist?'}]},
        {kind: 'panels'},
      ],
    });

    const lab = plan.steps[0] as LabStep;
    expect(lab.id).toBe('step-0');
    expect(lab.validation).toBe('tutor');

    const questions = plan.steps[1] as QuestionsStep;
    expect(questions.questions).toHaveLength(1);
    expect(questions.questions[0].type).toBe('freeResponse');
    expect(questions.questions[0].id).toBe('step-1-q0');

    // A panels step with no captions still renders something.
    expect(plan.steps[2].kind).toBe('panels');
  });

  describe('repo-shipped exemplar lessons', () => {
    const fixtures = fs
      .readdirSync(FIXTURES_DIR)
      .filter(f => f.endsWith('.json'));

    it('finds the exemplar fixtures', () => {
      expect(fixtures).toEqual(
        expect.arrayContaining([
          'adaptive-fan-page.json',
          'musical-artist-webpage.json',
          'website-with-ai.json',
        ])
      );
    });

    fixtures.forEach(fixture => {
      it(`${fixture} normalizes losslessly and has resolvable targets`, () => {
        const raw = loadFixture(fixture);
        const plan = normalizeLessonPlan(raw);

        // Normalization must be a no-op on a well-formed v2 lesson: the
        // fixtures are the format's source of truth, so defaults filled
        // in at load time indicate the file is missing something.
        expect(plan.steps).toEqual(raw.steps);

        const ids = new Set(plan.steps.map(s => s.id));
        expect(ids.size).toBe(plan.steps.length);

        plan.steps.forEach(step => {
          if (step.next && step.next !== 'end') {
            expect(ids.has(step.next)).toBe(true);
          }
          (step.branches || []).forEach(branch => {
            expect(ids.has(branch.goTo)).toBe(true);
          });
          if (step.kind === 'questions') {
            step.questions.forEach(q =>
              (q.options || []).forEach(o => {
                if (o.goTo) {
                  expect(ids.has(o.goTo)).toBe(true);
                }
              })
            );
          }
        });
      });
    });
  });
});
