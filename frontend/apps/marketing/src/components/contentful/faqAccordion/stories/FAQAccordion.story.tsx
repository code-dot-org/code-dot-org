import type {Meta, StoryObj} from '@storybook/nextjs-vite';

import FAQAccordion from '../FAQAccordion';

const meta: Meta<typeof FAQAccordion> = {
  title: 'Marketing/FAQAccordion',
  component: FAQAccordion,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof FAQAccordion>;

const createStory = (theme: string) => ({
  globals: {theme},
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <FAQAccordion
        question="What is this?"
        answer="This is an FAQ accordion."
      />
      <FAQAccordion
        question="How does it work?"
        answer="Click to expand/collapse."
      />
    </div>
  ),
});

export const CDOVariants = createStory('code.org');
export const CSForAllVariants = createStory('csforall');

export const Playground: Story = {
  args: {
    question: 'Playground Question',
    answer: 'Playground Answer',
  },
};
