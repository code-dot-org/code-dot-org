/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionBlockCollection, {
  ActionBlockCollectionProps,
} from '@/components/contentful/collections/actionBlockCollection/ActionBlockCollection';
import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {Meta, StoryObj} from '@storybook/react';
import {expect, within} from 'storybook/test';

import ActionBlockCollectionAlphabeticalMock from './__mocks__/ActionBlockCollectionAlphabetical.json';
import ActionBlockCollectionHiddenMock from './__mocks__/ActionBlockCollectionHidden.json';
import ActionBlockCollectionManualMock from './__mocks__/ActionBlockCollectionManual.json';

const meta: Meta<ActionBlockCollectionProps> = {
  title: 'Marketing/Collection/ActionBlock',
  component: ActionBlockCollection,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ActionBlockCollectionProps>;
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
      id: '49SifjEqSHArcx1iEiSw4o',
      type: 'Entry',
      createdAt: '2025-04-28T17:15:38.150Z',
      updatedAt: '2025-07-02T20:12:46.258Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      publishedVersion: 197,
      revision: 2,
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
      linkName: '❌ [ENG] Secondary button test',
      label: 'Secondary button test',
      primaryTarget: '/ping',
      isThisAnExternalLink: false,
      ariaLabel: 'Secondary button test',
    },
  },
]);

export const SortedAlphabetically: Story = {
  args: ActionBlockCollectionAlphabeticalMock as any,
  play: async ({canvas}) => {
    // Check that all block titles are rendered
    const titles = [
      '❌ [ENG] Curriculum 1',
      '❌ [ENG] Curriculum 2',
      '❌ [ENG] Curriculum 3',
      '❌ [ENG] Self-Paced PL 1',
      '❌ [ENG] Self-Paced PL 2',
      '❌ [ENG] Self-Paced PL 3',
    ];
    titles.forEach(title => {
      expect(canvas.getByText(title)).toBeInTheDocument();

      // Self-Paced has secondary buttons
      if (title.includes('Self-Paced')) {
        const titleElement = canvas.getByText(title);
        const parentDiv = titleElement.closest('div')?.parentElement;
        expect(
          parentDiv &&
            within(parentDiv).getByRole('link', {
              name: 'Secondary button test',
            }),
        ).toBeInTheDocument();
      }
    });
    // Check that anchor links (buttons) are present
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    // Check that at least one link has expected text
    // expect(canvas.getByRole('link', {name: /learn more/i})).toBeInTheDocument();
    // Check that blocks are sorted alphabetically by title
    const renderedTitles = canvas
      .queryAllByRole('heading', {level: 3})
      .map(h => h.textContent)
      .filter(Boolean);
    const sortedTitles = [...renderedTitles].sort((a, b) => a.localeCompare(b));
    expect(renderedTitles).toEqual(sortedTitles);
  },
};

export const SortedManually: Story = {
  args: ActionBlockCollectionManualMock as any,
  play: async ({canvas}) => {
    // Check that all block titles are rendered
    expect(canvas.getByText('❌ [ENG] Curriculum 1')).toBeInTheDocument();
    expect(canvas.getByText('❌ [ENG] Curriculum 2')).toBeInTheDocument();
    expect(canvas.getByText('❌ [ENG] Curriculum 3')).toBeInTheDocument();
    // Check that anchor links (buttons) are present
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  },
};

export const HiddenImages: Story = {
  args: ActionBlockCollectionHiddenMock as any,
  play: async ({canvas}) => {
    // Check that all block titles are rendered
    expect(canvas.getByText('❌ [ENG] Curriculum 1')).toBeInTheDocument();
    expect(canvas.getByText('❌ [ENG] Curriculum 2')).toBeInTheDocument();
    expect(canvas.getByText('❌ [ENG] Curriculum 3')).toBeInTheDocument();
    // Check that no images are rendered
    const images = canvas.queryAllByRole('img');
    expect(images.length).toBe(0);
  },
};
