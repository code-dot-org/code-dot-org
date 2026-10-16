import {render, fireEvent} from '@testing-library/react';
import {useRef} from 'react';
import {describe, expect, it} from 'vitest';

import useFocusTrap from '../useFocusTrap';

const Trapped = ({okDisabled = false}: {okDisabled?: boolean}) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  return (
    <div ref={ref}>
      <select data-testid="select">
        <option>1</option>
      </select>
      <button data-testid="ok" disabled={okDisabled}>
        OK
      </button>
    </div>
  );
};

const Empty = () => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  return <div ref={ref}>nothing to focus</div>;
};

// fireEvent returns false when a handler called preventDefault. That is how the
// trap claims Tab instead of letting the browser move focus onward, and it is
// the only part jsdom can observe: jsdom does not implement tab navigation, so
// asserting on document.activeElement alone passes whether or not the trap ran.
const tab = () => fireEvent.keyDown(document, {key: 'Tab'});

describe('useFocusTrap', () => {
  it('focuses the first control on mount', () => {
    const {getByTestId} = render(<Trapped />);

    expect(document.activeElement).toBe(getByTestId('select'));
  });

  it('wraps from the last control back to the first', () => {
    const {getByTestId} = render(<Trapped />);
    getByTestId('ok').focus();

    tab();

    expect(document.activeElement).toBe(getByTestId('select'));
  });

  it('wraps backward from the first control to the last', () => {
    const {getByTestId} = render(<Trapped />);
    getByTestId('select').focus();

    fireEvent.keyDown(document, {key: 'Tab', shiftKey: true});

    expect(document.activeElement).toBe(getByTestId('ok'));
  });

  it('hands Tab onward when a later control can still take focus', () => {
    const {getByTestId} = render(<Trapped />);
    getByTestId('select').focus();

    expect(tab()).toBe(true);
  });

  // A disabled control never takes focus, so treating it as the last stop left
  // the wrap unfired and Tab walked out of the dialog.
  it('keeps Tab inside when the only later control is disabled', () => {
    const {getByTestId} = render(<Trapped okDisabled />);
    getByTestId('select').focus();

    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(getByTestId('select'));
  });

  it('does not throw when nothing inside is focusable', () => {
    render(<Empty />);

    expect(() => tab()).not.toThrow();
  });
});
