import {render, screen} from '@testing-library/react';

import CardCollection, {CardCollectionProps} from '../CardCollection';

const mockCards: CardCollectionProps['cards'] = [
  {
    fields: {
      actionBlockOverline: 'Test Overline',
      title: 'Title 3',
      shortDescription: 'Test Description',
      imageSrc: 'https://code.org/image.jpg',
      primaryButton: {
        fields: {
          label: 'Test Primary Button',
          primaryTarget: '/primary-link',
          ariaLabel: 'Test Primary Button aria label',
        },
      },
      secondaryButton: {
        fields: {
          label: 'Test Secondary Button',
          primaryTarget: '/secondary-link',
          ariaLabel: 'Test Secondary Button aria label',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    fields: {
      actionBlockOverline: 'Test Overline',
      title: 'Title 1',
      shortDescription: 'Test Description',
      imageSrc: 'https://code.org/image.jpg',
      primaryButton: {
        fields: {
          label: 'Test Primary Button',
          primaryTarget: '/primary-link',
          ariaLabel: 'Test Primary Button aria label',
        },
      },
      secondaryButton: {
        fields: {
          label: 'Test Secondary Button',
          primaryTarget: '/secondary-link',
          ariaLabel: 'Test Secondary Button aria label',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    fields: {
      actionBlockOverline: 'Test Overline',
      title: 'Title 2',
      shortDescription: 'Test Description',
      imageSrc: 'https://code.org/image.jpg',
      primaryButton: {
        fields: {
          label: 'Test Primary Button',
          primaryTarget: '/primary-link',
          ariaLabel: 'Test Primary Button aria label',
        },
      },
      secondaryButton: {
        fields: {
          label: 'Test Secondary Button',
          primaryTarget: '/secondary-link',
          ariaLabel: 'Test Secondary Button aria label',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
];

describe('CardCollection', () => {
  it('renders all cards', () => {
    render(
      <CardCollection
        cards={mockCards}
        sortOrder="alphabetical"
        hideImages={false}
        hideSecondaryButton={false}
      />,
    );
    expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3);
  });

  it('sorts cards alphabetically by title', () => {
    render(
      <CardCollection
        cards={mockCards}
        sortOrder="alphabetical"
        hideImages={false}
        hideSecondaryButton={false}
      />,
    );
    const titles = screen.getAllByRole('heading', {level: 3});
    expect(titles[0]).toHaveTextContent('Title 1');
    expect(titles[1]).toHaveTextContent('Title 2');
    expect(titles[2]).toHaveTextContent('Title 3');
  });
});
