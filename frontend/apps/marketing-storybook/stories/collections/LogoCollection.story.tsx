import LogoCollection, {
  LogoCollectionProps,
} from '@/components/contentful/collections/logoCollection';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import LogoCollectionAlphabeticalMock from './__mocks__/LogoCollectionAlphabetical.json';
import LogoCollectionManualMock from './__mocks__/LogoCollectionManual.json';

const meta: Meta<LogoCollectionProps> = {
  title: 'Marketing/Collection/Logo',
  component: LogoCollection,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<LogoCollectionProps>;

export const SortedAlphabetically: Story = {
  args: LogoCollectionAlphabeticalMock,
  play: async ({canvas}) => {
    // sorted alphabetically by alt text
    const titles = [
      'amazon logo',
      'Clever Logo (Color)',
      'Google Classroom Logo',
      'Microsoft Square Logo',
      'Microsoft Logo',
      'Schoology logo',
    ];

    // Check alphabetical order
    const imgAlts = canvas
      .getAllByRole('img')
      .map(img => img.getAttribute('alt'));
    expect(imgAlts).toEqual(titles);

    // Check that "amazon logo" image is clickable using RTL syntax
    const amazonLogoLink = canvas.getByRole('link', {name: /amazon logo/i});
    expect(amazonLogoLink).toBeInTheDocument();
  },
};

export const SortedManually: Story = {
  args: LogoCollectionManualMock,
  play: async ({canvas}) => {
    const titles = [
      'amazon logo',
      'Clever Logo (Color)',
      'Google Classroom Logo',
      'Microsoft Square Logo',
      'Schoology logo',
      'Microsoft Logo',
    ];

    // Check that all titles exist as alt text
    const imgAlts = canvas
      .getAllByRole('img')
      .map(img => img.getAttribute('alt'));
    titles.forEach(title => {
      expect(imgAlts).toContain(title);
    });

    // Check that "amazon logo" image is clickable using RTL syntax
    const amazonLogoLink = canvas.getByRole('link', {name: /amazon logo/i});
    expect(amazonLogoLink).toBeInTheDocument();
  },
};
