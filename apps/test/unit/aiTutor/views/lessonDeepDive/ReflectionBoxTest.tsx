import {render, screen, fireEvent, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {
  saveUserLessonReflection,
  saveUserLessonObjectiveReflection,
} from '@cdo/apps/aiTutor/reflectionsApi';
import ReflectionBox from '@cdo/apps/aiTutor/views/lessonDeepDive/ReflectionBox';

jest.mock('@cdo/apps/aiTutor/reflectionsApi', () => ({
  saveUserLessonReflection: jest.fn(),
  saveUserLessonObjectiveReflection: jest.fn(),
}));

const saveReflectionMock = saveUserLessonReflection as jest.Mock;
const saveObjectiveMock = saveUserLessonObjectiveReflection as jest.Mock;

const LESSON_ID = 42;
const OBJECTIVES = [
  {id: '1', description: 'Objective one'},
  {id: '2', description: 'Objective two'},
];

function renderReflectionBox() {
  render(<ReflectionBox lessonId={LESSON_ID} objectives={OBJECTIVES} />);
}

describe('ReflectionBox submit button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    saveReflectionMock.mockResolvedValue(undefined);
    saveObjectiveMock.mockResolvedValue(undefined);
  });

  it('renders the submit button', () => {
    renderReflectionBox();
    expect(
      screen.getByRole('button', {name: /submit reflection/i})
    ).toBeInTheDocument();
  });

  it('calls saveUserLessonReflection with lessonId, success, and struggle on submit', async () => {
    renderReflectionBox();

    fireEvent.change(screen.getByLabelText(/moment i felt successful/i), {
      target: {value: 'I understood loops'},
    });
    fireEvent.change(screen.getByLabelText(/still confused/i), {
      target: {value: 'Recursion is hard'},
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /submit reflection/i}));
    });

    expect(saveReflectionMock).toHaveBeenCalledWith(
      LESSON_ID,
      'I understood loops',
      'Recursion is hard'
    );
  });

  it('does not call saveUserLessonObjectiveReflection when no objectives are selected', async () => {
    renderReflectionBox();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /submit reflection/i}));
    });

    expect(saveObjectiveMock).not.toHaveBeenCalled();
  });

  it('calls saveUserLessonObjectiveReflection only for selected objectives', async () => {
    renderReflectionBox();

    // Click Confident for the first objective only
    fireEvent.click(screen.getAllByRole('button', {name: /confident/i})[0]);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /submit reflection/i}));
    });

    expect(saveObjectiveMock).toHaveBeenCalledTimes(1);
  });

  it('calls saveUserLessonObjectiveReflection for each selected objective', async () => {
    renderReflectionBox();

    fireEvent.click(screen.getAllByRole('button', {name: /confident/i})[0]);
    fireEvent.click(screen.getAllByRole('button', {name: /lost/i})[1]);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /submit reflection/i}));
    });

    expect(saveObjectiveMock).toHaveBeenCalledTimes(2);
    expect(saveObjectiveMock).toHaveBeenCalledWith('1', 'confident');
    expect(saveObjectiveMock).toHaveBeenCalledWith('2', 'lost');
  });

  it('disables the submit button while submitting and re-enables after', async () => {
    let resolveSubmit: () => void;
    saveReflectionMock.mockReturnValue(
      new Promise<void>(resolve => {
        resolveSubmit = resolve;
      })
    );

    renderReflectionBox();
    const button = screen.getByRole('button', {name: /submit reflection/i});

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();

    await act(async () => {
      resolveSubmit!();
    });

    expect(button).not.toBeDisabled();
  });
});
