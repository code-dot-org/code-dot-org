import {render} from '@testing-library/react';
import {ReactPlayerProps} from 'react-player';
import ReactPlayer from 'react-player/file';

import ActionBlock, {ActionBlockContentfulProps} from '../ActionBlock';

ReactPlayer.canPlay = jest.fn();

jest.mock('react-player/youtube', () => ({
  __esModule: true,
  default: ({light, playIcon, onError}: ReactPlayerProps) => (
    <div>
      YouTube Player
      {light}
      {playIcon}
      <button onClick={onError}>Trigger Error</button>
    </div>
  ),
  canPlay: jest.fn(),
}));

jest.mock('react-player/file', () => ({
  __esModule: true,
  default: ({light, playIcon, onError}: ReactPlayerProps) => (
    <div>
      Fallback Player
      {light}
      {playIcon}
      <button onClick={onError}>Trigger Error</button>
    </div>
  ),
  canPlay: jest.fn(),
}));

describe('ActionBlock', () => {
  const defaultProps: ActionBlockContentfulProps = {
    overline: 'Test Overline',
    title: 'Test Title',
    description: 'Test Description',
    image: {
      fields: {
        file: {url: 'https://code.org/image.jpg'},
      },
    },
    primaryButton: {
      fields: {
        label: 'Test Primary Button',
        primaryTarget: '/primary-link',
        ariaLabel: 'Test Primary Button aria label',
      },
    },
    secondaryButton: {
      fields: {
        label: 'Test Secondary Button',
        primaryTarget: '/secondary-link',
        ariaLabel: 'Test Secondary Button aria label',
      },
    },
    background: 'primary',
    publishedDate: '2025-03-01T00:00:00Z', // March 1, 2025 12:00 AM UTC
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders component with all props', () => {
    const {getByText, getByAltText} = render(<ActionBlock {...defaultProps} />);

    expect(getByText('Test Overline')).toBeInTheDocument();
    expect(getByText('Test Title')).toBeInTheDocument();
    expect(getByText('Test Description')).toBeInTheDocument();
    expect(getByAltText('')).toBeInTheDocument();
    expect(getByText('Test Primary Button')).toBeInTheDocument();
    expect(getByText('Test Secondary Button')).toBeInTheDocument();
  });

  it('does not render buttons when the primary button is not provided', () => {
    const {queryByText} = render(
      <ActionBlock {...defaultProps} primaryButton={undefined} />,
    );

    // check for primary button
    expect(queryByText('Test Primary Button')).not.toBeInTheDocument();

    // check for secondary button
    expect(queryByText('Test Secondary Button')).not.toBeInTheDocument();
  });

  it('renders external link icon for buttons when isThisAnExternalLink is true', () => {
    const {queryAllByTestId} = render(
      <ActionBlock
        {...defaultProps}
        primaryButton={{
          fields: {
            ...defaultProps.primaryButton.fields,
            isThisAnExternalLink: true,
          },
        }}
        secondaryButton={{
          fields: {
            ...defaultProps.secondaryButton.fields,
            isThisAnExternalLink: true,
          },
        }}
      />,
    );

    expect(queryAllByTestId('font-awesome-v6-icon')).toHaveLength(2);
  });

  it('opens external links in a new tab', () => {
    const {getByLabelText} = render(
      <ActionBlock
        {...defaultProps}
        primaryButton={{
          fields: {
            ...defaultProps.primaryButton.fields,
            isThisAnExternalLink: true,
          },
        }}
        secondaryButton={{
          fields: {
            ...defaultProps.secondaryButton.fields,
            isThisAnExternalLink: true,
          },
        }}
      />,
    );

    expect(getByLabelText('Test Primary Button aria label')).toHaveAttribute(
      'target',
      '_blank',
    );

    expect(getByLabelText('Test Secondary Button aria label')).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('renders New tag if publishedDate is within 3 months of the current date', () => {
    const now = new Date('2025-05-01T00:00:00Z'); // May 1, 2025 12:00 AM UTC
    jest.useFakeTimers().setSystemTime(now);

    const {getByText} = render(<ActionBlock {...defaultProps} />);

    expect(getByText('New')).toBeInTheDocument();
  });

  it('does not render New tag if publishedDate is older than 3 months of the current date', () => {
    const now = new Date('2025-06-02T00:00:00Z'); // June 2, 2025 12:00 AM UTC
    jest.useFakeTimers().setSystemTime(now);

    const {queryByText} = render(<ActionBlock {...defaultProps} />);

    expect(queryByText('New')).not.toBeInTheDocument();
  });

  it('does not render New tag if publishedDate is after the current date', () => {
    const now = new Date('2025-02-28T00:00:00Z'); // Feb 28, 2025 12:00 AM UTC
    jest.useFakeTimers().setSystemTime(now);

    const {queryByText} = render(<ActionBlock {...defaultProps} />);

    expect(queryByText('New')).not.toBeInTheDocument();
  });

  it('does not render New tag if publishedDate is not provided', () => {
    const newProps = {...defaultProps};
    newProps.publishedDate = undefined;

    const {queryByText} = render(<ActionBlock {...newProps} />);

    expect(queryByText('New')).not.toBeInTheDocument();
  });
});
