import fs from 'fs';
import path from 'path';

import {normalizeLessonPlan} from '@cdo/apps/aiLessons/lessonFormat';
import {
  LabStep,
  LessonPlan,
  QuestionsStep,
  resolveAdaptivity,
} from '@cdo/apps/aiLessons/types';

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
          'website-skill-tree.json',
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

        // An arc spec's markers must name real steps, and its standards
        // list (what generated paths reference) must be non-empty.
        if (plan.arcSpec) {
          expect(ids.has(plan.arcSpec.generateAfter)).toBe(true);
          if (plan.arcSpec.rejoinAt) {
            expect(ids.has(plan.arcSpec.rejoinAt)).toBe(true);
          }
          expect(plan.arcSpec.standards.length).toBeGreaterThan(0);
          plan.arcSpec.standards.forEach(s => {
            expect(s.id).toBeTruthy();
            expect(s.text).toBeTruthy();
          });
        }

        // A step may belong to at most one hub path — hub ownership is
        // how the resolver knows where a completed step returns to.
        const owners = new Map<string, string>();
        plan.steps.forEach(step => {
          if (step.kind !== 'hub') return;
          step.paths.forEach(p =>
            p.steps.forEach(sid => {
              expect(owners.get(sid)).toBeUndefined();
              owners.set(sid, `${step.id}/${p.id}`);
            })
          );
        });

        plan.steps.forEach(step => {
          if (step.next && step.next !== 'end') {
            expect(ids.has(step.next)).toBe(true);
          }
          (step.branches || []).forEach(branch => {
            expect(ids.has(branch.goTo)).toBe(true);
          });
          if (step.kind === 'hub') {
            step.paths.forEach(p => {
              expect(p.steps.length).toBeGreaterThan(0);
              p.steps.forEach(sid => expect(ids.has(sid)).toBe(true));
              (p.requires || []).forEach(reqId =>
                expect(step.paths.some(other => other.id === reqId)).toBe(true)
              );
            });
          }
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

describe('adaptivity', () => {
  const dialled = (adaptivity?: LessonPlan['adaptivity']): LessonPlan =>
    normalizeLessonPlan({title: 'T', steps: [], adaptivity});

  it('defaults to augment and clamps to the authored max', () => {
    expect(resolveAdaptivity(dialled(undefined))).toBe('augment');
    expect(resolveAdaptivity(dialled(undefined), 'full')).toBe('augment');
    expect(resolveAdaptivity(dialled({default: 'augment', max: 'full'}))).toBe(
      'augment'
    );
    expect(
      resolveAdaptivity(dialled({default: 'augment', max: 'full'}), 'full')
    ).toBe('full');
    expect(
      resolveAdaptivity(dialled({default: 'full', max: 'full'}), 'static')
    ).toBe('static');
    // Nonsense requests fall back to the authored default.
    expect(
      resolveAdaptivity(dialled({default: 'augment', max: 'full'}), 'chaos')
    ).toBe('augment');
  });

  it('carries arcSpec and adaptivity through normalization', () => {
    const plan = normalizeLessonPlan({
      title: 'T',
      steps: [],
      adaptivity: {default: 'static'},
      arcSpec: {
        standards: [{id: 's1', text: 'Standard one'}],
        generateAfter: 'assessment',
      },
    });
    expect(plan.adaptivity).toEqual({default: 'static'});
    expect(plan.arcSpec?.standards[0].id).toBe('s1');
    expect(plan.arcSpec?.generateAfter).toBe('assessment');
  });
});
