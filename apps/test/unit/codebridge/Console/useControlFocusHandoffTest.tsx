import useControlFocusHandoff from '@codebridge/Console/useControlFocusHandoff';
import {render, screen} from '@testing-library/react';
import React, {useState} from 'react';

import '@testing-library/jest-dom';

// Stands in for WithConditionalTooltip, which wraps only the Run button. The
// wrapper is what makes the two branches structurally different, so React
// unmounts the old button instead of reusing the node. Without it the swap
// reuses one <button> and no focus is ever lost.
const Tooltip = ({children}: {children: React.ReactNode}) => (
  <span>{children}</span>
);

// Mirrors ControlButtons: Run and Stop are separate elements in a ternary, so
// the swap unmounts whichever one had focus.
function Controls({onSwap}: {onSwap: (swap: () => void) => void}) {
  const [running, setRunning] = useState(false);
  const {ref, onFocus, onBlur} =
    useControlFocusHandoff<HTMLDivElement>(running);
  onSwap(() => setRunning(r => !r));
  return (
    <div ref={ref} onFocus={onFocus} onBlur={onBlur}>
      {running ? (
        <button type="button">Stop</button>
      ) : (
        <Tooltip>
          <button type="button">Run</button>
        </Tooltip>
      )}
    </div>
  );
}

// A control outside the wrapper, to prove focus elsewhere is left alone.
function Harness() {
  let swap = () => {};
  const result = render(
    <>
      <Controls onSwap={fn => (swap = fn)} />
      <button type="button">Editor</button>
    </>
  );
  return {...result, swap: () => swap()};
}

// What ControlButtons now does: one button whose label and handler change,
// wrapped in a wrapper that is always rendered. React reuses the node, so
// focus survives without needing to be handed anywhere.
function SharedControl({onSwap}: {onSwap: (swap: () => void) => void}) {
  const [running, setRunning] = useState(false);
  onSwap(() => setRunning(r => !r));
  return (
    <div>
      <Tooltip>
        <button type="button">{running ? 'Stop' : 'Run'}</button>
      </Tooltip>
    </div>
  );
}

describe('sharing one element across the run/stop swap', () => {
  it('keeps focus on the button without moving it', () => {
    let swap = () => {};
    render(<SharedControl onSwap={fn => (swap = fn)} />);
    const button = screen.getByText('Run');
    button.focus();

    React.act(() => swap());

    // The same DOM node, still focused: no unmount, so nothing to announce.
    expect(screen.getByText('Stop')).toBe(button);
    expect(button).toHaveFocus();
  });
});

describe('useControlFocusHandoff', () => {
  it('moves focus to the replacement button', () => {
    const {swap} = Harness();
    screen.getByText('Run').focus();
    expect(screen.getByText('Run')).toHaveFocus();

    React.act(() => swap());

    // Without the handoff this is document.body, which a screen reader reads
    // as the page title.
    expect(document.activeElement).not.toBe(document.body);
    expect(screen.getByText('Stop')).toHaveFocus();
  });

  it('hands focus back when the run ends', () => {
    const {swap} = Harness();
    screen.getByText('Run').focus();

    React.act(() => swap());
    React.act(() => swap());

    expect(screen.getByText('Run')).toHaveFocus();
  });

  it('leaves focus alone when it was never on the control', () => {
    const {swap} = Harness();
    screen.getByText('Editor').focus();

    React.act(() => swap());

    expect(screen.getByText('Editor')).toHaveFocus();
  });

  it('does not pull focus back from wherever the user moved to', () => {
    const {swap} = Harness();
    screen.getByText('Run').focus();
    screen.getByText('Editor').focus();

    React.act(() => swap());

    expect(screen.getByText('Editor')).toHaveFocus();
  });
});
