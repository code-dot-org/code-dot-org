import {
  LevelStatus,
  RubricAiEvaluationStatus,
} from '@cdo/generated-scripts/sharedConstants';

// stub fetch

export function stubFetch({
  evalStatusForUser = {},
  evalStatusForAll = {},
  aiEvals = [],
  teacherEvals = [],
  tourStatus = {},
  updateTourStatus = {},
}) {
  const fetchStub = jest.spyOn(window, 'fetch');

  fetchStub.mockImplementation(url => {
    // Stubs out getting the AI status for a particular user
    if (/rubrics\/\d+\/ai_evaluation_status_for_user.*/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(evalStatusForUser)));
    }

    // Stubs out getting the overall AI status, which is part of RubricSettings but
    // useful to track alongside the user status, here
    if (/rubrics\/\d+\/ai_evaluation_status_for_all.*/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(evalStatusForAll)));
    }

    // This stubs out polling the AI evaluation list which can be provided by 'data'
    if (/rubrics\/\d+\/get_ai_evaluations.*/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(aiEvals)));
    }

    if (/rubrics\/\d+\/get_teacher_evaluations_for_all.*/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(teacherEvals)));
    }

    if (/rubrics\/\w+\/get_ai_rubrics_tour_seen/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(tourStatus)));
    }

    if (/rubrics\/\w+\/update_ai_rubrics_tour_seen/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify(updateTourStatus)));
    }

    if (/rubrics\/\d+\/run_ai_evaluations_for_user$/.test(url)) {
      return Promise.resolve(new Response(JSON.stringify({})));
    }
  });

  return fetchStub;
}

// rubric

export const defaultRubric = {
  id: 1,
  learningGoals: [
    {
      id: 1,
      key: '1',
      learningGoal: 'goal 1',
      aiEnabled: false,
      evidenceLevels: [{understanding: 1, id: 1, teacherDescription: 'test'}],
    },
    {
      id: 2,
      key: '2',
      learningGoal: 'goal 2',
      aiEnabled: true,
      evidenceLevels: [{understanding: 1, id: 2, teacherDescription: 'test'}],
    },
  ],
  script: {
    id: 42,
  },
  lesson: {
    position: 3,
    name: 'Data Structures',
  },
  level: {
    id: 107,
    name: 'test_level',
    position: 7,
  },
};

// students

export const studentAlice = {id: 11, name: 'Alice'};

export const defaultStudentInfo = {user_id: 11, name: 'Alice'};

// level info

export const levelNotTried = {
  id: '123',
  assessment: null,
  contained: false,
  paired: false,
  partnerNames: null,
  partnerCount: null,
  isConceptLevel: false,
  levelNumber: 4,
  passed: false,
  status: LevelStatus.not_tried,
};
export const levelSubmitted = {
  ...levelNotTried,
  status: LevelStatus.submitted,
};

// ai evaluations

export const mockAiEvaluations = [
  {id: 2, learning_goal_id: 2, understanding: 0, aiConfidencePassFail: 2},
];

// ai eval status

export const notAttemptedJson = {
  status: null,
  attempted: false,
  lastAttemptEvaluated: false,
  csrfToken: 'abcdef',
};

export const readyJson = {
  status: null,
  attempted: true,
  lastAttemptEvaluated: false,
  csrfToken: 'abcdef',
};

export const pendingJson = {
  attempted: true,
  lastAttemptEvaluated: false,
  csrfToken: 'abcdef',
  status: RubricAiEvaluationStatus.QUEUED,
};

export const runningJson = {
  attempted: true,
  lastAttemptEvaluated: false,
  csrfToken: 'abcdef',
  status: RubricAiEvaluationStatus.RUNNING,
};

export const successJson = {
  attempted: true,
  lastAttemptEvaluated: true,
  csrfToken: 'abcdef',
  status: RubricAiEvaluationStatus.SUCCESS,
};

// ai eval status all

export const notAttemptedJsonAll = {
  attemptedCount: 0,
  attemptedUnevaluatedCount: 1,
  csrfToken: 'abcdef',
  aiEvalStatusMap: {
    11: 'NOT_STARTED',
  },
};

export const readyJsonAll = {
  attemptedCount: 1,
  attemptedUnevaluatedCount: 1,
  csrfToken: 'abcdef',
  aiEvalStatusMap: {
    11: 'IN_PROGRESS',
  },
};

export const successJsonAll = {
  attemptedCount: 1,
  attemptedUnevaluatedCount: 0,
  csrfToken: 'abcdef',
  aiEvalStatusMap: {
    11: 'READY_TO_REVIEW',
  },
};

// teacher evaluations

export const noEvals = [
  {
    user_name: 'Stilgar',
    user_id: 1,
    eval: [],
  },
  {
    user_name: 'Chani',
    user_id: 1,
    eval: [],
  },
];

export const oneEval = [
  {
    user_name: studentAlice.name,
    user_id: studentAlice.id,
    eval: [
      {
        feedback: '',
        id: studentAlice.id,
        learning_goal_id: 1587,
        understanding: 0,
      },
    ],
  },
];
