/* eslint-disable @typescript-eslint/no-explicit-any */
import CardCollection, {
  CardCollectionProps,
} from '@/components/contentful/collections/cardCollection/CardCollection';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import {getButtonData} from './__mocks__/CardCollecationButtons';
import {getImagesData} from './__mocks__/CardCollecationImages';
import CardCollectionAlphabeticalMock from './__mocks__/CardCollectionAlphabetical.json';
import CardCollectionHiddenImagesMock from './__mocks__/CardCollectionHiddenImages.json';
import CardCollectionHiddenSecondaryButtonsMock from './__mocks__/CardCollectionHiddenSecondaryButtons.json';
import CardCollectionManualMock from './__mocks__/CardCollectionManual.json';

const meta: Meta<CardCollectionProps> = {
  title: 'Marketing/Collection/Card',
  component: CardCollection,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<CardCollectionProps>;

// Import images and button data
getImagesData();
getButtonData();

// Card titles
const titles = [
  'Poem Art',
  'Music Lab: Jam Session',
  'The Show Must Go On',
  'Hello World',
  'Dance Party',
  'Generation AI',
  'AI for Oceans',
];

// Card primary buttons
const primaryButtons = [
  'Start Poem Art tutorial',
  'Start Music Lab: Jam Session tutorial',
  'Start The Show Must Go On tutorial',
  'Start Hello World tutorial',
  'Start Dance Party tutorial',
  'Start Generation AI tutorial',
  'Start AI for Oceans tutorial',
];

// Card secondary buttons
const secondaryButtons = [
  'Explore Poem Art teacher materials',
  'Explore Music Lab: Jam Session teacher materials',
  'Explore The Show Must Go On teacher materials',
  'Explore Hello World teacher materials',
  'Explore Dance Party teacher materials',
  'Explore Generation AI teacher materials',
  'Explore AI for Oceans teacher materials',
];

export const SortedAlphabetically: Story = {
  args: CardCollectionAlphabeticalMock as any,
  play: async ({canvas}) => {
    // Check that blocks are sorted alphabetically by title
    titles.forEach(title => {
      expect(canvas.getByText(title)).toBeInTheDocument();
      // Check that images are rendered
      expect(canvas.getByAltText(title)).toBeInTheDocument();
    });
    const renderedTitles = canvas
      .queryAllByRole('heading', {level: 3})
      .map(h => h.textContent)
      .filter(Boolean);
    const sortedTitles = [...renderedTitles].sort((a, b) => a.localeCompare(b));
    expect(renderedTitles).toEqual(sortedTitles);

    // Check that buttons are rendered
    primaryButtons.forEach(button => {
      expect(canvas.getByRole('link', {name: button})).toBeInTheDocument();
    });
    secondaryButtons.forEach(button => {
      expect(canvas.getByRole('link', {name: button})).toBeInTheDocument();
    });
  },
};

export const SortedManually: Story = {
  args: CardCollectionManualMock as any,
  play: async ({canvas}) => {
    // Check that blocks are sorted manually by title
    const renderedTitles = canvas
      .queryAllByRole('heading', {level: 3})
      .map(h => h.textContent)
      .filter(Boolean);
    expect(renderedTitles).toEqual(titles);
  },
};

export const HiddenImages: Story = {
  args: CardCollectionHiddenImagesMock as any,
  play: async ({canvas}) => {
    // Check that images are not rendered
    expect(canvas.queryAllByRole('presentation').length).toBe(0);
  },
};

export const HiddenSecondaryButtons: Story = {
  args: CardCollectionHiddenSecondaryButtonsMock as any,
  play: async ({canvas}) => {
    // Check that secondary buttons are not rendered
    secondaryButtons.forEach(button => {
      expect(
        canvas.queryByRole('link', {name: button}),
      ).not.toBeInTheDocument();
    });
  },
};
