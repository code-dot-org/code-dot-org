import {describe, expect, it, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';

import {EmpathyCard} from '../EmpathyCard';
import {getEmpathyMessage} from '../empathyMessages';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal traceback string used across tests. */
const SAMPLE_TRACEBACK =
  'Traceback (most recent call last):\n' +
  '  File "<exec>", line 1, in <module>\n' +
  "NameError: name 'x' is not defined";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EmpathyCard', () => {
  it('renders the empathy message derived from getEmpathyMessage', () => {
    const name = 'NameError';
    const message = "name 'x' is not defined";
    const expected = getEmpathyMessage(name, message);

    render(
      <EmpathyCard
        name={name}
        message={message}
        traceback={SAMPLE_TRACEBACK}
        onTryAgain={() => undefined}
      />,
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('does not show the raw traceback by default', () => {
    render(
      <EmpathyCard
        name="NameError"
        message="name 'x' is not defined"
        traceback={SAMPLE_TRACEBACK}
        onTryAgain={() => undefined}
      />,
    );

    // Traceback is inside a MUI Collapse (height: 0 when closed).  jsdom does
    // not compute CSS transitions, so we verify the disclosure is closed by
    // checking the button label rather than CSS visibility.
    expect(
      screen.getByRole('button', {name: /show details/i}),
    ).toBeInTheDocument();
    // The traceback pre must be in the DOM but the Collapse wrapper must have
    // its collapsed aria state — MUI sets overflow hidden via inline style when
    // not entered.  Rather than asserting CSS (unreliable in jsdom) we confirm
    // the toggle button still reads "Show details", proving the panel is closed.
    expect(
      screen.queryByRole('button', {name: /hide details/i}),
    ).not.toBeInTheDocument();
  });

  it('reveals the traceback after clicking "Show details"', () => {
    render(
      <EmpathyCard
        name="NameError"
        message="name 'x' is not defined"
        traceback={SAMPLE_TRACEBACK}
        onTryAgain={() => undefined}
      />,
    );

    const showBtn = screen.getByRole('button', {name: /show details/i});
    fireEvent.click(showBtn);

    // After open, the button label flips to "Hide details".
    expect(
      screen.getByRole('button', {name: /hide details/i}),
    ).toBeInTheDocument();
    // The traceback pre is rendered in the (now expanded) Collapse panel.
    expect(screen.getByTestId('empathy-traceback')).toBeInTheDocument();
    expect(screen.getByTestId('empathy-traceback').textContent).toBe(
      SAMPLE_TRACEBACK,
    );
  });

  it('calls onTryAgain when the "Try again" button is clicked', () => {
    const onTryAgain = vi.fn();

    render(
      <EmpathyCard
        name="NameError"
        message="name 'x' is not defined"
        traceback={SAMPLE_TRACEBACK}
        onTryAgain={onTryAgain}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: /try again/i}));

    expect(onTryAgain).toHaveBeenCalledOnce();
  });

  it('shows a "Line 3" label when the line prop is 3', () => {
    render(
      <EmpathyCard
        name="TypeError"
        message="unsupported operand"
        line={3}
        traceback={SAMPLE_TRACEBACK}
        onTryAgain={() => undefined}
      />,
    );

    expect(screen.getByText('Line 3')).toBeInTheDocument();
  });
});
