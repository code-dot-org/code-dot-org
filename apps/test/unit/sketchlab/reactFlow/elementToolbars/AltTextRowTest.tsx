import {fireEvent, render} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AltTextRow from '@cdo/apps/sketchlab/reactFlow/elementToolbars/sections/AltTextRow';

interface RenderOptions {
  value?: string;
  onChange?: (next: string) => void;
}

function renderRow({value = '', onChange = jest.fn()}: RenderOptions = {}) {
  return render(<AltTextRow value={value} onChange={onChange} />);
}

function getInput(): HTMLInputElement {
  // Both the wrapping `role="group"` and the inner input share the same
  // label; disambiguate by selector.
  return document.querySelector('input[name="alt-text"]') as HTMLInputElement;
}

describe('AltTextRow', () => {
  it('renders the current value', () => {
    renderRow({value: 'A red square'});
    expect(getInput().value).toBe('A red square');
  });

  it('updates the displayed value while typing without calling onChange', () => {
    const onChange = jest.fn();
    renderRow({value: 'initial', onChange});
    const input = getInput();
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'edited'}});
    expect(input.value).toBe('edited');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('commits the edit on blur via onChange', () => {
    const onChange = jest.fn();
    renderRow({value: 'initial', onChange});
    const input = getInput();
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'edited'}});
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith('edited');
  });

  it('skips onChange on blur when the value is unchanged', () => {
    const onChange = jest.fn();
    renderRow({value: 'initial', onChange});
    const input = getInput();
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'initial'}});
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blurs the input on Enter so the value commits', () => {
    const onChange = jest.fn();
    renderRow({value: '', onChange});
    const input = getInput();
    input.focus();
    fireEvent.change(input, {target: {value: 'typed'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith('typed');
    expect(document.activeElement).not.toBe(input);
  });

  it('syncs the field to the latest prop value while unfocused', () => {
    const {rerender} = renderRow({value: 'first'});
    expect(getInput().value).toBe('first');
    rerender(<AltTextRow value="second" onChange={jest.fn()} />);
    expect(getInput().value).toBe('second');
  });

  it('does not overwrite the field with prop changes while focused', () => {
    const {rerender} = renderRow({value: 'first'});
    const input = getInput();
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'user typing'}});
    rerender(<AltTextRow value="external update" onChange={jest.fn()} />);
    expect(getInput().value).toBe('user typing');
  });
});
