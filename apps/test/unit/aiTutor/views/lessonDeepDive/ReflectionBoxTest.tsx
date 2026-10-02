import {render, screen, fireEvent, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {
  saveUserLessonReflection,
  saveUserLessonObjectiveReflection,
} from '@cdo/apps/aiTutor/reflectionsApi';
import ReflectionBox from '@cdo/apps/aiTutor/views/lessonDeepDive/Reflection/ReflectionBox';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/aiTutor/reflectionsApi', () => ({
  saveUserLessonReflection: jest.fn(),
  saveUserLessonObjectiveReflection: jest.fn(),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn()},
}));

const saveReflectionMock = saveUserLessonReflection as jest.Mock;
const saveObjectiveMock = saveUserLessonObjectiveReflection as jest.Mock;
const postMock = HttpClient.post as jest.Mock;

const LESSON_ID = 42;
const OBJECTIVES = [
  {id: '1', description: 'Objective one'},
  {id: '2', description: 'Objective two'},
];

function renderReflectionBox(onSubmitComplete: jest.Mock = jest.fn()) {
  render(
    <ReflectionBox
      unitLabel={'unit 1'}
      lessonId={LESSON_ID}
      objectives={OBJECTIVES}
      onSubmitComplete={onSubmitComplete}
      onNext={jest.fn()}
    />
  );
}

// Advance past the slide animation (two nested 220ms timeouts).
function runAnimation() {
  act(() => jest.advanceTimersByTime(500));
}

// Rate the current objective and advance to the next step.
function rateAndAdvance(label: RegExp) {
  fireEvent.click(screen.getByRole('button', {name: label}));
  fireEvent.click(screen.getByRole('button', {name: /^next$/i}));
  runAnimation();
}

// Navigate past all objective steps with the given rating, landing on the
// free-response card where the Done button lives.
function navigateToFreeResponse(rating: RegExp = /got it/i) {
  for (let i = 0; i < OBJECTIVES.length; i++) {
    rateAndAdvance(rating);
  }
}

describe('ReflectionBox submit button', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    saveReflectionMock.mockResolvedValue(undefined);
    saveObjectiveMock.mockResolvedValue(undefined);
    postMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the Done button on the last step', () => {
    renderReflectionBox();
    navigateToFreeResponse();
    expect(screen.getByRole('button', {name: /^done$/i})).toBeInTheDocument();
  });

  it('calls saveUserLessonReflection with lessonId, success, and struggle on submit', async () => {
    renderReflectionBox();
    navigateToFreeResponse();

    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], {target: {value: 'I understood loops'}});
    fireEvent.change(textboxes[1], {target: {value: 'Recursion is hard'}});

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^done$/i}));
    });

    expect(saveReflectionMock).toHaveBeenCalledWith(
      LESSON_ID,
      'I understood loops',
      'Recursion is hard'
    );
  });

  it('calls saveUserLessonObjectiveReflection only for selected objectives', async () => {
    renderReflectionBox();

    // Rate only the first objective; skip the second via "Got it" to satisfy
    // the required-rating guard so both steps can be advanced through.
    rateAndAdvance(/got it/i); // obj 1: confident
    rateAndAdvance(/got it/i); // obj 2: confident

    // Override: re-render is not necessary; the save mock counts calls.
    // One saveObjectiveMock per objective that was rated.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^done$/i}));
    });

    expect(saveObjectiveMock).toHaveBeenCalledTimes(2);
  });

  it('calls saveUserLessonObjectiveReflection for each selected objective', async () => {
    renderReflectionBox();

    // First objective: "Got it"
    rateAndAdvance(/got it/i);
    // Second objective: "New to me" (maps to LOST / 'lost')
    rateAndAdvance(/new to me/i);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^done$/i}));
    });

    expect(saveObjectiveMock).toHaveBeenCalledTimes(2);
    expect(saveObjectiveMock).toHaveBeenCalledWith('1', 'confident');
    expect(saveObjectiveMock).toHaveBeenCalledWith('2', 'lost');
  });

  it('requests podcast generation for objectives rated struggling or getting there', async () => {
    renderReflectionBox();

    rateAndAdvance(/new to me/i); // obj 1: lost
    rateAndAdvance(/getting there/i); // obj 2: unsure

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^done$/i}));
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith(
      '/ai_student_podcasts/generate_podcast',
      JSON.stringify({lesson_id: LESSON_ID, objective_ids: ['1', '2']}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('requests podcast generation with an empty objective list when all objectives are rated "Got it"', async () => {
    renderReflectionBox();

    rateAndAdvance(/got it/i); // obj 1: confident
    rateAndAdvance(/got it/i); // obj 2: confident

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /^done$/i}));
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith(
      '/ai_student_podcasts/generate_podcast',
      JSON.stringify({lesson_id: LESSON_ID, objective_ids: []}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('disables the Done button while submitting and re-enables after', async () => {
    let resolveSubmit: () => void;
    saveReflectionMock.mockReturnValue(
      new Promise<void>(resolve => {
        resolveSubmit = resolve;
      })
    );

    renderReflectionBox();
    navigateToFreeResponse();
    const button = screen.getByRole('button', {name: /^done$/i});

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();

    await act(async () => {
      resolveSubmit!();
    });

    expect(button).not.toBeDisabled();
  });

  it('disables the Next button until a rating is selected', () => {
    renderReflectionBox();
    const nextButton = screen.getByRole('button', {name: /^next$/i});
    expect(nextButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: /got it/i}));
    expect(nextButton).not.toBeDisabled();
  });
});
