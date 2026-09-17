import {act, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import CopiedTooltip, {
  COPIED_TOOLTIP_DURATION_MS,
} from '@cdo/apps/sharedComponents/CopiedTooltip';

describe('CopiedTooltip', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  function renderTooltip(
    props: Partial<React.ComponentProps<typeof CopiedTooltip>> = {}
  ) {
    return render(
      <CopiedTooltip copiedAt={null} onHide={jest.fn()} {...props}>
        <button type="button">Copy link to project</button>
      </CopiedTooltip>
    );
  }

  it('renders its child and no confirmation when nothing was copied', () => {
    renderTooltip();
    expect(
      screen.getByRole('button', {name: 'Copy link to project'})
    ).toBeInTheDocument();
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });

  it('shows the confirmation once a copy has happened', () => {
    renderTooltip({copiedAt: 1000});
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('announces the confirmation in an assertive live region', () => {
    renderTooltip({copiedAt: 1000});
    act(() => {
      jest.advanceTimersByTime(100);
    });
    const liveRegion = screen.getByRole('alert');
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    expect(liveRegion).toHaveTextContent('Copied!');
  });

  it('calls onHide once the confirmation has been up long enough', () => {
    const onHide = jest.fn();
    renderTooltip({copiedAt: 1000, onHide});
    expect(onHide).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(COPIED_TOOLTIP_DURATION_MS);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer when a second copy lands mid-confirmation', () => {
    const onHide = jest.fn();
    const {rerender} = renderTooltip({copiedAt: 1000, onHide});

    // Second copy three quarters of the way through the first window.
    act(() => {
      jest.advanceTimersByTime(COPIED_TOOLTIP_DURATION_MS * 0.75);
    });
    rerender(
      <CopiedTooltip copiedAt={2000} onHide={onHide}>
        <button type="button">Copy link to project</button>
      </CopiedTooltip>
    );

    // The first copy's timer must not carry over and cut this one short.
    act(() => {
      jest.advanceTimersByTime(COPIED_TOOLTIP_DURATION_MS * 0.5);
    });
    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(COPIED_TOOLTIP_DURATION_MS * 0.5);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('does not call onHide while nothing has been copied', () => {
    const onHide = jest.fn();
    renderTooltip({copiedAt: null, onHide});
    act(() => {
      jest.advanceTimersByTime(COPIED_TOOLTIP_DURATION_MS * 2);
    });
    expect(onHide).not.toHaveBeenCalled();
  });
});
