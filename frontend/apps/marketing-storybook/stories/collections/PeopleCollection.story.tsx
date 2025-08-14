import PeopleCollection, {
  PeopleCollectionProps,
} from '@/components/contentful/collections/peopleCollection';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import PeopleCollectionAlphabeticalMock from './__mocks__/PeopleCollectionAlphabetical.json';
import PeopleCollectionHiddenMock from './__mocks__/PeopleCollectionHidden.json';
import PeopleCollectionManualMock from './__mocks__/PeopleCollectionManual.json';

const meta: Meta<PeopleCollectionProps> = {
  title: 'Marketing/Collection/People',
  component: PeopleCollection,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<PeopleCollectionProps>;

export const SortedAlphabetically: Story = {
  args: PeopleCollectionAlphabeticalMock,
  play: async ({canvas}) => {
    for (const person of PeopleCollectionAlphabeticalMock.people) {
      expect(
        canvas.getByRole('heading', {name: person.fields.name}),
      ).toBeInTheDocument();
      if (person.fields.title) {
        expect(canvas.getByText(person.fields.title)).toBeInTheDocument();
      }
      if (person.fields.bio) {
        expect(canvas.getByText(person.fields.bio)).toBeInTheDocument();
      }
    }
  },
};

export const SortedManually: Story = {
  args: PeopleCollectionManualMock,
  play: async ({canvas}) => {
    for (const person of PeopleCollectionManualMock.people) {
      expect(
        canvas.getByRole('heading', {name: person.fields.name}),
      ).toBeInTheDocument();
      if (person.fields.title) {
        expect(canvas.getByText(person.fields.title)).toBeInTheDocument();
      }
      if (person.fields.bio) {
        expect(canvas.getByText(person.fields.bio)).toBeInTheDocument();
      }
    }
  },
};

export const HiddenImages: Story = {
  args: PeopleCollectionHiddenMock,
  play: async ({canvas}) => {
    for (const person of PeopleCollectionHiddenMock.people) {
      expect(
        canvas.getByRole('heading', {name: person.fields.name}),
      ).toBeInTheDocument();
      if (person.fields.title) {
        expect(canvas.getByText(person.fields.title)).toBeInTheDocument();
      }
      if (person.fields.bio) {
        expect(canvas.getByText(person.fields.bio)).toBeInTheDocument();
      }
    }
  },
};
