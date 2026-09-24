import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import ChallengeRoute from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengeRoute';
import {
  Challenge,
  challengeValidator,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn()},
}));

jest.mock(
  '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/ChallengeBox',
  () => ({
    __esModule: true,
    default: ({
      challenge,
      challengeType,
    }: {
      challenge: Challenge;
      challengeType: string;
    }) => (
      <div>
        challenge-{challenge.id} type-{challengeType}
      </div>
    ),
  })
);

const fetchJson = HttpClient.fetchJson as jest.Mock;

const fakeChallenge: Challenge = {
  id: 7,
  lesson_id: 42,
  question: 'Explain recursion.',
  default_modality: 'video',
  whiteboard_starter_image_url: null,
  whiteboard_starter_image_alt_text: null,
};

function renderRoute({
  challengeId = '7',
  modality = 'video',
  lessonId = 42,
} = {}) {
  render(
    <MemoryRouter initialEntries={[`/challenge/${challengeId}/${modality}`]}>
      <Routes>
        <Route
          path="/challenge/:challengeId/:modality"
          element={<ChallengeRoute lessonId={lessonId} />}
        />
        <Route path="/intervention" element={<div>intervention</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ChallengeRoute', () => {
  beforeEach(() => {
    fetchJson.mockReset();
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, true);
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
  });

  it('renders nothing when the challenge experiment flag is off', () => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
    fetchJson.mockResolvedValue({value: [fakeChallenge]});
    renderRoute();
    expect(
      screen.queryByRole('button', {name: 'Back to practice'})
    ).not.toBeInTheDocument();
  });

  it('fetches challenges for the lesson on mount', () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});
    renderRoute();
    expect(fetchJson).toHaveBeenCalledWith(
      '/challenges?lesson_id=42',
      {},
      challengeValidator
    );
  });

  it('renders ChallengeBox with the matching challenge', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});
    renderRoute({challengeId: '7', modality: 'video'});
    await waitFor(() =>
      expect(screen.getByText('challenge-7 type-video')).toBeInTheDocument()
    );
  });

  it('navigates to /intervention when the challenge ID is not found', async () => {
    fetchJson.mockResolvedValue({value: [fakeChallenge]});
    renderRoute({challengeId: '999'});
    await waitFor(() =>
      expect(screen.getByText('intervention')).toBeInTheDocument()
    );
  });

  it('shows an error message when the fetch fails', async () => {
    fetchJson.mockRejectedValue(new Error('network error'));
    renderRoute();
    await waitFor(() =>
      expect(
        screen.getByText(/Couldn't load this challenge/)
      ).toBeInTheDocument()
    );
  });

  it('passes "whiteboard" as the challengeType when the URL modality is not "video"', async () => {
    const wbChallenge: Challenge = {
      ...fakeChallenge,
      id: 8,
      default_modality: 'whiteboard',
    };
    fetchJson.mockResolvedValue({value: [wbChallenge]});
    renderRoute({challengeId: '8', modality: 'whiteboard'});
    await waitFor(() =>
      expect(
        screen.getByText('challenge-8 type-whiteboard')
      ).toBeInTheDocument()
    );
  });
});
