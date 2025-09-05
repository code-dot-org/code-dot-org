import '@testing-library/jest-dom';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {UserEvent} from 'node_modules/@testing-library/user-event/dist/types/setup/setup';
import React from 'react';

import {CopyButton} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/components/CopyButton';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

jest.mock('@cdo/apps/util/copyToClipboard', () => jest.fn());
const mockCopyToClipboard = copyToClipboard as jest.MockedFunction<
  typeof copyToClipboard
>;

describe('CopyButton', () => {
  let user: UserEvent;
  const advanceTimers = () => {
    // Fast-forward time by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });
  };

  beforeEach(() => {
    user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');
    mockCopyToClipboard.mockImplementation(((
      _str: string,
      onSuccess?: () => void,
      _onFailure?: () => void
    ) => {
      onSuccess?.();
    }) as typeof mockCopyToClipboard);
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const defaultProps = {
    buttonText: 'Copy link',
    textToCopy: 'https://example.com/test-link',
  };

  it('renders with correct text and initial icon', () => {
    render(<CopyButton {...defaultProps} />);

    expect(screen.getByRole('button', {name: 'Copy link'})).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });

  it('renders with custom aria-label when provided', () => {
    const customAriaLabel = 'Copy workshop marketing page link';
    render(<CopyButton {...defaultProps} ariaLabel={customAriaLabel} />);

    expect(
      screen.getByRole('button', {name: customAriaLabel})
    ).toBeInTheDocument();
  });

  it('calls copyToClipboard with correct link when clicked', async () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button', {name: 'Copy link'});
    await act(async () => {
      await user.click(button);
    });
    advanceTimers();

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      defaultProps.textToCopy,
      expect.any(Function)
    );
  });

  it('changes text to "Copied!" when copy is successful', async () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button', {name: 'Copy link'});
    await act(async () => {
      await user.click(button);
    });

    // Verify the text changed to "Copied!"
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    advanceTimers();

    expect(mockCopyToClipboard).toHaveBeenCalled();
  });

  it('resets text back to "Copy link" after 2 seconds', async () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button', {name: 'Copy link'});
    await act(async () => {
      await user.click(button);
    });

    // Verify text changed to "Copied!"
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    // Fast-forward time by 2 seconds
    advanceTimers();

    // Verify text reset back to "Copy link"
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });

  it('handles link values correctly', async () => {
    const customLink = 'https://code.org/workshops/123/join';

    render(<CopyButton {...defaultProps} textToCopy={customLink} />);

    const button = screen.getByRole('button', {name: 'Copy link'});
    await act(async () => {
      await user.click(button);
    });
    advanceTimers();

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      customLink,
      expect.any(Function)
    );
  });

  it('cleans up timeout when component unmounts', async () => {
    const {unmount} = render(<CopyButton {...defaultProps} />);

    // Click to trigger the timeout
    const button = screen.getByRole('button', {name: 'Copy link'});
    await act(async () => {
      await user.click(button);
    });
    // Unmount the component
    unmount();

    // Verify that clearTimeout would be called (this is handled by the useEffect cleanup)
    expect(clearTimeout).toHaveBeenCalled();
  });
});
