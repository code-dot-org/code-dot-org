import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import Accordion from '../index';

export default {
  title: 'DesignSystem/Accordion',
  component: Accordion,
} as Meta;

type Story = StoryObj<typeof Accordion>;

//
// STORIES
//

const playGroundItems = [
  {
    id: 'introduction',
    label: 'Introduction to Code.org',
    content:
      'Code.org is a nonprofit dedicated to expanding access to computer science in schools.',
  },
  {
    id: 'learning-resources',
    label: 'Learning Resources Available',
    content:
      'Code.org offers free online courses, Hour of Code activities, and professional learning programs.',
  },
  {
    id: 'curriculum-access',
    label: 'Is the Curriculum Free?',
    content:
      'Yes! Code.org provides free curriculum and tools for teachers worldwide.',
  },
];

export const Playground: Story = {
  args: {
    items: playGroundItems,
  },
};

export const WithRichContent: Story = {
  args: {
    items: [
      {
        id: 'coding-beginners',
        label: 'Getting Started with Coding',
        content: (
          <p>
            Start with the <strong>Hour of Code</strong> activities, designed
            for complete beginners.
          </p>
        ),
      },
      {
        id: 'teacher-resources',
        label: 'Resources for Teachers',
        content: (
          <ul>
            <li>Free curriculum</li>
            <li>Lesson plans</li>
            <li>Workshops & webinars</li>
          </ul>
        ),
      },
      {
        id: 'student-engagement',
        label: 'How to Engage Students?',
        content: (
          <p>
            Use interactive <strong>block-based coding</strong> and real-world
            projects to make learning fun.
          </p>
        ),
      },
    ],
  },
};

export const MultipleAccordions: Story = {
  args: {
    items: [
      {
        id: 'first-accordion',
        label: 'First Accordion',
        content: 'This is the first accordion content.',
      },
      {
        id: 'second-accordion',
        label: 'Second Accordion',
        content: 'This is the second accordion content.',
      },
      {
        id: 'third-accordion',
        label: 'Third Accordion',
        content: 'This is the third accordion content.',
      },
    ],
  },
};
MultipleAccordions.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const labels = ['First Accordion', 'Second Accordion', 'Third Accordion'];

  for (const label of labels) {
    const labelElement = await canvas.findByText(label);
    expect(labelElement).toBeInTheDocument();
  }
};
