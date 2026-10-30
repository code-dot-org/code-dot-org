import type {Meta, StoryObj} from '@storybook/react';

import LessonFeedbackWidget from './LessonFeedbackWidget';

const meta: Meta<typeof LessonFeedbackWidget> = {
  component: LessonFeedbackWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
    lessonId: 123,
    studentId: 456,
    teacherHasEnabledAi: true,
  },
};

// Loading state when no lesson is selected
export const LoadingState: Story = {
  args: {
    lessonId: null,
    studentId: 456,
    teacherHasEnabledAi: true,
  },
};

// Error state when AI is disabled
export const AiDisabledError: Story = {
  args: {
    lessonId: 123,
    studentId: 456,
    teacherHasEnabledAi: false,
  },
};
