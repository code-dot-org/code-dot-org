import {render, screen} from '@testing-library/react';

import SiteLogo, {SiteLogoProps} from '../SiteLogo';

describe('SiteLogo', () => {
  const defaultProps: SiteLogoProps = {
    label: 'Site Logo',
    href: 'https://example.com',
    imgSrc: 'logo.png',
  };

  it('renders the logo image', () => {
    render(<SiteLogo {...defaultProps} />);
    const img = screen.getByRole('presentation');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', defaultProps.imgSrc);
  });

  it('sets the correct aria-label on the link', () => {
    render(<SiteLogo {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', defaultProps.label);
  });

  it('sets the correct href on the link', () => {
    render(<SiteLogo {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', defaultProps.href);
  });
});
