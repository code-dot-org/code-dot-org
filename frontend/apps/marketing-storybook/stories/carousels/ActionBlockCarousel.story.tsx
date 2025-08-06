import ActionBlockCarousel, {
  ActionBlockCarouselProps,
} from '@/components/contentful/carousels/actionBlockCarousel';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import ActionBlockCarouselCurriculumMock from './__mocks__/ActionBlockCarouselCurriculum.json';
import ActionBlockCarouselPLMock from './__mocks__/ActionBlockCarouselPL.json';

const meta: Meta<ActionBlockCarouselProps> = {
  title: 'Marketing/Carousel/ActionBlock',
  component: ActionBlockCarousel,
  parameters: {eyes: {include: false}},
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ActionBlockCarouselProps>;

export const Curriculum: Story = {
  args: ActionBlockCarouselCurriculumMock,
  play: async ({canvas}) => {
    const nextButton = await canvas.findByLabelText('Go to slide 2');
    await expect(nextButton).toBeVisible();

    // Check for anchor links (primary/secondary buttons)
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    // Check for slide titles
    ActionBlockCarouselCurriculumMock.slides.forEach(slide => {
      expect(canvas.getByText(slide.fields.title)).toBeInTheDocument();
    });
  },
};

export const SelfPacedPL: Story = {
  args: ActionBlockCarouselPLMock,
  play: async ({canvas}) => {
    const nextButton = await canvas.findByLabelText('Go to slide 2');
    await expect(nextButton).toBeVisible();

    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    ActionBlockCarouselPLMock.slides.forEach(slide => {
      expect(canvas.getByText(slide.fields.title)).toBeInTheDocument();
    });
  },
};
