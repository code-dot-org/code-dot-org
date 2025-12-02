import type {Meta, StoryObj} from '@storybook/react';
import type {InferProps} from 'prop-types';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import {aiEvaluationShape} from '@cdo/apps/templates/rubrics/rubricShapes';
import type {
  Rubric,
  StudentLevelInfo,
  ReportingData,
} from '@cdo/apps/types/rubricTypes';

import StudentRubricWidget from './StudentRubricWidget';

type AiEvaluation = InferProps<typeof aiEvaluationShape>['isRequired'];

// Extend Rubric type to include fields that RubricContent actually uses
// (RubricContent accesses lesson.title, which isn't in the PropTypes shape)
type ExtendedRubric = Rubric & {
  lesson?: (Rubric['lesson'] & {title?: string}) | null;
};

// --- Mock data for rubric + evaluations so Storybook can show real UI ----

const mockRubric: ExtendedRubric = {
  id: 1,
  lesson: {
    position: 11,
    name: 'Lesson 11: Mini-Project - Captioned Scenes',
    title: 'Lesson 11: Mini-Project - Captioned Scenes',
  },
  level: {id: 10000},
  learningGoals: [
    {
      learningGoal: 'Program Development - Program Sequence',
      evidenceLevels: [
        {
          understanding: 3,
          teacherDescription:
            'Work shows a clear and complete sequence of steps that solve the problem.',
        },
        {
          understanding: 2,
          teacherDescription:
            'Work shows a mostly correct sequence with minor gaps or inefficiencies.',
        },
        {
          understanding: 1,
          teacherDescription:
            'Work attempts a sequence but is missing key steps or has major issues.',
        },
      ],
    },
    {
      learningGoal: 'Modularity - Sprites and Sprite Properties',
      evidenceLevels: [
        {
          understanding: 3,
          teacherDescription:
            'Student uses sprites and properties effectively to organize the scene.',
        },
        {
          understanding: 2,
          teacherDescription:
            'Student uses sprites with some minor issues in organization or duplication.',
        },
        {
          understanding: 1,
          teacherDescription:
            'Sprites or properties are missing or used inconsistently, making the scene hard to follow.',
        },
      ],
    },
  ],
};

const mockAiEvaluations: AiEvaluation[] = [
  {
    id: 1,
    learning_goal_id: 1,
    understanding: 3,
    aiConfidencePassFail: 0.95,
    aiConfidenceExactMatch: 0.85,
    showExactMatch: true,
    observations: 'Great job breaking the problem into clear steps.',
    evidence: 'Code shows logical sequencing.',
  },
  {
    id: 2,
    learning_goal_id: 2,
    understanding: 2,
    aiConfidencePassFail: 0.75,
    aiConfidenceExactMatch: 0.65,
    showExactMatch: true,
    observations: 'Good use of sprites—consider cleaning up a few extra ones.',
    evidence: 'Some sprite duplication present.',
  },
];

const mockStudentLevelInfo: StudentLevelInfo = {
  name: 'Student1',
  user_id: 1,
  timeSpent: 7,
  attempts: 1,
  lastAttempt: new Date().toISOString(),
};

const mockReportingData: ReportingData = {
  courseName: 'CS Discoveries',
  unitName: 'Unit 3',
  levelName: 'Lesson 11: Mini-Project - Captioned Scenes',
};

// Minimal mock Redux store for connected components used by RubricContent
const initialState = {
  teacherSections: {
    selectedSectionId: 1,
    selectedStudents: [
      {id: 1, name: 'Student1', familyName: ''},
      {id: 2, name: 'Student2', familyName: ''},
    ],
    sectionIds: [1],
    sections: {
      1: {
        id: 1,
        name: 'csd 1 y',
        hidden: false,
      },
    },
  },
  teacherPanel: {
    levelsWithProgress: [],
  },
  teacherRubric: {
    hasTeacherFeedbackMap: {1: true, 2: false},
    aiEvalStatusMap: {1: 'READY_TO_REVIEW', 2: 'NOT_STARTED'},
  },
};

const mockStore = createStore((state = initialState) => state);

const meta: Meta<typeof StudentRubricWidget> = {
  component: StudentRubricWidget,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Teacher-style rubric widget that reuses the existing `RubricContent` component from the TA rubric modal. Storybook passes mock rubric + student data via props.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
  argTypes: {
    gridWidth: {
      control: {type: 'number', min: 1, max: 4},
      description: 'Width in grid columns',
    },
    gridHeight: {
      control: {type: 'number', min: 1, max: 4},
      description: 'Height in grid rows',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StudentRubricWidget>;

export const Default: Story = {
  args: {
    gridWidth: 2,
    gridHeight: 2,
    rubric: mockRubric as Rubric,
    studentLevelInfo: mockStudentLevelInfo,
    teacherHasEnabledAi: true,
    canProvideFeedback: true,
    reportingData: mockReportingData,
    aiEvaluations: mockAiEvaluations,
  },
};
