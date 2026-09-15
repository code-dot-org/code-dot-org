import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import Toast, {ToastAnnouncer, ToastProvider, useToast} from './../index';

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
    function Trigger({message}: {message: string}) {
      const toast = useToast();
      return <button onClick={() => toast(message)}>fire</button>;
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

    it('no-ops without a provider', () => {
      render(<Trigger message="Saved!" />);
      expect(() =>
        fireEvent.click(screen.getByRole('button', {name: 'fire'})),
      ).not.toThrow();
      expect(screen.queryByText('Saved!')).toBeNull();
    });
  });
});
