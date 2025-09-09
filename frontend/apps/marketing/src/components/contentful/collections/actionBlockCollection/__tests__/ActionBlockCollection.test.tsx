import {render, screen} from '@testing-library/react';

import ActionBlockCollection, {
  ActionBlockCollectionProps,
} from '../ActionBlockCollection';

const mockBlocks: ActionBlockCollectionProps['blocks'] = [
  {
    fields: {
      overline: 'Test Overline',
      title: 'Title 3',
      description: 'Test Description',
      image: {
        fields: {
          file: {url: 'https://code.org/image.jpg'},
        },
      },
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
      overline: 'Test Overline',
      title: 'Title 1',
      description: 'Test Description',
      image: {
        fields: {
          file: {url: 'https://code.org/image.jpg'},
        },
      },
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
      overline: 'Test Overline',
      title: 'Title 2',
      description: 'Test Description',
      image: {
        fields: {
          file: {url: 'https://code.org/image.jpg'},
        },
      },
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

describe('ActionBlockCollection', () => {
  it('renders action blocks', () => {
    render(
      <ActionBlockCollection
        blocks={mockBlocks}
        background="primary"
        sortOrder="alphabetical"
        hideImages={false}
      />,
    );
    expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3);
  });

  it('sorts blocks alphabetically by title', () => {
    render(
      <ActionBlockCollection
        blocks={mockBlocks}
        background="primary"
        sortOrder="alphabetical"
        hideImages={false}
      />,
    );
    const titles = screen.getAllByRole('heading', {level: 3});
    expect(titles[0]).toHaveTextContent('Title 1');
    expect(titles[1]).toHaveTextContent('Title 2');
    expect(titles[2]).toHaveTextContent('Title 3');
  });

  it('sorts blocks manually by title', () => {
    render(
      <ActionBlockCollection
        blocks={mockBlocks}
        background="primary"
        sortOrder="manual"
        hideImages={false}
      />,
    );
    const blocks = screen.getAllByRole('heading', {level: 3});
    expect(blocks[0]).toHaveTextContent('Title 3');
    expect(blocks[1]).toHaveTextContent('Title 1');
    expect(blocks[2]).toHaveTextContent('Title 2');
  });

  it('handles blocks with missing or undefined fields when sorting', () => {
    const blocks = mockBlocks;
    const blocksWithMissingFields: ActionBlockCollectionProps['blocks'] = [
      {
        fields: {
          title: null,
          description: null,
          image: {
            fields: {
              file: {url: null},
            },
          },
          primaryButton: {
            fields: {
              label: null,
              primaryTarget: null,
              ariaLabel: null,
            },
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {
        fields: {
          title: undefined,
          description: undefined,
          image: {
            fields: {
              file: {url: undefined},
            },
          },
          primaryButton: {
            fields: {
              label: undefined,
              primaryTarget: undefined,
              ariaLabel: undefined,
            },
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    ];

    render(
      <ActionBlockCollection
        blocks={[...blocks, ...blocksWithMissingFields]}
        background="primary"
        sortOrder="alphabetical"
        hideImages={false}
      />,
    );
    const titles = screen.getAllByRole('heading', {level: 3});
    expect(titles[0]).toHaveTextContent('Title 1');
    expect(titles[1]).toHaveTextContent('Title 2');
    expect(titles[2]).toHaveTextContent('Title 3');
  });

  it('hides images when hideImages is true', () => {
    render(
      <ActionBlockCollection
        blocks={mockBlocks}
        background="primary"
        sortOrder="alphabetical"
        hideImages={true}
      />,
    );
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});
