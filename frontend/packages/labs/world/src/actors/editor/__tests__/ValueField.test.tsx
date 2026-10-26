// A value's field, by its type: here, a picture (specs/ACTORS_AS_DATA_PLAN.md,
// step 4).

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {ValueField} from '../ValueField';

const show = (value: string) => {
  const onValue = vi.fn();
  render(
    <ValueField
      name="face"
      label="Face"
      type="picture"
      value={value}
      onValue={onValue}
      isReadOnly={false}
      pictures={['ace.png', 'king.png']}
    />,
  );
  return {onValue, field: screen.getByLabelText('Face') as HTMLSelectElement};
};

describe('a picture’s field', () => {
  it('offers the project’s pictures, and none', () => {
    const {field} = show('ace.png');
    expect([...field.options].map(option => option.value)).toEqual([
      '',
      'ace.png',
      'king.png',
    ]);
    expect(field.value).toBe('ace.png');
  });

  it('says what it holds even when the project no longer has it', () => {
    const {field} = show('gone.png');
    expect(field.value).toBe('gone.png');
  });

  it('is changed by choosing one', () => {
    const {onValue, field} = show('');
    fireEvent.change(field, {target: {value: 'king.png'}});
    expect(onValue).toHaveBeenCalledWith('king.png');
  });
});
