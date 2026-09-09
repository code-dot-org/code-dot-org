import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import Toast, {
  DEFAULT_TOAST_DURATION,
  ShowToastOptions,
  ToastAnnouncer,
  ToastProvider,
  useToast,
} from './../index';

describe('Design System - Toast', () => {
  describe('controlled Toast', () => {
    it('renders the visible message when open', () => {
      render(<Toast open message="Saved!" />);
      // The Alert shows the message synchronously; the live region fills a frame
      // later (see the announce test), so only the Alert copy is present here.
      expect(screen.getByText('Saved!')).toBeInTheDocument();
    });

    it('announces via a persistent, initially-empty assertive live region', async () => {
      const {rerender} = render(<Toast open={false} message="Saved!" />);
      // The live region exists and is empty before the toast opens, so a screen
      // reader observes a text change (not a node inserted already containing
      // the text, nor a node appearing in a previously-empty region). Default
      // politeness is assertive (role="alert"), the only setting Orca speaks.
      const liveRegion = screen.getByRole('alert');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(liveRegion).toBeEmptyDOMElement();

      rerender(<Toast open message="Saved!" />);
      // The announcer clears then sets the text on the next frame.
      await waitFor(() => expect(liveRegion).toHaveTextContent('Saved!'));
    });

    it('speaks only from the announcer (the visible Alert is presentation)', async () => {
      render(<Toast open message="Saved!" />);
      // Exactly one live region announces; the visible Alert is presentation.
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Saved!'),
      );
      expect(screen.getAllByRole('alert')).toHaveLength(1);
    });

    it('honors polite politeness (role=status) when asked', () => {
      render(<Toast open message="Saved!" politeness="polite" />);
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('renders the surface with an elevation shadow class', () => {
      render(<Toast open message="Saved!" />);
      // The visible Alert surface carries the toast elevation class (the
      // module class renders unscoped in tests).
      const [alertText] = screen.getAllByText('Saved!');
      expect(alertText.closest('.elevated')).toBeInTheDocument();
    });

    it('calls onClose from an accessible dismiss button', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Toast open message="Saved!" onClose={onClose} />);

      await user.click(screen.getByRole('button', {name: 'Close alert'}));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('auto-dismisses after the default duration', () => {
      vi.useFakeTimers();
      try {
        const onClose = vi.fn();
        render(<Toast open message="Saved!" onClose={onClose} />);

        vi.advanceTimersByTime(5_999);
        expect(onClose).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('does not auto-dismiss when autoHideDuration is null', () => {
      vi.useFakeTimers();
      try {
        const onClose = vi.fn();
        render(
          <Toast
            open
            message="Saved!"
            autoHideDuration={null}
            onClose={onClose}
          />,
        );

        vi.advanceTimersByTime(60_000);
        expect(onClose).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it('re-announces an identical message when toastId changes', async () => {
      // Two identical messages leave the region's text unchanged, and a screen
      // reader says nothing about a node that did not change.
      const {rerender} = render(<Toast open toastId={1} message="Saved!" />);
      const liveRegion = screen.getByRole('alert');
      await waitFor(() => expect(liveRegion).toHaveTextContent('Saved!'));

      rerender(<Toast open toastId={2} message="Saved!" />);

      // Cleared on the spot, refilled on the next frame - the same two-step a
      // changing message gets.
      expect(liveRegion.textContent).toBe('');
      await waitFor(() => expect(liveRegion).toHaveTextContent('Saved!'));
      expect(screen.getByRole('alert')).toBe(liveRegion);
    });

    it('restarts the timer when toastId changes for the same message', () => {
      // Two identical messages in a row are distinguishable only by the id, so
      // it has to reach the Snackbar's key alongside the text.
      vi.useFakeTimers();
      try {
        const onClose = vi.fn();
        const {rerender} = render(
          <Toast
            open
            toastId={1}
            message="Saved!"
            autoHideDuration={8000}
            onClose={onClose}
          />,
        );

        vi.advanceTimersByTime(7000);
        rerender(
          <Toast
            open
            toastId={2}
            message="Saved!"
            autoHideDuration={8000}
            onClose={onClose}
          />,
        );

        vi.advanceTimersByTime(7999);
        expect(onClose).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('puts className on the Snackbar, not the Alert', () => {
      // The Snackbar is the positioned surface, so a consumer moving the toast
      // (e.g. below a page header) needs the class to land there.
      const {container} = render(
        <Toast open message="Saved!" className="belowHeader" />,
      );
      const snackbar = container.querySelector('.belowHeader');
      expect(snackbar).toBeInTheDocument();
      expect(snackbar).not.toHaveClass('elevated');
    });

    it('keeps counting down while the window is unfocused', () => {
      // MUI pauses auto-hide on window blur by default and resumes only on
      // refocus. That strands a toast whenever focus sits elsewhere - notably
      // in an iframe on the same page - so the duration must hold regardless.
      vi.useFakeTimers();
      try {
        const onClose = vi.fn();
        render(<Toast open message="Saved!" onClose={onClose} />);

        act(() => {
          fireEvent.blur(window);
        });
        act(() => {
          vi.advanceTimersByTime(DEFAULT_TOAST_DURATION + 1);
        });
        expect(onClose).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('ignores a clickaway close (user must read the status)', () => {
      const onClose = vi.fn();
      render(<Toast open message="Saved!" onClose={onClose} />);
      // MUI reports a clickaway via reason; that must not dismiss the toast.
      fireEvent.click(document.body);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('ToastAnnouncer', () => {
    it('is an empty assertive live region until given a message', async () => {
      const {rerender} = render(<ToastAnnouncer message={null} />);
      const region = screen.getByRole('alert');
      expect(region).toHaveAttribute('aria-live', 'assertive');
      expect(region).toBeEmptyDOMElement();

      rerender(<ToastAnnouncer message="Done" />);
      // Text lands on the next frame (clear-then-set).
      await waitFor(() => expect(region).toHaveTextContent('Done'));
    });
  });

  describe('ToastProvider + useToast', () => {
    function Trigger({
      message,
      options,
    }: {
      message: string;
      options?: ShowToastOptions;
    }) {
      const toast = useToast();
      return <button onClick={() => toast(message, options)}>fire</button>;
    }

    it('shows and announces a message on demand', async () => {
      render(
        <ToastProvider>
          <Trigger message="Profile updated" />
        </ToastProvider>,
      );
      const liveRegion = screen.getByRole('alert');
      expect(liveRegion).toBeEmptyDOMElement();

      fireEvent.click(screen.getByRole('button', {name: 'fire'}));

      await waitFor(() =>
        expect(liveRegion).toHaveTextContent('Profile updated'),
      );
      // Both the visible Alert and the live region hold the text.
      expect(screen.getAllByText('Profile updated')).toHaveLength(2);
    });

    it('forwards className from the provider to the Snackbar', () => {
      const {container} = render(
        <ToastProvider className="belowHeader">
          <Trigger message="Profile updated" />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'fire'}));
      expect(container.querySelector('.belowHeader')).toBeInTheDocument();
    });

    it('treats an explicit null duration as "until closed"', () => {
      vi.useFakeTimers();
      try {
        render(
          <ToastProvider>
            <Trigger message="Saving..." options={{autoHideDuration: null}} />
          </ToastProvider>,
        );
        act(() => {
          fireEvent.click(screen.getByRole('button', {name: 'fire'}));
        });
        act(() => {
          vi.advanceTimersByTime(DEFAULT_TOAST_DURATION * 2);
        });
        expect(screen.queryAllByText('Saving...').length).toBeGreaterThan(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('gives a replacing toast of the same duration its own full time', () => {
      // MUI restarts its timer only when `open` or `autoHideDuration` changes,
      // so consecutive equal-duration toasts would otherwise share one.
      vi.useFakeTimers();
      try {
        render(
          <ToastProvider>
            <Trigger message="first" options={{autoHideDuration: 8000}} />
            <Trigger message="second" options={{autoHideDuration: 8000}} />
          </ToastProvider>,
        );
        const [firstButton, secondButton] = screen.getAllByRole('button', {
          name: 'fire',
        });

        act(() => {
          fireEvent.click(firstButton);
        });
        act(() => {
          vi.advanceTimersByTime(7000);
        });
        act(() => {
          fireEvent.click(secondButton);
        });
        act(() => {
          vi.advanceTimersByTime(1500);
        });

        // The live region mirrors `open` (it is cleared on close) and, unlike
        // the Snackbar, does not linger in jsdom waiting for a transition.
        expect(screen.getByRole('alert')).toHaveTextContent('second');
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps its message while animating out', async () => {
      // The Snackbar's key holds the message, so the provider has to keep that
      // message on close - dropping it would change the key mid-exit and
      // replace the toast with a blank one instead of letting it animate out.
      const user = userEvent.setup();
      render(
        <ToastProvider>
          <Trigger message="Saved!" />
        </ToastProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'fire'}));
      await user.click(screen.getByRole('button', {name: 'Close alert'}));

      expect(screen.queryAllByText('Saved!').length).toBeGreaterThan(0);
    });

    it('reuses one live region across consecutive toasts', async () => {
      // Ensure the live region is reused across consecutive toasts, so
      // keyboard users don't lose focus.
      render(
        <ToastProvider>
          <Trigger message="first" />
          <Trigger message="second" />
        </ToastProvider>,
      );
      const [firstButton, secondButton] = screen.getAllByRole('button', {
        name: 'fire',
      });
      const liveRegion = screen.getByRole('alert');

      fireEvent.click(firstButton);
      await waitFor(() => expect(liveRegion).toHaveTextContent('first'));
      fireEvent.click(secondButton);
      await waitFor(() => expect(liveRegion).toHaveTextContent('second'));

      // Still the same node, and still the only one.
      expect(screen.getByRole('alert')).toBe(liveRegion);
    });

    it('no-ops without a provider', () => {
      render(<Trigger message="Saved!" />);
      expect(() =>
        fireEvent.click(screen.getByRole('button', {name: 'fire'})),
      ).not.toThrow();
      expect(screen.queryByText('Saved!')).toBeNull();
    });
  });
});
