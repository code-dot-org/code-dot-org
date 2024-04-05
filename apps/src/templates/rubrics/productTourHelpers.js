import evidenceDemo from '@cdo/static/ai-evidence-demo.gif';

export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: '#ui-floatingActionButton',
    title: 'Getting Started with AI Teaching Assistant',
    intro:
      '<p>Launch AI Teaching Assistant from the bottom left corner of the screen.</p>',
  },
  {
    element: '#tour-ai-assessment',
    title: 'Understanding the AI Assessment',
    intro:
      '<p>AI Teaching Assistant analyzes students’ code for each learning goal with AI enabled, then recommends a rubric score(s). AI will provide one score for learning goals where our AI has trained extensively. It will provide two scores where more training data is needed.</p><p>The final score is always up to you. AI Teaching Assistant will provide evidence for its recommendation.</p>',
  },
  {
    element: '#tour-ai-evidence',
    title: 'Using Evidence',
    position: 'top',
    intro: `<p>Where possible, AI Teaching Assistant will highlight the relevant lines of code in the student’s project so it is easy for you to double-check.</p><img src=${evidenceDemo}>`,
  },
  {
    element: '#tour-ai-confidence',
    title: 'Understanding AI Confidence',
    intro:
      "<p>The confidence rating gives you an idea of how often the AI agreed with teachers when scoring this learning goal. Just like humans, AI isn't perfect.</p>",
  },
  {
    element: '#tour-evidence-levels',
    title: 'Assigning a Rubric Score',
    intro:
      "<p>Once you have reviewed the AI Assessment and the student's code, assign a rubric score for the learning goal.</p>",
  },
  {
    element: '#tour-ai-assessment-feedback',
    title: 'How did we do?',
    intro:
      '<p>Your feedback helps us make the AI Teaching Assistant more helpful to you – let us know how it did.</p>',
  },
];

// Dummy props for product tour
export const DUMMY_PROPS = {
  rubricDummy: {
    id: 1,
    learningGoals: [
      {
        id: 1,
        key: '1',
        learningGoal: 'Variables',
        aiEnabled: true,
        evidenceLevels: [
          {
            id: 141,
            understanding: 0,
            teacherDescription:
              'Errors in program sequencing are significant enoug… or the Draw loop is not used to create animation',
          },
          {
            id: 142,
            understanding: 1,
            teacherDescription:
              'You have several sequencing errors, resulting in m…e code is improperly placed in or out of the loop',
          },
          {
            id: 143,
            understanding: 2,
            teacherDescription:
              'You properly separated code in and out of the draw…ew elements hidden behind others unintentionally.',
          },
          {
            id: 144,
            understanding: 3,
            teacherDescription:
              'You sequenced the program well (1)  and properly separated code in and out of the draw loop (2).',
          },
        ],
      },
    ],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
  },
  studentLevelInfoDummy: {
    name: 'Grace Hopper',
    timeSpent: 305,
    lastAttempt: '1980-07-31T00:00:00.000Z',
    attempts: 6,
  },
  aiEvaluationsDummy: [
    {
      id: 1,
      learning_goal_id: 1,
      understanding: 2,
      aiConfidencePassFail: 2,
      evidence: '',
    },
  ],
};
