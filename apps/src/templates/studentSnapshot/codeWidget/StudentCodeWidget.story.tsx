import {CdoTheme} from '@code-dot-org/component-library/themes';
import {ThemeProvider} from '@mui/material/styles';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import StudentCodeWidget from './StudentCodeWidget';

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

const meta: Meta<typeof StudentCodeWidget> = {
  component: StudentCodeWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    selectedUnitId: {
      control: 'number',
      description: 'Selected unit ID',
    },
    selectedLessonId: {
      control: 'number',
      description: 'Selected lesson ID',
    },
    selectedStudentId: {
      control: 'number',
      description: 'Selected student ID',
    },
  },
  decorators: [
    Story => {
      return (
        <ThemeProvider theme={CdoTheme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof StudentCodeWidget>;

export const SingleFile: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 1,
    selectedStudentId: 1,
  },
  decorators: [
    Story => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async () => {
        return {
          value: {studentCode: SAMPLE_STUDENT_CODE},
          response: new Response(),
        };
      };
      return <Story />;
    },
  ],
};

export const MultipleFiles: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 1,
    selectedStudentId: 1,
  },
  decorators: [
    Story => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async () => {
        return {
          value: {studentCode: SAMPLE_STUDENT_CODE_2},
          response: new Response(),
        };
      };
      return <Story />;
    },
  ],
};

export const NoFiles: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 1,
    selectedStudentId: 1,
  },
  decorators: [
    Story => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async () => {
        return {
          value: {studentCode: {}},
          response: new Response(),
        };
      };
      return <Story />;
    },
  ],
};
