import type {Meta, StoryObj} from '@storybook/react';

import StudentCodeWidget from './index';

const SAMPLE_STUDENT_CODE: Record<string, string> = {
  'main.py':
    '# Create three variables below — one of each data type\nmeal_name = "Lunch"\nmeal_taken = True\nlunch_cal = 650\nbreakfast_cal = 500\ndinner_cal = 575\nexercise_cal = 300\n\n\n# Use at least one operation\ntotal_cal = lunch_cal + breakfast_cal + dinner_cal - exercise_cal\n\n# Print out your variables in fun or useful ways\nprint("Total calories:", total_cal)\n',
};

const meta: Meta<typeof StudentCodeWidget> = {
  component: StudentCodeWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    studentCode: {
      control: 'object',
      description: 'Student code files (Record<string, string>)',
    },
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
type Story = StoryObj<typeof StudentCodeWidget>;

export const NoCode: Story = {
  args: {
    studentCode: {},
    gridWidth: 2,
    gridHeight: 2,
  },
};
export const CodeProvided: Story = {
  args: {
    studentCode: SAMPLE_STUDENT_CODE,
    gridWidth: 2,
    gridHeight: 2,
  },
};
