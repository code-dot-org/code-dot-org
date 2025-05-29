import {render, screen} from '@testing-library/react';

import '@testing-library/jest-dom';
import ActionBlock, {ActionBlockProps} from '../index';

describe('ActionBlock', () => {
  const defaultProps: ActionBlockProps = {
    title: 'Action block title',
    description: 'This is the action block description.',
  };

  const primaryButtonProps = {
    primaryButton: {
      text: 'Primary Button',
      href: 'https://code.org',
      ariaLabel: 'Primary Button aria label',
    },
  };

  const secondaryButtonProps = {
    secondaryButton: {
      text: 'Secondary Button',
      href: 'https://hourofcode.com',
      ariaLabel: 'Secondary Button aria label',
    },
  };

  it('renders the title and description', () => {
    render(<ActionBlock {...defaultProps} />);

    expect(screen.getByText('Action block title')).toBeInTheDocument();
    expect(
      screen.getByText('This is the action block description.'),
    ).toBeInTheDocument();
  });

  it('renders an image', () => {
    render(
      <ActionBlock {...defaultProps} image={{src: 'image.png', alt: ''}} />,
    );

    expect(screen.getByAltText('')).toHaveAttribute('src', 'image.png');
  });

  it('renders an overline', () => {
    render(<ActionBlock {...defaultProps} overline="Overline Text" />);

    expect(screen.getByText('Overline Text')).toBeInTheDocument();
  });

  it('renders a tag', () => {
    render(<ActionBlock {...defaultProps} tag="New" />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders detail', () => {
    render(
      <ActionBlock
        {...defaultProps}
        details={{label: 'Duration', description: '1 hour'}}
      />,
    );

    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  it('renders buttons', () => {
    render(
      <ActionBlock
        {...defaultProps}
        {...primaryButtonProps}
        {...secondaryButtonProps}
      />,
    );

    // check for primary button
    const primaryButton = screen.getByLabelText('Primary Button aria label');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', 'https://code.org');

    // check for secondary button
    const secondaryButton = screen.getByLabelText(
      'Secondary Button aria label',
    );
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', 'https://hourofcode.com');
  });

  it('does not render buttons when the primary button is not provided', () => {
    render(<ActionBlock {...defaultProps} primaryButton={undefined} />);

    // check for primary button
    const primaryButton = screen.queryByLabelText('Primary Button aria label');
    expect(primaryButton).not.toBeInTheDocument();

    // check for secondary button
    const secondaryButton = screen.queryByLabelText(
      'Secondary Button aria label',
    );
    expect(secondaryButton).not.toBeInTheDocument();
  });
});
