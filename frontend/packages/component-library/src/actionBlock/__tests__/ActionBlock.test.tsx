import {render, screen} from '@testing-library/react';

import '@testing-library/jest-dom';
import ActionBlock, {ActionBlockProps} from '../ActionBlock';

describe('ActionBlock', () => {
  const defaultProps: ActionBlockProps = {
    title: 'Action block title',
    description: 'This is the action block description.',
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

    expect(screen.getByRole('figure')).toHaveStyle(
      'background: url(image.jpg) center / cover no-repeat',
    );
  });

  it('renders an overline', () => {
    render(<ActionBlock {...defaultProps} overline="Overline Text" />);

    expect(screen.getByText('Overline Text')).toBeInTheDocument();
  });

  it('renders duration detail', () => {
    render(
      <ActionBlock
        {...defaultProps}
        detail="duration"
        detailString="2 hours"
      />,
    );

    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('2 hours')).toBeInTheDocument();
  });

  it('renders labProject detail', () => {
    render(
      <ActionBlock
        {...defaultProps}
        detail="labProject"
        detailString="Create a web app"
      />,
    );

    expect(screen.getByText('What you can make:')).toBeInTheDocument();
    expect(screen.getByText('Create a web app')).toBeInTheDocument();
  });

  it('renders buttons', () => {
    render(
      <ActionBlock
        {...defaultProps}
        primaryButtonLabel="Primary Button"
        primaryButtonUrl="https://code.org"
        primaryButtonAriaLabel="Primary Button aria label"
        secondaryButtonLabel="Secondary Button"
        secondaryButtonUrl="https://hourofcode.com"
        secondaryButtonAriaLabel="Secondary Button aria label"
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
