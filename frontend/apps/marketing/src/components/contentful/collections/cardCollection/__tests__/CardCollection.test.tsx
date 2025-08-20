import {render, screen} from '@testing-library/react';

import CardCollection, {CardCollectionProps} from '../CardCollection';

// Mock the Contentful SDK hook
jest.mock('@contentful/experiences-sdk-react', () => ({
  useInMemoryEntities: () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    maybeResolveLink: (link: any) => link,
  }),
}));

// Mock the getAbsoluteImageUrl function
jest.mock('@/selectors/contentful/getImage', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAbsoluteImageUrl: (image: any) => image?.fields?.file?.url || '',
}));

const createMockCard = (title: string): CardCollectionProps['cards'][number] =>
  ({
    fields: {
      actionBlockOverline: 'Test Overline',
      title,
      shortDescription: 'Test Description',
      image: {
        fields: {
          file: {
            url: 'https://example.com/image.jpg',
          },
        },
      },
      primaryLinkRef: {
        fields: {
          label: 'Test Primary Button',
          primaryTarget: '/primary-link',
          ariaLabel: 'Test Primary Button aria label',
        },
      },
      secondaryLinkRef: {
        fields: {
          label: 'Test Secondary Button',
          primaryTarget: '/secondary-link',
          ariaLabel: 'Test Secondary Button aria label',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const mockCards: CardCollectionProps['cards'] = [
  createMockCard('Title 3'),
  createMockCard('Title 1'),
  createMockCard('Title 2'),
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
    // Check that images are showing
    expect(screen.getAllByRole('presentation')).toHaveLength(3);
    // Check that overlines are showing
    expect(screen.getAllByText('Test Overline')).toHaveLength(3);
    // Check that titles are showing
    expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3);
    // Check that descriptions are showing
    expect(screen.getAllByText('Test Description')).toHaveLength(3);
    // Check that primary buttons are showing
    expect(
      screen.getAllByRole('link', {name: /test primary button/i}),
    ).toHaveLength(3);
    // Check that secondary buttons are showing
    expect(
      screen.getAllByRole('link', {name: /test secondary button/i}),
    ).toHaveLength(3);
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

  it('sorts cards manually by title', () => {
    render(
      <CardCollection
        cards={mockCards}
        sortOrder="manual"
        hideImages={false}
        hideSecondaryButton={false}
      />,
    );
    const titles = screen.getAllByRole('heading', {level: 3});
    expect(titles[0]).toHaveTextContent('Title 3');
    expect(titles[1]).toHaveTextContent('Title 1');
    expect(titles[2]).toHaveTextContent('Title 2');
  });

  it('hides images when hideImages is true', () => {
    render(
      <CardCollection
        cards={mockCards}
        sortOrder="alphabetical"
        hideImages={true}
        hideSecondaryButton={false}
      />,
    );
    const images = screen.queryAllByRole('presentation');
    expect(images).toHaveLength(0);
  });

  it('hides secondary buttons when hideSecondaryButton is true', () => {
    render(
      <CardCollection
        cards={mockCards}
        sortOrder="alphabetical"
        hideImages={false}
        hideSecondaryButton={true}
      />,
    );
    const secondaryButtons = screen.queryAllByRole('link', {
      name: /test secondary button/i,
    });
    expect(secondaryButtons).toHaveLength(0);
  });
});
