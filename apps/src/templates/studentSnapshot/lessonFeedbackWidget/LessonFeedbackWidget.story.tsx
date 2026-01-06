import type {Meta, StoryObj} from '@storybook/react';

import LessonFeedbackWidget from './LessonFeedbackWidget';

const meta: Meta<typeof LessonFeedbackWidget> = {
  title: 'StudentSnapshot/LessonFeedbackWidget',
  component: LessonFeedbackWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    gridWidth: {
      control: {type: 'number', min: 1, max: 4},
      description: 'Grid width for the widget',
    },
    gridHeight: {
      control: {type: 'number', min: 1, max: 4},
      description: 'Grid height for the widget',
    },
    lessonId: {
      control: {type: 'number'},
      description: 'ID of the lesson, null if no lesson selected',
    },
    studentId: {
      control: {type: 'number'},
      description: 'ID of the student',
    },
    teacherHasEnabledAi: {
      control: {type: 'boolean'},
      description: 'Whether the teacher has enabled AI features',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state with valid lesson and AI enabled
export const Default: Story = {
  args: {
    gridWidth: 2,
    gridHeight: 2,
    lessonId: 123,
    studentId: 456,
    teacherHasEnabledAi: true,
  },
};

// Loading state when no lesson is selected
export const LoadingState: Story = {
  args: {
    gridWidth: 2,
    gridHeight: 2,
    lessonId: null,
    studentId: 456,
    teacherHasEnabledAi: true,
  },
};

// Error state when AI is disabled
export const AiDisabledError: Story = {
  args: {
    gridWidth: 2,
    gridHeight: 2,
    lessonId: 123,
    studentId: 456,
    teacherHasEnabledAi: false,
  },
};
