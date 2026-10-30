import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import HttpClient from '@cdo/apps/util/HttpClient';

import LessonInsightWidget from './index';

const mockStore = createStore(() => ({
  teacherSections: {
    selectedSectionId: 123,
  },
}));

const meta: Meta<typeof LessonInsightWidget> = {
  component: LessonInsightWidget,
  decorators: [
    Story => (
      <Provider store={mockStore}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridAutoRows: '200px',
            gap: '12px',
            minWidth: '600px',
          }}
        >
          <Story />
        </div>
      </Provider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 2,
    selectedStudentId: 3,
  },
  decorators: [
    Story => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async () => {
        return {
          value: {
            json: JSON.stringify({
              progress:
                'Student is making good progress on the lesson concepts. They understand basic loops and are beginning to grasp conditional statements.',
              misconceptions:
                'Some confusion about when to use while loops vs for loops. May need reinforcement on loop termination conditions.',
              assessment:
                'Completed 8 out of 10 exercises correctly. Strong performance on basic concepts but struggled with nested loops.',
              next_steps:
                'Recommend additional practice with nested loops and introduce debugging techniques. Consider pair programming exercises.',
            }),
          },
          response: new Response(),
        };
      };
      return <Story />;
    },
  ],
};

export const Loading: Story = {
  args: {
    selectedUnitId: 1,
    selectedLessonId: 2,
    selectedStudentId: 3,
  },
  decorators: [
    Story => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HttpClient as any).fetchJson = async () => {
        return new Promise(() => {});
      };
      return <Story />;
    },
  ],
};
