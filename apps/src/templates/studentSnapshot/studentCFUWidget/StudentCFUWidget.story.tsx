import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import StudentCFUWidget from './StudentCFUWidget';

const SAMPLE_CFU_LEVELS = [
  {
    id: 21103,
    name: 'programming-fundamentals-lesson5-level6_2025-launch_2025',
    display_name: 'programming-fundamentals-lesson5-level6_2025-launch_2025',
    type: 'Multi',
    key: 'programming-fundamentals-lesson5-level6_2025-launch_2025',
    script_level_id: 1943,
    progression: 'Check Your Understanding',
    progression_display_name: 'Check Your Understanding',
  },
  {
    id: 11816,
    name: 'programming-fundamentals-lesson5-vocab_2025',
    display_name: 'programming-fundamentals-lesson5-vocab_2025',
    type: 'Match',
    key: 'programming-fundamentals-lesson5-vocab_2025',
    script_level_id: 1947,
    progression: 'Check Your Understanding',
    progression_display_name: 'Check Your Understanding',
  },
  {
    id: 21101,
    name: 'programming-fundamentals-lesson5-level10_2025-launch_2025',
    display_name: 'programming-fundamentals-lesson5-level10_2025-launch_2025',
    type: 'Multi',
    key: 'programming-fundamentals-lesson5-level10_2025-launch_2025',
    script_level_id: 1948,
    progression: 'Check Your Understanding',
    progression_display_name: 'Check Your Understanding',
  },
];

const SAMPLE_CFU_RESPONSES = [
  {
    level_id: 21103,
    script_level_id: 1943,
    response: {
      type: 'Multi',
      student_result: [1],
      status: 'correct',
    },
    submitted: true,
    timestamp: '2025-01-01T00:00:00Z',
  },
];

const SAMPLE_LEVEL_GROUP_CFU_LEVELS = [
  {
    id: 80107,
    name: 'programming-fundamentals-lesson3-level7_2025',
    display_name: 'programming-fundamentals-lesson3-level7_2025',
    type: 'LevelGroup',
    key: 'programming-fundamentals-lesson3-level7_2025',
    script_level_id: 1927,
    progression: 'Check for Understanding',
    progression_display_name: 'Check for Understanding',
    question_text: null,
    answers: null,
  },
];

const SAMPLE_LEVEL_GROUP_CFU_RESPONSES = [
  {
    level_id: 80107,
    script_level_id: 1927,
    response: {
      type: 'LevelGroup',
      level_results: [
        {
          level_id: 90001,
          type: 'FreeResponse',
          student_result: 'hello world',
          status: '',
        },
      ],
    },
    submitted: false,
    timestamp: '2025-12-17T17:51:12.000Z',
  },
];

const meta: Meta<typeof StudentCFUWidget> = {
  component: StudentCFUWidget,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Temporary CFU widget that displays the raw CFU level data returned from the student snapshots API.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => {
      // Default Storybook mock for widget fetches. Individual stories can
      // override by setting different args (e.g. isLoading) or by swapping
      // this mock out if needed.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async (url: string) => {
        if (url.startsWith('/student_snapshots/cfu_levels/')) {
          return {
            value: {cfu_levels: SAMPLE_CFU_LEVELS},
            response: new Response(),
          };
        }
        if (url.startsWith('/student_snapshots/cfu_responses/')) {
          return {
            value: {cfu_responses: SAMPLE_CFU_RESPONSES},
            response: new Response(),
          };
        }
        return {value: {}, response: new Response()};
      };

      return <Story />;
    },
  ],
  argTypes: {
    lessonId: {
      control: {type: 'number'},
      description: 'Lesson id used for CFU API calls.',
    },
    studentId: {
      control: {type: 'number'},
      description: 'Student id used for CFU response API calls.',
    },
    gridWidth: {
      control: {type: 'number', min: 1, max: 4},
      description: 'Width in grid columns',
    },
    gridHeight: {
      control: {type: 'number', min: 1, max: 4},
      description: 'Height in grid rows',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the widget should show its loading state.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StudentCFUWidget>;

export const Loading: Story = {
  args: {
    isLoading: true,
    gridWidth: 2,
    gridHeight: 2,
    lessonId: 1,
    studentId: 1,
  },
};

export const Empty: Story = {
  decorators: [
    Story => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async () => {
        return {value: {cfu_levels: []}, response: new Response()};
      };
      return <Story />;
    },
  ],
  args: {
    isLoading: false,
    gridWidth: 2,
    gridHeight: 2,
    lessonId: 1,
    studentId: 1,
  },
};

export const WithData: Story = {
  args: {
    isLoading: false,
    gridWidth: 2,
    gridHeight: 2,
    lessonId: 1,
    studentId: 1,
  },
};

export const WithLevelGroupTextInput: Story = {
  decorators: [
    Story => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async (url: string) => {
        if (url.startsWith('/student_snapshots/cfu_levels/')) {
          return {
            value: {cfu_levels: SAMPLE_LEVEL_GROUP_CFU_LEVELS},
            response: new Response(),
          };
        }
        if (url.startsWith('/student_snapshots/cfu_responses/')) {
          return {
            value: {cfu_responses: SAMPLE_LEVEL_GROUP_CFU_RESPONSES},
            response: new Response(),
          };
        }
        return {value: {}, response: new Response()};
      };
      return <Story />;
    },
  ],
  args: {
    isLoading: false,
    gridWidth: 2,
    gridHeight: 2,
    lessonId: 1,
    studentId: 1,
  },
};
