import {render, screen} from '@testing-library/react';

import LogoCollection, {LogoCollectionProps} from '../LogoCollection';

jest.mock('@/selectors/contentful/getImage', () => ({
  getAbsoluteImageUrl: jest.fn(() => 'https://example.com/logo.png'),
}));

const mockLogos: LogoCollectionProps['logos'] = [
  {
    fields: {
      title: 'Microsoft',
      logoImage: {
        fields: {
          title: 'Microsoft Logo',
        },
      },
      primaryLinkRef: {
        fields: {
          primaryTarget: 'https://microsoft.com',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    fields: {
      title: 'Amazon',
      logoImage: {
        fields: {
          title: 'Amazon Logo',
        },
      },
      primaryLinkRef: {
        fields: {
          primaryTarget: 'https://amazon.com',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  {
    fields: {
      title: 'Google',
      logoImage: {
        fields: {
          title: 'Google Logo',
        },
      },
      primaryLinkRef: {
        fields: {
          primaryTarget: '',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
];

describe('LogoCollection', () => {
  it('renders logos', () => {
    render(<LogoCollection logos={mockLogos} sortOrder="alphabetical" />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('renders logos with correct alt text', () => {
    render(<LogoCollection logos={mockLogos} sortOrder="alphabetical" />);
    expect(screen.getByAltText('Microsoft Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Amazon Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Google Logo')).toBeInTheDocument();
  });

  it('renders links for logos with URLs', () => {
    render(<LogoCollection logos={mockLogos} sortOrder="alphabetical" />);
    const images = screen.getAllByRole('figure');

    // check that images with URLs have links
    expect(images[0].firstElementChild).toHaveAttribute(
      'href',
      'https://amazon.com',
    );
    expect(images[1].firstElementChild).not.toHaveAttribute('href');

    // check that images without URLs do not have links
    expect(images[2].firstElementChild).toHaveAttribute(
      'href',
      'https://microsoft.com',
    );
  });

  it('sorts logos alphabetically by brand title', () => {
    render(<LogoCollection logos={mockLogos} sortOrder="alphabetical" />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('alt', 'Amazon Logo');
    expect(images[1]).toHaveAttribute('alt', 'Google Logo');
    expect(images[2]).toHaveAttribute('alt', 'Microsoft Logo');
  });

  it('sorts logos manually by brand title', () => {
    render(<LogoCollection logos={mockLogos} sortOrder="manual" />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('alt', 'Microsoft Logo');
    expect(images[1]).toHaveAttribute('alt', 'Amazon Logo');
    expect(images[2]).toHaveAttribute('alt', 'Google Logo');
  });

  it('handles logos with missing or undefined fields when sorting', () => {
    const logos = mockLogos;
    const logosWithMissingFields: LogoCollectionProps['logos'] = [
      {
        fields: {
          title: null,
          logoImage: null,
          primaryLinkRef: null,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {
        fields: {
          title: undefined,
          logoImage: undefined,
          primaryLinkRef: undefined,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    ];

    render(
      <LogoCollection
        logos={[...logos, ...logosWithMissingFields]}
        sortOrder="alphabetical"
      />,
    );
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('alt', 'Amazon Logo');
    expect(images[1]).toHaveAttribute('alt', 'Google Logo');
    expect(images[2]).toHaveAttribute('alt', 'Microsoft Logo');
  });
});
