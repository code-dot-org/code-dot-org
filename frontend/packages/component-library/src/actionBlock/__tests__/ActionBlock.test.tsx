import {render, screen} from '@testing-library/react';

import '@testing-library/jest-dom';
import ActionBlock, {FullWidthActionBlock, ActionBlockProps} from '../index';

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
    render(<ActionBlock {...defaultProps} image="image.png" />);

    expect(screen.getByAltText('')).toHaveAttribute('src', 'image.png');
  });

  it('renders an overline', () => {
    render(<ActionBlock {...defaultProps} overline="Overline Text" />);

    expect(screen.getByText('Overline Text')).toBeInTheDocument();
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
});

describe('FullWidthActionBlock', () => {
  const defaultProps: ActionBlockProps = {
    title: 'Full width action block title',
    description: 'This is the full width action block description.',
  };

  const primaryButtonProps = {
    primaryButton: {
      text: 'Full Width Primary Button',
      href: 'https://google.com',
      ariaLabel: 'Full Width Primary Button aria label',
    },
  };
  const secondaryButtonProps = {
    secondaryButton: {
      text: 'Full Width Secondary Button',
      href: 'https://apple.com',
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
    render(<FullWidthActionBlock {...defaultProps} image="image2.png" />);

    expect(screen.getByAltText('')).toHaveAttribute('src', 'image2.png');
  });

  it('renders an overline', () => {
    render(
      <ActionBlock {...defaultProps} overline="Full Width Overline Text" />,
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
    expect(primaryButton).toHaveAttribute('href', 'https://google.com');

    // check for secondary button
    const secondaryButton = screen.getByLabelText(
      'Full Width Secondary Button aria label',
    );
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', 'https://apple.com');
  });
});
