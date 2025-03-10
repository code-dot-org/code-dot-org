import type {Meta, StoryObj} from '@storybook/react';
import {within, expect} from '@storybook/test';

import FAQAccordion from '../index';

export default {
  title: 'DesignSystem/Accordion/FAQ Accordion',
  component: FAQAccordion,
} as Meta;

type Story = StoryObj<typeof FAQAccordion>;

//
// STORIES
//
const playGroundItems = [
  {
    id: 'what-is-code-org',
    label: 'What is Code.org?',
    questionString: 'What is Code.org?',
    content:
      'Code.org is a nonprofit dedicated to expanding access to computer science in schools and increasing participation by young women and students from underrepresented groups.',
    answerString:
      'Code.org is a nonprofit dedicated to expanding access to computer science in schools and increasing participation by young women and students from underrepresented groups.',
  },
  {
    id: 'how-can-i-start-learning',
    label: 'How can I start learning?',
    questionString: 'How can I start learning?',
    content:
      'You can start learning by exploring our free online courses available for all age groups and skill levels.',
    answerString:
      'You can start learning by exploring our free online courses available for all age groups and skill levels.',
  },
  {
    id: 'is-code-org-curriculum-free',
    label: 'Is Code.org curriculum free?',
    questionString: 'Is Code.org curriculum free?',
    content:
      'Yes! Code.org provides free curriculum and tools for teachers to use in classrooms.',
    answerString:
      'Yes! Code.org provides free curriculum and tools for teachers to use in classrooms.',
  },
];

export const Playground: Story = {
  args: {
    items: playGroundItems,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Check if all accordion labels are rendered
    for (const {label, content} of playGroundItems) {
      const labelElement = await canvas.findByText(label);
      expect(labelElement).toBeInTheDocument();

      // Click to expand
      await labelElement.click();
      const contentElement = await canvas.findByText(content);
      expect(contentElement).toBeVisible();

      // Click again to collapse
      await labelElement.click();
      expect(contentElement).not.toBeVisible();
    }
  },
};

export const WithLongAnswers: Story = {
  args: {
    items: [
      {
        id: 'how-code-org-supports-teachers',
        label: 'How does Code.org support teachers?',
        questionString: 'How does Code.org support teachers?',
        content:
          'Code.org provides free curriculum, professional learning programs, and tools to help teachers integrate computer science into their classrooms effectively.',
        answerString:
          'Code.org provides free curriculum, professional learning programs, and tools to help teachers integrate computer science into their classrooms effectively.',
      },
      {
        id: 'coding-resources-for-beginners',
        label: 'Are there coding resources for beginners?',
        questionString: 'Are there coding resources for beginners?',
        content:
          'Yes! Code.org offers a variety of beginner-friendly resources, including Hour of Code activities, introductory courses, and self-paced learning materials.',
        answerString:
          'Yes! Code.org offers a variety of beginner-friendly resources, including Hour of Code activities, introductory courses, and self-paced learning materials.',
      },
    ],
  },
};
