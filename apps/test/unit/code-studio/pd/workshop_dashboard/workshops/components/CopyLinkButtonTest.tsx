import '@testing-library/jest-dom';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {UserEvent} from 'node_modules/@testing-library/user-event/dist/types/setup/setup';
import React from 'react';

import {CopyLinkButton} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/components/CopyLinkButton';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

jest.mock('@cdo/apps/util/copyToClipboard', () => jest.fn());
const mockCopyToClipboard = copyToClipboard as jest.MockedFunction<
  typeof copyToClipboard
>;

describe('CopyLinkButton', () => {
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
    link: 'https://example.com/test-link',
  };

  it('renders with correct text and initial icon', () => {
    render(<CopyLinkButton {...defaultProps} />);

    expect(screen.getByRole('button', {name: 'Copy link'})).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });

  it('renders with custom aria-label when provided', () => {
    const customAriaLabel = 'Copy workshop marketing page link';
    render(<CopyLinkButton {...defaultProps} ariaLabel={customAriaLabel} />);

    expect(
      screen.getByRole('button', {name: customAriaLabel})
    ).toBeInTheDocument();
  });

  it('calls copyToClipboard with correct link when clicked', async () => {
    render(<CopyLinkButton {...defaultProps} />);

    const button = screen.getByRole('button', {name: 'Copy link'});
    await act(async () => {
      await user.click(button);
    });
    advanceTimers();

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      defaultProps.link,
      expect.any(Function)
    );
  });

  it('changes text to "Copied!" when copy is successful', async () => {
    render(<CopyLinkButton {...defaultProps} />);

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
    render(<CopyLinkButton {...defaultProps} />);

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

    render(<CopyLinkButton link={customLink} />);

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
    const {unmount} = render(<CopyLinkButton {...defaultProps} />);

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
