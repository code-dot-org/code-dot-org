import FAQAccordionContentful, {
  FAQAccordionContentfulProps,
} from '@/components/contentful/faqAccordion/FAQAccordion';
import {Meta, StoryObj} from '@storybook/react';
import {expect, within, userEvent} from 'storybook/test';

import FAQAccordionMock from './__mocks__/FAQAccordion.json';

const meta: Meta<FAQAccordionContentfulProps> = {
  title: 'Marketing/FAQAccordion',
  component: FAQAccordionContentful,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<FAQAccordionContentfulProps>;

export const FilledOut: Story = {
  args: FAQAccordionMock as FAQAccordionContentfulProps,
  play: async ({canvas}) => {
    const questions = ['FAQ Text', 'FAQ Lists', 'FAQ Links'];
    for (const q of questions) {
      const summary = canvas.getByRole('button', {name: q});
      await expect(summary).toBeInTheDocument();
      await userEvent.click(summary);
      const accordionRoot = summary.closest(
        '.MuiAccordion-root',
      ) as HTMLElement | null;
      await expect(accordionRoot).toBeTruthy();
      const region = within(accordionRoot!).getByRole('region', {hidden: true});
      await expect(region).toBeInTheDocument();
      if (q === 'FAQ Text') {
        await expect(region).toHaveTextContent('Normal text');
      } else if (q === 'FAQ Lists') {
        await expect(region).toHaveTextContent('Ordered Item 3');
      } else if (q === 'FAQ Links') {
        const boldItalicLink = within(region).getByRole('link', {
          name: 'Bold Italic link',
        });
        await expect(boldItalicLink).toBeInTheDocument();
        await expect(boldItalicLink).toHaveAttribute(
          'href',
          expect.stringContaining('https://code.org'),
        );
      }
    }

    const storybookRoot = document.getElementById('storybook-root');
    await userEvent.click(storybookRoot!);
  },
};
