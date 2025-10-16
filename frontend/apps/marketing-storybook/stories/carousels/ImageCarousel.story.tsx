import ImageCarousel, {
  ImageCarouselProps,
} from '@/components/contentful/carousels/imageCarousel';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import ImageCarouselMock from './__mocks__/ImageCarousel.json';

const meta: Meta<ImageCarouselProps> = {
  title: 'Marketing/Carousel/Image',
  component: ImageCarousel,
  parameters: {eyes: {include: false}},
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ImageCarouselProps>;

export const SingleSlide: Story = {
  args: ImageCarouselMock,
  play: async ({canvas}) => {
    const nextButton = await canvas.findByLabelText('Go to slide 2');
    await expect(nextButton).toBeVisible();

    // Check for images by alt text and src
    const figures = canvas.getAllByRole('figure');
    ImageCarouselMock.slides.forEach((slide, idx) => {
      const {file} = slide.fields;
      // Check for image by src
      const figure = figures[idx];
      expect(figure).toBeInTheDocument();
      const img = figure.querySelector('img');
      expect(img).toHaveAttribute('src', expect.stringContaining(file.url));
    });
    // Check for anchor links if present
    const links = canvas.queryAllByRole('link');
    if (links.length) {
      expect(links.length).toBeGreaterThan(0);
    }
  },
};

export const TwoSlides: Story = {
  args: {...ImageCarouselMock, slidesPerView: 2},
  play: async ({canvas}) => {
    const nextButton = await canvas.findByLabelText('Go to slide 2');
    await expect(nextButton).toBeVisible();

    // Check for images by alt text and src
    const figures = canvas.getAllByRole('figure');
    ImageCarouselMock.slides.forEach((slide, idx) => {
      const {file} = slide.fields;
      // Check for image by src
      const figure = figures[idx];
      expect(figure).toBeInTheDocument();
      const img = figure.querySelector('img');
      expect(img).toHaveAttribute('src', expect.stringContaining(file.url));
    });
    // Check for anchor links if present
    const links = canvas.queryAllByRole('link');
    if (links.length) {
      expect(links.length).toBeGreaterThan(0);
    }
  },
};

export const ThreeSlides: Story = {
  args: {...ImageCarouselMock, slidesPerView: 3},
  play: async ({canvas}) => {
    const nextButton = await canvas.findByLabelText('Go to slide 2');
    await expect(nextButton).toBeVisible();

    // Check for images by alt text and src
    const figures = canvas.getAllByRole('figure');
    ImageCarouselMock.slides.forEach((slide, idx) => {
      const {file} = slide.fields;
      // Check for image by src
      const figure = figures[idx];
      expect(figure).toBeInTheDocument();
      const img = figure.querySelector('img');
      expect(img).toHaveAttribute('src', expect.stringContaining(file.url));
    });
    // Check for anchor links if present
    const links = canvas.queryAllByRole('link');
    if (links.length) {
      expect(links.length).toBeGreaterThan(0);
    }
  },
};

export const FourSlides: Story = {
  args: {...ImageCarouselMock, slidesPerView: 4},
  play: async ({canvas}) => {
    const nextButton = await canvas.findByLabelText('Go to slide 2');
    await expect(nextButton).toBeVisible();

    // Check for images by alt text and src
    const figures = canvas.getAllByRole('figure');
    ImageCarouselMock.slides.forEach((slide, idx) => {
      const {file} = slide.fields;
      // Check for image by src
      const figure = figures[idx];
      expect(figure).toBeInTheDocument();
      const img = figure.querySelector('img');
      expect(img).toHaveAttribute('src', expect.stringContaining(file.url));
    });
    // Check for anchor links if present
    const links = canvas.queryAllByRole('link');
    if (links.length) {
      expect(links.length).toBeGreaterThan(0);
    }
  },
};
