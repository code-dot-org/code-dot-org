import {render, screen} from '@testing-library/react';

import LogoCollection from '../LogoCollection';

jest.mock('@/selectors/contentful/getImage', () => ({
  getAbsoluteImageUrl: jest.fn(() => 'https://example.com/logo.png'),
}));

const mockLogo = (overrides = {}) => ({
  fields: {
    title: 'First Logo',
    logoImage: {
      fields: {
        title: 'First Brand',
      },
    },
    primaryLinkRef: {
      fields: {
        primaryTarget: 'https://first.com',
      },
    },
    ...overrides,
  },
});

const mockLogos = [
  mockLogo(),
  mockLogo({
    title: 'Second Logo',
    logoImage: {fields: {title: 'Second Brand'}},
    primaryLinkRef: {fields: {primaryTarget: 'https://second.com'}},
  }),
  mockLogo({
    title: 'Third Logo',
    logoImage: {fields: {title: 'Third Brand'}},
    primaryLinkRef: {fields: {primaryTarget: ''}},
  }),
  mockLogo({
    title: 'Fourth Logo',
    logoImage: {fields: {title: 'Fourth Brand'}},
    primaryLinkRef: {fields: {primaryTarget: ''}},
  }),
  mockLogo({
    title: 'Fifth Logo',
    logoImage: {fields: {title: 'Fifth Brand'}},
    primaryLinkRef: {fields: {primaryTarget: 'https://fifth.com'}},
  }),
  mockLogo({
    title: 'Sixth Logo',
    logoImage: {fields: {title: 'Sixth Brand'}},
    primaryLinkRef: {fields: {primaryTarget: 'https://sixth.com'}},
  }),
];

describe('LogoCollection', () => {
  it('renders logos', () => {
    const logos = mockLogos;
    render(
      <LogoCollection
        logos={logos as Parameters<typeof LogoCollection>[0]['logos']}
      />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(6);
  });

  it('renders logos with correct alt text', () => {
    const logos = mockLogos;
    render(
      <LogoCollection
        logos={logos as Parameters<typeof LogoCollection>[0]['logos']}
      />,
    );
    expect(screen.getAllByAltText('First Brand')[0]).toBeInTheDocument();
  });

  it('renders links for logos with URLs', () => {
    const logos = mockLogos;
    render(
      <LogoCollection
        logos={logos as Parameters<typeof LogoCollection>[0]['logos']}
      />,
    );
    const images = screen.getAllByRole('figure');

    // check that images with URLs have links
    expect(images[0].parentElement).toHaveAttribute(
      'href',
      'https://first.com',
    );
    expect(images[1].parentElement).toHaveAttribute(
      'href',
      'https://second.com',
    );
    expect(images[4].parentElement).toHaveAttribute(
      'href',
      'https://fifth.com',
    );
    expect(images[5].parentElement).toHaveAttribute(
      'href',
      'https://sixth.com',
    );

    // check that images without URLs do not have links
    expect(images[2].parentElement).not.toHaveAttribute('href');
    expect(images[3].parentElement).not.toHaveAttribute('href');
  });
});
