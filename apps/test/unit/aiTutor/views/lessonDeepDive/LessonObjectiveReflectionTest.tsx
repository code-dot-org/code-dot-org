import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import LessonObjectiveReflection from '@cdo/apps/aiTutor/views/lessonDeepDive/Reflection/LessonObjectiveReflection';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

const OBJECTIVE = {id: 'obj-1', description: 'Understand loops'};

function renderComponent(
  selected: string | null = null,
  onSelectionChange = jest.fn()
) {
  render(
    <LessonObjectiveReflection
      objective={OBJECTIVE}
      selected={selected}
      onSelectionChange={onSelectionChange}
    />
  );
  return onSelectionChange;
}

describe('LessonObjectiveReflection', () => {
  it('renders the objective description', () => {
    renderComponent();
    expect(screen.getByText('Understand loops')).toBeInTheDocument();
  });

  it('renders all three rating buttons', () => {
    renderComponent();
    expect(screen.getByRole('button', {name: 'New to me'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Getting there'})
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Got it'})).toBeInTheDocument();
  });

  it('calls onSelectionChange with the objective id and value on click', () => {
    const callback = renderComponent();
    fireEvent.click(screen.getByRole('button', {name: 'Got it'}));
    expect(callback).toHaveBeenCalledWith(
      'obj-1',
      LessonObjectiveReflectionValues.CONFIDENT
    );
  });

  it('marks the selected button as aria-pressed=true', () => {
    renderComponent(LessonObjectiveReflectionValues.UNSURE);
    expect(screen.getByRole('button', {name: 'Getting there'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('marks non-selected buttons as aria-pressed=false', () => {
    renderComponent(LessonObjectiveReflectionValues.UNSURE);
    expect(screen.getByRole('button', {name: 'New to me'})).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', {name: 'Got it'})).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});
