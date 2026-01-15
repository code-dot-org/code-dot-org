import type {Meta, StoryObj} from '@storybook/react';

import CodeWidget from './index';

const SAMPLE_STUDENT_CODE: Record<string, string> = {
  'main.py':
    '# Create three variables below — one of each data type\nmeal_name = "Lunch"\nmeal_taken = True\nlunch_cal = 650\nbreakfast_cal = 500\ndinner_cal = 575\nexercise_cal = 300\n\n\n# Use at least one operation\ntotal_cal = lunch_cal + breakfast_cal + dinner_cal - exercise_cal\n\n# Print out your variables in fun or useful ways\nprint("Total calories:", total_cal)\n',
};

const SAMPLE_STUDENT_CODE_2: Record<string, string> = {
  'main.py':
    '# Create three variables below — one of each data type\nmeal_name = "Lunch"\nmeal_taken = True\nlunch_cal = 650\nbreakfast_cal = 500\ndinner_cal = 575\nexercise_cal = 300\n\n\n# Use at least one operation\ntotal_cal = lunch_cal + breakfast_cal + dinner_cal - exercise_cal\n\n# Print out your variables in fun or useful ways\nprint("Total calories:", total_cal)\n',
  'text_file.txt':
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce elementum mattis libero, ut ultricies ex luctus auctor. Nunc et magna viverra, consequat ante nec, fermentum sem. Nullam lobortis tristique eros a euismod. Etiam bibendum pellentesque neque ut hendrerit. Sed eu interdum nisl, sit amet venenatis magna. Proin imperdiet hendrerit quam quis laoreet. Integer luctus augue quis posuere ultrices. Mauris augue ligula, mattis et pharetra sit amet, venenatis eget dolor. Praesent vitae urna in enim malesuada fringilla.\nFusce vitae nisl commodo magna posuere dignissim. Morbi hendrerit, est eget placerat lobortis, nisi quam commodo ipsum, ac sollicitudin massa diam sit amet felis. Vivamus tristique orci eget dignissim malesuada. Praesent a sollicitudin erat, in convallis ante. Suspendisse interdum sed dui ac tempor. Cras id orci sapien. Aliquam quis pretium purus. Donec bibendum aliquam dolor, non blandit nulla bibendum non. Vestibulum tincidunt, nunc id accumsan tempor, felis felis accumsan nibh, vel posuere urna ligula in turpis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquet lectus eleifend metus sagittis bibendum. Aliquam erat volutpat. Mauris ut congue magna, sed luctus metus.\n',
  'fake_csv.csv':
    'student_id,lesson_date,lesson_topic,lesson_duration,lesson_grade\n1,12/19/2021,Natural Language Processing,1.8,34\n2,1/2/2021,Natural Language Processing,1.7,64\n3,7/5/2020,Machine Learning,2.0,8\n4,10/8/2020,Natural Language Processing,1.8,10\n5,1/21/2020,Neural Networks,2.9,74\n6,5/25/2021,Machine Learning,2.8,68\n7,4/1/2020,Machine Learning,2.6,9\n8,11/14/2021,Machine Learning,1.7,67',
};

const meta: Meta<typeof CodeWidget> = {
  component: CodeWidget,
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
type Story = StoryObj<typeof CodeWidget>;

export const NoFiles: Story = {
  args: {
    studentCode: {},
    gridWidth: 2,
    gridHeight: 2,
  },
};
export const SingleFile: Story = {
  args: {
    studentCode: SAMPLE_STUDENT_CODE,
    gridWidth: 2,
    gridHeight: 2,
  },
};

export const MultipleFiles: Story = {
  args: {
    studentCode: SAMPLE_STUDENT_CODE_2,
    gridWidth: 2,
    gridHeight: 2,
  },
};
