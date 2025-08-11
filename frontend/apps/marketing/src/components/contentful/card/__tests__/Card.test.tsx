import {render, screen} from '@testing-library/react';

import Card, {CardProps} from '../Card';

const defaultProps: CardProps = {
  title: 'Test Title',
  description: 'Test Description',
  imageSrc: 'test-image.jpg',
  imageHeight: '250',
  overline: 'Test Overline',
  primaryButton: {
    fields: {
      label: 'Primary',
      primaryTarget: '/primary',
      ariaLabel: 'Primary Button',
      isThisAnExternalLink: false,
    },
  },
  secondaryButton: {
    fields: {
      label: 'Secondary',
      primaryTarget: '/secondary',
      ariaLabel: 'Secondary Button',
      isThisAnExternalLink: true,
    },
  },
  className: 'custom-card',
};

describe('Card', () => {
  it('renders title, description, and overline', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Overline')).toBeInTheDocument();
  });

  it('renders image with correct src and height', () => {
    render(<Card {...defaultProps} />);
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('test-image.jpg'),
    );
    expect(img).toHaveStyle({height: '250px'});
  });

  it('uses default image height if imageHeight is not provided', () => {
    render(<Card {...defaultProps} imageHeight={undefined} />);
    const img = screen.getByRole('presentation');
    expect(img).toHaveStyle({height: '300px'});
  });

  it('renders primary and secondary buttons with correct labels and hrefs', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Primary').closest('a')).toHaveAttribute(
      'href',
      '/primary',
    );
    expect(screen.getByText('Secondary').closest('a')).toHaveAttribute(
      'href',
      '/secondary',
    );
  });

  it('renders without image if imageSrc is not provided', () => {
    render(<Card {...defaultProps} imageSrc={undefined} />);
    expect(screen.queryByRole('presentation')).toBeNull();
  });

  it('renders without overline if not provided', () => {
    render(<Card {...defaultProps} overline={undefined} />);
    expect(screen.queryByText('Test Overline')).toBeNull();
  });

  it('renders without title if not provided', () => {
    render(<Card {...defaultProps} title={undefined} />);
    expect(screen.queryByText('Test Title')).toBeNull();
  });

  it('renders without description if not provided', () => {
    render(<Card {...defaultProps} description={undefined} />);
    expect(screen.queryByText('Test Description')).toBeNull();
  });

  it('renders without buttons if not provided', () => {
    render(
      <Card
        {...defaultProps}
        primaryButton={undefined}
        secondaryButton={undefined}
      />,
    );
    expect(screen.queryByText('Primary')).toBeNull();
    expect(screen.queryByText('Secondary')).toBeNull();
  });
});
