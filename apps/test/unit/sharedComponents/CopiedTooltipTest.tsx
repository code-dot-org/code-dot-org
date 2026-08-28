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
      <CopiedTooltip copied={false} onHide={jest.fn()} {...props}>
        <button type="button">Copy link to project</button>
      </CopiedTooltip>
    );
  }

  it('renders its child and no confirmation when not copied', () => {
    renderTooltip();
    expect(
      screen.getByRole('button', {name: 'Copy link to project'})
    ).toBeInTheDocument();
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });

  it('shows the confirmation when copied', () => {
    renderTooltip({copied: true});
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('announces the confirmation in a polite live region', () => {
    renderTooltip({copied: true});
    act(() => {
      jest.advanceTimersByTime(100);
    });
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveTextContent('Copied!');
  });

  it('calls onHide once the confirmation has been up long enough', () => {
    const onHide = jest.fn();
    renderTooltip({copied: true, onHide});
    expect(onHide).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(COPIED_TOOLTIP_DURATION_MS);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('does not call onHide while nothing has been copied', () => {
    const onHide = jest.fn();
    renderTooltip({copied: false, onHide});
    act(() => {
      jest.advanceTimersByTime(COPIED_TOOLTIP_DURATION_MS * 2);
    });
    expect(onHide).not.toHaveBeenCalled();
  });
});
