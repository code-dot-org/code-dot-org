import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Card, {CardProps} from '../Card';

// Mock Statsig provider
const mockLogEvent = jest.fn();
jest.mock('@/providers/statsig/client', () => ({
  useStatsigLogger: jest.fn(() => ({
    logEvent: mockLogEvent,
  })),
}));

const defaultProps: CardProps = {
  title: 'Test Title',
  description: 'Test Description',
  imageSrc: '//images.code.org/test-image.jpg',
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
  beforeEach(() => {
    mockLogEvent.mockClear();
  });

  it('renders title, description, and overline', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Overline')).toBeInTheDocument();
  });

  it('renders image with correct src and height', () => {
    render(<Card {...defaultProps} />);
    const img = screen.getByAltText(defaultProps.title!);
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('test-image.jpg'),
    );
    expect(img).toHaveStyle({height: '100%'});
  });

  it('uses default image height if imageHeight is not provided', () => {
    render(<Card {...defaultProps} imageHeight={undefined} />);
    const img = screen.getByAltText(defaultProps.title!);
    expect(img).toHaveStyle({height: '100%'});
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

  it('calls handlePrimaryButtonClick when primary button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Card
        {...defaultProps}
        primaryButtonEventName="primary_click"
        eventMetadata={{cardTitle: 'Test Title'}}
        id="card-id"
      />,
    );

    const primaryButton = screen.getByText('Primary');
    await user.click(primaryButton);

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(
      'primary_click',
      'card-id',
      expect.objectContaining({
        cardTitle: 'Test Title',
        buttonText: 'Primary Button',
        buttonTarget: '/primary',
      }),
    );
  });

  it('calls handleSecondaryButtonClick when secondary button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Card
        {...defaultProps}
        secondaryButtonEventName="secondary_click"
        eventMetadata={{cardTitle: 'Test Title'}}
        id="card-id"
      />,
    );

    const secondaryButton = screen.getByText('Secondary');
    await user.click(secondaryButton);

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(
      'secondary_click',
      'card-id',
      expect.objectContaining({
        cardTitle: 'Test Title',
        buttonText: 'Secondary Button',
        buttonTarget: '/secondary',
      }),
    );
  });

  it('does not call logEvent if event name or eventMetadata is missing for primary button', () => {
    render(<Card {...defaultProps} primaryButtonEventName={undefined} />);
    screen.getByText('Primary').click();
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('does not call logEvent if event name or eventMetadata is missing for secondary button', () => {
    render(<Card {...defaultProps} secondaryButtonEventName={undefined} />);
    screen.getByText('Secondary').click();
    expect(mockLogEvent).not.toHaveBeenCalled();
  });
});
