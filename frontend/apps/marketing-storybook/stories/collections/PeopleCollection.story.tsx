import PeopleCollection, {
  PeopleCollectionProps,
} from '@/components/contentful/collections/peopleCollection';
import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {Meta, StoryObj} from '@storybook/react';
import {expect, within} from 'storybook/test';

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

const inMemoryEntities = useInMemoryEntities();

inMemoryEntities.addEntities([
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: '90t6bu6vlf76',
        },
      },
      id: '5CznPyR4ZsbIkhpwSaUxoe',
      type: 'Entry',
      createdAt: '2025-04-28T17:15:38.051Z',
      updatedAt: '2025-07-02T20:13:06.538Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 42,
      revision: 4,
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'link',
        },
      },
      locale: 'en-US',
    },
    fields: {
      linkName: '❌ [ENG] External link button test',
      label: 'External link button test',
      primaryTarget: 'about:blank',
      isThisAnExternalLink: true,
      ariaLabel: 'External link button test',
    },
  },
]);

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
      if (person.fields.personalLink) {
        const heading = canvas.getByRole('heading', {name: person.fields.name});
        const parentDiv = heading.closest('div');
        expect(
          within(parentDiv!).getByRole('link', {name: 'Visit personal page'}),
        ).toBeInTheDocument();
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
      if (person.fields.personalLink) {
        const heading = canvas.getByRole('heading', {name: person.fields.name});
        const parentDiv = heading.closest('div');
        expect(
          within(parentDiv!).getByRole('link', {name: 'Visit personal page'}),
        ).toBeInTheDocument();
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
      if (person.fields.personalLink) {
        const heading = canvas.getByRole('heading', {name: person.fields.name});
        const parentDiv = heading.closest('div');
        expect(
          within(parentDiv!).getByRole('link', {name: 'Visit personal page'}),
        ).toBeInTheDocument();
      }
    }
  },
};
