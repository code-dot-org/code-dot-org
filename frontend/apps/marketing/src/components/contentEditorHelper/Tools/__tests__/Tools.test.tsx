import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {useParams} from 'next/navigation';

import ContentEditorTools from '../Tools';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  redirect: jest.fn(),
}));

describe('ContentEditorTools', () => {
  const originalLocation = window.location;
  const mockOnChangeDraftToken = jest.fn();

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {reload: jest.fn(), origin: originalLocation.origin},
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({slug: 'test-slug', locale: 'en'});
  });

  it('renders the preview label', () => {
    render(
      <ContentEditorTools
        onChangeDraftToken={mockOnChangeDraftToken}
        isDraftModeEnabled={false}
        previewLabel="Preview Mode"
      />,
    );

    expect(screen.getByText('Viewing Preview Mode')).toBeInTheDocument();
  });

  it('copies the shareable link to the clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValueOnce(undefined),
      },
    });

    render(
      <ContentEditorTools
        onChangeDraftToken={mockOnChangeDraftToken}
        isDraftModeEnabled={false}
        previewLabel="Preview Mode"
      />,
    );

    const copyButton = screen.getByText('Get shareable link');
    fireEvent.click(copyButton);

    await waitFor(async () => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `http://localhost/api/draft?token=null&slug=test-slug&locale=en`,
      );

      expect(await screen.findByText('Copied!')).toBeInTheDocument();
    });
  });

  it('calls onChangeDraftToken when "Change draft token" button is clicked', () => {
    render(
      <ContentEditorTools
        onChangeDraftToken={mockOnChangeDraftToken}
        isDraftModeEnabled={false}
        previewLabel="Preview Mode"
      />,
    );

    const changeTokenButton = screen.getByText('Change draft token');
    fireEvent.click(changeTokenButton);

    expect(mockOnChangeDraftToken).toHaveBeenCalled();
  });

  it('renders "Enter draft mode" button when draft mode is disabled', () => {
    render(
      <ContentEditorTools
        onChangeDraftToken={mockOnChangeDraftToken}
        isDraftModeEnabled={false}
        previewLabel="Preview Mode"
      />,
    );

    expect(screen.getByText('Enter draft mode')).toBeInTheDocument();
  });

  it('renders "Exit draft mode" button when draft mode is enabled', () => {
    render(
      <ContentEditorTools
        onChangeDraftToken={mockOnChangeDraftToken}
        isDraftModeEnabled={true}
        previewLabel="Preview Mode"
      />,
    );

    expect(screen.getByText('Exit draft mode')).toBeInTheDocument();
  });

  it('reloads the page when exiting draft mode succeeds', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ok: true});

    render(
      <ContentEditorTools
        onChangeDraftToken={mockOnChangeDraftToken}
        isDraftModeEnabled={true}
        previewLabel="Preview Mode"
      />,
    );

    const exitDraftModeButton = screen.getByText('Exit draft mode');
    fireEvent.click(exitDraftModeButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/disable-draft', {
      method: 'POST',
    });

    await screen.findByText('Exit draft mode');
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('logs an error when exiting draft mode fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValueOnce({ok: false, status: 500});

    render(
      <ContentEditorTools
        onChangeDraftToken={mockOnChangeDraftToken}
        isDraftModeEnabled={true}
        previewLabel="Preview Mode"
      />,
    );

    const exitDraftModeButton = screen.getByText('Exit draft mode');
    fireEvent.click(exitDraftModeButton);

    await screen.findByText('Exit draft mode');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to exit draft mode with status:',
      500,
    );

    consoleErrorSpy.mockRestore();
  });
});
