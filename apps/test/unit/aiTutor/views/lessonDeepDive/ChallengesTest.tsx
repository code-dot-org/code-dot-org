import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import Challenges from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/Challenges';
import {Challenge} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';

// Replaces ChallengePicker with a minimal stub that exposes two buttons:
// "start" fires the callback with a real challenge, "cancel" fires it with nulls.
jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengePicker',
  () => ({
    __esModule: true,
    default: ({
      lessonId,
      challengeSetCallback,
    }: {
      lessonId: number;
      challengeSetCallback: (c: Challenge | null, t: string | null) => void;
    }) => (
      <div>
        <span>Lesson {lessonId}</span>
        <button
          type="button"
          onClick={() =>
            challengeSetCallback(
              {
                id: 5,
                lesson_id: lessonId,
                question: 'q',
                default_modality: 'video',
                whiteboard_starter_image_url: null,
                whiteboard_starter_image_alt_text: null,
              },
              'video'
            )
          }
        >
          start
        </button>
        <button type="button" onClick={() => challengeSetCallback(null, null)}>
          cancel
        </button>
      </div>
    ),
  })
);

function renderChallenges(lessonId = 42) {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Challenges lessonId={lessonId} />} />
        <Route
          path="/challenge/:id/:type"
          element={<div>challenge-page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Challenges', () => {
  it('passes the lessonId down to ChallengePicker', () => {
    renderChallenges(99);
    expect(screen.getByText('Lesson 99')).toBeInTheDocument();
  });

  it('navigates to /challenge/:id/:type when a challenge is picked', () => {
    renderChallenges();
    fireEvent.click(screen.getByRole('button', {name: 'start'}));
    expect(screen.getByText('challenge-page')).toBeInTheDocument();
  });

  it('does not navigate when the callback fires with a null challenge', () => {
    renderChallenges();
    fireEvent.click(screen.getByRole('button', {name: 'cancel'}));
    expect(screen.queryByText('challenge-page')).not.toBeInTheDocument();
  });
});
