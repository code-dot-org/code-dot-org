// Named fixtures for the dev host and tests. Scenarios represent host states
// that are expensive to reconstruct through the full platform (seeded AI
// curriculum, per-objective reflections, progress rows).

import type {LessonDeepDiveData} from '../lessonDeepDive/types';

export const SCENARIO_TAGS = ['fresh', 'aced', 'sparse'] as const;
export type ScenarioTag = (typeof SCENARIO_TAGS)[number];

const base: LessonDeepDiveData = {
  lessonId: 101,
  lessonName: 'How AI Makes Decisions',
  lessonSummary:
    'Students explore how machine learning models make predictions from ' +
    'training data, and how bias in data shapes model behavior.',
  vocabulary: [
    {
      id: 'v1',
      word: 'Training Data',
      definition: 'Examples used to teach a machine learning model.',
    },
    {
      id: 'v2',
      word: 'Bias',
      definition:
        'A systematic skew in predictions caused by unrepresentative data.',
    },
    {
      id: 'v3',
      word: 'Model',
      definition: 'A program that finds patterns in data to make predictions.',
    },
  ],
  objectives: [
    {id: '201', description: 'Explain how training data shapes a model'},
    {id: '202', description: 'Identify sources of bias in a dataset'},
    {id: '203', description: 'Describe how a model makes a prediction'},
  ],
  assessmentAnalysis: [
    {level_id: 9001, script_level_id: 8001, attempts: 2, correct: true},
    {
      level_id: 9002,
      script_level_id: 8002,
      attempts: 3,
      correct: false,
      evaluation: 'Confused bias with variance',
    },
  ],
  jsonVideos: [
    {
      key: 'training-data-intro',
      url: '/media/mock-video.mp4',
      description: 'Where training data comes from',
    },
  ],
  practiceProblems: [],
  progressCounts: {
    levelsTotalCount: 12,
    levelsAttemptedCount: 9,
    validatedLevelsTotalCount: 4,
    validatedLevelsCorrectCount: 3,
    validatedLevelsIncorrectCount: 1,
  },
  timeSpentSeconds: 1847,
  unitLabel: 'Unit 3',
  nextLessonUrl: '#next-lesson',
};

export const SCENARIOS: Record<ScenarioTag, LessonDeepDiveData> = {
  // A student partway through, with a wrong assessment answer to review.
  fresh: base,
  // Everything attempted and correct.
  aced: {
    ...base,
    assessmentAnalysis: base.assessmentAnalysis.map(a => ({
      ...a,
      correct: true,
      evaluation: undefined,
    })),
    progressCounts: {
      levelsTotalCount: 12,
      levelsAttemptedCount: 12,
      validatedLevelsTotalCount: 4,
      validatedLevelsCorrectCount: 4,
      validatedLevelsIncorrectCount: 0,
    },
  },
  // Lesson authored without vocabulary or videos — exercises empty states.
  sparse: {
    ...base,
    vocabulary: [],
    jsonVideos: [],
    assessmentAnalysis: [],
    unitLabel: null,
    nextLessonUrl: null,
  },
};

// Server-shaped practice problems (mirrors PracticeProblem#summarize; the
// client validator maps problem_type -> type).
export const SERVER_PRACTICE_PROBLEMS = [
  {
    id: 301,
    key: 'bias-mc-single',
    problem_type: 'multiple_choice_single_select',
    active: true,
    problem_text: 'Which of these is the most likely source of model bias?',
    solution: [
      {option: 'Unrepresentative training data', correct: true},
      {option: 'A fast computer', correct: false},
      {option: 'Too many users', correct: false},
    ],
    objectives: [{id: 202, description: 'Identify sources of bias'}],
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
  },
  {
    id: 302,
    key: 'training-mc-multi',
    problem_type: 'multiple_choice_multi_select',
    active: true,
    problem_text: 'Select ALL statements that are true about training data.',
    solution: [
      {option: 'Models learn patterns from it', correct: true},
      {option: 'More diverse data can reduce bias', correct: true},
      {option: 'It is only used after deployment', correct: false},
    ],
    objectives: [{id: 201, description: 'Explain training data'}],
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
  },
];

export const PODCAST_SCRIPT = [
  {
    voice_id: 'Sam',
    text: "Welcome back! Today we're recapping how AI makes decisions.",
  },
  {voice_id: 'Riley', text: 'Right — and it all starts with training data.'},
  {
    voice_id: 'Sam',
    text: 'If the examples a model learns from are skewed, its predictions inherit that skew. That is what we call bias.',
  },
  {
    voice_id: 'Riley',
    text: 'So diverse, representative data means fairer predictions.',
  },
];

export const CHALLENGES = [
  {
    id: 401,
    lesson_id: 101,
    question:
      'Draw a diagram showing how training data flows into a model and becomes a prediction. Label each step.',
    default_modality: 'whiteboard',
    whiteboard_starter_image_alt_text: null,
  },
];
