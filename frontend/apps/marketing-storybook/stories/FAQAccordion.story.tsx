/* eslint-disable @typescript-eslint/no-explicit-any */

import FAQAccordionContentful, {
  FAQAccordionContentfulProps,
} from '@/components/contentful/faqAccordion/FAQAccordion';
import {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent} from 'storybook/test';

import FAQAccordionMock from './__mocks__/FAQAccordion.json';

const meta: Meta<FAQAccordionContentfulProps> = {
  title: 'Marketing/FAQAccordion',
  component: FAQAccordionContentful,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<FAQAccordionContentfulProps>;

export const FilledOut: Story = {
  args: FAQAccordionMock as any,
  play: async ({canvas}) => {
    // Find all FAQ items (summary elements)
    let summaryEls: HTMLElement[] = [];
    // Only use summary elements, do not use role 'button'
    summaryEls = await canvas.findAllByText((content, element) => {
      return !!element && element.tagName === 'SUMMARY';
    });
    // Open the first FAQ item
    await userEvent.click(summaryEls[0]);
    // Check that the answer is now visible
    const answerText = 'Normal text'; // from mock JSON
    await expect(canvas.getByText(answerText)).toBeInTheDocument();

    /// Open second FAQ item
    await userEvent.click(summaryEls[1]);
    // Check that the answer is now visible
    const secondAnswerText = 'Ordered Item 3'; // from mock JSON
    await expect(canvas.getByText(secondAnswerText)).toBeInTheDocument();

    /// Open third FAQ item
    await userEvent.click(summaryEls[2]);
    // Check that anchor links are present
    const links = await canvas.findAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      await expect(link).toBeVisible();
    }
  },
};
