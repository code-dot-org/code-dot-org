import {render, screen} from '@testing-library/react';

import SkinnyBanner from '../SkinnyBanner';

describe('Skinny Banner', () => {
  const heading = 'Test Heading';
  const contentMode = 'Light';

  const renderComponent = (props = {}) =>
    render(
      <SkinnyBanner heading={heading} contentMode={contentMode} {...props} />,
    );

  it('renders internal button link when props provided', () => {
    const buttonLinkData = {
      label: 'Internal Button Link',
      primaryTarget: '/test-link',
      ariaLabel: 'Internal Button Link Label',
      isThisAnExternalLink: false,
    };

    renderComponent({buttonLinks: [{fields: buttonLinkData}]});

    const buttonLink = screen.getByRole('link', {
      name: buttonLinkData.ariaLabel,
    });
    expect(buttonLink).toBeInTheDocument();
    expect(buttonLink).toHaveTextContent(buttonLinkData.label);
    expect(buttonLink).toHaveAttribute('href', buttonLinkData.primaryTarget);
    expect(buttonLink).not.toHaveAttribute('rel');
    expect(buttonLink).not.toHaveAttribute('target');
  });

  it('renders external button link when props provided', () => {
    const buttonLinkData = {
      label: 'External Button Link',
      primaryTarget: '/test-link',
      ariaLabel: 'External Button Link Label',
      isThisAnExternalLink: true,
    };

    renderComponent({buttonLinks: [{fields: buttonLinkData}]});

    const buttonLink = screen.getByRole('link', {
      name: buttonLinkData.ariaLabel,
    });
    expect(buttonLink).toBeInTheDocument();
    expect(buttonLink).toHaveTextContent(buttonLinkData.label);
    expect(buttonLink).toHaveAttribute('href', buttonLinkData.primaryTarget);
    expect(buttonLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(buttonLink).toHaveAttribute('target', '_blank');
  });
});
