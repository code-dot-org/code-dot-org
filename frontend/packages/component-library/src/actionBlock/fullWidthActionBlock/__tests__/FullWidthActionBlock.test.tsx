import {render, screen} from '@testing-library/react';

import '@testing-library/jest-dom';
import FullWidthActionBlock, {ActionBlockProps} from '../index';

describe('FullWidthActionBlock', () => {
  const defaultProps: ActionBlockProps = {
    title: 'Full width action block title',
    description: 'This is the full width action block description.',
  };

  const primaryButtonProps = {
    primaryButton: {
      text: 'Full Width Primary Button',
      href: 'https://code.org',
      ariaLabel: 'Full Width Primary Button aria label',
    },
  };

  const secondaryButtonProps = {
    secondaryButton: {
      text: 'Full Width Secondary Button',
      href: 'https://hourofcode.com',
      ariaLabel: 'Full Width Secondary Button aria label',
    },
  };

  it('renders the title and description', () => {
    render(<FullWidthActionBlock {...defaultProps} />);

    expect(
      screen.getByText('Full width action block title'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is the full width action block description.'),
    ).toBeInTheDocument();
  });

  it('renders an image', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        image={{src: 'image.png', alt: ''}}
      />,
    );

    expect(screen.getByAltText('')).toHaveAttribute('src', 'image.png');
  });

  it('renders an overline', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        overline="Full Width Overline Text"
      />,
    );

    expect(screen.getByText('Full Width Overline Text')).toBeInTheDocument();
  });

  it('renders detail', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        details={{label: 'Duration', description: '1 week'}}
      />,
    );

    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('1 week')).toBeInTheDocument();
  });

  it('renders buttons', () => {
    render(
      <FullWidthActionBlock
        {...defaultProps}
        {...primaryButtonProps}
        {...secondaryButtonProps}
      />,
    );

    // check for primary button
    const primaryButton = screen.getByLabelText(
      'Full Width Primary Button aria label',
    );
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', 'https://code.org');

    // check for secondary button
    const secondaryButton = screen.getByLabelText(
      'Full Width Secondary Button aria label',
    );
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', 'https://hourofcode.com');
  });

  it('does not render buttons when the primary button is not provided', () => {
    render(
      <FullWidthActionBlock {...defaultProps} primaryButton={undefined} />,
    );

    // check for primary button
    const primaryButton = screen.queryByLabelText(
      'Full Width Primary Button aria label',
    );
    expect(primaryButton).not.toBeInTheDocument();

    // check for secondary button
    const secondaryButton = screen.queryByLabelText(
      'Full Width Secondary Button aria label',
    );
    expect(secondaryButton).not.toBeInTheDocument();
  });
});
