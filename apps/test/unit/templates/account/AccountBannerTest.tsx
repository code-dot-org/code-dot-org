import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import i18n from '@cdo/locale';

describe('AccountBanner', () => {
  const defaultProps = {
    heading: 'Heading',
    desc: 'This is a description',
    showLogo: true,
  };

  it('renders the banner with required props', () => {
    render(<AccountBanner {...defaultProps} />);
    expect(
      screen.getByRole('heading', {name: defaultProps.heading})
    ).toBeInTheDocument();
    expect(screen.getByText(defaultProps.desc)).toBeInTheDocument();
  });

  it('renders the logo when showLogo is true', () => {
    render(<AccountBanner {...defaultProps} showLogo={true} />);
    const logo = screen.getByRole('img', {name: i18n.codeLogo()});
    expect(logo).toBeInTheDocument();
  });

  it('does not render the logo when showLogo is false', () => {
    render(<AccountBanner {...defaultProps} showLogo={false} />);
    expect(
      screen.queryByRole('img', {name: i18n.codeLogo()})
    ).not.toBeInTheDocument();
  });

  it('applies the custom className when provided', () => {
    const customClass = 'custom-banner';
    render(<AccountBanner {...defaultProps} className={customClass} />);
    const headingContainer = screen
      .getByText(defaultProps.heading)
      .closest('div');
    // eslint-disable-next-line no-restricted-properties
    expect(headingContainer).toHaveClass(customClass);
  });
});
