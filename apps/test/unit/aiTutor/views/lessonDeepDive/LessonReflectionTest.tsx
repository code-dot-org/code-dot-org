import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import LessonReflection from '@cdo/apps/aiTutor/views/lessonDeepDive/Reflection/LessonReflection';

function renderComponent({
  success = '',
  struggle = '',
  onSuccessChange = jest.fn(),
  onStruggleChange = jest.fn(),
} = {}) {
  render(
    <LessonReflection
      success={success}
      struggle={struggle}
      onSuccessChange={onSuccessChange}
      onStruggleChange={onStruggleChange}
    />
  );
  return {onSuccessChange, onStruggleChange};
}

describe('LessonReflection', () => {
  it('renders the success textarea with its current value', () => {
    renderComponent({success: 'I solved the problem'});
    expect(
      screen.getByDisplayValue('I solved the problem')
    ).toBeInTheDocument();
  });

  it('renders the struggle textarea with its current value', () => {
    renderComponent({struggle: 'Still confused about for loops'});
    expect(
      screen.getByDisplayValue('Still confused about for loops')
    ).toBeInTheDocument();
  });

  it('calls onSuccessChange when the success textarea changes', () => {
    const {onSuccessChange} = renderComponent();
    // Both textareas share the same placeholder; order in the DOM is
    // success first, struggle second.
    const [successTextarea] = screen.getAllByRole('textbox');
    fireEvent.change(successTextarea, {target: {value: 'new success text'}});
    expect(onSuccessChange).toHaveBeenCalledWith('new success text');
  });

  it('calls onStruggleChange when the struggle textarea changes', () => {
    const {onStruggleChange} = renderComponent();
    const [, struggleTextarea] = screen.getAllByRole('textbox');
    fireEvent.change(struggleTextarea, {
      target: {value: 'new struggle text'},
    });
    expect(onStruggleChange).toHaveBeenCalledWith('new struggle text');
  });
});
