import {render, screen} from '@testing-library/react';
import React from 'react';

import AskAiIndicator, {
  FAILURE_VISIBLE_MS,
} from '@cdo/apps/p5lab/spritelab/lab2/views/components/AskAiIndicator';

describe('AskAiIndicator', () => {
  it('shows nothing when no request is out', () => {
    const {container} = render(
      <AskAiIndicator status={null} onFailureExpired={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  // role="status" is what announces the wait to a screen reader.
  it('announces the wait while a request is out', () => {
    render(
      <AskAiIndicator
        status={{state: 'pending'}}
        onFailureExpired={jest.fn()}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Waiting for AI response'
    );
  });

  it('shows the failure message', () => {
    render(
      <AskAiIndicator
        status={{state: 'failed', message: 'The AI could not answer.'}}
        onFailureExpired={jest.fn()}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The AI could not answer.'
    );
  });

  it('reports a failure as expired after ten seconds', () => {
    jest.useFakeTimers();
    const onFailureExpired = jest.fn();
    render(
      <AskAiIndicator
        status={{state: 'failed', message: 'nope'}}
        onFailureExpired={onFailureExpired}
      />
    );
    jest.advanceTimersByTime(FAILURE_VISIBLE_MS - 1);
    expect(onFailureExpired).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onFailureExpired).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  // Without a restart, a second failure would inherit the first's countdown
  // and could vanish almost at once.
  it('restarts the countdown for a second failure', () => {
    jest.useFakeTimers();
    const onFailureExpired = jest.fn();
    const {rerender} = render(
      <AskAiIndicator
        status={{state: 'failed', message: 'first'}}
        onFailureExpired={onFailureExpired}
      />
    );
    jest.advanceTimersByTime(FAILURE_VISIBLE_MS - 1);
    rerender(
      <AskAiIndicator
        status={{state: 'failed', message: 'second'}}
        onFailureExpired={onFailureExpired}
      />
    );
    jest.advanceTimersByTime(FAILURE_VISIBLE_MS - 1);
    expect(onFailureExpired).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onFailureExpired).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('does not report a spinner as expired', () => {
    jest.useFakeTimers();
    const onFailureExpired = jest.fn();
    render(
      <AskAiIndicator
        status={{state: 'pending'}}
        onFailureExpired={onFailureExpired}
      />
    );
    jest.advanceTimersByTime(FAILURE_VISIBLE_MS * 2);
    expect(onFailureExpired).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
