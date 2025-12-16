import type {Meta, StoryObj} from '@storybook/react';

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
  argTypes: {
    cfuLevels: {
      control: 'object',
      description: 'Array of CFU levels for the selected lesson.',
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
    cfuLevels: [],
    isLoading: true,
    gridWidth: 2,
    gridHeight: 2,
  },
};

export const Empty: Story = {
  args: {
    cfuLevels: [],
    isLoading: false,
    gridWidth: 2,
    gridHeight: 2,
  },
};

export const WithData: Story = {
  args: {
    cfuLevels: SAMPLE_CFU_LEVELS,
    isLoading: false,
    gridWidth: 2,
    gridHeight: 2,
  },
};
