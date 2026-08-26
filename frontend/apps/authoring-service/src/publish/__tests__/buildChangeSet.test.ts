import {describe, expect, it} from 'vitest';

import type {
  CourseModel,
  CurriculumChange,
  WidgetDescriptor,
} from '../../authoring/model.js';
import type {CurriculumSnapshot} from '../../store/SessionStore.js';
import {buildChangeSet} from '../buildChangeSet.js';

const widget: WidgetDescriptor = {
  id: 'sorter',
  toolName: 'present_sorter',
  title: 'Sorter',
  description: 'Sort samples.',
  inputSchema: {type: 'object'},
  resourceUri: 'ui://widgets/sorter.html',
  visibility: ['model', 'app'],
  network: 'none',
};

const course: CourseModel = {
  id: 'k5-ai-data-2024',
  displayName: 'How AI Makes Decisions',
  origin: 'levelbuilder',
  units: [
    {
      id: 'k5-ai-data-2024',
      displayName: 'How AI Makes Decisions',
      origin: 'levelbuilder',
      lessons: [
        {
          id: 'lb:k5-ai-data-2024:what-is-data',
          displayName: 'What is data?',
          origin: 'levelbuilder',
          adaptivePolicy: {tutorGuidance: 'Nudge, never solve.'},
          experiences: [
            {
              id: 'lb:Oceans_FishVTrash_2024',
              origin: 'levelbuilder',
              kind: 'existingLevel',
              levelKey: 'Oceans_FishVTrash_2024',
              levelType: 'Fish',
              runtime: 'labhost',
              labKey: 'oceans',
            },
            {
              id: 'lb:ai_data_intro_video',
              origin: 'levelbuilder',
              kind: 'existingLevel',
              levelKey: 'ai_data_intro_video',
              levelType: 'StandaloneVideo',
              runtime: 'generic',
              data: {type: 'video', videoKey: 'ai-data-intro'},
            },
            {
              id: 'lb:some_dance_level',
              origin: 'levelbuilder',
              kind: 'existingLevel',
              levelKey: 'some_dance_level',
              levelType: 'Dancelab',
              runtime: 'unsupported',
            },
          ],
        },
        {
          id: 'draft:lesson-1',
          displayName: 'Balance the data',
          origin: 'draft',
          experiences: [
            {
              id: 'draft:experience-1',
              origin: 'draft',
              kind: 'widget',
              widgetId: 'sorter',
              toolName: 'present_sorter',
            },
          ],
        },
        {
          id: 'draft:lesson-2',
          displayName: 'Outline only',
          origin: 'draft',
          experiences: [],
        },
      ],
    },
  ],
};

const snapshot: CurriculumSnapshot = {
  version: 4,
  courses: [course],
  widgets: [widget],
  levelProperties: {},
};

const changes: CurriculumChange[] = [
  {
    seq: 1,
    at: '2026-08-25T00:00:00.000Z',
    actor: 'agent',
    op: 'createLesson',
    unitId: 'k5-ai-data-2024',
    lesson: {
      id: 'draft:lesson-1',
      displayName: 'Balance the data',
      origin: 'draft',
    },
  },
  {
    seq: 2,
    at: '2026-08-25T00:00:01.000Z',
    actor: 'agent',
    op: 'createWidget',
    descriptor: widget,
  },
];

const SOURCE =
  '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'"><p>hi</p>';

function build() {
  return buildChangeSet({
    snapshot,
    changes,
    readWidgetSource: id => (id === widget.id ? SOURCE : undefined),
    generatedAt: new Date('2026-08-25T12:00:00.000Z'),
  });
}

describe('buildChangeSet', () => {
  it('reports the courses the change log touched', () => {
    expect(build().courseIds).toEqual(['k5-ai-data-2024']);
  });

  it('carries the full change log', () => {
    expect(build().changes).toEqual(changes);
  });

  it('collects draft objects as new', () => {
    const {newObjects} = build();
    expect(newObjects.units).toEqual([]);
    expect(newObjects.lessons.map(lesson => lesson.id)).toEqual([
      'draft:lesson-1',
      'draft:lesson-2',
    ]);
    expect(newObjects.experiences.map(exp => exp.id)).toEqual([
      'draft:experience-1',
    ]);
  });

  it('validates widget source against the offline default', () => {
    expect(build().widgets).toEqual([
      {
        id: 'sorter',
        descriptor: widget,
        source: SOURCE,
        validation: {hasHtml: true, networkPolicy: 'none', cspPresent: true},
      },
    ]);
  });

  it('flags external video and unsupported level types per lesson', () => {
    const [imported, realized, outline] = build().offline;

    expect(imported).toMatchObject({
      lessonId: 'lb:k5-ai-data-2024:what-is-data',
      contentPresent: true,
      deterministicNextStep: true,
    });
    expect(imported.experiences).toEqual([
      {
        experienceId: 'lb:Oceans_FishVTrash_2024',
        kind: 'existingLevel',
        deterministic: true,
        flags: [],
      },
      {
        experienceId: 'lb:ai_data_intro_video',
        kind: 'existingLevel',
        deterministic: true,
        flags: ['external-video'],
      },
      {
        experienceId: 'lb:some_dance_level',
        kind: 'existingLevel',
        deterministic: false,
        flags: ['unsupported-level-type:Dancelab'],
      },
    ]);

    expect(realized.experiences).toEqual([
      {
        experienceId: 'draft:experience-1',
        kind: 'widget',
        deterministic: true,
        flags: [],
      },
    ]);

    expect(outline).toMatchObject({
      lessonId: 'draft:lesson-2',
      contentPresent: false,
      deterministicNextStep: false,
    });
  });

  it('lists only lessons that carry an adaptive policy', () => {
    expect(build().adaptivePolicies).toEqual([
      {
        lessonId: 'lb:k5-ai-data-2024:what-is-data',
        policy: {tutorGuidance: 'Nudge, never solve.'},
      },
    ]);
  });
});
