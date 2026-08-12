import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ChallengeGallery from '@cdo/apps/aiTutor/views/gallery/ChallengeGallery';
import {
  Challenge,
  ChallengeResponse,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {fetchJson: jest.fn()},
}));

const fetchJson = HttpClient.fetchJson as jest.Mock;

const fakeChallenge: Challenge = {
  id: 1,
  lesson_id: 42,
  question: 'Draw a flowchart of the algorithm.',
  default_modality: 'whiteboard',
  whiteboard_starter_image_alt_text: null,
};

const fakeResponse: ChallengeResponse = {
  id: 7,
  challenge_id: 1,
  user_id: 99,
  student_text: 'I used a loop.',
  transcript: 'First I drew the start node.',
  student_feedback: 'Nice work labeling each step!',
  evaluation_status: 'success',
  is_final: true,
  created_at: '2026-08-10T12:00:00Z',
  assets: [
    {
      id: 3,
      asset_type: 'whiteboard_image',
      download_url: 'https://s3.example/download.png',
    },
  ],
};

// The component issues one fetch for the lesson's challenges and one for the
// student's responses; route them by URL.
const stubFetches = (
  challenges: Challenge[],
  responses: ChallengeResponse[]
) => {
  fetchJson.mockImplementation((url: string) =>
    url.startsWith('/challenges?')
      ? Promise.resolve({value: challenges})
      : Promise.resolve({value: responses})
  );
};

describe('ChallengeGallery', () => {
  beforeEach(() => {
    fetchJson.mockReset();
  });

  it('shows the submission with its question, assets, text, and feedback', async () => {
    stubFetches([fakeChallenge], [fakeResponse]);

    render(<ChallengeGallery lessonId={42} lessonName="Algorithms" />);

    await waitFor(() =>
      expect(
        screen.getByText('Draw a flowchart of the algorithm.')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole('img', {name: 'Whiteboard submission'})
    ).toHaveAttribute('src', 'https://s3.example/download.png');
    expect(screen.getByText('I used a loop.')).toBeInTheDocument();
    expect(
      screen.getByText('First I drew the start node.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Nice work labeling each step!')
    ).toBeInTheDocument();
  });

  it('shows a pending message while evaluation is in progress', async () => {
    stubFetches(
      [fakeChallenge],
      [
        {
          ...fakeResponse,
          student_feedback: null,
          evaluation_status: 'queued',
        },
      ]
    );

    render(<ChallengeGallery lessonId={42} lessonName="Algorithms" />);

    await waitFor(() =>
      expect(
        screen.getByText('Feedback is on its way. Check back soon!')
      ).toBeInTheDocument()
    );
  });

  it('shows an unavailable message when evaluation failed', async () => {
    stubFetches(
      [fakeChallenge],
      [
        {
          ...fakeResponse,
          student_feedback: null,
          evaluation_status: 'failure',
        },
      ]
    );

    render(<ChallengeGallery lessonId={42} lessonName="Algorithms" />);

    await waitFor(() =>
      expect(
        screen.getByText('Feedback is not available for this submission.')
      ).toBeInTheDocument()
    );
  });

  it('shows an empty state when there are no submissions', async () => {
    stubFetches([fakeChallenge], []);

    render(<ChallengeGallery lessonId={42} lessonName="Algorithms" />);

    await waitFor(() =>
      expect(
        screen.getByText(
          "You haven't submitted any challenge responses for this lesson yet."
        )
      ).toBeInTheDocument()
    );
  });

  it('shows an error message when a fetch fails', async () => {
    fetchJson.mockRejectedValue(new Error('network'));

    render(<ChallengeGallery lessonId={42} lessonName="Algorithms" />);

    await waitFor(() =>
      expect(
        screen.getByText(/We couldn't load your challenge submissions/)
      ).toBeInTheDocument()
    );
  });
});
