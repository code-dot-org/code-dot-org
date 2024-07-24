import {stripHtml} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import evidenceDemo from '@cdo/static/ai-evidence-demo.gif';

export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: '#ui-floatingActionButton',
    title: stripHtml(i18n.rubricTourStepOneTitle()),
    intro: stripHtml(i18n.rubricTourStepOneText()),
  },
  {
    element: '#tour-ai-assessment',
    title: stripHtml(i18n.rubricTourStepTwoTitle()),
    intro: stripHtml(i18n.rubricTourStepTwoText()),
  },
  {
    element: '#tour-ai-evidence',
    title: stripHtml(i18n.rubricTourStepThreeTitle()),
    position: 'top',
    intro: `<p>${stripHtml(
      i18n.rubricTourStepThreeText()
    )}</p><img src=${evidenceDemo}>`,
  },
  {
    element: '#tour-ai-confidence',
    title: stripHtml(i18n.rubricTourStepFourTitle()),
    intro: stripHtml(i18n.rubricTourStepFourText()),
  },
  {
    element: '#tour-evidence-levels',
    title: stripHtml(i18n.rubricTourStepFiveTitle()),
    intro: stripHtml(i18n.rubricTourStepFiveText()),
  },
  {
    element: '#tour-ai-assessment-feedback',
    title: stripHtml(i18n.rubricTourStepSixTitle()),
    intro: stripHtml(i18n.rubricTourStepSixText()),
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
        learningGoal: stripHtml(i18n.catVariables()),
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
